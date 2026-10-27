# Дракончик

Браузерная игра-раннер по мотивам офлайн-игры Chrome. HTML5 Canvas + TypeScript, без игровых движков и бэкенда.

## Запуск

Нужен Node 22+.

```bash
npm install
npm run dev
```

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Проверка типов и сборка в `dist/` |
| `npm run preview` | Локальный просмотр собранной версии |
| `npm run typecheck` | Проверка типов |
| `npm run lint` | ESLint |
| `npm test` | Юнит-тесты (Vitest) |

## Структура

- `src/config.ts` - размеры мира, цвета, баланс игры
- `src/render/` - canvas и отрисовка
- `tests/` - юнит-тесты чистой логики

## Деплой

Netlify собирает проект из GitHub по `netlify.toml`: команда `npm run build`, папка `dist`.
