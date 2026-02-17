import { describe, it, expect } from 'vitest';
import { validateAiSource } from '../bluebook/ai-source-rules.js';
import type { AiSourceComponents } from '@legalcitation/shared';

function makeLlmComponents(overrides: Partial<AiSourceComponents> = {}): AiSourceComponents {
  return {
    subtype: 'llm',
    modelName: 'ChatGPT',
    date: 'Jan. 15, 2025',
    prompt: 'What is the meaning of life?',
    promptAuthor: 'John Smith',
    onFileWith: 'the Harvard Law Review',
    ...overrides,
  } as AiSourceComponents;
}

function makeSearchComponents(overrides: Partial<AiSourceComponents> = {}): AiSourceComponents {
  return {
    subtype: 'search',
    modelName: 'Bing',
    searchEngine: 'Bing',
    query: 'The Bluebook',
    resultCount: '6,050,000',
    date: 'May 22, 2024',
    onFileWith: 'the Harvard Law Review',
    ...overrides,
  } as AiSourceComponents;
}

function makeGeneratedComponents(overrides: Partial<AiSourceComponents> = {}): AiSourceComponents {
  return {
    subtype: 'generated_content',
    modelName: 'DALL-E 3',
    date: 'Mar. 1, 2025',
    generatedByModel: 'DALL-E 3',
    onFileWith: 'the Columbia Law Review',
    ...overrides,
  } as AiSourceComponents;
}

describe('R. 18.3 — AI Source Rules', () => {
  describe('Common checks', () => {
    it('flags missing model name', () => {
      const components = makeLlmComponents({ modelName: '' });
      const issues = validateAiSource(components);
      const modelErrors = issues.filter(i => i.message.includes('AI tool or model'));
      expect(modelErrors.length).toBeGreaterThan(0);
    });

    it('flags missing date', () => {
      const components = makeLlmComponents({ date: '' });
      const issues = validateAiSource(components);
      const dateErrors = issues.filter(i => i.message.includes('date'));
      expect(dateErrors.length).toBeGreaterThan(0);
    });

    it('flags missing "on file with"', () => {
      const components = makeLlmComponents({ onFileWith: undefined });
      const issues = validateAiSource(components);
      const fileErrors = issues.filter(i => i.message.includes('on file with'));
      expect(fileErrors.length).toBeGreaterThan(0);
    });
  });

  describe('LLM citations (R. 18.3(a))', () => {
    it('passes a complete LLM citation', () => {
      const components = makeLlmComponents();
      const issues = validateAiSource(components);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('flags missing prompt', () => {
      const components = makeLlmComponents({ prompt: undefined });
      const issues = validateAiSource(components);
      const promptErrors = issues.filter(i => i.rule === 'R. 18.3(a)' && i.message.includes('prompt'));
      expect(promptErrors.length).toBeGreaterThan(0);
    });

    it('flags URL in LLM citation', () => {
      const components = makeLlmComponents();
      const raw = 'ChatGPT, "test prompt" (Jan. 15, 2025), https://chat.openai.com/share/abc123 (on file with author).';
      const issues = validateAiSource(components, raw);
      const urlErrors = issues.filter(i => i.rule === 'R. 18.3(a)' && i.message.includes('URL'));
      expect(urlErrors.length).toBeGreaterThan(0);
    });

    it('warns about missing prompt author', () => {
      const components = makeLlmComponents({ promptAuthor: undefined });
      const issues = validateAiSource(components);
      const authorWarnings = issues.filter(i => i.severity === 'warning' && i.message.includes('prompted'));
      expect(authorWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Search citations (R. 18.3(b))', () => {
    it('passes a complete search citation', () => {
      const components = makeSearchComponents();
      const issues = validateAiSource(components);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('flags missing search engine', () => {
      const components = makeSearchComponents({ searchEngine: undefined });
      const issues = validateAiSource(components);
      const engineErrors = issues.filter(i => i.message.includes('search engine'));
      expect(engineErrors.length).toBeGreaterThan(0);
    });

    it('flags missing search query', () => {
      const components = makeSearchComponents({ query: undefined });
      const issues = validateAiSource(components);
      const queryErrors = issues.filter(i => i.message.includes('search query'));
      expect(queryErrors.length).toBeGreaterThan(0);
    });

    it('warns about missing result count', () => {
      const components = makeSearchComponents({ resultCount: undefined });
      const issues = validateAiSource(components);
      const countWarnings = issues.filter(i => i.message.includes('number of results'));
      expect(countWarnings.length).toBeGreaterThan(0);
    });
  });

  describe('Generated content (R. 18.3(c))', () => {
    it('passes a complete generated content citation', () => {
      const components = makeGeneratedComponents();
      const issues = validateAiSource(components);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });

    it('flags missing "generated by" parenthetical', () => {
      const components = makeGeneratedComponents({ generatedByModel: undefined });
      const issues = validateAiSource(components);
      const genErrors = issues.filter(i => i.message.includes('generated by'));
      expect(genErrors.length).toBeGreaterThan(0);
    });
  });
});
