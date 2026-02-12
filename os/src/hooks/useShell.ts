import { useEffect, useCallback, useState, useRef } from 'react';
import { wsManager } from '../services/ws';
import { uid } from '../utils/uid';
import type { ShellOutputPayload, ShellExitPayload } from '../types/ws';

export interface TermLine {
  id: number;
  text: string;
  type: 'stdout' | 'stderr' | 'input' | 'system';
}

export interface ShellTab {
  id: string;
  title: string;
  lines: TermLine[];
  running: boolean;
}

export function useShellTabs() {
  const [tabs, setTabs] = useState<ShellTab[]>(() => [
    { id: uid(8), title: 'Shell 1', lines: [], running: false },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);
  const lineId = useRef(0);
  const tabCounter = useRef(1);

  // Subscribe to WS events — route by tab_id
  useEffect(() => {
    const unsubs = [
      wsManager.on<ShellOutputPayload>('shell.output', (payload) => {
        const chunks = payload.data.split('\n');
        const newLines = chunks
          .filter((chunk) => chunk.length > 0)
          .map((chunk) => ({
            id: lineId.current++,
            text: chunk,
            type: payload.stream as 'stdout' | 'stderr',
          }));
        if (newLines.length === 0) return;

        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === payload.tab_id
              ? { ...tab, lines: [...tab.lines, ...newLines] }
              : tab,
          ),
        );
      }),
      wsManager.on<ShellExitPayload>('shell.exit', (payload) => {
        setTabs((prev) =>
          prev.map((tab) =>
            tab.id === payload.tab_id
              ? {
                  ...tab,
                  running: false,
                  lines: [
                    ...tab.lines,
                    {
                      id: lineId.current++,
                      text: `[exit ${payload.code ?? payload.signal ?? '?'}]`,
                      type: 'system' as const,
                    },
                  ],
                }
              : tab,
          ),
        );
      }),
    ];

    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  const exec = useCallback((tabId: string, command: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? {
              ...tab,
              running: true,
              lines: [
                ...tab.lines,
                { id: lineId.current++, text: `$ ${command}`, type: 'input' as const },
              ],
            }
          : tab,
      ),
    );
    wsManager.shellExec(tabId, command);
  }, []);

  const kill = useCallback((tabId: string) => {
    wsManager.shellKill(tabId);
  }, []);

  const sendInput = useCallback((tabId: string, data: string) => {
    wsManager.shellInput(tabId, data);
  }, []);

  const clearTab = useCallback((tabId: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId ? { ...tab, lines: [] } : tab,
      ),
    );
  }, []);

  const addTab = useCallback(() => {
    tabCounter.current++;
    const newTab: ShellTab = {
      id: uid(8),
      title: `Shell ${tabCounter.current}`,
      lines: [],
      running: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback(
    (tabId: string) => {
      // Kill any running process
      wsManager.shellKill(tabId);

      setTabs((prev) => {
        const filtered = prev.filter((t) => t.id !== tabId);
        // Always keep at least one tab
        if (filtered.length === 0) {
          tabCounter.current++;
          const newTab: ShellTab = {
            id: uid(8),
            title: `Shell ${tabCounter.current}`,
            lines: [],
            running: false,
          };
          return [newTab];
        }
        return filtered;
      });

      // Switch active tab if we closed the active one
      setActiveTabId((currentActive) => {
        if (currentActive === tabId) {
          // Find next tab to activate
          const idx = tabs.findIndex((t) => t.id === tabId);
          const remaining = tabs.filter((t) => t.id !== tabId);
          if (remaining.length === 0) return currentActive; // will be handled by setTabs above
          const newIdx = Math.min(idx, remaining.length - 1);
          return remaining[newIdx].id;
        }
        return currentActive;
      });
    },
    [tabs],
  );

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    exec,
    kill,
    sendInput,
    clearTab,
    addTab,
    closeTab,
  };
}
