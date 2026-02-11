/**
 * Text-to-Speech service — uses OpenAI TTS API to convert text to audio.
 */

export async function textToSpeech(
  text: string,
  apiKey: string,
  voice: string = 'nova',
): Promise<Buffer> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI TTS API error (${response.status}): ${errorBody}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
