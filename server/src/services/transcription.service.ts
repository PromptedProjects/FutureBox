/**
 * Transcription service — uses OpenAI Whisper API to convert audio to text.
 */

export async function transcribeAudio(base64Audio: string, apiKey: string, language?: string): Promise<string> {
  const audioBuffer = Buffer.from(base64Audio, 'base64');
  const blob = new Blob([audioBuffer], { type: 'audio/mp4' });
  const file = new File([blob], 'audio.m4a', { type: 'audio/mp4' });

  const form = new FormData();
  form.append('file', file);
  form.append('model', 'whisper-1');
  if (language) form.append('language', language);

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI Whisper API error (${response.status}): ${errorBody}`);
  }

  const result = (await response.json()) as { text: string };
  return result.text;
}
