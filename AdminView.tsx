import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth, useData } from '../context';
import { Schedule } from './Schedule';
import {
  BookOpen, Calendar, ClipboardList, Users, LogOut, Settings, Plus,
  Trash2, Edit2, Search, X, Save, ChevronDown, Eye, EyeOff,
  AlertTriangle, TrendingUp, TrendingDown, FileText,
  BarChart3, Award, ArrowLeft, RefreshCw, ChevronRight, Tag
} from 'lucide-react';
import {
  SUBJECTS, MONTH_NAMES, MONTH_NAMES_GEN, ATTENDANCE_TYPES,
  type Student, type Test, type TestQuestion, type CustomLessonType, type AttendanceRecord,
  defaultCustomLessonTypes, formatDate
} from '../data';

type Tab = 'dashboard' | 'schedule' | 'journal' | 'tests' | 'students' | 'lessonTypes';

export const AdminView: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Сводка', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'schedule', label: 'Расписание', icon: <Calendar className="w-5 h-5" /> },
    { id: 'journal', label: 'Журнал', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'tests', label: 'Тесты', icon: <FileText className="w-5 h-5" /> },
    { id: 'students', label: 'Ученики', icon: <Users className="w-5 h-5" /> },
    { id: 'lessonTypes', label: 'Типы уроков', icon: <Tag className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">Панель управления</span>
            </div>
            <nav className="flex items-center gap-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {tab.icon}
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <LogOut className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'schedule' && <Schedule editable />}
        {activeTab === 'journal' && <Journal />}
        {activeTab === 'tests' && <TestsManager />}
        {activeTab === 'students' && <StudentsManager />}
        {activeTab === 'lessonTypes' && <LessonTypesManager />}
      </main>
    </div>
  );
};

// ==================== DASHBOARD ====================
const AdminDashboard: React.FC = () => {
  const { students, grades, lessons, tests, attendance } = useData();
  const today = formatDate(new Date());
  const todayLessons = lessons.filter(l => l.date === today).sort((a, b) => a.lessonNumber - b.lessonNumber);

  const avgGrade = grades.length > 0 ? (grades.reduce((s, g) => s + g.value, 0) / grades.length).toFixed(2) : '—';
  const absentCount = attendance.filter(a => a.type === 'Н').length;

  const topStudents = useMemo(() => {
    return students.map(s => {
      const sg = grades.filter(g => g.studentId === s.id);
      const avg = sg.length > 0 ? sg.reduce((a, g) => a + g.value, 0) / sg.length : 0;
      return { ...s, avg, count: sg.length };
    }).filter(s => s.count > 0).sort((a, b) => b.avg - a.avg).slice(0, 5);
  }, [students, grades]);

  const weakStudents = useMemo(() => {
    return students.map(s => {
      const sg = grades.filter(g => g.studentId === s.id);
      const avg = sg.length > 0 ? sg.reduce((a, g) => a + g.value, 0) / sg.length : 0;
      return { ...s, avg, count: sg.length };
    }).filter(s => s.count > 0).sort((a, b) => a.avg - b.avg).slice(0, 5);
  }, [students, grades]);

  const avgBySubject = useMemo(() => {
    return SUBJECTS.map(s => {
      const sg = grades.filter(g => g.subject === s);
      const avg = sg.length > 0 ? sg.reduce((a, g) => a + g.value, 0) / sg.length : 0;
      return { subject: s, avg, count: sg.length };
    }).filter(s => s.count > 0);
  }, [grades]);

  const distribution = useMemo(() => {
    const d = { 5: 0, 4: 0, 3: 0, 2: 0 };
    grades.forEach(g => { d[g.value as keyof typeof d] = (d[g.value as keyof typeof d] || 0) + 1; });
    return d;
  }, [grades]);

  const totalGrades = grades.length;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Добро пожаловать!</h1>
        <p className="text-primary-100 mt-1">
          {new Date().getDate()} {MONTH_NAMES_GEN[new Date().getMonth()]} · {students.length} учеников · {todayLessons.length} уроков сегодня
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Users className="w-4 h-4" /> Учеников</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{students.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500"><Award className="w-4 h-4" /> Средний балл</div>
          <div className="text-3xl font-bold text-primary-600 mt-1">{avgGrade}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500"><ClipboardList className="w-4 h-4" /> Оценок</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{grades.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-sm text-gray-500"><AlertTriangle className="w-4 h-4" /> Пропуски (Н)</div>
          <div className="text-3xl font-bold text-red-600 mt-1">{absentCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">🥇 Лучшие ученики</h3>
          <div className="space-y-2">
            {topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                <span className="flex-1 font-medium text-gray-900">{s.lastName} {s.firstName}</span>
                <span className="font-bold text-green-600">{s.avg.toFixed(2)}</span>
              </div>
            ))}
            {topStudents.length === 0 && <p className="text-gray-400 text-sm">Нет данных</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">⚠ Требуют внимания</h3>
          <div className="space-y-2">
            {weakStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-500">{i + 1}.</span>
                <span className="flex-1 font-medium text-gray-900">{s.lastName} {s.firstName}</span>
                <span className="font-bold text-red-600">{s.avg.toFixed(2)}</span>
              </div>
            ))}
            {weakStudents.length === 0 && <p className="text-gray-400 text-sm">Нет данных</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Средний балл по предметам</h3>
          <div className="space-y-3">
            {avgBySubject.map(item => (
              <div key={item.subject}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.subject}</span>
                  <span className="font-bold">{item.avg.toFixed(2)}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.avg >= 4.5 ? 'bg-green-500' : item.avg >= 3.5 ? 'bg-blue-500' : item.avg >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(item.avg / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-8">Распределение оценок</h3>
          <div className="flex items-end justify-center gap-6 h-48 mt-4">
            {[5, 4, 3, 2].map(v => {
              const count = distribution[v as keyof typeof distribution] || 0;
              const pct = totalGrades > 0 ? (count / totalGrades) * 100 : 0;
              const colors = { 5: 'bg-green-500', 4: 'bg-blue-500', 3: 'bg-yellow-500', 2: 'bg-red-500' };
              return (
                <div key={v} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">{count}</span>
                  <div className={`w-14 rounded-t-lg ${colors[v as keyof typeof colors]}`}
                    style={{ height: `${Math.max(pct * 1.6, 8)}px` }} />
                  <span className="text-sm font-bold text-gray-600">{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {todayLessons.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Расписание на сегодня</h3>
          <div className="space-y-2">
            {todayLessons.map(l => (
              <div key={l.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">{l.lessonNumber}</div>
                <span className="font-medium text-gray-900">{l.subject}</span>
                {l.startTime && <span className="text-xs text-gray-500 ml-auto">{l.startTime}-{l.endTime}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{tests.length}</div>
          <div className="text-xs text-gray-500 mt-1">Тестов</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{SUBJECTS.length}</div>
          <div className="text-xs text-gray-500 mt-1">Предметов</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{lessons.length}</div>
          <div className="text-xs text-gray-500 mt-1">Уроков в расписании</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{attendance.length}</div>
          <div className="text-xs text-gray-500 mt-1">Отметок посещаемости</div>
        </div>
      </div>
    </div>
  );
};

// ==================== GRADE PICKER PORTAL ====================
const GradePickerPortal: React.FC<{
  anchorRect: DOMRect;
  currentGrade?: number;
  onSelect: (v: number) => void;
  onDelete?: () => void;
  onClose: () => void;
}> = ({ anchorRect, currentGrade, onSelect, onDelete, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const widgetW = 200;
  const widgetH = currentGrade ? 90 : 60;
  let top = anchorRect.bottom + 4;
  let left = anchorRect.left + anchorRect.width / 2 - widgetW / 2;
  if (top + widgetH > window.innerHeight) top = anchorRect.top - widgetH - 4;
  if (left < 8) left = 8;
  if (left + widgetW > window.innerWidth - 8) left = window.innerWidth - widgetW - 8;

  return createPortal(
    <div ref={ref} className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 p-2 animate-scaleIn"
      style={{ top, left, width: widgetW }}>
      <div className="flex gap-1.5 justify-center">
        {[5, 4, 3, 2].map(v => (
          <button key={v} onClick={() => onSelect(v)}
            className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
              v === 5 ? 'bg-green-100 text-green-700 hover:bg-green-200' :
              v === 4 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
              v === 3 ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
              'bg-red-100 text-red-700 hover:bg-red-200'
            } ${currentGrade === v ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}>
            {v}
          </button>
        ))}
      </div>
      {currentGrade && onDelete && (
        <button onClick={onDelete} className="w-full mt-1.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1">
          <Trash2 className="w-3 h-3" /> Удалить
        </button>
      )}
    </div>,
    document.body
  );
};

// ==================== ATTENDANCE PICKER PORTAL ====================
const AttendancePickerPortal: React.FC<{
  anchorRect: DOMRect;
  currentType?: AttendanceRecord['type'];
  onSelect: (type: AttendanceRecord['type']) => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ anchorRect, currentType, onSelect, onDelete, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const widgetW = 220;
  let top = anchorRect.bottom + 4;
  let left = anchorRect.left + anchorRect.width / 2 - widgetW / 2;
  if (top + 120 > window.innerHeight) top = anchorRect.top - 120;
  if (left < 8) left = 8;
  if (left + widgetW > window.innerWidth - 8) left = window.innerWidth - widgetW - 8;

  return createPortal(
    <div ref={ref} className="fixed z-[100] bg-white rounded-xl shadow-2xl border border-gray-200 p-2 animate-scaleIn"
      style={{ top, left, width: widgetW }}>
      <div className="grid grid-cols-2 gap-1.5">
        {ATTENDANCE_TYPES.map(at => (
          <button key={at.value} onClick={() => onSelect(at.value)}
            className={`px-2 py-2 rounded-lg text-xs font-bold transition-all ${at.bgColor} ${at.color} ${currentType === at.value ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}>
            {at.short} — {at.label.slice(0, 10)}
          </button>
        ))}
      </div>
      {currentType && (
        <button onClick={onDelete} className="w-full mt-1.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1">
          <Trash2 className="w-3 h-3" /> Удалить
        </button>
      )}
    </div>,
    document.body
  );
};

// ==================== JOURNAL ====================
const Journal: React.FC = () => {
  const {
    students, grades, setGrades, diaryEntries, setDiaryEntries, lessons,
    journalColumns, setJournalColumns, lessonTypes, setLessonTypes,
    customLessonTypes, attendance, setAttendance, tests,
    testAttempts, testRetakes, setTestRetakes,
  } = useData();

  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [journalTab, setJournalTab] = useState<'grades' | 'topics' | 'attendance'>('grades');
  const [showSettings, setShowSettings] = useState(false);
  const [showTrend, setShowTrend] = useState(true);
  const [showNotAsked, setShowNotAsked] = useState(true);
  const [gradePickerState, setGradePickerState] = useState<{ rect: DOMRect; studentId: string; date: string; columnId?: string } | null>(null);
  const [attendancePickerState, setAttendancePickerState] = useState<{ rect: DOMRect; studentId: string; date: string } | null>(null);
  const [popoverDate, setPopoverDate] = useState<string | null>(null);
  const [lessonPageDate, setLessonPageDate] = useState<string | null>(null);

  const sortedStudents = useMemo(() =>
    [...students].sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)),
    [students]
  );

  const allDates = useMemo(() => {
    const dateSet = new Set<string>();
    grades.filter(g => g.subject === selectedSubject).forEach(g => dateSet.add(g.date));
    diaryEntries.filter(e => e.subject === selectedSubject).forEach(e => dateSet.add(e.date));
    attendance.filter(a => a.subject === selectedSubject).forEach(a => dateSet.add(a.date));
    journalColumns.filter(c => c.subject === selectedSubject).forEach(c => dateSet.add(c.date));
    lessons.filter(l => l.subject === selectedSubject).forEach(l => dateSet.add(l.date));
    return Array.from(dateSet).sort();
  }, [grades, diaryEntries, attendance, journalColumns, lessons, selectedSubject]);

  const monthGroups = useMemo(() => {
    const groups: { month: string; dates: string[] }[] = [];
    let currentMonth = '';
    allDates.forEach(d => {
      const m = MONTH_NAMES[parseInt(d.split('-')[1]) - 1]?.slice(0, 3) || '';
      if (m !== currentMonth) { currentMonth = m; groups.push({ month: m, dates: [d] }); }
      else { groups[groups.length - 1].dates.push(d); }
    });
    return groups;
  }, [allDates]);

  const getColumnsForDate = (date: string) => {
    const cols = journalColumns.filter(c => c.date === date && c.subject === selectedSubject);
    return cols;
  };

  const addColumn = (date: string) => {
    setJournalColumns(prev => [...prev, { id: `jc${Date.now()}`, date, subject: selectedSubject, type: 'grade' }]);
  };

  const removeColumn = (colId: string) => {
    setJournalColumns(prev => prev.filter(c => c.id !== colId));
    setGrades(prev => prev.filter(g => g.columnId !== colId));
  };

  const getGrade = (studentId: string, date: string, columnId?: string) => {
    return grades.find(g => g.studentId === studentId && g.date === date && g.subject === selectedSubject && (columnId ? g.columnId === columnId : !g.columnId));
  };

  const setGrade = (studentId: string, date: string, value: number, columnId?: string) => {
    setGrades(prev => {
      const existing = prev.find(g => g.studentId === studentId && g.date === date && g.subject === selectedSubject && (columnId ? g.columnId === columnId : !g.columnId));
      if (existing) return prev.map(g => g.id === existing.id ? { ...g, value } : g);
      return [...prev, { id: `g${Date.now()}${Math.random().toString(36).slice(2, 6)}`, studentId, subject: selectedSubject, value, date, columnId }];
    });
  };

  const deleteGrade = (studentId: string, date: string, columnId?: string) => {
    setGrades(prev => prev.filter(g => !(g.studentId === studentId && g.date === date && g.subject === selectedSubject && (columnId ? g.columnId === columnId : !g.columnId))));
  };

  const getLessonType = (date: string) => {
    return lessonTypes.find(lt => lt.date === date && lt.subject === selectedSubject);
  };

  const getAttendanceMark = (studentId: string, date: string) => {
    return attendance.find(a => a.studentId === studentId && a.date === date && a.subject === selectedSubject);
  };

  const setAttendanceMark = (studentId: string, date: string, type: AttendanceRecord['type']) => {
    setAttendance(prev => {
      const existing = prev.find(a => a.studentId === studentId && a.date === date && a.subject === selectedSubject);
      if (existing) return prev.map(a => a.id === existing.id ? { ...a, type } : a);
      return [...prev, { id: `at${Date.now()}${Math.random().toString(36).slice(2, 6)}`, studentId, date, subject: selectedSubject, type }];
    });
  };

  const deleteAttendanceMark = (studentId: string, date: string) => {
    setAttendance(prev => prev.filter(a => !(a.studentId === studentId && a.date === date && a.subject === selectedSubject)));
  };

  const getStudentAvg = (studentId: string) => {
    const sg = grades.filter(g => g.studentId === studentId && g.subject === selectedSubject);
    return sg.length > 0 ? sg.reduce((a, g) => a + g.value, 0) / sg.length : 0;
  };

  const getStudentTrend = (studentId: string) => {
    const sg = grades.filter(g => g.studentId === studentId && g.subject === selectedSubject).sort((a, b) => a.date.localeCompare(b.date));
    if (sg.length < 2) return 0;
    const mid = Math.floor(sg.length / 2);
    const firstHalf = sg.slice(0, mid);
    const secondHalf = sg.slice(mid);
    const avgFirst = firstHalf.reduce((a, g) => a + g.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, g) => a + g.value, 0) / secondHalf.length;
    if (avgSecond - avgFirst > 0.2) return 1;
    if (avgFirst - avgSecond > 0.2) return -1;
    return 0;
  };

  const getLastGradeDate = (studentId: string) => {
    const sg = grades.filter(g => g.studentId === studentId && g.subject === selectedSubject).sort((a, b) => b.date.localeCompare(a.date));
    return sg.length > 0 ? sg[0].date : null;
  };

  const getOrCreateDiaryEntry = (date: string) => {
    const existing = diaryEntries.find(e => e.date === date && e.subject === selectedSubject);
    if (existing) return existing;
    const newEntry = { id: `de${Date.now()}`, date, lessonNumber: 1, subject: selectedSubject, topic: '', homework: '' };
    setDiaryEntries(prev => [...prev, newEntry]);
    return newEntry;
  };

  // ==================== LESSON PAGE ====================
  if (lessonPageDate) {
    const entry = diaryEntries.find(e => e.date === lessonPageDate && e.subject === selectedSubject);
    const lpLessonType = getLessonType(lessonPageDate);
    const cols = getColumnsForDate(lessonPageDate);
    const assignedTest = entry?.testId ? tests.find(t => t.id === entry.testId) : null;

    const lpStudentGrades = sortedStudents.map(s => {
      const sg = grades.filter(g => g.studentId === s.id && g.subject === selectedSubject);
      const avg = sg.length > 0 ? sg.reduce((a, g) => a + g.value, 0) / sg.length : 0;
      const trend = getStudentTrend(s.id);
      const lastDate = getLastGradeDate(s.id);
      const daysSinceLastGrade = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : 999;
      return { ...s, avg, trend, daysSinceLastGrade };
    });

    return (
      <div className="animate-fadeIn">
        <button onClick={() => setLessonPageDate(null)} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4 font-medium">
          <ArrowLeft className="w-4 h-4" /> Назад к журналу
        </button>

        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white mb-6">
          <h2 className="text-xl font-bold">{selectedSubject}</h2>
          <p className="text-primary-100 mt-1">{new Date(lessonPageDate + 'T00:00').getDate()} {MONTH_NAMES_GEN[new Date(lessonPageDate + 'T00:00').getMonth()]} {new Date(lessonPageDate + 'T00:00').getFullYear()}</p>
        </div>

        {/* Topic, HW, Lesson Type, Test */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Информация об уроке</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тема урока</label>
              <input type="text" value={entry?.topic || ''} onChange={e => {
                const ent = getOrCreateDiaryEntry(lessonPageDate);
                setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, topic: e.target.value } : de));
              }} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Домашнее задание</label>
              <input type="text" value={entry?.homework || ''} onChange={e => {
                const ent = getOrCreateDiaryEntry(lessonPageDate);
                setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, homework: e.target.value } : de));
              }} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип урока</label>
              <select value={lpLessonType?.type || ''} onChange={e => {
                const val = e.target.value;
                setLessonTypes(prev => {
                  const existing = prev.find(lt => lt.date === lessonPageDate && lt.subject === selectedSubject);
                  if (existing) return prev.map(lt => lt.id === existing.id ? { ...lt, type: val } : lt);
                  return [...prev, { id: `lt${Date.now()}`, date: lessonPageDate, subject: selectedSubject, type: val }];
                });
              }} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Не указан</option>
                {customLessonTypes.map(lt => <option key={lt.id} value={lt.value}>{lt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тест</label>
              <select value={entry?.testId || ''} onChange={e => {
                const ent = getOrCreateDiaryEntry(lessonPageDate);
                setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, testId: e.target.value || undefined } : de));
              }} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Без теста</option>
                {tests.filter(t => t.subject === selectedSubject).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            {entry?.testId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Тип теста</label>
                <select value={entry?.testType || 'training'} onChange={e => {
                  setDiaryEntries(prev => prev.map(de => de.id === entry.id ? { ...de, testType: e.target.value as 'training' | 'real' } : de));
                  if (e.target.value === 'real') {
                    const hasCol = journalColumns.some(c => c.date === lessonPageDate && c.subject === selectedSubject && c.type === 'test');
                    if (!hasCol) setJournalColumns(prev => [...prev, { id: `jc${Date.now()}`, date: lessonPageDate, subject: selectedSubject, type: 'test' }]);
                  }
                }} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="training">Тренировочный</option>
                  <option value="real">Настоящий</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={entry?.checkHomework || false} onChange={e => {
              const ent = getOrCreateDiaryEntry(lessonPageDate);
              setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, checkHomework: e.target.checked } : de));
              if (e.target.checked) {
                const hasCol = journalColumns.some(c => c.date === lessonPageDate && c.subject === selectedSubject && c.type === 'homework');
                if (!hasCol) setJournalColumns(prev => [...prev, { id: `jc${Date.now()}`, date: lessonPageDate, subject: selectedSubject, type: 'homework' }]);
              } else {
                setJournalColumns(prev => prev.filter(c => !(c.date === lessonPageDate && c.subject === selectedSubject && c.type === 'homework')));
              }
            }} className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            <label className="text-sm text-gray-700">Проверять ДЗ</label>
          </div>
        </div>

        {/* Column management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Колонки оценок</h3>
            <button onClick={() => addColumn(lessonPageDate)} className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Добавить колонку
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600">Основная</div>
            {cols.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
                {c.type === 'homework' ? 'ДЗ' : c.type === 'test' ? 'Тест' : 'Доп.'}
                <button onClick={() => removeColumn(c.id)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Test results button */}
        {assignedTest && entry?.testType === 'real' && (
          <TestResultsSection test={assignedTest} date={lessonPageDate} subject={selectedSubject} students={sortedStudents} testAttempts={testAttempts} testRetakes={testRetakes} setTestRetakes={setTestRetakes} />
        )}

        {/* Student grades table with last 5, avg, trend */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Оценки учеников</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-600 border-b border-gray-200">
                <th className="px-3 py-2 text-left">№</th>
                <th className="px-3 py-2 text-left">ФИ</th>
                <th className="px-3 py-2 text-center">Основная</th>
                {cols.map(c => <th key={c.id} className="px-3 py-2 text-center">{c.type === 'homework' ? 'ДЗ' : c.type === 'test' ? 'Тест' : 'Доп.'}</th>)}
                <th className="px-3 py-2 text-center">Ср.</th>
                <th className="px-3 py-2 text-center">Тренд</th>
                <th className="px-3 py-2 text-center">⏱</th>
              </tr>
            </thead>
            <tbody>
              {lpStudentGrades.map((s, idx) => {
                const mainGrade = getGrade(s.id, lessonPageDate);
                return (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{s.lastName} {s.firstName}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={e => {
                        setGradePickerState({ rect: e.currentTarget.getBoundingClientRect(), studentId: s.id, date: lessonPageDate });
                      }} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${mainGrade ?
                        (mainGrade.value === 5 ? 'bg-green-100 text-green-700' : mainGrade.value === 4 ? 'bg-blue-100 text-blue-700' : mainGrade.value === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                        {mainGrade?.value || '·'}
                      </button>
                    </td>
                    {cols.map(c => {
                      const g = getGrade(s.id, lessonPageDate, c.id);
                      return (
                        <td key={c.id} className="px-3 py-2 text-center">
                          <button onClick={e => {
                            setGradePickerState({ rect: e.currentTarget.getBoundingClientRect(), studentId: s.id, date: lessonPageDate, columnId: c.id });
                          }} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${g ?
                            (g.value === 5 ? 'bg-green-100 text-green-700' : g.value === 4 ? 'bg-blue-100 text-blue-700' : g.value === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                            {g?.value || '·'}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-center">
                      {s.avg > 0 ? (
                        <span className={`font-bold text-sm ${s.avg >= 4.5 ? 'text-green-600' : s.avg >= 3.5 ? 'text-blue-600' : s.avg >= 2.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {s.avg.toFixed(1)}
                        </span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {s.trend === 1 && <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />}
                      {s.trend === -1 && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                      {s.trend === 0 && <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {(s.daysSinceLastGrade >= 14 || s.avg === 0) && allDates.length > 0 && (
                        <span title={s.daysSinceLastGrade >= 999 ? 'Ни разу не спрашивали' : `Не спрашивали ${s.daysSinceLastGrade} дн.`}>
                          <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {gradePickerState && (
          <GradePickerPortal
            anchorRect={gradePickerState.rect}
            currentGrade={getGrade(gradePickerState.studentId, gradePickerState.date, gradePickerState.columnId)?.value}
            onSelect={v => { setGrade(gradePickerState.studentId, gradePickerState.date, v, gradePickerState.columnId); setGradePickerState(null); }}
            onDelete={() => { deleteGrade(gradePickerState.studentId, gradePickerState.date, gradePickerState.columnId); setGradePickerState(null); }}
            onClose={() => setGradePickerState(null)}
          />
        )}
      </div>
    );
  }

  // ==================== MAIN JOURNAL VIEW ====================
  return (
    <div className="animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500">
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
            {(['grades', 'topics', 'attendance'] as const).map(tab => (
              <button key={tab} onClick={() => setJournalTab(tab)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${journalTab === tab ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {tab === 'grades' ? 'Оценки' : tab === 'topics' ? 'Темы и ДЗ' : 'Посещаемость'}
              </button>
            ))}
          </div>
          {journalTab === 'grades' && (
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Settings only for grades tab */}
      {showSettings && journalTab === 'grades' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 animate-fadeIn">
          <h4 className="font-medium text-gray-900 mb-3">Настройки журнала</h4>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-all ${showTrend ? 'bg-primary-600' : 'bg-gray-300'} relative`}
                onClick={() => setShowTrend(!showTrend)}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${showTrend ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700">Тренд</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-10 h-6 rounded-full transition-all ${showNotAsked ? 'bg-primary-600' : 'bg-gray-300'} relative`}
                onClick={() => setShowNotAsked(!showNotAsked)}>
                <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${showNotAsked ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-gray-700">Давно не спрашивали</span>
            </label>
          </div>
        </div>
      )}

      {/* GRADES TAB */}
      {journalTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {/* Month row */}
                {monthGroups.length > 0 && (
                  <tr className="bg-amber-50">
                    <th className="sticky left-0 z-20 bg-amber-50 w-[48px] min-w-[48px] border-b border-r border-amber-200" />
                    <th className="sticky left-[48px] z-20 bg-amber-50 min-w-[140px] border-b border-r border-amber-200" />
                    {monthGroups.map((mg, i) => {
                      const totalCols = mg.dates.reduce((sum, d) => sum + 1 + getColumnsForDate(d).length, 0);
                      return (
                        <th key={i} colSpan={totalCols} className="px-2 py-2 text-center font-semibold text-amber-800 border-b border-r border-amber-200 text-xs uppercase">
                          {mg.month}
                        </th>
                      );
                    })}
                    <th className="px-3 py-2 border-b border-amber-200" />
                    {showTrend && <th className="border-b border-amber-200" />}
                    {showNotAsked && <th className="border-b border-amber-200" />}
                  </tr>
                )}
                {/* Date row */}
                <tr className="bg-gray-50">
                  <th className="sticky left-0 z-20 bg-gray-50 px-2 py-2 text-xs font-medium text-gray-500 border-b border-r border-gray-200 w-[48px] min-w-[48px]">№</th>
                  <th className="sticky left-[48px] z-20 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500 border-b border-r border-gray-200 min-w-[140px]">ФИ</th>
                  {allDates.map(d => {
                    const cols = getColumnsForDate(d);
                    const totalCols = 1 + cols.length;
                    const lt = getLessonType(d);
                    const ltType = lt ? customLessonTypes.find(c => c.value === lt.type) : null;
                    return (
                      <th key={d} colSpan={totalCols} className="px-1 py-1 text-center border-b border-r border-gray-200 min-w-[44px] relative">
                        <button onClick={() => setPopoverDate(popoverDate === d ? null : d)}
                          className="text-xs font-medium text-gray-600 hover:text-primary-600 transition-colors">
                          {parseInt(d.split('-')[2])}
                          <ChevronDown className={`w-3 h-3 inline ml-0.5 transition-transform ${popoverDate === d ? 'rotate-180' : ''}`} />
                        </button>
                        {ltType && (
                          <div className={`text-[9px] font-bold rounded px-1 mt-0.5 ${ltType.color}`}>{ltType.short}</div>
                        )}
                        {/* Attendance badge in grades */}
                        {/* Popover */}
                        {popoverDate === d && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 p-3 text-left animate-scaleIn"
                            onClick={e => e.stopPropagation()}>
                            <div className="text-xs font-bold text-gray-900 mb-2">{parseInt(d.split('-')[2])} {MONTH_NAMES_GEN[parseInt(d.split('-')[1]) - 1]}</div>
                            <div className="space-y-1 mb-2">
                              <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-gray-50 text-xs text-gray-600">Основная</div>
                              {cols.map(c => (
                                <div key={c.id} className="flex items-center justify-between px-2 py-1 rounded-lg bg-blue-50 text-xs text-blue-700 group">
                                  <span>{c.type === 'homework' ? 'ДЗ' : c.type === 'test' ? 'Тест' : 'Доп.'}</span>
                                  <button onClick={() => removeColumn(c.id)} className="opacity-0 group-hover:opacity-100 text-red-500"><X className="w-3 h-3" /></button>
                                </div>
                              ))}
                            </div>
                            <button onClick={() => { addColumn(d); }} className="w-full text-xs text-primary-600 hover:bg-primary-50 rounded-lg py-1.5 transition-colors flex items-center justify-center gap-1">
                              <Plus className="w-3 h-3" /> Добавить колонку
                            </button>
                            <hr className="my-2" />
                            <button onClick={() => { setLessonPageDate(d); setPopoverDate(null); }} className="w-full text-xs text-gray-700 hover:bg-gray-50 rounded-lg py-1.5 transition-colors">
                              Страница урока →
                            </button>
                          </div>
                        )}
                      </th>
                    );
                  })}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200 min-w-[56px]">Ср.</th>
                  {showTrend && <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200 w-10">↕</th>}
                  {showNotAsked && <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200 w-10">⚠</th>}
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, idx) => {
                  const avg = getStudentAvg(student.id);
                  const trend = getStudentTrend(student.id);
                  const lastDate = getLastGradeDate(student.id);
                  const daysSince = lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : 999;

                  return (
                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="sticky left-0 z-10 bg-white px-2 py-1.5 text-center text-xs text-gray-500 border-r border-gray-200 w-[48px]">{idx + 1}</td>
                      <td className="sticky left-[48px] z-10 bg-white px-3 py-1.5 font-medium text-gray-900 text-xs border-r border-gray-200 whitespace-nowrap">{student.lastName} {student.firstName}</td>
                      {allDates.map(d => {
                        const cols = getColumnsForDate(d);
                        const mainGrade = getGrade(student.id, d);
                        const att = getAttendanceMark(student.id, d);
                        return (
                          <React.Fragment key={d}>
                            <td className="px-0.5 py-0.5 text-center border-r border-gray-100">
                              <button onClick={e => setGradePickerState({ rect: e.currentTarget.getBoundingClientRect(), studentId: student.id, date: d })}
                                className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${mainGrade ?
                                  (mainGrade.value === 5 ? 'bg-green-100 text-green-700' : mainGrade.value === 4 ? 'bg-blue-100 text-blue-700' : mainGrade.value === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')
                                  : 'hover:bg-gray-100 text-gray-300'}`}>
                                {mainGrade?.value || ''}
                              </button>
                              {att && <div className={`text-[8px] font-bold rounded px-0.5 mt-0.5 ${ATTENDANCE_TYPES.find(at => at.value === att.type)?.bgColor} ${ATTENDANCE_TYPES.find(at => at.value === att.type)?.color}`}>{att.type}</div>}
                            </td>
                            {cols.map(c => {
                              const g = getGrade(student.id, d, c.id);
                              return (
                                <td key={c.id} className="px-0.5 py-0.5 text-center border-r border-gray-100">
                                  <button onClick={e => setGradePickerState({ rect: e.currentTarget.getBoundingClientRect(), studentId: student.id, date: d, columnId: c.id })}
                                    className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${g ?
                                      (g.value === 5 ? 'bg-green-100 text-green-700' : g.value === 4 ? 'bg-blue-100 text-blue-700' : g.value === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')
                                      : 'hover:bg-gray-100 text-gray-300'}`}>
                                    {g?.value || ''}
                                  </button>
                                </td>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                      <td className="px-2 py-1.5 text-center border-gray-200">
                        {avg > 0 ? (
                          <span className={`font-bold text-sm ${avg >= 4.5 ? 'text-green-600' : avg >= 3.5 ? 'text-blue-600' : avg >= 2.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {avg.toFixed(1)}
                          </span>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      {showTrend && (
                        <td className="px-2 py-1.5 text-center">
                          {trend === 1 && <TrendingUp className="w-4 h-4 text-green-500 mx-auto" />}
                          {trend === -1 && <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />}
                        </td>
                      )}
                      {showNotAsked && (
                        <td className="px-2 py-1.5 text-center">
                          {allDates.length > 0 && (daysSince >= 14 || grades.filter(g => g.studentId === student.id && g.subject === selectedSubject).length === 0) && (
                            <span title={daysSince >= 999 ? 'Ни разу не спрашивали' : `Не спрашивали ${daysSince} дн.`}>
                              <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TOPICS TAB */}
      {journalTab === 'topics' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                <th className="px-3 py-2 text-left w-10">№</th>
                <th className="px-3 py-2 text-left w-28">Дата</th>
                <th className="px-3 py-2 text-left w-28">Тип урока</th>
                <th className="px-3 py-2 text-left">Тема урока</th>
                <th className="px-3 py-2 text-left">Домашнее задание</th>
                <th className="px-3 py-2 text-center w-16">Пров. ДЗ</th>
                <th className="px-3 py-2 text-left w-40">Тест</th>
              </tr>
            </thead>
            <tbody>
              {allDates.map((d, idx) => {
                const entry = diaryEntries.find(e => e.date === d && e.subject === selectedSubject);
                const lt = getLessonType(d);
                const testObj = entry?.testId ? tests.find(t => t.id === entry.testId) : null;

                return (
                  <tr key={d} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 text-gray-700 font-medium">
                      {parseInt(d.split('-')[2])} {MONTH_NAMES_GEN[parseInt(d.split('-')[1]) - 1]?.slice(0, 3)}
                    </td>
                    <td className="px-3 py-2">
                      <select value={lt?.type || ''} onChange={e => {
                        setLessonTypes(prev => {
                          const existing = prev.find(l => l.date === d && l.subject === selectedSubject);
                          if (existing) return prev.map(l => l.id === existing.id ? { ...l, type: e.target.value } : l);
                          return [...prev, { id: `lt${Date.now()}`, date: d, subject: selectedSubject, type: e.target.value }];
                        });
                      }} className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option value="">—</option>
                        {customLessonTypes.map(clt => <option key={clt.id} value={clt.value}>{clt.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={entry?.topic || ''} onChange={e => {
                        const ent = getOrCreateDiaryEntry(d);
                        setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, topic: e.target.value } : de));
                      }} placeholder="Тема..." className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={entry?.homework || ''} onChange={e => {
                        const ent = getOrCreateDiaryEntry(d);
                        setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, homework: e.target.value } : de));
                      }} placeholder="ДЗ..." className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input type="checkbox" checked={entry?.checkHomework || false} onChange={e => {
                        const ent = getOrCreateDiaryEntry(d);
                        setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, checkHomework: e.target.checked } : de));
                        if (e.target.checked) {
                          const hasCol = journalColumns.some(c => c.date === d && c.subject === selectedSubject && c.type === 'homework');
                          if (!hasCol) setJournalColumns(prev => [...prev, { id: `jc${Date.now()}`, date: d, subject: selectedSubject, type: 'homework' }]);
                        } else {
                          setJournalColumns(prev => prev.filter(c => !(c.date === d && c.subject === selectedSubject && c.type === 'homework')));
                        }
                      }} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                    </td>
                    <td className="px-3 py-2">
                      <select value={entry?.testId || ''} onChange={e => {
                        const ent = getOrCreateDiaryEntry(d);
                        setDiaryEntries(prev => prev.map(de => de.id === ent.id ? { ...de, testId: e.target.value || undefined } : de));
                      }} className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option value="">—</option>
                        {tests.filter(t => t.subject === selectedSubject).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                      </select>
                      {testObj && (
                        <select value={entry?.testType || 'training'} onChange={e => {
                          if (entry) setDiaryEntries(prev => prev.map(de => de.id === entry.id ? { ...de, testType: e.target.value as 'training' | 'real' } : de));
                          if (e.target.value === 'real') {
                            const hasCol = journalColumns.some(c => c.date === d && c.subject === selectedSubject && c.type === 'test');
                            if (!hasCol) setJournalColumns(prev => [...prev, { id: `jc${Date.now()}`, date: d, subject: selectedSubject, type: 'test' }]);
                          }
                        }} className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white mt-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                          <option value="training">Тренировочный</option>
                          <option value="real">Настоящий</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
              {allDates.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Нет дат. Добавьте уроки в расписание.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {journalTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
            <div className="flex gap-2 text-xs">
              {ATTENDANCE_TYPES.map(at => (
                <span key={at.value} className={`px-2 py-1 rounded-md font-bold ${at.bgColor} ${at.color}`}>
                  {at.short} — {at.label}
                </span>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                {monthGroups.length > 0 && (
                  <tr className="bg-amber-50">
                    <th className="sticky left-0 z-20 bg-amber-50 w-[48px] border-b border-r border-amber-200" />
                    <th className="sticky left-[48px] z-20 bg-amber-50 min-w-[140px] border-b border-r border-amber-200" />
                    {monthGroups.map((mg, i) => (
                      <th key={i} colSpan={mg.dates.length} className="px-2 py-2 text-center font-semibold text-amber-800 border-b border-r border-amber-200 text-xs uppercase">{mg.month}</th>
                    ))}
                    <th className="border-b border-amber-200" />
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <th className="sticky left-0 z-20 bg-gray-50 px-2 py-2 text-xs font-medium text-gray-500 border-b border-r border-gray-200 w-[48px]">№</th>
                  <th className="sticky left-[48px] z-20 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-500 border-b border-r border-gray-200 min-w-[140px]">ФИ</th>
                  {allDates.map(d => (
                    <th key={d} className="px-1 py-2 text-center text-xs font-medium text-gray-600 border-b border-r border-gray-200 min-w-[44px]">
                      {parseInt(d.split('-')[2])}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 border-b border-gray-200 min-w-[100px]">Итого</th>
                </tr>
              </thead>
              <tbody>
                {sortedStudents.map((student, idx) => {
                  const studentAtt = attendance.filter(a => a.studentId === student.id && a.subject === selectedSubject);
                  const counts = { 'Н': 0, 'УП': 0, 'Б': 0, 'ОП': 0 };
                  studentAtt.forEach(a => { counts[a.type]++; });
                  return (
                    <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="sticky left-0 z-10 bg-white px-2 py-1.5 text-center text-xs text-gray-500 border-r border-gray-200">{idx + 1}</td>
                      <td className="sticky left-[48px] z-10 bg-white px-3 py-1.5 font-medium text-gray-900 text-xs border-r border-gray-200 whitespace-nowrap">{student.lastName} {student.firstName}</td>
                      {allDates.map(d => {
                        const mark = getAttendanceMark(student.id, d);
                        const at = mark ? ATTENDANCE_TYPES.find(a => a.value === mark.type) : null;
                        return (
                          <td key={d} className="px-0.5 py-0.5 text-center border-r border-gray-100">
                            <button onClick={e => setAttendancePickerState({ rect: e.currentTarget.getBoundingClientRect(), studentId: student.id, date: d })}
                              className={`w-8 h-8 rounded-md text-[10px] font-bold transition-all ${at ? `${at.bgColor} ${at.color}` : 'hover:bg-gray-100 text-gray-300'}`}>
                              {mark?.type || ''}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-2 py-1.5 text-center">
                        <div className="flex gap-1 justify-center">
                          {Object.entries(counts).filter(([, v]) => v > 0).map(([k, v]) => {
                            const at = ATTENDANCE_TYPES.find(a => a.value === k);
                            return <span key={k} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${at?.bgColor} ${at?.color}`}>{k}:{v}</span>;
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Picker */}
      {gradePickerState && (
        <GradePickerPortal
          anchorRect={gradePickerState.rect}
          currentGrade={getGrade(gradePickerState.studentId, gradePickerState.date, gradePickerState.columnId)?.value}
          onSelect={v => { setGrade(gradePickerState.studentId, gradePickerState.date, v, gradePickerState.columnId); setGradePickerState(null); }}
          onDelete={() => { deleteGrade(gradePickerState.studentId, gradePickerState.date, gradePickerState.columnId); setGradePickerState(null); }}
          onClose={() => setGradePickerState(null)}
        />
      )}

      {/* Attendance Picker */}
      {attendancePickerState && (
        <AttendancePickerPortal
          anchorRect={attendancePickerState.rect}
          currentType={getAttendanceMark(attendancePickerState.studentId, attendancePickerState.date)?.type}
          onSelect={type => { setAttendanceMark(attendancePickerState.studentId, attendancePickerState.date, type); setAttendancePickerState(null); }}
          onDelete={() => { deleteAttendanceMark(attendancePickerState.studentId, attendancePickerState.date); setAttendancePickerState(null); }}
          onClose={() => setAttendancePickerState(null)}
        />
      )}
    </div>
  );
};

// ==================== TEST RESULTS SECTION ====================
const TestResultsSection: React.FC<{
  test: Test; date: string; subject: string; students: Student[];
  testAttempts: any[]; testRetakes: any[]; setTestRetakes: any;
}> = ({ test, date, students, testAttempts, testRetakes, setTestRetakes }) => {
  const [showResults, setShowResults] = useState(false);
  const [viewingAttempt, setViewingAttempt] = useState<any>(null);

  const studentResults = students.map(s => {
    const allAttempts = testAttempts.filter((a: any) => a.studentId === s.id && a.testId === test.id && a.date === date)
      .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    const latest = allAttempts[0];
    const hasRetake = testRetakes.some((r: any) => r.studentId === s.id && r.testId === test.id);
    return { student: s, latest, allAttempts, hasRetake, attemptCount: allAttempts.length };
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mb-6">
      <button onClick={() => setShowResults(!showResults)}
        className="flex items-center gap-2 px-4 py-3 bg-violet-50 text-violet-700 rounded-xl font-medium hover:bg-violet-100 transition-colors w-full border border-violet-200">
        <FileText className="w-5 h-5" />
        Результаты теста: {test.title}
        <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${showResults ? 'rotate-90' : ''}`} />
      </button>

      {showResults && (
        <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 overflow-hidden animate-fadeIn">
          {viewingAttempt ? (
            // Detailed attempt view
            <div className="p-5">
              <button onClick={() => setViewingAttempt(null)} className="flex items-center gap-1 text-sm text-primary-600 mb-4">
                <ArrowLeft className="w-4 h-4" /> Назад к списку
              </button>
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Баллы</div>
                  <div className="font-bold text-gray-900">{viewingAttempt.correct}/{viewingAttempt.total}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Процент</div>
                  <div className="font-bold text-gray-900">{viewingAttempt.percent}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Оценка</div>
                  <div className={`font-bold text-lg ${viewingAttempt.grade >= 4 ? 'text-green-600' : viewingAttempt.grade === 3 ? 'text-yellow-600' : 'text-red-600'}`}>{viewingAttempt.grade}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">Время</div>
                  <div className="font-bold text-gray-900">{viewingAttempt.timeSpent ? formatTime(viewingAttempt.timeSpent) : '—'}</div>
                </div>
              </div>
              <h4 className="font-medium text-gray-900 mb-3">Ответы по вопросам:</h4>
              <div className="space-y-3">
                {test.questions.map((q, qi) => {
                  const ans = viewingAttempt.answers?.find((a: any) => a.questionId === q.id);
                  return (
                    <div key={q.id} className={`p-3 rounded-xl border ${ans?.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-start gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${ans?.correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{qi + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{q.text}</p>
                          {q.type === 'text' ? (
                            <div className="mt-1 text-xs">
                              <span className="text-gray-500">Ответ: </span>
                              <span className={ans?.correct ? 'text-green-700' : 'text-red-700'}>{ans?.answer || '—'}</span>
                              {!ans?.correct && <span className="text-green-700 ml-2">(Верно: {q.correctAnswer})</span>}
                            </div>
                          ) : (
                            <div className="mt-1 text-xs">
                              {q.options.map(opt => {
                                const selected = Array.isArray(ans?.answer) ? ans.answer.includes(opt.id) : ans?.answer === opt.id;
                                return (
                                  <div key={opt.id} className={`flex items-center gap-1 ${selected ? (opt.correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium') : opt.correct ? 'text-green-600' : 'text-gray-500'}`}>
                                    {selected ? (opt.correct ? '✓' : '✗') : opt.correct ? '○' : '·'} {opt.text}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Student list
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-600 border-b border-gray-200">
                  <th className="px-3 py-2 text-left">№</th>
                  <th className="px-3 py-2 text-left">ФИ</th>
                  <th className="px-3 py-2 text-center">Статус</th>
                  <th className="px-3 py-2 text-center">Результат</th>
                  <th className="px-3 py-2 text-center">Оценка</th>
                  <th className="px-3 py-2 text-center">Время</th>
                  <th className="px-3 py-2 text-center">Попытки</th>
                  <th className="px-3 py-2 text-center">Действия</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((sr, idx) => (
                  <tr key={sr.student.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                    <td className="px-3 py-2 font-medium text-gray-900">{sr.student.lastName} {sr.student.firstName}</td>
                    <td className="px-3 py-2 text-center">
                      {sr.latest ? (
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md">Сдал</span>
                      ) : sr.hasRetake ? (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md">⏳ Ожидает</span>
                      ) : (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Не сдал</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {sr.latest ? `${sr.latest.correct}/${sr.latest.total} (${sr.latest.percent}%)` : '—'}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {sr.latest ? (
                        <span className={`font-bold ${sr.latest.grade >= 4 ? 'text-green-600' : sr.latest.grade === 3 ? 'text-yellow-600' : 'text-red-600'}`}>{sr.latest.grade}</span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">
                      {sr.latest?.timeSpent ? formatTime(sr.latest.timeSpent) : '—'}
                    </td>
                    <td className="px-3 py-2 text-center text-xs">{sr.attemptCount}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {sr.latest && (
                          <button onClick={() => setViewingAttempt(sr.latest)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Подробнее">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {sr.latest && !sr.hasRetake && (
                          <button onClick={() => setTestRetakes((prev: any[]) => [...prev, { studentId: sr.student.id, testId: test.id, date }])}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Дать пересдачу">
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        {sr.hasRetake && (
                          <button onClick={() => setTestRetakes((prev: any[]) => prev.filter((r: any) => !(r.studentId === sr.student.id && r.testId === test.id)))}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Отменить">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== TESTS MANAGER ====================
const TestsManager: React.FC = () => {
  const { tests, setTests } = useData();
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const createNewTest = () => {
    const newTest: Test = {
      id: `t${Date.now()}`, title: '', subject: SUBJECTS[0], timeLimit: 0,
      gradingScale: [{ minPercent: 90, grade: 5 }, { minPercent: 70, grade: 4 }, { minPercent: 50, grade: 3 }, { minPercent: 0, grade: 2 }],
      questions: [], createdAt: new Date().toISOString(),
    };
    setEditingTest(newTest);
    setShowEditor(true);
  };

  const saveTest = (test: Test) => {
    setTests(prev => {
      const exists = prev.find(t => t.id === test.id);
      if (exists) return prev.map(t => t.id === test.id ? test : t);
      return [...prev, test];
    });
    setShowEditor(false);
    setEditingTest(null);
  };

  const deleteTest = (id: string) => {
    setTests(prev => prev.filter(t => t.id !== id));
  };

  if (showEditor && editingTest) {
    return <TestEditor test={editingTest} onSave={saveTest} onCancel={() => { setShowEditor(false); setEditingTest(null); }} />;
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Тесты</h2>
        <button onClick={createNewTest} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
          <Plus className="w-5 h-5" /> Создать тест
        </button>
      </div>
      <div className="grid gap-4">
        {tests.map(test => (
          <div key={test.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{test.title || 'Без названия'}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {test.subject} · {test.questions.length} вопросов {test.timeLimit > 0 ? `· ${test.timeLimit} мин` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEditingTest(test); setShowEditor(true); }} className="p-2 rounded-lg hover:bg-gray-100">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => deleteTest(test.id)} className="p-2 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {tests.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Нет тестов. Создайте первый тест.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== TEST EDITOR ====================
const TestEditor: React.FC<{ test: Test; onSave: (t: Test) => void; onCancel: () => void }> = ({ test: initialTest, onSave, onCancel }) => {
  const [test, setTest] = useState<Test>(initialTest);

  const addQuestion = () => {
    const q: TestQuestion = { id: `q${Date.now()}`, type: 'single', text: '', options: [{ id: `o${Date.now()}a`, text: '', correct: true }, { id: `o${Date.now()}b`, text: '', correct: false }], points: 1 };
    setTest(prev => ({ ...prev, questions: [...prev.questions, q] }));
  };

  const updateQuestion = (qId: string, updates: Partial<TestQuestion>) => {
    setTest(prev => ({ ...prev, questions: prev.questions.map(q => q.id === qId ? { ...q, ...updates } : q) }));
  };

  const removeQuestion = (qId: string) => {
    setTest(prev => ({ ...prev, questions: prev.questions.filter(q => q.id !== qId) }));
  };

  const addOption = (qId: string) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, options: [...q.options, { id: `o${Date.now()}`, text: '', correct: false }] } : q)
    }));
  };

  const updateOption = (qId: string, oId: string, updates: { text?: string; correct?: boolean }) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? {
        ...q, options: q.options.map(o => {
          if (o.id === oId) return { ...o, ...updates };
          if (updates.correct && q.type === 'single') return { ...o, correct: false };
          return o;
        })
      } : q)
    }));
  };

  const removeOption = (qId: string, oId: string) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === qId ? { ...q, options: q.options.filter(o => o.id !== oId) } : q)
    }));
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <button onClick={() => onSave(test)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
          <Save className="w-4 h-4" /> Сохранить
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
            <input type="text" value={test.title} onChange={e => setTest(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
            <select value={test.subject} onChange={e => setTest(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Лимит (мин, 0=без)</label>
            <input type="number" value={test.timeLimit} onChange={e => setTest(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Шкала оценок</label>
          <div className="flex flex-wrap gap-2">
            {test.gradingScale.sort((a, b) => b.minPercent - a.minPercent).map((gs, i) => (
              <div key={i} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1">
                <span className="text-xs text-gray-500">от</span>
                <input type="number" value={gs.minPercent} onChange={e => {
                  setTest(prev => ({ ...prev, gradingScale: prev.gradingScale.map((g, gi) => gi === i ? { ...g, minPercent: Number(e.target.value) } : g) }));
                }} className="w-12 px-1 py-0.5 text-xs border rounded bg-white text-center" />
                <span className="text-xs text-gray-500">% =</span>
                <span className="text-sm font-bold">{gs.grade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {test.questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-900">Вопрос {qi + 1}</span>
              <div className="flex items-center gap-2">
                <select value={q.type} onChange={e => updateQuestion(q.id, { type: e.target.value as any })}
                  className="px-2 py-1 text-xs border rounded-lg bg-gray-50">
                  <option value="single">Один ответ</option>
                  <option value="multiple">Несколько ответов</option>
                  <option value="text">Текстовый</option>
                </select>
                <button onClick={() => removeQuestion(q.id)} className="p-1 rounded-lg hover:bg-red-50 text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input type="text" value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })}
              placeholder="Текст вопроса..." className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="text" value={q.formula || ''} onChange={e => updateQuestion(q.id, { formula: e.target.value })}
              placeholder="Формула (необязательно)..." className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input type="text" value={q.image || ''} onChange={e => updateQuestion(q.id, { image: e.target.value })}
              placeholder="URL картинки (необязательно)..." className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />

            {(q.type === 'single' || q.type === 'multiple') && (
              <div className="space-y-2">
                {q.options.map(opt => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input type={q.type === 'single' ? 'radio' : 'checkbox'} checked={opt.correct}
                      onChange={() => updateOption(q.id, opt.id, { correct: q.type === 'single' ? true : !opt.correct })}
                      className="w-4 h-4" />
                    <input type="text" value={opt.text} onChange={e => updateOption(q.id, opt.id, { text: e.target.value })}
                      placeholder="Вариант ответа..." className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button onClick={() => removeOption(q.id, opt.id)} className="p-1 text-red-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={() => addOption(q.id)} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Добавить вариант
                </button>
              </div>
            )}

            {q.type === 'text' && (
              <input type="text" value={q.correctAnswer || ''} onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })}
                placeholder="Правильный ответ..." className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            )}
          </div>
        ))}
        <button onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> Добавить вопрос
        </button>
      </div>
    </div>
  );
};

// ==================== STUDENTS MANAGER ====================
const StudentsManager: React.FC = () => {
  const { students, setStudents } = useData();
  const [search, setSearch] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', className: '9А', username: '', password: '123456' });

  const sorted = useMemo(() =>
    [...students]
      .sort((a, b) => `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`))
      .filter(s => `${s.lastName} ${s.firstName}`.toLowerCase().includes(search.toLowerCase())),
    [students, search]
  );

  const openAdd = () => {
    setEditingStudent(null);
    setFormData({ firstName: '', lastName: '', className: '9А', username: '', password: '123456' });
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditingStudent(s);
    setFormData({ firstName: s.firstName, lastName: s.lastName, className: s.className, username: s.username, password: s.password });
    setShowModal(true);
  };

  const save = () => {
    if (!formData.firstName || !formData.lastName || !formData.username) return;
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
    } else {
      setStudents(prev => [...prev, { id: `s${Date.now()}`, ...formData }]);
    }
    setShowModal(false);
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Ученики</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
          <Plus className="w-5 h-5" /> Добавить
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
              <th className="px-4 py-3 text-left">№</th>
              <th className="px-4 py-3 text-left">ФИО</th>
              <th className="px-4 py-3 text-left">Класс</th>
              <th className="px-4 py-3 text-left">Логин</th>
              <th className="px-4 py-3 text-left">Пароль</th>
              <th className="px-4 py-3 text-center">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.lastName} {s.firstName}</td>
                <td className="px-4 py-3 text-gray-600">{s.className}</td>
                <td className="px-4 py-3 text-gray-600">{s.username}</td>
                <td className="px-4 py-3 text-gray-600">••••••</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => deleteStudent(s.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">{editingStudent ? 'Редактировать' : 'Добавить ученика'}</h3>
            <div className="space-y-3">
              <input type="text" value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                placeholder="Фамилия" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                placeholder="Имя" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={formData.className} onChange={e => setFormData(p => ({ ...p, className: e.target.value }))}
                placeholder="Класс" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                placeholder="Логин" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="Пароль" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">Отмена</button>
              <button onClick={save} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== LESSON TYPES MANAGER ====================
const LessonTypesManager: React.FC = () => {
  const { customLessonTypes, setCustomLessonTypes } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CustomLessonType | null>(null);
  const [formData, setFormData] = useState({ label: '', short: '', color: 'bg-blue-100 text-blue-700' });

  const COLORS = [
    'bg-blue-100 text-blue-700', 'bg-cyan-100 text-cyan-700', 'bg-green-100 text-green-700',
    'bg-teal-100 text-teal-700', 'bg-red-100 text-red-700', 'bg-orange-100 text-orange-700',
    'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700',
    'bg-indigo-100 text-indigo-700', 'bg-pink-100 text-pink-700', 'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700', 'bg-yellow-100 text-yellow-700',
  ];

  const openAdd = () => {
    setEditing(null);
    setFormData({ label: '', short: '', color: COLORS[0] });
    setShowModal(true);
  };

  const openEdit = (lt: CustomLessonType) => {
    setEditing(lt);
    setFormData({ label: lt.label, short: lt.short, color: lt.color });
    setShowModal(true);
  };

  const save = () => {
    if (!formData.label || !formData.short) return;
    if (editing) {
      setCustomLessonTypes(prev => prev.map(lt => lt.id === editing.id ? { ...lt, label: formData.label, short: formData.short, color: formData.color } : lt));
    } else {
      const newLT: CustomLessonType = {
        id: `clt${Date.now()}`,
        value: formData.label.toLowerCase().replace(/\s+/g, '_'),
        label: formData.label,
        short: formData.short,
        color: formData.color,
      };
      setCustomLessonTypes(prev => [...prev, newLT]);
    }
    setShowModal(false);
  };

  const deleteLT = (id: string) => {
    setCustomLessonTypes(prev => prev.filter(lt => lt.id !== id));
  };

  const resetDefaults = () => {
    setCustomLessonTypes(defaultCustomLessonTypes);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Типы уроков</h2>
        <div className="flex gap-2">
          <button onClick={resetDefaults} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium text-sm">По умолчанию</button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium">
            <Plus className="w-5 h-5" /> Добавить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {customLessonTypes.map(lt => (
          <div key={lt.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${lt.color}`}>{lt.short}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(lt)} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit2 className="w-3.5 h-3.5 text-gray-500" /></button>
                <button onClick={() => deleteLT(lt.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{lt.label}</h3>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">{editing ? 'Редактировать' : 'Добавить тип'}</h3>
            <div className="space-y-3">
              <input type="text" value={formData.label} onChange={e => setFormData(p => ({ ...p, label: e.target.value }))}
                placeholder="Название" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={formData.short} onChange={e => setFormData(p => ({ ...p, short: e.target.value.slice(0, 3) }))}
                placeholder="Сокращение (до 3 символов)" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setFormData(p => ({ ...p, color: c }))}
                      className={`w-8 h-8 rounded-lg ${c} ${formData.color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''} transition-all`} />
                  ))}
                </div>
              </div>
              {formData.label && formData.short && (
                <div className="pt-2">
                  <span className="text-xs text-gray-500">Предпросмотр:</span>
                  <span className={`ml-2 px-3 py-1.5 rounded-lg text-sm font-bold ${formData.color}`}>{formData.short}</span>
                  <span className="ml-2 text-sm text-gray-900">{formData.label}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium">Отмена</button>
              <button onClick={save} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
