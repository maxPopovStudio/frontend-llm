import { makeAutoObservable } from 'mobx';
import { LLMModel } from '../types';

export class LLMStore {
  models: LLMModel[] = [
    {
      id: 'gpt2',
      name: 'GPT-2',
      description: 'OpenAI GPT-2 модель для аналізу тексту',
      modelId: 'Xenova/gpt2',
      provider: 'transformers.js',
      status: 'not_loaded'
    }
  ];

  selectedModelId: string = 'gpt2';
  pipeline: any = null;
  isLoading: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  get selectedModel(): LLMModel | undefined {
    return this.models.find(m => m.id === this.selectedModelId);
  }

  setSelectedModel(modelId: string) {
    this.selectedModelId = modelId;
  }

  setModelStatus(modelId: string, status: LLMModel['status'], error?: string) {
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      model.status = status;
      if (error) {
        model.error = error;
      }
    }
  }

  async loadModel(modelId: string) {
    const model = this.models.find(m => m.id === modelId);
    if (!model) return;

    if (model.status === 'loaded' && this.pipeline) {
      return this.pipeline;
    }

    this.setModelStatus(modelId, 'loading');
    this.isLoading = true;

    try {
      const { pipeline } = await import('@xenova/transformers');
      
      // Завантажуємо text-generation pipeline для GPT-2
      // Використовуємо CPU як fallback, оскільки WebGPU може бути недоступний
      let textPipeline;
      try {
        textPipeline = await pipeline(
          'text-generation',
          model.modelId,
          {
            device: 'webgpu',
          }
        );
      } catch (webgpuError) {
        // Fallback на CPU якщо WebGPU недоступний
        console.warn('WebGPU недоступний, використовуємо CPU');
        textPipeline = await pipeline(
          'text-generation',
          model.modelId,
          {
            device: 'cpu',
          }
        );
      }

      this.pipeline = textPipeline;
      this.setModelStatus(modelId, 'loaded');
      return textPipeline;
    } catch (error: any) {
      const errorMessage = error?.message || 'Помилка завантаження моделі';
      this.setModelStatus(modelId, 'error', errorMessage);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async generateText(prompt: string, maxLength: number = 512): Promise<string> {
    if (!this.pipeline) {
      await this.loadModel(this.selectedModelId);
    }

    try {
      const result = await this.pipeline(prompt, {
        max_new_tokens: Math.min(maxLength, 512), // Обмежуємо для GPT-2
        temperature: 0.7,
        do_sample: true,
        return_full_text: false,
      });

      // transformers.js повертає результат у форматі масиву об'єктів
      if (Array.isArray(result) && result.length > 0) {
        const firstResult = result[0];
        // Може бути generated_text або просто текст
        return firstResult.generated_text || firstResult.text || JSON.stringify(firstResult);
      }
      
      // Якщо результат не масив, спробуємо витягти текст
      if (typeof result === 'string') {
        return result;
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      throw new Error(error?.message || 'Помилка генерації тексту');
    }
  }
}

