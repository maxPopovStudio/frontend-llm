import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { llmStore } from '../stores';

export const LLMSelector = observer(() => {
  const { models, selectedModelId, selectedModel, isLoading } = llmStore;

  useEffect(() => {
    // Автоматично завантажуємо обрану модель при монтуванні
    if (selectedModel && selectedModel.status === 'not_loaded') {
      llmStore.loadModel(selectedModelId).catch(console.error);
    }
  }, [selectedModelId]);

  const handleModelChange = async (modelId: string) => {
    llmStore.setSelectedModel(modelId);
    try {
      await llmStore.loadModel(modelId);
    } catch (error) {
      console.error('Помилка завантаження моделі:', error);
    }
  };

  return (
    <div className="llm-selector-container">
      <label htmlFor="llm-select" className="llm-selector-label">
        Оберіть LLM модель
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
            {model.name} {model.status === 'loaded' ? '✓' : model.status === 'loading' ? '⏳' : ''}
          </option>
        ))}
      </select>
      {selectedModel && (
        <div className="llm-selector-info">
          <p className="llm-description">{selectedModel.description}</p>
          <div className="llm-status">
            <span className={`status-badge status-${selectedModel.status}`}>
              {selectedModel.status === 'not_loaded' && 'Не завантажено'}
              {selectedModel.status === 'loading' && 'Завантаження...'}
              {selectedModel.status === 'loaded' && 'Завантажено'}
              {selectedModel.status === 'error' && `Помилка: ${selectedModel.error}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

