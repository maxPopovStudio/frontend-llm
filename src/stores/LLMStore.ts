import { makeAutoObservable, runInAction } from 'mobx';
import { LLMModel } from '../types';

// Зберігаємо pipeline поза класом, щоб MobX гарантовано його не чіпав
let globalPipeline: any = null;

export class LLMStore {
  models: LLMModel[] = [
    {
      id: 'flan-t5',
      name: 'LaMini-Flan-T5',
      description: 'Google Flan-T5 (248M) - розумна модель для інструкцій',
      modelId: 'Xenova/LaMini-Flan-T5-248M',
      provider: 'transformers.js',
      pipelineType: 'text2text-generation',
      status: 'not_loaded'
    },
    {
      id: 'phi-3',
      name: 'Phi-3 Mini',
      description: 'Microsoft Phi-3 Mini (3.8B quantized) - потужна, але важка',
      modelId: 'Xenova/Phi-3-mini-4k-instruct',
      provider: 'transformers.js',
      pipelineType: 'text-generation',
      status: 'not_loaded'
    },
    {
      id: 'qwen-1.5',
      name: 'Qwen 1.5 Chat',
      description: 'Qwen 1.5 (0.5B) - швидка та якісна модель',
      modelId: 'Xenova/Qwen1.5-0.5B-Chat',
      provider: 'transformers.js',
      pipelineType: 'text-generation',
      status: 'not_loaded'
    }
  ];

  selectedModelId: string = 'flan-t5';
  // pipeline винесено у globalPipeline
  isLoading: boolean = false;
  loadProgress: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setLoadProgress(progress: number) {
    // Захист від глюків прогресу з різних callback-форматів
    const clamped = Math.max(0, Math.min(100, progress));
    this.loadProgress = Number.isFinite(clamped) ? clamped : this.loadProgress;
  }

  private normalizeProgressValue(raw: any): number | null {
    // transformers.js може присилати:
    // - progress: 0..1
    // - progress: 0..100
    // - loaded/total
    if (raw == null) return null;

    // Якщо прилетів просто number
    if (typeof raw === 'number') {
      if (!Number.isFinite(raw)) return null;
      // 0..1 -> частка
      if (raw >= 0 && raw <= 1) return raw * 100;
      // 0..100 -> %
      if (raw >= 0 && raw <= 100) return raw;
      // все інше — вже "дивне"
      return null;
    }

    // Якщо прилетів об’єкт
    if (typeof raw === 'object') {
      // Найчастіше: { progress: number }
      if (typeof raw.progress === 'number') {
        return this.normalizeProgressValue(raw.progress);
      }
      // Або: { loaded, total }
      if (typeof raw.loaded === 'number' && typeof raw.total === 'number' && raw.total > 0) {
        const frac = raw.loaded / raw.total;
        return this.normalizeProgressValue(frac);
      }
    }

    return null;
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

    if (model.status === 'loaded' && globalPipeline) {
      return globalPipeline;
    }

    runInAction(() => {
      this.setModelStatus(modelId, 'loading');
      this.isLoading = true;
      this.loadProgress = 0;
    });

    try {
      // Динамічно імпортуємо transformers.js тільки при натисканні кнопки
      runInAction(() => this.setLoadProgress(5));
      
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Налаштовуємо env
      if (env) {
        env.allowLocalModels = false;
        env.allowRemoteModels = true;
        env.useBrowserCache = true;
        
        // Явно вказуємо шлях до WASM файлів на CDN, щоб уникнути проблем з локальними шляхами через alias
        env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/';
        env.backends.onnx.wasm.numThreads = 1; // Обмежуємо потоки для стабільності
      }
      
      runInAction(() => this.setLoadProgress(10));
      
      // Використовуємо WASM backend
      runInAction(() => this.setLoadProgress(15));
      
      const pipelineType = model.pipelineType || 'text2text-generation';
      const textPipeline = await pipeline(
        pipelineType,
        model.modelId,
        {
          progress_callback: (progress: any) => {
            // Оновлюємо прогрес завантаження моделі (15-95%)
            const pct = this.normalizeProgressValue(progress);
            if (pct == null) return;
            runInAction(() => {
              // 15..95, щоб лишити місце під "фіналізацію"
              const mapped = 15 + (pct * 0.8);
              this.setLoadProgress(mapped);
            });
          }
        }
      );

      runInAction(() => {
        this.setLoadProgress(100);
        globalPipeline = textPipeline;
        this.setModelStatus(modelId, 'loaded');
      });
      
      return textPipeline;
    } catch (error: any) {
      const errorMessage = error?.message || 'Помилка завантаження моделі';
      runInAction(() => {
        this.setModelStatus(modelId, 'error', errorMessage);
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
        this.loadProgress = null;
      });
    }
  }

  async generateText(prompt: string, maxLength: number = 512): Promise<string> {
    if (!globalPipeline) {
      await this.loadModel(this.selectedModelId);
    }

    try {
      const result = await globalPipeline(prompt, {
        max_new_tokens: 512,
        do_sample: false, // Greedy search для стабільності та детермінізму
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

