// Mirrors server types exactly

export type ActionTier = 'red' | 'yellow' | 'green';
export type ActionStatus = 'pending' | 'approved' | 'denied' | 'expired';
export type MessageRole = 'user' | 'assistant' | 'system';
export type TrustDecision = 'auto_approve' | 'auto_deny' | 'ask';
export type Capability = 'language' | 'reasoning' | 'vision' | 'stt' | 'tts';

export interface Action {
  id: string;
  conversation_id: string | null;
  type: string;
  tier: ActionTier;
  title: string;
  description: string | null;
  payload: string | null;
  status: ActionStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
  images?: string[]; // base64 for display
}

export interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface TrustRule {
  id: string;
  service: string;
  action: string;
  decision: TrustDecision;
  created_at: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: Capability[];
  size?: string;
}

export interface ModelSlots {
  slots: Record<Capability, { provider: string; model: string } | null>;
}

export interface SystemStatus {
  version: string;
  uptime: number;
  status: 'running';
  cpu: {
    model: string;
    usage: number;
    cores: number;
    temperature: number | null;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    ip: string;
    hostname: string;
  };
  ai: {
    connected_clients: number;
  };
}
