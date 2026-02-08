import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  type User, type Lesson, type Grade, type DiaryEntry, type Student, type Test,
  type JournalColumn, type LessonTypeEntry, type CustomLessonType, type AttendanceRecord, type TestAttempt,
  adminUsers, initialLessons, initialGrades, initialDiaryEntries, initialStudents, initialTests, defaultCustomLessonTypes
} from './data';

const DATA_VERSION = 'v6';

function checkAndClearOldData() {
  const storedVersion = localStorage.getItem('data_version');
  if (storedVersion !== DATA_VERSION) {
    // Clear all old cached data so fresh defaults apply
    const keysToRemove = [
      'data_lessons', 'data_grades', 'data_diary', 'data_students',
      'data_tests', 'data_journal_columns', 'data_lesson_types',
      'data_custom_lesson_types', 'data_attendance',
      'data_test_attempts', 'data_test_retakes'
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));
    localStorage.setItem('data_version', DATA_VERSION);
  }
}

// Run on module load
checkAndClearOldData();

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error(`Error loading ${key}`, e); }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (e) { console.error(`Error saving ${key}`, e); }
}

// ==================== AUTH ====================
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadFromStorage<User | null>('auth_user', null));

  const login = useCallback((username: string, password: string): boolean => {
    const admin = adminUsers.find(u => u.username === username && u.password === password);
    if (admin) { setUser(admin); saveToStorage('auth_user', admin); return true; }
    const studentsData = loadFromStorage<Student[]>('data_students', initialStudents);
    const student = studentsData.find(s => s.username === username && s.password === password);
    if (student) {
      const su: User = { id: student.id, username: student.username, password: student.password, role: 'student', name: `${student.lastName} ${student.firstName}` };
      setUser(su); saveToStorage('auth_user', su); return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => { setUser(null); localStorage.removeItem('auth_user'); }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// ==================== DATA ====================
interface DataContextType {
  lessons: Lesson[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  grades: Grade[];
  setGrades: React.Dispatch<React.SetStateAction<Grade[]>>;
  diaryEntries: DiaryEntry[];
  setDiaryEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  tests: Test[];
  setTests: React.Dispatch<React.SetStateAction<Test[]>>;
  journalColumns: JournalColumn[];
  setJournalColumns: React.Dispatch<React.SetStateAction<JournalColumn[]>>;
  lessonTypes: LessonTypeEntry[];
  setLessonTypes: React.Dispatch<React.SetStateAction<LessonTypeEntry[]>>;
  customLessonTypes: CustomLessonType[];
  setCustomLessonTypes: React.Dispatch<React.SetStateAction<CustomLessonType[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  testAttempts: TestAttempt[];
  setTestAttempts: React.Dispatch<React.SetStateAction<TestAttempt[]>>;
  testRetakes: { studentId: string; testId: string; date: string }[];
  setTestRetakes: React.Dispatch<React.SetStateAction<{ studentId: string; testId: string; date: string }[]>>;
}

const DataContext = createContext<DataContextType>(null!);
export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lessons, setLessons] = useState<Lesson[]>(() => loadFromStorage('data_lessons', initialLessons));
  const [grades, setGrades] = useState<Grade[]>(() => loadFromStorage('data_grades', initialGrades));
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => loadFromStorage('data_diary', initialDiaryEntries));
  const [students, setStudents] = useState<Student[]>(() => loadFromStorage('data_students', initialStudents));
  const [tests, setTests] = useState<Test[]>(() => loadFromStorage('data_tests', initialTests));
  const [journalColumns, setJournalColumns] = useState<JournalColumn[]>(() => loadFromStorage('data_journal_columns', []));
  const [lessonTypes, setLessonTypes] = useState<LessonTypeEntry[]>(() => loadFromStorage('data_lesson_types', []));
  const [customLessonTypes, setCustomLessonTypes] = useState<CustomLessonType[]>(() => loadFromStorage('data_custom_lesson_types', defaultCustomLessonTypes));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadFromStorage('data_attendance', []));
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() => loadFromStorage('data_test_attempts', []));
  const [testRetakes, setTestRetakes] = useState<{ studentId: string; testId: string; date: string }[]>(() => loadFromStorage('data_test_retakes', []));

  useEffect(() => { saveToStorage('data_lessons', lessons); }, [lessons]);
  useEffect(() => { saveToStorage('data_grades', grades); }, [grades]);
  useEffect(() => { saveToStorage('data_diary', diaryEntries); }, [diaryEntries]);
  useEffect(() => { saveToStorage('data_students', students); }, [students]);
  useEffect(() => { saveToStorage('data_tests', tests); }, [tests]);
  useEffect(() => { saveToStorage('data_journal_columns', journalColumns); }, [journalColumns]);
  useEffect(() => { saveToStorage('data_lesson_types', lessonTypes); }, [lessonTypes]);
  useEffect(() => { saveToStorage('data_custom_lesson_types', customLessonTypes); }, [customLessonTypes]);
  useEffect(() => { saveToStorage('data_attendance', attendance); }, [attendance]);
  useEffect(() => { saveToStorage('data_test_attempts', testAttempts); }, [testAttempts]);
  useEffect(() => { saveToStorage('data_test_retakes', testRetakes); }, [testRetakes]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        switch (e.key) {
          case 'data_grades': setGrades(JSON.parse(e.newValue)); break;
          case 'data_lessons': setLessons(JSON.parse(e.newValue)); break;
          case 'data_diary': setDiaryEntries(JSON.parse(e.newValue)); break;
          case 'data_students': setStudents(JSON.parse(e.newValue)); break;
          case 'data_tests': setTests(JSON.parse(e.newValue)); break;
          case 'data_journal_columns': setJournalColumns(JSON.parse(e.newValue)); break;
          case 'data_lesson_types': setLessonTypes(JSON.parse(e.newValue)); break;
          case 'data_custom_lesson_types': setCustomLessonTypes(JSON.parse(e.newValue)); break;
          case 'data_attendance': setAttendance(JSON.parse(e.newValue)); break;
          case 'data_test_attempts': setTestAttempts(JSON.parse(e.newValue)); break;
          case 'data_test_retakes': setTestRetakes(JSON.parse(e.newValue)); break;
        }
      } catch (err) { console.error('Sync error', err); }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <DataContext.Provider value={{
      lessons, setLessons, grades, setGrades, diaryEntries, setDiaryEntries,
      students, setStudents, tests, setTests, journalColumns, setJournalColumns,
      lessonTypes, setLessonTypes,
      customLessonTypes, setCustomLessonTypes,
      attendance, setAttendance,
      testAttempts, setTestAttempts,
      testRetakes, setTestRetakes,
    }}>
      {children}
    </DataContext.Provider>
  );
};
