import React from 'react';
import { observer } from 'mobx-react-lite';
import { llmStore } from '../stores';

export const LLMSelector = observer(() => {
  const { models, selectedModelId, selectedModel, isLoading, loadProgress } = llmStore;

  const handleModelChange = (modelId: string) => {
    llmStore.setSelectedModel(modelId);
  };

  const handleLoadModel = async () => {
    try {
      await llmStore.loadModel(selectedModelId);
    } catch (error) {
      console.error('Помилка завантаження моделі:', error);
    }
  };

  return (
    <div className="llm-selector-container">
      <div className="llm-selector-row">
        <label htmlFor="llm-select" className="llm-selector-label">
          Модель:
        </label>
        <select
          id="llm-select"
          className="llm-selector"
          value={selectedModelId}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={isLoading}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} {model.status === 'loaded' ? '✓' : ''}
            </option>
          ))}
        </select>
        
        {selectedModel && selectedModel.status !== 'loaded' && (
          <button
            className="btn-load-model"
            onClick={handleLoadModel}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Завантаження...' : '📥 Завантажити модель'}
          </button>
        )}
      </div>

      {isLoading && loadProgress !== null && (
        <div className="model-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(loadProgress)}%</span>
        </div>
      )}

      {selectedModel && selectedModel.status === 'error' && (
        <div className="llm-error-message">
          ❌ Помилка: {selectedModel.error || 'Не вдалося завантажити модель'}
        </div>
      )}
    </div>
  );
});

