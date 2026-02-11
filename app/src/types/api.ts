import type {
  Action,
  Conversation,
  Message,
  ModelInfo,
  ModelSlots,
  SystemStatus,
  TrustRule,
  TrustDecision,
} from './models';

// Standard response wrappers
export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse<T> = ApiOk<T> | ApiError;

// Endpoint response data shapes

export interface PairCreateData {
  token: string;
  expires_at: string;
}

export interface PairData {
  session_token: string;
}

export interface MeData {
  session_id: string;
}

export interface StatusData extends SystemStatus {}

export interface ModelsData {
  models: ModelInfo[];
}

export interface ModelSlotsData extends ModelSlots {}

export interface ChatData {
  conversation_id: string;
  message_id: string;
  content: string;
  model?: string;
}

export interface ConversationsData {
  conversations: Conversation[];
}

export interface ConversationMessagesData {
  conversation: Conversation;
  messages: Message[];
  total: number;
}

export interface PendingActionsData {
  actions: Action[];
}

export interface ActionData {
  action: Action;
}

export interface SubmitActionData {
  decision: 'auto_approved' | 'auto_denied' | 'pending';
  action: Action;
}

export interface TrustRulesData {
  rules: TrustRule[];
}

export interface TrustRuleCreateData {
  id: string;
}

export interface ConfigData extends Record<string, string> {}

export interface ConfigValueData {
  key: string;
  value: string;
}

// Request bodies
export interface PairRequest {
  token: string;
  device_name?: string;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
}

export interface TrustRuleRequest {
  service: string;
  action: string;
  decision: TrustDecision;
}

export interface ConfigSetRequest {
  key: string;
  value: string;
}

// --- Files ---

export interface FileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size: number;
  modified: string;
}

export interface FilesListData {
  path: string;
  entries: FileEntry[];
}

export interface FileReadData {
  path: string;
  content: string;
}
