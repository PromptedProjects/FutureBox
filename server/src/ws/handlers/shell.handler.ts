import { spawn, type ChildProcess } from 'child_process';
import { wsManager } from '../ws-manager.js';
import {
  createWSMessage,
  type ShellExecPayload,
  type ShellInputPayload,
  type ShellKillPayload,
  type ShellOutputPayload,
  type ShellExitPayload,
} from '../ws-protocol.js';

const SHELL_TIMEOUT_MS = 30_000; // 30 seconds

/** Multiple shells per session, keyed by "sessionId:tabId" */
const activeShells = new Map<string, ChildProcess>();
const activeTimers = new Map<string, ReturnType<typeof setTimeout>>();

function shellKey(sessionId: string, tabId: string): string {
  return `${sessionId}:${tabId}`;
}

export function handleShellExec(
  sessionId: string,
  messageId: string,
  payload: ShellExecPayload,
): void {
  const key = shellKey(sessionId, payload.tab_id);

  // Kill any existing shell for this tab
  killShellByKey(key);

  const isWindows = process.platform === 'win32';
  const shell = isWindows ? 'cmd.exe' : '/bin/bash';
  const args = isWindows ? ['/c', payload.command] : ['-c', payload.command];

  const child = spawn(shell, args, {
    cwd: payload.cwd || process.env.HOME || process.env.USERPROFILE || '.',
    env: { ...process.env, TERM: 'dumb' },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  activeShells.set(key, child);

  // Auto-kill after timeout
  const timer = setTimeout(() => {
    if (activeShells.get(key) === child) {
      wsManager.send(
        sessionId,
        createWSMessage<ShellOutputPayload>('shell.output', messageId, {
          tab_id: payload.tab_id,
          data: '\n[timed out after 30s]\n',
          stream: 'stderr',
        }),
      );
      child.kill('SIGTERM');
    }
  }, SHELL_TIMEOUT_MS);
  activeTimers.set(key, timer);

  child.stdout?.on('data', (data: Buffer) => {
    wsManager.send(
      sessionId,
      createWSMessage<ShellOutputPayload>('shell.output', messageId, {
        tab_id: payload.tab_id,
        data: data.toString('utf-8'),
        stream: 'stdout',
      }),
    );
  });

  child.stderr?.on('data', (data: Buffer) => {
    wsManager.send(
      sessionId,
      createWSMessage<ShellOutputPayload>('shell.output', messageId, {
        tab_id: payload.tab_id,
        data: data.toString('utf-8'),
        stream: 'stderr',
      }),
    );
  });

  child.on('close', (code, signal) => {
    clearTimeout(activeTimers.get(key));
    activeTimers.delete(key);
    activeShells.delete(key);
    wsManager.send(
      sessionId,
      createWSMessage<ShellExitPayload>('shell.exit', messageId, {
        tab_id: payload.tab_id,
        code,
        signal: signal ?? null,
      }),
    );
  });

  child.on('error', (err) => {
    activeShells.delete(key);
    wsManager.send(
      sessionId,
      createWSMessage<ShellOutputPayload>('shell.output', messageId, {
        tab_id: payload.tab_id,
        data: `Error: ${err.message}\n`,
        stream: 'stderr',
      }),
    );
    wsManager.send(
      sessionId,
      createWSMessage<ShellExitPayload>('shell.exit', messageId, {
        tab_id: payload.tab_id,
        code: 1,
        signal: null,
      }),
    );
  });
}

export function handleShellInput(sessionId: string, payload: ShellInputPayload): void {
  const key = shellKey(sessionId, payload.tab_id);
  const child = activeShells.get(key);
  if (child?.stdin?.writable) {
    child.stdin.write(payload.data);
  }
}

export function handleShellKill(sessionId: string, payload: ShellKillPayload): void {
  const key = shellKey(sessionId, payload.tab_id);
  killShellByKey(key);
}

function killShellByKey(key: string): void {
  clearTimeout(activeTimers.get(key));
  activeTimers.delete(key);
  const child = activeShells.get(key);
  if (child) {
    child.kill('SIGTERM');
    activeShells.delete(key);
  }
}

/** Clean up all shells when a client disconnects */
export function cleanupShells(sessionId: string): void {
  const prefix = `${sessionId}:`;
  for (const key of activeShells.keys()) {
    if (key.startsWith(prefix)) {
      killShellByKey(key);
    }
  }
}
