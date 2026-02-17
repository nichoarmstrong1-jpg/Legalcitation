/**
 * Known AI model names for citation detection and validation (R. 18.3).
 */
export const KNOWN_AI_MODELS: Record<string, string> = {
  'ChatGPT': 'ChatGPT',
  'GPT-4': 'GPT-4',
  'GPT-4o': 'GPT-4o',
  'GPT-3.5': 'GPT-3.5',
  'Claude': 'Claude',
  'Google Gemini': 'Google Gemini',
  'Google Gemini Advanced': 'Google Gemini Advanced',
  'Gemini Advanced': 'Google Gemini Advanced',
  'DALL-E': 'DALL-E',
  'DALL-E 3': 'DALL-E 3',
  'Midjourney': 'Midjourney',
  'Stable Diffusion': 'Stable Diffusion',
  'Copilot': 'Copilot',
  'Perplexity': 'Perplexity',
  'Llama': 'Llama',
  'Mistral': 'Mistral',
};

export const KNOWN_SEARCH_ENGINES = ['Google', 'Bing', 'DuckDuckGo', 'Yahoo'] as const;
