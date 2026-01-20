# 📚 План улучшения TeacherDashboard

## Текущее состояние

### ✅ Что уже есть:
- Создание классов с уникальным кодом
- Просмотр списка учеников класса
- Статистика: XP, прогресс, серия дней
- Статусы учеников (активен / неактивен / требует внимания)
- Поиск и фильтрация учеников
- Экспорт отчёта в CSV
- Адаптивный дизайн

### ❌ Чего не хватает:
- Данные хранятся только в state (не в Firestore)
- Ученики не могут присоединиться по коду
- Нет назначения заданий
- Нет уведомлений для учителя
- Нет детальной аналитики по сценариям

---

## 🚀 План улучшений (4 фазы)

---

## Фаза 1: Интеграция с Firestore (1-2 дня)

### 1.1 Схема базы данных

```
/classrooms/{classroomId}
├── name: string
├── grade: string
├── code: string (уникальный, 8 символов)
├── teacherId: string (uid учителя)
├── createdAt: timestamp
├── settings: {
│   └── allowJoin: boolean
│   └── scenariosRequired: string[] (ID обязательных сценариев)
│ }
└── /students/{studentId} (subcollection)
    ├── joinedAt: timestamp
    └── role: "student"

/users/{userId}
├── classroomIds: string[] (ID классов, где состоит)
├── classroomCode: string (если присоединился по коду)
└── ... (остальные поля)
```

### 1.2 Задачи

| Задача | Описание | Файлы |
|--------|----------|-------|
| Создать сервис | `classroomService.ts` для CRUD операций | `services/` |
| Обновить Firestore Rules | Разрешить учителям управлять своими классами | `firestore.rules` |
| Заменить mock-данные | Загружать классы из Firestore | `TeacherDashboard.tsx` |
| Добавить индексы | Для быстрого поиска по коду класса | `firestore.indexes.json` |

### 1.3 Cloud Functions

```javascript
// functions/index.js

// Присоединение ученика к классу по коду
exports.joinClassroom = functions.https.onCall(async (data, context) => {
  const { code } = data;
  const userId = context.auth.uid;
  
  // Найти класс по коду
  const classroomQuery = await db.collection('classrooms')
    .where('code', '==', code.toUpperCase())
    .limit(1)
    .get();
  
  if (classroomQuery.empty) {
    throw new functions.https.HttpsError('not-found', 'Класс не найден');
  }
  
  const classroom = classroomQuery.docs[0];
  
  // Добавить ученика в subcollection
  await classroom.ref.collection('students').doc(userId).set({
    joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    role: 'student'
  });
  
  // Обновить профиль пользователя
  await db.collection('users').doc(userId).update({
    classroomIds: admin.firestore.FieldValue.arrayUnion(classroom.id)
  });
  
  return { success: true, classroomName: classroom.data().name };
});
```

---

## Фаза 2: Присоединение учеников (1 день)

### 2.1 UI для ученика

Добавить в **SettingsPage** или **DashboardPage** блок "Присоединиться к классу":

```tsx
// components/JoinClassroomModal.tsx

const JoinClassroomModal = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleJoin = async () => {
    setLoading(true);
    try {
      const joinClassroom = httpsCallable(functions, 'joinClassroom');
      const result = await joinClassroom({ code: code.toUpperCase() });
      toast.success(`Вы присоединились к классу "${result.data.classroomName}"`);
      onClose();
    } catch (err) {
      setError('Класс не найден. Проверьте код.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Присоединиться к классу</h3>
      <p>Введите код, который дал вам учитель</p>
      <input 
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="QS7A2024"
        maxLength={8}
        className="font-mono text-center text-2xl tracking-widest"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button onClick={handleJoin} disabled={loading || code.length < 6}>
        {loading ? 'Присоединение...' : 'Присоединиться'}
      </button>
    </Modal>
  );
};
```

### 2.2 Отображение класса в профиле ученика

В **SettingsPage** показать:
- Название класса, к которому присоединён
- Имя учителя
- Кнопка "Покинуть класс"

---

## Фаза 3: Назначение заданий (2-3 дня)

### 3.1 Схема данных

```
/classrooms/{classroomId}/assignments/{assignmentId}
├── title: string ("Пройти SMS-фишинг до пятницы")
├── description: string
├── scenarioIds: string[] (какие сценарии нужно пройти)
├── dueDate: timestamp
├── createdAt: timestamp
├── status: "active" | "completed"
└── /submissions/{studentId}
    ├── completedAt: timestamp
    ├── score: number
    └── scenarioResults: { [scenarioId]: { score, mistakes } }
```

### 3.2 UI для учителя

#### Создание задания:

```tsx
// components/CreateAssignmentModal.tsx

const CreateAssignmentModal = ({ classroomId, onClose }) => {
  const [title, setTitle] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const { scenarios } = useScenarios(); // Получить список всех сценариев
  
  return (
    <Modal>
      <h3>Новое задание</h3>
      
      <input 
        placeholder="Название задания"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <div>
        <label>Выберите сценарии:</label>
        {scenarios.map(s => (
          <label key={s.id} className="flex items-center gap-2">
            <input 
              type="checkbox"
              checked={selectedScenarios.includes(s.id)}
              onChange={() => toggleScenario(s.id)}
            />
            {s.title} ({s.difficulty})
          </label>
        ))}
      </div>
      
      <input 
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
      />
      
      <button onClick={handleCreate}>Создать задание</button>
    </Modal>
  );
};
```

#### Просмотр заданий в ClassDetailView:

```tsx
// Добавить вкладки: "Ученики" | "Задания"

<Tabs defaultValue="students">
  <TabsList>
    <TabsTrigger value="students">Ученики</TabsTrigger>
    <TabsTrigger value="assignments">Задания</TabsTrigger>
  </TabsList>
  
  <TabsContent value="students">
    {/* Текущий список учеников */}
  </TabsContent>
  
  <TabsContent value="assignments">
    <AssignmentsList classroomId={classroom.id} />
  </TabsContent>
</Tabs>
```

### 3.3 UI для ученика

В **TrainingPage** показывать:
- Бейдж "Задание от учителя" на сценариях
- "Дедлайн: 15 января" 
- Notification при приближении дедлайна

---

## Фаза 4: Аналитика и уведомления (1-2 дня)

### 4.1 Расширенная аналитика

Добавить в ClassDetailView:

```tsx
// Графики и детальная статистика

<AnalyticsSection classroom={classroom}>
  {/* 1. Прогресс по сценариям */}
  <ScenarioCompletionChart students={students} />
  
  {/* 2. Типичные ошибки */}
  <CommonMistakesTable classroomId={classroom.id} />
  
  {/* 3. Активность по дням */}
  <WeeklyActivityChart students={students} />
  
  {/* 4. Сравнение с другими классами */}
  <ClassComparison teacherId={user.uid} />
</AnalyticsSection>
```

### 4.2 Уведомления для учителя

```javascript
// Cloud Function: Ежедневная проверка (Cloud Scheduler)
exports.checkAtRiskStudents = functions.pubsub
  .schedule('0 9 * * *') // Каждый день в 9:00
  .timeZone('Asia/Almaty')
  .onRun(async () => {
    // Найти учеников, которые не заходили > 5 дней
    // Отправить email учителю
  });

// Cloud Function: Уведомление о дедлайне
exports.sendDeadlineReminder = functions.pubsub
  .schedule('0 18 * * *') // Каждый день в 18:00
  .onRun(async () => {
    // Найти задания с дедлайном завтра
    // Отправить push-уведомления ученикам
  });
```

### 4.3 Электронные отчёты

Улучшить экспорт:
- PDF-отчёт с графиками (jsPDF + Chart.js)
- Отправка на email учителя
- Форматирование для родительских собраний

---

## 📋 Итоговый чеклист

### Фаза 1: Firestore интеграция
- [ ] Создать `services/classroomService.ts`
- [ ] Обновить `firestore.rules`
- [ ] Добавить индексы в `firestore.indexes.json`
- [ ] Написать Cloud Function `createClassroom`
- [ ] Заменить mock-данные на реальные запросы

### Фаза 2: Присоединение учеников
- [ ] Cloud Function `joinClassroom`
- [ ] Компонент `JoinClassroomModal`
- [ ] UI в SettingsPage или DashboardPage
- [ ] Отображение класса в профиле ученика

### Фаза 3: Назначение заданий
- [ ] Схема `assignments` в Firestore
- [ ] Компонент `CreateAssignmentModal`
- [ ] Вкладка "Задания" в ClassDetailView
- [ ] Отображение заданий для учеников в TrainingPage
- [ ] Cloud Function для отслеживания выполнения

### Фаза 4: Аналитика и уведомления
- [ ] Компоненты графиков (Chart.js или Recharts)
- [ ] Cloud Functions для уведомлений
- [ ] PDF-экспорт отчётов
- [ ] Email-уведомления учителям

---

## ⏱️ Оценка времени

| Фаза | Описание | Время |
|------|----------|-------|
| 1 | Firestore интеграция | 1-2 дня |
| 2 | Присоединение учеников | 1 день |
| 3 | Назначение заданий | 2-3 дня |
| 4 | Аналитика и уведомления | 1-2 дня |
| **Итого** | **Полная реализация** | **5-8 дней** |

---

## 🎯 Приоритеты

**Must Have (обязательно):**
1. Firestore интеграция (без этого ничего не работает)
2. Присоединение учеников по коду

**Should Have (желательно):**
3. Назначение заданий
4. Базовые уведомления

**Nice to Have (бонус):**
5. Расширенная аналитика с графиками
6. PDF-отчёты
7. Сравнение классов

---

## 🚦 Рекомендация: С чего начать?

**Начать с Фазы 1 + 2** — это даст рабочий MVP за 2-3 дня:
- Учитель создаёт класс → получает код
- Ученик вводит код → присоединяется
- Учитель видит реальный прогресс учеников

После этого можно добавлять задания и аналитику по запросам школ.
