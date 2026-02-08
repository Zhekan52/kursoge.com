// ==================== TYPES ====================

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'admin';
  name: string;
}

export interface Lesson {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD specific date
  lessonNumber: number;
  startTime?: string;
  endTime?: string;
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  value: number;
  date: string;
  columnId?: string;
}

export interface DiaryEntry {
  id: string;
  date: string;
  lessonNumber: number;
  subject: string;
  topic: string;
  homework: string;
  grade?: number;
  testId?: string;
  checkHomework?: boolean;
  testType?: 'training' | 'real';
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  username: string;
  password: string;
}

export interface TestQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text';
  text: string;
  image?: string;
  formula?: string;
  options: { id: string; text: string; correct: boolean }[];
  correctAnswer?: string;
  points: number;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  timeLimit: number;
  gradingScale: { minPercent: number; grade: number }[];
  questions: TestQuestion[];
  assignedLessonId?: string;
  createdAt: string;
}

export interface JournalColumn {
  id: string;
  date: string;
  subject: string;
  type: 'grade' | 'homework' | 'test';
}

export interface LessonTypeEntry {
  id: string;
  date: string;
  subject: string;
  type: string;
}

export interface TestAttempt {
  id: string;
  studentId: string;
  testId: string;
  date: string;
  subject: string;
  correct: number;
  total: number;
  percent: number;
  grade: number;
  completedAt: string;
  timeSpent: number; // seconds spent on test
  answers: { questionId: string; answer: string | string[]; correct: boolean }[];
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  subject: string;
  type: 'Н' | 'УП' | 'Б' | 'ОП';
}

export const ATTENDANCE_TYPES: { value: AttendanceRecord['type']; label: string; short: string; color: string; bgColor: string }[] = [
  { value: 'Н', label: 'Неуважительная причина', short: 'Н', color: 'text-red-700', bgColor: 'bg-red-100' },
  { value: 'УП', label: 'Уважительная причина', short: 'УП', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  { value: 'Б', label: 'Болел', short: 'Б', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  { value: 'ОП', label: 'Опоздал', short: 'ОП', color: 'text-orange-700', bgColor: 'bg-orange-100' },
];

export interface CustomLessonType {
  id: string;
  value: string;
  label: string;
  color: string;
  short: string;
}

export const defaultCustomLessonTypes: CustomLessonType[] = [
  { id: 'clt1', value: 'new', label: 'Новая тема', color: 'bg-blue-100 text-blue-700', short: 'НТ' },
  { id: 'clt2', value: 'consolidation', label: 'Закрепление', color: 'bg-cyan-100 text-cyan-700', short: 'Зк' },
  { id: 'clt3', value: 'practice', label: 'Практика', color: 'bg-green-100 text-green-700', short: 'Пр' },
  { id: 'clt4', value: 'lab', label: 'Лаб. работа', color: 'bg-teal-100 text-teal-700', short: 'Лр' },
  { id: 'clt5', value: 'control', label: 'Контрольная', color: 'bg-red-100 text-red-700', short: 'Кр' },
  { id: 'clt6', value: 'independent', label: 'Самост. работа', color: 'bg-orange-100 text-orange-700', short: 'Ср' },
  { id: 'clt7', value: 'test', label: 'Тест', color: 'bg-purple-100 text-purple-700', short: 'Тс' },
  { id: 'clt8', value: 'review', label: 'Повторение', color: 'bg-amber-100 text-amber-700', short: 'Пв' },
  { id: 'clt9', value: 'exam', label: 'Зачёт', color: 'bg-rose-100 text-rose-700', short: 'Зч' },
];

// ==================== CONSTANTS ====================

export const TIME_SLOTS = [
  { num: 1, start: '08:00', end: '08:45' },
  { num: 2, start: '08:55', end: '09:40' },
  { num: 3, start: '09:50', end: '10:35' },
  { num: 4, start: '10:55', end: '11:40' },
  { num: 5, start: '11:50', end: '12:35' },
  { num: 6, start: '12:45', end: '13:30' },
  { num: 7, start: '13:40', end: '14:25' },
];

export const DAY_NAMES = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
export const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
export const MONTH_NAMES = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
export const MONTH_NAMES_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

export const SUBJECTS = [
  'Математика', 'Русский язык', 'Обществознание', 'География'
];

export const LESSON_TYPE_OPTIONS: { value: string; label: string; color: string; short: string }[] = [
  { value: '', label: 'Не указан', color: 'bg-gray-100 text-gray-500', short: '' },
  { value: 'new', label: 'Новая тема', color: 'bg-blue-100 text-blue-700', short: 'НТ' },
  { value: 'consolidation', label: 'Закрепление', color: 'bg-cyan-100 text-cyan-700', short: 'Зк' },
  { value: 'practice', label: 'Практика', color: 'bg-green-100 text-green-700', short: 'Пр' },
  { value: 'lab', label: 'Лаб. работа', color: 'bg-teal-100 text-teal-700', short: 'Лр' },
  { value: 'control', label: 'Контрольная', color: 'bg-red-100 text-red-700', short: 'Кр' },
  { value: 'independent', label: 'Самост. работа', color: 'bg-orange-100 text-orange-700', short: 'Ср' },
  { value: 'test', label: 'Тест', color: 'bg-purple-100 text-purple-700', short: 'Тс' },
  { value: 'review', label: 'Повторение', color: 'bg-amber-100 text-amber-700', short: 'Пв' },
  { value: 'exam', label: 'Зачёт', color: 'bg-rose-100 text-rose-700', short: 'Зч' },
];

// ==================== USERS ====================

export const adminUsers: User[] = [
  { id: 'u2', username: 'admin', password: '123456', role: 'admin', name: 'Директор' },
];

// ==================== STUDENTS ====================

export const initialStudents: Student[] = [
  { id: 's1', firstName: 'Максим', lastName: 'Андреев', className: '9А', username: 'andreev', password: '123456' },
  { id: 's2', firstName: 'Анна', lastName: 'Белова', className: '9А', username: 'belova', password: '123456' },
  { id: 's3', firstName: 'Дмитрий', lastName: 'Васильев', className: '9А', username: 'vasilev', password: '123456' },
  { id: 's4', firstName: 'Елена', lastName: 'Григорьева', className: '9А', username: 'grigorieva', password: '123456' },
  { id: 's5', firstName: 'Артём', lastName: 'Давыдов', className: '9А', username: 'davydov', password: '123456' },
  { id: 's6', firstName: 'Мария', lastName: 'Егорова', className: '9А', username: 'egorova', password: '123456' },
  { id: 's7', firstName: 'Иван', lastName: 'Жуков', className: '9А', username: 'zhukov', password: '123456' },
  { id: 's8', firstName: 'Ольга', lastName: 'Зайцева', className: '9А', username: 'zaitseva', password: '123456' },
  { id: 's9', firstName: 'Алексей', lastName: 'Кириллов', className: '9А', username: 'kirillov', password: '123456' },
  { id: 's10', firstName: 'Софья', lastName: 'Лазарева', className: '9А', username: 'lazareva', password: '123456' },
  { id: 's11', firstName: 'Никита', lastName: 'Морозов', className: '9А', username: 'morozov', password: '123456' },
  { id: 's12', firstName: 'Дарья', lastName: 'Николаева', className: '9А', username: 'nikolaeva', password: '123456' },
  { id: 's13', firstName: 'Павел', lastName: 'Орлов', className: '9А', username: 'orlov', password: '123456' },
  { id: 's14', firstName: 'Виктория', lastName: 'Петрова', className: '9А', username: 'petrova', password: '123456' },
  { id: 's15', firstName: 'Сергей', lastName: 'Романов', className: '9А', username: 'romanov', password: '123456' },
];

// ==================== SCHEDULE ====================

export const initialLessons: Lesson[] = [];

// ==================== GRADES ====================

export const initialGrades: Grade[] = [];

// ==================== DIARY ENTRIES ====================

function generateDiaryEntries(): DiaryEntry[] {
  // No initial lessons, so no diary entries
  return [];
}

export const initialDiaryEntries: DiaryEntry[] = generateDiaryEntries();

// ==================== TESTS ====================

export const initialTests: Test[] = [
  {
    id: 't1', title: 'Квадратные уравнения', subject: 'Математика', timeLimit: 30,
    gradingScale: [{ minPercent: 90, grade: 5 }, { minPercent: 70, grade: 4 }, { minPercent: 50, grade: 3 }, { minPercent: 0, grade: 2 }],
    questions: [
      { id: 'q1', type: 'single', text: 'Решите: x² - 5x + 6 = 0', formula: 'x² - 5x + 6 = 0', options: [{ id: 'o1', text: 'x=2, x=3', correct: true }, { id: 'o2', text: 'x=-2, x=-3', correct: false }, { id: 'o3', text: 'x=1, x=6', correct: false }, { id: 'o4', text: 'x=-1, x=-6', correct: false }], points: 2 },
      { id: 'q2', type: 'multiple', text: 'Какие уравнения квадратные?', options: [{ id: 'o5', text: '2x²+3x-1=0', correct: true }, { id: 'o6', text: '3x+5=0', correct: false }, { id: 'o7', text: 'x²=16', correct: true }, { id: 'o8', text: 'x³-x=0', correct: false }], points: 3 },
      { id: 'q3', type: 'text', text: 'Дискриминант: 2x²-4x+1=0', formula: 'D=b²-4ac', options: [], correctAnswer: '8', points: 2 },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2', title: 'Климат и природные зоны', subject: 'География', timeLimit: 45,
    gradingScale: [{ minPercent: 85, grade: 5 }, { minPercent: 65, grade: 4 }, { minPercent: 45, grade: 3 }, { minPercent: 0, grade: 2 }],
    questions: [
      { id: 'q4', type: 'single', text: 'Какой климат преобладает в центральной части России?', options: [{ id: 'o9', text: 'Умеренно-континентальный', correct: true }, { id: 'o10', text: 'Субтропический', correct: false }, { id: 'o11', text: 'Арктический', correct: false }, { id: 'o12', text: 'Экваториальный', correct: false }], points: 1 },
      { id: 'q5', type: 'text', text: 'Назовите самую длинную реку России', options: [], correctAnswer: 'Лена', points: 2 },
    ],
    createdAt: new Date().toISOString(),
  },
];

// ==================== HELPERS ====================

export function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const dates: Date[] = [];
  for (let i = 0; i < 6; i++) {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    dates.push(dd);
  }
  return dates;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateRu(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES_GEN[date.getMonth()]}`;
}

export function getMonthDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay();
  if (startDow === 0) startDow = 7;
  startDow -= 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
