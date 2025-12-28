import React from 'react';
import { observer } from 'mobx-react-lite';
import ReactECharts from 'echarts-for-react';
import { chartStore } from '../stores';

export const ChartVisualization = observer(() => {
  const { chartConfig, selectedChartType } = chartStore;

  if (!chartConfig) {
    return (
      <div className="chart-placeholder">
        <p>Діаграма з'явиться після аналізу тексту</p>
      </div>
    );
  }

  const { echartsConfig, title, description } = chartConfig;

  return (
    <div className="chart-visualization-container">
      <div className="chart-header">
        <h2 className="chart-title">{title}</h2>
        {description && <p className="chart-description">{description}</p>}
        {selectedChartType && (
          <span className="chart-type-badge">{selectedChartType}</span>
        )}
      </div>
      <div className="chart-wrapper">
        <ReactECharts
          option={echartsConfig}
          style={{ height: '500px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
});

