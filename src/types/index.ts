// Types for analysis steps
export interface AnalysisStep {
  id: string;
  name: string;
  description: string;
  prompt: string;
  outputFormat: 'json' | 'text';
  requiredFields: string[];
  dependsOn?: string[];
}

export interface AnalysisStepResult {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  prompt: string;
  result?: any;
  error?: string;
  timestamp: number;
}

// Types for chart configuration
export interface ChartType {
  type: string;
  name: string;
  description: string;
  useCase: string;
  dataStructure: {
    format: string;
    example: any[];
    requiredFields: string[];
    optionalFields?: string[];
    description: string;
  };
  bestFor: string;
}

export interface EChartsConfig {
  title?: any;
  tooltip?: any;
  legend?: any;
  xAxis?: any;
  yAxis?: any;
  series: any[];
  color?: string[];
  [key: string]: any;
}

export interface ChartConfig {
  echartsConfig: EChartsConfig;
  title: string;
  description: string;
}

// Types for LLM models
export interface LLMModel {
  id: string;
  name: string;
  description: string;
  modelId: string;
  provider: 'transformers.js';
  pipelineType?: string; // Тип pipeline: 'text-generation' або 'text2text-generation'
  status: 'not_loaded' | 'loading' | 'loaded' | 'error';
  error?: string;
}

// Types for voice input
export interface VoiceInputState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript?: string;
  error?: string;
}

// Types for extracted data
export interface ExtractedData {
  extractedData: any[];
  fields: string[];
  dataCount: number;
}

export interface ValidatedData {
  isValid: boolean;
  hasNumericValues: boolean;
  hasCategories: boolean;
  minDataPoints: number;
  issues: string[];
  validatedData: any[];
}

export interface DataStructure {
  hasTimeSeries: boolean;
  hasMultipleCategories: boolean;
  hasGrouping: boolean;
  hasTwoDimensions: boolean;
  isProportional: boolean;
  isSingleValue: boolean;
  categoryCount: number;
  dataPointCount: number;
  structureDescription: string;
}

export interface ChartSelection {
  selectedChartType: string;
  confidence: number;
  reasoning: string;
  alternativeTypes: Array<{ type: string; confidence: number }>;
}

export interface FormattedChartData {
  chartData: any[];
  fields: string[];
  transformations: string[];
}

