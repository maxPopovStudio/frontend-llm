import { makeAutoObservable } from 'mobx';
import { ChartConfig, EChartsConfig } from '../types';
import chartTypes from '../../echarts-chart-types.json';

export class ChartStore {
  chartConfig: ChartConfig | null = null;
  selectedChartType: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setChartConfig(config: ChartConfig) {
    this.chartConfig = config;
    this.selectedChartType = config.echartsConfig.series?.[0]?.type || null;
  }

  getChartTypeInfo(chartType: string) {
    return chartTypes.chartTypes.find(ct => ct.type === chartType);
  }

  clearChart() {
    this.chartConfig = null;
    this.selectedChartType = null;
  }

  updateEChartsConfig(updates: Partial<EChartsConfig>) {
    if (this.chartConfig) {
      this.chartConfig.echartsConfig = {
        ...this.chartConfig.echartsConfig,
        ...updates
      };
    }
  }
}

