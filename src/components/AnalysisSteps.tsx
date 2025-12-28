import React from 'react';
import { observer } from 'mobx-react-lite';
import { textAnalysisStore } from '../stores';
// @ts-ignore - JSON imports
import analysisPrompts from '../../analysis-prompts.json';

export const AnalysisSteps = observer(() => {
  const { steps, currentStepIndex, isAnalyzing } = textAnalysisStore;

  if (steps.length === 0 && !isAnalyzing) {
    return null;
  }

  return (
    <div className="analysis-steps-container">
      <h3 className="analysis-steps-title">Кроки аналізу</h3>
      <div className="analysis-steps-list">
        {steps.map((step, index) => {
          const stepConfig = analysisPrompts.steps.find(s => s.id === step.stepId);
          const isActive = index === currentStepIndex;
          const isCompleted = step.status === 'completed';
          const isError = step.status === 'error';

          return (
            <div
              key={step.stepId}
              className={`analysis-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isError ? 'error' : ''}`}
            >
              <div className="analysis-step-header">
                <div className="step-number">{index + 1}</div>
                <div className="step-info">
                  <h4 className="step-name">{stepConfig?.name || step.stepId}</h4>
                  <p className="step-description">{stepConfig?.description || ''}</p>
                </div>
                <div className="step-status">
                  {step.status === 'pending' && '⏸'}
                  {step.status === 'running' && '⏳'}
                  {step.status === 'completed' && '✓'}
                  {step.status === 'error' && '❌'}
                </div>
              </div>

              {step.status !== 'pending' && (
                <div className="analysis-step-content">
                  <div className="step-prompt">
                    <strong>Промпт:</strong>
                    <pre className="prompt-text">{step.prompt}</pre>
                  </div>

                  {step.result && (
                    <div className="step-result">
                      <strong>Результат:</strong>
                      <pre className="result-text">
                        {JSON.stringify(step.result, null, 2)}
                      </pre>
                    </div>
                  )}

                  {step.error && (
                    <div className="step-error">
                      <strong>Помилка:</strong>
                      <p className="error-text">{step.error}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

