import { makeAutoObservable, runInAction } from 'mobx';
import { AnalysisStepResult, ExtractedData, ValidatedData, DataStructure, ChartSelection, FormattedChartData } from '../types';
// @ts-ignore - JSON imports
import analysisPrompts from '../../analysis-prompts.json';
// @ts-ignore - JSON imports
import chartTypes from '../../echarts-chart-types.json';
import { LLMStore } from './LLMStore';

export class TextAnalysisStore {
  inputText: string = '';
  maxTextLength: number = 1024;
  isAnalyzing: boolean = false;
  steps: AnalysisStepResult[] = [];
  currentStepIndex: number = -1;
  error: string | null = null;

  // Intermediate results
  extractedData?: ExtractedData;
  validatedData?: ValidatedData;
  dataStructure?: DataStructure;
  chartSelection?: ChartSelection;
  formattedChartData?: FormattedChartData;

  constructor(private llmStore: LLMStore) {
    makeAutoObservable(this);
  }

  setInputText(text: string) {
    this.inputText = text;
    if (text.length > this.maxTextLength) {
      this.error = `Текст перевищує максимальну довжину ${this.maxTextLength} символів`;
    } else {
      this.error = null;
    }
  }

  async analyzeText() {
    if (!this.inputText.trim()) {
      this.error = 'Введіть текст для аналізу';
      return;
    }

    if (this.inputText.length > this.maxTextLength) {
      this.error = `Текст перевищує максимальну довжину ${this.maxTextLength} символів`;
      return;
    }

    this.isAnalyzing = true;
    this.error = null;
    this.steps = [];
    this.currentStepIndex = -1;

    try {
      // Ініціалізуємо кроки
      const prompts = analysisPrompts.steps;
      this.steps = prompts.map(step => ({
        stepId: step.id,
        status: 'pending' as const,
        prompt: step.prompt,
        timestamp: Date.now()
      }));

      // Виконуємо кроки послідовно
      for (let i = 0; i < prompts.length; i++) {
        const step = prompts[i];
        await this.executeStep(step, i);
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error?.message || 'Помилка під час аналізу';
        this.isAnalyzing = false;
      });
    }
  }

  private async executeStep(step: any, index: number) {
    runInAction(() => {
      this.currentStepIndex = index;
      if (this.steps[index]) {
        this.steps[index].status = 'running';
      }
    });

    try {
      // Підготовка промпту з підстановкою змінних
      let prompt = this.substituteVariables(step.prompt, step.id);

      // Виконання через LLM
      const result = await this.llmStore.generateText(prompt, 512);

      // Парсинг JSON відповіді
      let parsedResult: any;
      try {
        // Спробуємо витягти JSON з тексту
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON не знайдено в відповіді');
        }
      } catch (parseError) {
        throw new Error(`Помилка парсингу JSON: ${parseError}`);
      }

      // Валідація обов'язкових полів
      this.validateStepResult(parsedResult, step.requiredFields);

      // Збереження проміжних результатів
      this.saveIntermediateResult(step.id, parsedResult);

      runInAction(() => {
        if (this.steps[index]) {
          this.steps[index].status = 'completed';
          this.steps[index].result = parsedResult;
        }
      });
    } catch (error: any) {
      runInAction(() => {
        if (this.steps[index]) {
          this.steps[index].status = 'error';
          this.steps[index].error = error?.message || 'Помилка виконання кроку';
        }
        this.error = error?.message || 'Помилка виконання кроку';
      });
      throw error;
    }
  }

  private substituteVariables(prompt: string, stepId: string): string {
    let result = prompt;

    // Підстановка базових змінних
    result = result.replace(/{text}/g, this.inputText);

    // Підстановка проміжних результатів
    if (stepId === 'step2_extract_structured_data') {
      const step1Result = this.steps.find(s => s.stepId === 'step1_initial_analysis')?.result;
      if (step1Result) {
        result = result.replace(/{initialAnalysis}/g, JSON.stringify(step1Result));
      }
    }

    if (stepId === 'step3_validate_data') {
      if (this.extractedData) {
        result = result.replace(/{extractedData}/g, JSON.stringify(this.extractedData.extractedData));
      }
    }

    if (stepId === 'step4_analyze_data_structure') {
      if (this.validatedData) {
        result = result.replace(/{validatedData}/g, JSON.stringify(this.validatedData.validatedData));
      }
    }

    if (stepId === 'step5_select_chart_type') {
      // Додаємо опис типів діаграм
      const chartTypesDescription = chartTypes.chartTypes
        .map(ct => `${ct.type}: ${ct.name} - ${ct.description}. Використовується для: ${ct.useCase}`)
        .join('\n');
      result = result.replace(/{chartTypesDescription}/g, chartTypesDescription);

      if (this.dataStructure) {
        result = result.replace(/{dataStructure}/g, JSON.stringify(this.dataStructure));
      }
    }

    if (stepId === 'step6_format_chart_data') {
      if (this.chartSelection) {
        result = result.replace(/{selectedChartType}/g, this.chartSelection.selectedChartType);
        
        const selectedChartType = chartTypes.chartTypes.find(
          ct => ct.type === this.chartSelection?.selectedChartType
        );
        if (selectedChartType) {
          result = result.replace(
            /{chartTypeDataStructure}/g,
            JSON.stringify(selectedChartType.dataStructure)
          );
          result = result.replace(
            /{chartTypeExample}/g,
            JSON.stringify(selectedChartType.dataStructure.example)
          );
        }
      }

      if (this.validatedData) {
        result = result.replace(/{validatedData}/g, JSON.stringify(this.validatedData.validatedData));
      }
    }

    if (stepId === 'step7_generate_chart_config') {
      if (this.chartSelection) {
        result = result.replace(/{selectedChartType}/g, this.chartSelection.selectedChartType);
      }

      if (this.formattedChartData) {
        result = result.replace(/{chartData}/g, JSON.stringify(this.formattedChartData.chartData));
      }
    }

    return result;
  }

  private validateStepResult(result: any, requiredFields: string[]) {
    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Відсутнє обов'язкове поле: ${field}`);
      }
    }
  }

  private saveIntermediateResult(stepId: string, result: any) {
    if (stepId === 'step2_extract_structured_data') {
      this.extractedData = result as ExtractedData;
    } else if (stepId === 'step3_validate_data') {
      this.validatedData = result as ValidatedData;
      if (!result.isValid) {
        throw new Error(`Дані не валідні: ${result.issues?.join(', ') || 'невідома помилка'}`);
      }
    } else if (stepId === 'step4_analyze_data_structure') {
      this.dataStructure = result as DataStructure;
    } else if (stepId === 'step5_select_chart_type') {
      this.chartSelection = result as ChartSelection;
    } else if (stepId === 'step6_format_chart_data') {
      this.formattedChartData = result as FormattedChartData;
    }
  }

  reset() {
    this.inputText = '';
    this.isAnalyzing = false;
    this.steps = [];
    this.currentStepIndex = -1;
    this.error = null;
    this.extractedData = undefined;
    this.validatedData = undefined;
    this.dataStructure = undefined;
    this.chartSelection = undefined;
    this.formattedChartData = undefined;
  }
}

