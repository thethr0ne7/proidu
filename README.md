# ПРОЙДУ? — exact working build

Это не новая сборка и не редизайн. Это восстановленная рабочая dist-структура из переданных main-файлов.

## Структура

- `index.html`
- `assets/index-B8QPXbw2.js`
- `assets/index-B2qev5cU.css`
- `BUILD_MANIFEST.json`

## Как залить в GitHub

1. В репозитории оставь ровно эту структуру.
2. Не удаляй папку `assets`.
3. `index.html` должен лежать в корне.
4. GitHub Pages должен смотреть на root/main.

## Что проверено

- Telegram WebApp script подключён в `index.html`.
- JS bundle содержит live search endpoint `/functions/v1/search`.
- JS bundle содержит route endpoint `/functions/v1/route`.
- Цена полного маршрута в интерфейсе: 149 ⭐.

## Важно

Не заливай поверх этой сборки мои предыдущие AI Factory архивы, они меняли UI.
