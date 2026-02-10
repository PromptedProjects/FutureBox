import {
  Capability,
  type LLMProvider,
  type ChatMessage,
  type ChatResponse,
  type ModelInfo,
} from './provider.interface.js';

export class ClaudeProvider implements LLMProvider {
  readonly name = 'claude';
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', provider: this.name, capabilities: [Capability.Language, Capability.Vision] },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', provider: this.name, capabilities: [Capability.Language, Capability.Vision] },
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', provider: this.name, capabilities: [Capability.Language, Capability.Reasoning, Capability.Vision] },
    ];
  }

  async chat(model: string, messages: ChatMessage[]): Promise<ChatResponse> {
    const systemMsg = messages.find((m) => m.role === 'system');
    const chatMsgs = messages.filter((m) => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemMsg?.content,
        messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.status} ${err}`);
    }

    const data = await response.json() as any;
    const content = data.content?.[0]?.text ?? '';
    const tokensUsed = (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0);

    return { content, model, tokens_used: tokensUsed };
  }

  async *chatStream(model: string, messages: ChatMessage[]): AsyncGenerator<string, ChatResponse> {
    const systemMsg = messages.find((m) => m.role === 'system');
    const chatMsgs = messages.filter((m) => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        stream: true,
        system: systemMsg?.content,
        messages: chatMsgs.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Claude API error: ${response.status} ${err}`);
    }

    let fullContent = '';
    let tokensUsed = 0;
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6);
        if (json === '[DONE]') continue;

        try {
          const event = JSON.parse(json);
          if (event.type === 'content_block_delta' && event.delta?.text) {
            fullContent += event.delta.text;
            yield event.delta.text;
          } else if (event.type === 'message_delta' && event.usage) {
            tokensUsed = (event.usage.input_tokens ?? 0) + (event.usage.output_tokens ?? 0);
          }
        } catch {
          // skip malformed events
        }
      }
    }

    return { content: fullContent, model, tokens_used: tokensUsed };
  }
}
