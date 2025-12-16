# QadamSafe

Интерактивная образовательная платформа по кибербезопасности.

## Описание

QadamSafe — это production-ready MVP платформы для обучения кибербезопасности через игровые симуляции и ИИ-подготовленные сценарии. Пользователи учатся распознавать фишинг и цифровые угрозы через практические упражнения.

## Технологический стек

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication

### Frontend
- React 18
- Vite
- TypeScript
- Tailwind CSS + shadcn/ui
- react-i18next (русский, английский, казахский)

## Установка и запуск

### Требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование репозитория
```bash
cd "QadamSafe 2"
```

### 2. Настройка Backend

```bash
cd backend
npm install
```

Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT (сгенерируйте случайную строку)
- `PORT` - порт для backend (по умолчанию 3000)

Выполните миграции базы данных:
```bash
npx prisma migrate dev
```

Запустите backend:
```bash
npm run dev
```

Backend будет доступен на `http://localhost:3000`

### 3. Настройка Frontend

Откройте новый терминал:
```bash
cd frontend
npm install
```

Создайте файл `.env` (если нужно изменить URL backend):
```
VITE_API_URL=http://localhost:3000
```

Запустите frontend:
```bash
npm run dev
```

Frontend будет доступен на `http://localhost:5173`

## Структура проекта

```
QadamSafe 2/
├── backend/
│   ├── src/
│   │   ├── config/         # Конфигурация приложения
│   │   ├── middleware/     # Express middleware
│   │   ├── repositories/   # Слой доступа к данным
│   │   ├── services/       # Бизнес-логика
│   │   ├── routes/         # API маршруты
│   │   ├── types/          # TypeScript типы
│   │   └── server.ts       # Точка входа
│   ├── prisma/
│   │   └── schema.prisma   # Схема базы данных
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── contexts/       # React контексты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API клиенты
│   │   ├── i18n/           # Переводы
│   │   ├── types/          # TypeScript типы
│   │   └── App.tsx         # Главный компонент
│   └── package.json
└── README.md
```

## Основные функции

### Аутентификация
- Регистрация и вход пользователей
- JWT-токены для защищенных маршрутов
- Роли: user / admin

### Обучение
- ИИ-подготовленные сценарии фишинга
- Уровни сложности
- Отслеживание прогресса
- Анализ ошибок

### Мультиязычность
- Русский (основной)
- Английский
- Казахский
- Переключение без перезагрузки страницы

### Подписки
- Free: ограниченный доступ
- Pro: полный доступ к сценариям
- Business: корпоративные функции (заготовка)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Получить текущего пользователя

### Scenarios
- `GET /api/scenarios` - Список сценариев
- `GET /api/scenarios/:id` - Детали сценария
- `POST /api/scenarios/:id/complete` - Завершить сценарий

### Progress
- `GET /api/progress` - Прогресс пользователя
- `GET /api/progress/stats` - Статистика

### Achievements
- `GET /api/achievements` - Список достижений
- `GET /api/achievements/user` - Достижения пользователя

## Разработка

### Backend команды
```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для production
npm run start        # Запуск production версии
npx prisma studio    # Открыть Prisma Studio (GUI для БД)
```

### Frontend команды
```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run preview      # Предпросмотр production сборки
```

## Безопасность

- Все пароли хешируются с помощью bcrypt
- JWT токены для аутентификации
- Защищенные маршруты на frontend и backend
- Валидация данных на всех уровнях
- CORS настроен для безопасности

## Примечания

Это MVP версия без реальных интеграций:
- ❌ Реальные платежи
- ❌ Отправка email/SMS
- ❌ Реальные AI API вызовы

Архитектура готова для будущей интеграции Firebase (Auth, Firestore, Storage).

## Лицензия

Proprietary - QadamSafe 2024
