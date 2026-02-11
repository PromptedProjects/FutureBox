import { useAuthStore } from '../stores/auth.store';
import type {
  ApiResponse,
  PairCreateData,
  PairData,
  PairRequest,
  MeData,
  StatusData,
  ModelsData,
  ModelSlotsData,
  ChatData,
  ChatRequest,
  ConversationsData,
  ConversationMessagesData,
  PendingActionsData,
  ActionData,
  SubmitActionData,
  TrustRulesData,
  TrustRuleCreateData,
  TrustRuleRequest,
  ConfigData,
  ConfigValueData,
  ConfigSetRequest,
  FilesListData,
  FileReadData,
} from '../types/api';

function getBaseUrl(): string {
  const host = useAuthStore.getState().host;
  if (!host) throw new Error('No host configured');
  // Host may already include protocol (http://...) or just be ip:port
  return host.startsWith('http') ? host : `http://${host}`;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false,
): Promise<ApiResponse<T>> {
  const baseUrl = skipAuth && options.headers
    ? '' // will be overridden below
    : getBaseUrl();

  const url = `${baseUrl}${path}`;
  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !skipAuth) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    return (await res.json()) as ApiResponse<T>;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network request failed',
    };
  }
}

/** For requests that need a custom host (before pairing is stored) */
async function requestWithHost<T>(
  host: string,
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const baseUrl = host.startsWith('http') ? host : `http://${host}`;
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    return (await res.json()) as ApiResponse<T>;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Network request failed',
    };
  }
}

// --- Public (no auth) ---

export function getStatus() {
  return request<StatusData>('/status', {}, true);
}

export function getStatusFromHost(host: string) {
  return requestWithHost<StatusData>(host, '/status');
}

// --- Pairing ---

export function createPairToken(host: string) {
  return requestWithHost<PairCreateData>(host, '/pair/create', { method: 'POST' });
}

export function pair(host: string, body: PairRequest) {
  return requestWithHost<PairData>(host, '/pair', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// --- Auth check ---

export function getMe() {
  return request<MeData>('/me');
}

// --- Models ---

export function getModels() {
  return request<ModelsData>('/models');
}

export function getModelSlots() {
  return request<ModelSlotsData>('/models/slots');
}

// --- Chat ---

export function sendChat(body: ChatRequest) {
  return request<ChatData>('/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// --- Conversations ---

export function getConversations(limit = 50, offset = 0) {
  return request<ConversationsData>(
    `/conversations?limit=${limit}&offset=${offset}`,
  );
}

export function getConversationMessages(
  conversationId: string,
  limit = 100,
  offset = 0,
) {
  return request<ConversationMessagesData>(
    `/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`,
  );
}

// --- Actions ---

export function getPendingActions() {
  return request<PendingActionsData>('/pending');
}

export function approveAction(id: string) {
  return request<ActionData>(`/approve/${id}`, { method: 'POST', body: '{}' });
}

export function denyAction(id: string) {
  return request<ActionData>(`/deny/${id}`, { method: 'POST', body: '{}' });
}

// --- Trust Rules ---

export function getTrustRules() {
  return request<TrustRulesData>('/trust-rules');
}

export function createTrustRule(body: TrustRuleRequest) {
  return request<TrustRuleCreateData>('/trust-rules', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function deleteTrustRule(id: string) {
  return request<void>(`/trust-rules/${id}`, { method: 'DELETE' });
}

// --- Config ---

export function getConfig() {
  return request<ConfigData>('/config');
}

export function getConfigValue(key: string) {
  return request<ConfigValueData>(`/config/${encodeURIComponent(key)}`);
}

export function setConfig(body: ConfigSetRequest) {
  return request<void>('/config', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// --- Files ---

export function listFiles(dirPath?: string) {
  const query = dirPath ? `?path=${encodeURIComponent(dirPath)}` : '';
  return request<FilesListData>(`/files/list${query}`);
}

export function readFile(filePath: string) {
  return request<FileReadData>(`/files/read?path=${encodeURIComponent(filePath)}`);
}

// --- Transcription ---

export function transcribeAudio(base64Audio: string, language?: string) {
  return request<{ text: string }>('/transcribe', {
    method: 'POST',
    body: JSON.stringify({ audio: base64Audio, language: language || undefined }),
  });
}

// --- TTS ---

export function textToSpeech(text: string, voice?: string) {
  return request<{ audio: string }>('/tts', {
    method: 'POST',
    body: JSON.stringify({ text, voice }),
  });
}
