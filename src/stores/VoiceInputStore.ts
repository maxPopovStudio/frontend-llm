import { makeAutoObservable } from 'mobx';
import { VoiceInputState } from '../types';

export class VoiceInputStore {
  state: VoiceInputState = {
    isRecording: false,
    isProcessing: false
  };

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recognition: any = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeWhisper();
  }

  private async initializeWhisper() {
    try {
      // Ініціалізація Whisper через transformers.js
      const { pipeline } = await import('@xenova/transformers');
      
      try {
        this.recognition = await pipeline(
          'automatic-speech-recognition',
          'Xenova/whisper-tiny',
          {
            device: 'webgpu'
          }
        );
      } catch (webgpuError) {
        // Fallback на CPU
        console.warn('WebGPU недоступний для Whisper, використовуємо CPU');
        this.recognition = await pipeline(
          'automatic-speech-recognition',
          'Xenova/whisper-tiny',
          {
            device: 'cpu'
          }
        );
      }
    } catch (error) {
      console.error('Помилка ініціалізації Whisper:', error);
      this.state.error = 'Не вдалося завантажити Whisper модель';
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.processAudio();
      };

      this.mediaRecorder.start();
      this.state.isRecording = true;
    } catch (error: any) {
      this.state.error = error?.message || 'Помилка доступу до мікрофона';
      this.state.isRecording = false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.state.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      this.state.isRecording = false;
    }
  }

  private async processAudio() {
    if (this.audioChunks.length === 0) return;

    this.state.isProcessing = true;
    this.state.error = undefined;

    try {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      if (!this.recognition) {
        await this.initializeWhisper();
      }

      if (this.recognition) {
        // Конвертуємо Blob в ArrayBuffer для Whisper
        // Примітка: Whisper потребує правильну обробку аудіо
        // Тут спрощена версія - в реальному застосунку потрібна правильна конвертація
        const arrayBuffer = await audioBlob.arrayBuffer();
        
        // Використовуємо AudioContext для конвертації
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const audioData = audioBuffer.getChannelData(0);

        const result = await this.recognition(audioData, {
          return_timestamps: false
        });

        this.state.transcript = result?.text || '';
      } else {
        throw new Error('Whisper модель не завантажена');
      }
    } catch (error: any) {
      this.state.error = error?.message || 'Помилка обробки аудіо';
    } finally {
      this.state.isProcessing = false;
    }
  }

  clearTranscript() {
    this.state.transcript = undefined;
    this.state.error = undefined;
  }

  reset() {
    this.stopRecording();
    this.state = {
      isRecording: false,
      isProcessing: false
    };
    this.audioChunks = [];
  }
}

