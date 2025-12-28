import React from 'react';
import { observer } from 'mobx-react-lite';
import { textAnalysisStore } from '../stores';
import { VoiceInput } from './VoiceInput';

export const TextInput = observer(() => {
  const { inputText, maxTextLength, error } = textAnalysisStore;
  const characterCount = inputText.length;
  const isOverLimit = characterCount > maxTextLength;

  return (
    <div className="text-input-container">
      <div className="text-input-header">
        <label htmlFor="text-input" className="text-input-label">
          Текст для аналізу:
        </label>
        <VoiceInput />
      </div>
      <textarea
        id="text-input"
        className={`text-input ${isOverLimit ? 'error' : ''}`}
        value={inputText}
        onChange={(e) => textAnalysisStore.setInputText(e.target.value)}
        placeholder="Введіть текст зі структурованими даними для візуалізації..."
        rows={4}
        maxLength={maxTextLength * 2} // Дозволяємо введення, але показуємо попередження
      />
      <div className="text-input-footer">
        <span className={`character-count ${isOverLimit ? 'error' : ''}`}>
          {characterCount} / {maxTextLength}
        </span>
        {error && <span className="error-message">{error}</span>}
      </div>
    </div>
  );
});

