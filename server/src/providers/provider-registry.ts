import type { LLMProvider, VisionProvider } from './provider.interface.js';
import { Capability } from './provider.interface.js';

export interface CapabilitySlot {
  capability: Capability;
  provider: LLMProvider | VisionProvider;
  model: string;
}

/** Maps each capability to a provider + model, with optional fallback chain */
class ProviderRegistry {
  private slots = new Map<Capability, CapabilitySlot[]>();
  private providers = new Map<string, LLMProvider | VisionProvider>();

  registerProvider(provider: LLMProvider | VisionProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): LLMProvider | VisionProvider | undefined {
    return this.providers.get(name);
  }

  getAllProviders(): Map<string, LLMProvider | VisionProvider> {
    return this.providers;
  }

  /** Assign a provider+model to a capability slot (first = primary, rest = fallbacks) */
  assign(capability: Capability, providerName: string, model: string): void {
    const provider = this.providers.get(providerName);
    if (!provider) throw new Error(`Unknown provider: ${providerName}`);

    const slot: CapabilitySlot = { capability, provider, model };
    const existing = this.slots.get(capability) ?? [];
    existing.push(slot);
    this.slots.set(capability, existing);
  }

  /** Resolve the primary provider+model for a capability */
  resolve(capability: Capability): CapabilitySlot | undefined {
    const chain = this.slots.get(capability);
    return chain?.[0];
  }

  /** Get the full fallback chain for a capability */
  resolveChain(capability: Capability): CapabilitySlot[] {
    return this.slots.get(capability) ?? [];
  }

  /** Get all capability assignments */
  getSlots(): Map<Capability, CapabilitySlot[]> {
    return this.slots;
  }
}

// Singleton
export const registry = new ProviderRegistry();
