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
    <div className="voice-input-container">
      <div className="voice-input-controls">
        {!isRecording ? (
          <button
            className="voice-button voice-button-start"
            onClick={handleStartRecording}
            disabled={isProcessing}
          >
            🎤 Почати запис
          </button>
        ) : (
          <button
            className="voice-button voice-button-stop"
            onClick={handleStopRecording}
          >
            ⏹ Зупинити запис
          </button>
        )}
      </div>

      {isRecording && (
        <div className="voice-recording-indicator">
          <span className="recording-dot"></span>
          Запис триває...
        </div>
      )}

      {isProcessing && (
        <div className="voice-processing">
          ⏳ Обробка аудіо...
        </div>
      )}

      {error && (
        <div className="voice-error">
          ❌ {error}
        </div>
      )}

      {transcript && !isProcessing && (
        <div className="voice-transcript">
          <strong>Розпізнаний текст:</strong>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
});

