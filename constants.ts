import { WritingTone, TargetLanguage } from './types';

export const TONE_OPTIONS = [
  { value: WritingTone.PROFESSIONAL, label: 'Professional & Authoritative' },
  { value: WritingTone.CONVERSATIONAL, label: 'Conversational & Casual' },
  { value: WritingTone.PERSUASIVE, label: 'Persuasive & Sales-focused' },
  { value: WritingTone.EDUCATIONAL, label: 'Educational & How-to' },
  { value: WritingTone.JOURNALISTIC, label: 'Journalistic' },
  { value: WritingTone.CUSTOM, label: 'Custom...' },
];

export const LANGUAGE_OPTIONS = [
  { value: TargetLanguage.ENGLISH, label: 'English' },
  { value: TargetLanguage.CHINESE, label: 'Simplified Chinese' },
];

export const SYSTEM_INSTRUCTION = `You are an expert SEO and GEO (Generative Engine Optimization) Content Strategist. 
Your goal is to create high-ranking content that appeals to both human readers and AI search snapshots (like Google SGE).
Always prioritize:
1. Direct Answers: Provide clear, concise definitions or answers early in the text.
2. Structure: Use clear H2/H3 hierarchies.
3. Data: Include lists, tables, or statistical references where appropriate.
4. Keywords: Integrate provided keywords naturally but effectively.
`;