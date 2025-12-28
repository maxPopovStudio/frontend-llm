import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { chartStore } from '../stores';

// Реєструємо тільки необхідні компоненти
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  CanvasRenderer
]);

export const ChartVisualization = observer(() => {
  const { chartConfig, selectedChartType } = chartStore;
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && chartConfig) {
      // Ініціалізуємо діаграму
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }
      
      // Оновлюємо конфігурацію
      chartInstance.current.setOption(chartConfig.echartsConfig);
      
      // Обробка зміни розміру
      const handleResize = () => {
        chartInstance.current?.resize();
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [chartConfig]);

  useEffect(() => {
    return () => {
      // Очищуємо діаграму при розмонтуванні
      chartInstance.current?.dispose();
    };
  }, []);

  if (!chartConfig) {
    return (
      <div className="chart-placeholder">
        <p>Діаграма з'явиться після аналізу тексту</p>
      </div>
    );
  }

  const { title, description } = chartConfig;

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
        <div ref={chartRef} style={{ height: '500px', width: '100%' }} />
      </div>
    </div>
  );
});

