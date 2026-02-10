import {
  Capability,
  type LLMProvider,
  type ChatMessage,
  type ChatResponse,
  type ModelInfo,
} from './provider.interface.js';

export class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async isAvailable(): Promise<boolean> {
    return this.apiKey.length > 0;
  }

  async listModels(): Promise<ModelInfo[]> {
    return [
      { id: 'gpt-4o', name: 'GPT-4o', provider: this.name, capabilities: [Capability.Language, Capability.Vision] },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: this.name, capabilities: [Capability.Language, Capability.Vision] },
      { id: 'o1', name: 'o1', provider: this.name, capabilities: [Capability.Language, Capability.Reasoning] },
    ];
  }

  async chat(model: string, messages: ChatMessage[]): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${err}`);
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content ?? '';
    const tokensUsed = data.usage?.total_tokens ?? 0;

    return { content, model, tokens_used: tokensUsed };
  }

  async *chatStream(model: string, messages: ChatMessage[]): AsyncGenerator<string, ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${err}`);
    }

    let fullContent = '';
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
          const token = event.choices?.[0]?.delta?.content;
          if (token) {
            fullContent += token;
            yield token;
          }
        } catch {
          // skip
        }
      }
    }

    return { content: fullContent, model };
  }
}
