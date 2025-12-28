import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { TextInput } from './TextInput';
import { LLMSelector } from './LLMSelector';
import { AnalysisSteps } from './AnalysisSteps';
import { ChartVisualization } from './ChartVisualization';
import { textAnalysisStore, chartStore } from '../stores';

export const App = observer(() => {
  const { isAnalyzing, error: analysisError, steps } = textAnalysisStore;
  const { chartConfig } = chartStore;

  // Автоматично оновлюємо діаграму коли аналіз завершується
  useEffect(() => {
    if (steps.length > 0 && !isAnalyzing) {
      const lastStep = steps[steps.length - 1];
      if (lastStep.status === 'completed' && lastStep.result?.echartsConfig) {
        chartStore.setChartConfig(lastStep.result);
      }
    }
  }, [steps, isAnalyzing]);

  const handleAnalyze = async () => {
    try {
      chartStore.clearChart();
      await textAnalysisStore.analyzeText();
    } catch (error) {
      console.error('Помилка аналізу:', error);
    }
  };

  const handleReset = () => {
    textAnalysisStore.reset();
    chartStore.clearChart();
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Візуалізація даних з тексту</h1>
        <p className="app-subtitle">
          Автоматичний аналіз тексту та створення діаграм за допомогою LLM
        </p>
      </header>

      <main className="app-main">
        <div className="app-controls">
          <div className="controls-section">
            <LLMSelector />
          </div>

          <div className="controls-section">
            <TextInput />
          </div>

          <div className="controls-section">
            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={isAnalyzing || textAnalysisStore.inputText.trim().length === 0}
              >
                {isAnalyzing ? '⏳ Аналіз...' : '🚀 Почати аналіз'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isAnalyzing}
              >
                🔄 Скинути
              </button>
            </div>
            {analysisError && (
              <div className="error-banner">
                ❌ {analysisError}
              </div>
            )}
          </div>
        </div>

        <div className="app-content">
          <div className="content-left">
            <AnalysisSteps />
          </div>
          <div className="content-right">
            <ChartVisualization />
          </div>
        </div>
      </main>
    </div>
  );
});

