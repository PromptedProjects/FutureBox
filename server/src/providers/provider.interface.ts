export enum Capability {
  Language = 'language',
  Reasoning = 'reasoning',
  Vision = 'vision',
  STT = 'stt',
  TTS = 'tts',
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: string[]; // base64 for vision
}

export interface ChatResponse {
  content: string;
  model: string;
  tokens_used?: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  capabilities: Capability[];
  size?: string; // e.g. "3.8B", "7B"
}

/** Any provider that can do text chat */
export interface LLMProvider {
  readonly name: string;

  /** Check if this provider is reachable */
  isAvailable(): Promise<boolean>;

  /** List models this provider offers */
  listModels(): Promise<ModelInfo[]>;

  /** Single-shot chat (waits for full response) */
  chat(model: string, messages: ChatMessage[]): Promise<ChatResponse>;

  /** Streaming chat — yields token chunks */
  chatStream(model: string, messages: ChatMessage[]): AsyncGenerator<string, ChatResponse>;
}

/** Provider that can process images */
export interface VisionProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  describeImage(model: string, image: string, prompt?: string): Promise<ChatResponse>;
}
