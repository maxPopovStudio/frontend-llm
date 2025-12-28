# Структура проекту

## Загальна структура

```
frontend-llm/
├── src/
│   ├── components/          # React компоненти
│   │   ├── App.tsx         # Головний компонент застосунку
│   │   ├── TextInput.tsx   # Поле вводу тексту
│   │   ├── LLMSelector.tsx # Вибір LLM моделі
│   │   ├── VoiceInput.tsx  # Голосовий ввід
│   │   ├── AnalysisSteps.tsx # Відображення кроків аналізу
│   │   └── ChartVisualization.tsx # Візуалізація діаграми
│   ├── stores/              # MobX stores
│   │   ├── index.ts        # Експорт всіх stores
│   │   ├── LLMStore.ts     # Управління LLM моделями
│   │   ├── TextAnalysisStore.ts # Управління процесом аналізу
│   │   ├── ChartStore.ts   # Управління діаграмами
│   │   └── VoiceInputStore.ts # Управління голосовим вводом
│   ├── types/               # TypeScript типи
│   │   └── index.ts        # Всі типи та інтерфейси
│   ├── main.tsx            # Точка входу React застосунку
│   ├── index.css           # Глобальні стилі
│   └── vite-env.d.ts       # TypeScript декларації для Vite
├── analysis-prompts.json    # Промпти для аналізу тексту
├── echarts-chart-types.json # Опис типів діаграм
├── package.json            # Залежності та скрипти
├── tsconfig.json           # TypeScript конфігурація
├── vite.config.ts          # Vite конфігурація
├── index.html              # HTML шаблон
├── README.md               # Опис проекту
└── INSTALL.md             # Інструкція з встановлення
```

## Основні компоненти

### Stores (MobX)

- **LLMStore**: Завантаження та управління LLM моделями через transformers.js
- **TextAnalysisStore**: Виконання покрокового аналізу тексту з використанням промптів
- **ChartStore**: Зберігання та управління конфігурацією діаграм
- **VoiceInputStore**: Управління голосовим вводом через Whisper

### Компоненти

- **App**: Головний компонент, оркеструє всі інші компоненти
- **TextInput**: Поле вводу з лічильником символів та валідацією
- **LLMSelector**: Вибір та завантаження LLM моделі
- **VoiceInput**: Голосовий ввід з індикаторами стану
- **AnalysisSteps**: Відображення всіх кроків аналізу з промптами та результатами
- **ChartVisualization**: Візуалізація діаграми через ECharts

## Потік даних

1. Користувач вводить текст або використовує голосовий ввід
2. TextAnalysisStore виконує покроковий аналіз через LLM
3. Кожен крок використовує свій промпт з analysis-prompts.json
4. Проміжні результати зберігаються в TextAnalysisStore
5. Після завершення аналізу ChartStore отримує конфігурацію діаграми
6. ChartVisualization відображає діаграму через ECharts

## Конфігураційні файли

- **analysis-prompts.json**: Містить всі промпти для аналізу тексту
- **echarts-chart-types.json**: Опис типів діаграм та їх структур даних

## Технології

- **React 18**: UI фреймворк
- **MobX**: Управління станом
- **TypeScript**: Типізація
- **Vite**: Build tool
- **ECharts**: Візуалізація діаграм
- **transformers.js**: LLM моделі в браузері

