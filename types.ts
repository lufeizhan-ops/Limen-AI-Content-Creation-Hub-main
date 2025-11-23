export enum ProjectStage {
  STRATEGY = 'STRATEGY',
  TITLES = 'TITLES',
  OUTLINE = 'OUTLINE',
  DRAFTING = 'DRAFTING',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED'
}

export enum WritingTone {
  PROFESSIONAL = 'Professional/Authoritative',
  CONVERSATIONAL = 'Conversational/Casual',
  PERSUASIVE = 'Persuasive/Sales',
  EDUCATIONAL = 'Educational/How-to',
  JOURNALISTIC = 'Journalistic',
  CUSTOM = 'Custom'
}

export enum TargetLanguage {
  ENGLISH = 'English',
  CHINESE = 'Simplified Chinese'
}

export interface ProjectStrategy {
  topic: string;
  audience: string;
  keywords: string;
  language: TargetLanguage;
  tone: WritingTone;
  customTone?: string;
  customRules?: string;
}

export interface Project {
  id: string;
  name: string;
  updatedAt: Date;
  stage: ProjectStage;
  strategy: ProjectStrategy;
  generatedTitles: string[];
  selectedTitle: string | null;
  outline: string; // Markdown
  draft: string; // Markdown
  revisionHistory: string[]; // Array of feedback/prompts used
  
  // Metadata
  slug?: string;
  shortText?: string;
  introText?: string;
}

export interface TitleGenerationResponse {
  titles: string[];
}

export interface OutlineGenerationResponse {
  outline: string;
}

export interface SeoMetadataResponse {
  slug: string;
  shortText: string;
  introText: string;
}