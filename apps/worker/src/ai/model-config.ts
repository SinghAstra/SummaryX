export const MODEL_CONFIG = {
  activeModel: "llama-3.1-8b-instant",
  temperature: 0.1,
  maxInputTokens: 5000,
} as const;

export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 3.5);
}
