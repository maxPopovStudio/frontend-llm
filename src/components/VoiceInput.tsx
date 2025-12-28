import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { voiceInputStore, textAnalysisStore } from '../stores';

export const VoiceInput = observer(() => {
  const { state } = voiceInputStore;
  const { isRecording, isProcessing, transcript, error } = state;

  useEffect(() => {
    // Автоматично вставляємо транскрипт в поле вводу
    if (transcript && !isProcessing) {
      textAnalysisStore.setInputText(transcript);
      voiceInputStore.clearTranscript();
    }
  }, [transcript, isProcessing]);

  const handleStartRecording = () => {
    voiceInputStore.startRecording();
  };

  const handleStopRecording = () => {
    voiceInputStore.stopRecording();
  };

  return (
    <div className="voice-input-inline">
      {!isRecording ? (
        <button
          className="voice-button-inline voice-button-start"
          onClick={handleStartRecording}
          disabled={isProcessing}
          title="Почати голосовий запис"
        >
          🎤
        </button>
      ) : (
        <button
          className="voice-button-inline voice-button-stop"
          onClick={handleStopRecording}
          title="Зупинити запис"
        >
          ⏹
        </button>
      )}
      {isProcessing && <span className="voice-processing-inline">⏳</span>}
      {error && <span className="voice-error-inline" title={error}>❌</span>}
    </div>
  );
});

