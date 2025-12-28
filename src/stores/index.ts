import { LLMStore } from './LLMStore';
import { TextAnalysisStore } from './TextAnalysisStore';
import { ChartStore } from './ChartStore';
import { VoiceInputStore } from './VoiceInputStore';

// Створюємо екземпляри stores
export const llmStore = new LLMStore();
export const textAnalysisStore = new TextAnalysisStore(llmStore);
export const chartStore = new ChartStore();
export const voiceInputStore = new VoiceInputStore();

// Експортуємо типи для використання
export type { LLMStore, TextAnalysisStore, ChartStore, VoiceInputStore };

