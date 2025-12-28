# 🚀 Быстрый старт QadamSafe

## ✅ Статус деплоя

- ✅ **Firebase Hosting**: https://qadamsafe.web.app
- ✅ **Firestore Rules & Indexes**: Задеплоены
- ⚠️ **Firebase Functions**: Требуют Blaze план (платный)

## 🏃 Локальный запуск

### Вариант 1: Запуск всего проекта (рекомендуется)

Из корневой директории проекта:
```bash
npm run dev
```

Это запустит:
- **Backend** на `http://localhost:3000`
- **Frontend** на `http://localhost:5173`

### Вариант 2: Отдельный запуск

**Терминал 1 - Backend:**
```bash
cd backend
npm run dev
```

**Терминал 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📦 Установка зависимостей

Если впервые запускаете проект:

```bash
# Установить зависимости для всех частей проекта
npm run install:all

# Или вручную:
npm install              # Корень проекта
cd backend && npm install
cd ../frontend && npm install
```

## 🌐 Доступные URL

### Production
- **Frontend**: https://qadamsafe.web.app
- **Backend API**: (требует настройки на вашем хостинге)

### Локальная разработка
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

## ⚙️ Настройка переменных окружения

### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/qadamsafe"
JWT_SECRET="your-secret-key-change-in-production"
CORS_ORIGIN="http://localhost:5173"

# Firebase (опционально)
FIREBASE_PROJECT_ID="qadamsafe"
FIREBASE_PRIVATE_KEY="..."
FIREBASE_CLIENT_EMAIL="..."
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000
```

## 🗄️ Настройка базы данных

1. Убедитесь что PostgreSQL запущен
2. Создайте базу данных:
```sql
CREATE DATABASE qadamsafe;
```

3. Примените миграции:
```bash
cd backend
npx prisma migrate dev
```

4. (Опционально) Заполните тестовыми данными:
```bash
npm run seed
```

## 🚢 Деплой

### Firebase Hosting (Frontend)

```bash
# Собрать frontend
cd frontend
npm run build

# Задеплоить
cd ..
npx firebase-tools deploy --only hosting
```

### Firebase Functions

Требует платный план Blaze. После активации:

```bash
npx firebase-tools deploy --only functions
```

### Firestore Rules & Indexes

```bash
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

## 🐛 Решение проблем

### Порт занят
- Измените `PORT` в `backend/.env`
- Или укажите другой порт для Vite в `frontend/vite.config.ts`

### Ошибки базы данных
- Проверьте что PostgreSQL запущен
- Убедитесь что база данных создана
- Проверьте `DATABASE_URL` в `.env`

### Firebase ошибки
- Проверьте что проект `qadamsafe` активен в Firebase Console
- Убедитесь что Firebase CLI установлен: `npm install -g firebase-tools`

## 📚 Дополнительная информация

- [README.md](./README.md) - Полная документация
- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Рекомендации по улучшению

