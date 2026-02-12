import type { Buddy, Space, SpaceData } from './types';
import { getSpaceData } from './space-manager';

export function getBuddySystemPrompt(buddy: Buddy, space: Space, data?: SpaceData): string {
  let prompt = `You are ${buddy.name}, a specialized AI buddy inside FutureBuddy's "${space.name}" space.\n\n`;
  prompt += `PERSONALITY:\n${buddy.personality}\n\n`;
  prompt += `RULES:\n`;
  prompt += `- Stay in character as ${buddy.name} at all times.\n`;
  prompt += `- You only know about and discuss topics related to the "${space.name}" space.\n`;
  prompt += `- Be concise and direct.\n`;
  prompt += `- When the user asks you to DO something, call the appropriate tool if available.\n`;

  if (data && Object.keys(data).length > 0) {
    prompt += `\nSPACE DATA (current state):\n`;
    prompt += JSON.stringify(data, null, 2);
  }

  return prompt;
}

export async function buildBuddyPrompt(space: Space): Promise<string> {
  const data = await getSpaceData(space.id);
  return getBuddySystemPrompt(space.buddy, space, data);
}
