import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth, useData } from '../context';
import { Schedule } from './Schedule';
import {
  BookOpen, Calendar, ClipboardList, BarChart3, LogOut, ChevronLeft, ChevronRight,
  FileText, Clock, CheckCircle, AlertCircle, Play, ArrowLeft, ArrowRight
} from 'lucide-react';
import { SUBJECTS, MONTH_NAMES, MONTH_NAMES_GEN, DAY_NAMES, getWeekDates, formatDate } from '../data';

type Tab = 'home' | 'schedule' | 'grades' | 'diary' | 'reports';

export const StudentView: React.FC = () => {
  const { user, logout } = useAuth();
  const { lessons, grades, diaryEntries, tests, testAttempts, setTestAttempts, testRetakes, setTestRetakes, setGrades, journalColumns } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const studentId = user?.id || '';

  const myGrades = useMemo(() => grades.filter(g => g.studentId === studentId), [grades, studentId]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Главная', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'schedule', label: 'Расписание', icon: <Calendar className="w-5 h-5" /> },
    { id: 'grades', label: 'Оценки', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'diary', label: 'Дневник', icon: <FileText className="w-5 h-5" /> },
    { id: 'reports', label: 'Отчёты', icon: <BarChart3 className="w-5 h-5" /> },
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
              <span className="font-bold text-gray-900 text-lg">Дневник</span>
            </div>
            <nav className="flex items-center gap-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
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
        {activeTab === 'home' && <Home myGrades={myGrades} lessons={lessons} studentId={studentId} />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'grades' && <Grades myGrades={myGrades} journalColumns={journalColumns} />}
        {activeTab === 'diary' && (
          <Diary
            studentId={studentId}
            lessons={lessons}
            diaryEntries={diaryEntries}
            myGrades={myGrades}
            tests={tests}
            testAttempts={testAttempts}
            setTestAttempts={setTestAttempts}
            testRetakes={testRetakes}
            setTestRetakes={setTestRetakes}
            grades={grades}
            setGrades={setGrades}
            journalColumns={journalColumns}
          />
        )}
        {activeTab === 'reports' && <Reports myGrades={myGrades} />}
      </main>
    </div>
  );
};

// ==================== HOME ====================
const Home: React.FC<{ myGrades: any[]; lessons: any[]; studentId: string }> = ({ myGrades, lessons }) => {
  const today = formatDate(new Date());
  const todayLessons = lessons.filter((l: any) => l.date === today).sort((a: any, b: any) => a.lessonNumber - b.lessonNumber);
  const avgGrade = myGrades.length > 0 ? (myGrades.reduce((s: number, g: any) => s + g.value, 0) / myGrades.length).toFixed(2) : '—';

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Добро пожаловать!</h1>
        <p className="text-primary-100 mt-1">Сегодня {new Date().getDate()} {MONTH_NAMES_GEN[new Date().getMonth()]}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Средний балл</div>
          <div className="text-3xl font-bold text-primary-600 mt-1">{avgGrade}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Всего оценок</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{myGrades.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500">Уроков сегодня</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{todayLessons.length}</div>
        </div>
      </div>
      {todayLessons.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Расписание на сегодня</h3>
          <div className="space-y-2">
            {todayLessons.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-700">{l.lessonNumber}</div>
                <span className="font-medium text-gray-900">{l.subject}</span>
                {l.startTime && <span className="text-xs text-gray-500 ml-auto">{l.startTime}-{l.endTime}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== GRADES ====================
const Grades: React.FC<{ myGrades: any[]; journalColumns: any[] }> = ({ myGrades }) => {
  const gradesBySubject = useMemo(() => {
    const map: Record<string, { dates: Record<string, number[]>; allGrades: number[] }> = {};
    SUBJECTS.forEach(s => { map[s] = { dates: {}, allGrades: [] }; });
    myGrades.forEach(g => {
      if (!map[g.subject]) map[g.subject] = { dates: {}, allGrades: [] };
      if (!map[g.subject].dates[g.date]) map[g.subject].dates[g.date] = [];
      map[g.subject].dates[g.date].push(g.value);
      map[g.subject].allGrades.push(g.value);
    });
    return map;
  }, [myGrades]);

  const allDates = useMemo(() => {
    const dateSet = new Set<string>();
    myGrades.forEach(g => dateSet.add(g.date));
    return Array.from(dateSet).sort();
  }, [myGrades]);

  const monthGroups = useMemo(() => {
    const groups: { month: string; dates: string[] }[] = [];
    let currentMonth = '';
    allDates.forEach(d => {
      const m = MONTH_NAMES[parseInt(d.split('-')[1]) - 1]?.slice(0, 3) || '';
      if (m !== currentMonth) {
        currentMonth = m;
        groups.push({ month: m, dates: [d] });
      } else {
        groups[groups.length - 1].dates.push(d);
      }
    });
    return groups;
  }, [allDates]);

  const gradeColor = (v: number) => v === 5 ? 'bg-green-100 text-green-700' : v === 4 ? 'bg-blue-100 text-blue-700' : v === 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  return (
    <div className="animate-fadeIn">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Оценки</h2>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {monthGroups.length > 0 && (
                <tr className="bg-amber-50">
                  <th className="sticky left-0 z-10 bg-amber-50 px-4 py-2 text-left font-medium text-amber-800 border-b border-r border-amber-200 min-w-[160px]"></th>
                  {monthGroups.map((mg, i) => (
                    <th key={i} colSpan={mg.dates.length} className="px-2 py-2 text-center font-semibold text-amber-800 border-b border-r border-amber-200 text-xs uppercase">
                      {mg.month}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium text-amber-800 border-b border-amber-200">Ср.</th>
                </tr>
              )}
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-2 text-left font-medium text-gray-700 border-b border-r border-gray-200 min-w-[160px]">Предмет</th>
                {allDates.map(d => (
                  <th key={d} className="px-2 py-2 text-center font-medium text-gray-600 border-b border-r border-gray-100 min-w-[44px]">
                    {parseInt(d.split('-')[2])}
                  </th>
                ))}
                <th className="px-3 py-2 text-center font-medium text-gray-600 border-b border-gray-200 min-w-[56px]">Ср.</th>
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map(subject => {
                const data = gradesBySubject[subject];
                if (!data || data.allGrades.length === 0) return null;
                const avg = data.allGrades.length > 0 ? (data.allGrades.reduce((a, b) => a + b, 0) / data.allGrades.length) : 0;
                return (
                  <tr key={subject} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="sticky left-0 z-10 bg-white px-4 py-2.5 font-medium text-gray-900 border-r border-gray-200">{subject}</td>
                    {allDates.map(d => {
                      const vals = data.dates[d] || [];
                      return (
                        <td key={d} className="px-1 py-1 text-center border-r border-gray-100">
                          <div className="flex flex-wrap gap-0.5 justify-center">
                            {vals.map((v, i) => (
                              <span key={i} className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${gradeColor(v)}`}>{v}</span>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2 text-center font-bold border-gray-200">
                      <span className={`inline-flex items-center justify-center w-10 h-8 rounded-lg text-sm font-bold ${avg >= 4.5 ? 'bg-green-100 text-green-700' : avg >= 3.5 ? 'bg-blue-100 text-blue-700' : avg >= 2.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {avg.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ==================== DIARY ====================
interface DiaryProps {
  studentId: string;
  lessons: any[];
  diaryEntries: any[];
  myGrades: any[];
  tests: any[];
  testAttempts: any[];
  setTestAttempts: any;
  testRetakes: any[];
  setTestRetakes: any;
  grades: any[];
  setGrades: any;
  journalColumns: any[];
}

const Diary: React.FC<DiaryProps> = ({
  studentId, lessons, diaryEntries, myGrades, tests,
  testAttempts, setTestAttempts, testRetakes, setTestRetakes, grades: _grades, setGrades, journalColumns
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekDates = getWeekDates(currentDate);

  // Test taking state
  const [takingTest, setTakingTest] = useState<{ test: any; entry: any } | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ test: any; entry: any } | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [testTimer, setTestTimer] = useState(0);
  const [testStartTime, setTestStartTime] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Timer
  useEffect(() => {
    if (!takingTest || testFinished) return;
    const interval = setInterval(() => {
      setTestTimer(prev => {
        const newVal = prev + 1;
        if (takingTest.test.timeLimit > 0 && newVal >= takingTest.test.timeLimit * 60) {
          finishTest();
        }
        return newVal;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [takingTest, testFinished]);

  const startTest = (test: any, entry: any) => {
    setTakingTest({ test, entry });
    setCurrentQuestion(0);
    setAnswers({});
    setTestTimer(0);
    setTestStartTime(Date.now());
    setTestFinished(false);
    setTestResult(null);
    setShowConfirm(null);
  };

  const finishTest = useCallback(() => {
    if (!takingTest) return;
    const test = takingTest.test;
    const entry = takingTest.entry;
    let correct = 0;
    const total = test.questions.length;
    const answerDetails: { questionId: string; answer: string | string[]; correct: boolean }[] = [];

    test.questions.forEach((q: any) => {
      const userAnswer = answers[q.id];
      let isCorrect = false;
      if (q.type === 'single') {
        const correctOpt = q.options.find((o: any) => o.correct);
        isCorrect = correctOpt && userAnswer === correctOpt.id;
      } else if (q.type === 'multiple') {
        const correctIds = q.options.filter((o: any) => o.correct).map((o: any) => o.id).sort();
        const selected = (Array.isArray(userAnswer) ? userAnswer : []).sort();
        isCorrect = JSON.stringify(correctIds) === JSON.stringify(selected);
      } else if (q.type === 'text') {
        isCorrect = typeof userAnswer === 'string' && q.correctAnswer &&
          userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }
      if (isCorrect) correct++;
      answerDetails.push({ questionId: q.id, answer: userAnswer || '', correct: isCorrect });
    });

    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    let grade = 2;
    const scale = [...(test.gradingScale || [])].sort((a: any, b: any) => b.minPercent - a.minPercent);
    for (const s of scale) {
      if (percent >= s.minPercent) { grade = s.grade; break; }
    }

    const timeSpent = Math.round((Date.now() - testStartTime) / 1000);

    const attempt = {
      id: `ta${Date.now()}`,
      studentId,
      testId: test.id,
      date: entry.date,
      subject: entry.subject,
      correct, total, percent, grade,
      completedAt: new Date().toISOString(),
      timeSpent,
      answers: answerDetails,
    };

    setTestAttempts((prev: any[]) => {
      const filtered = prev.filter((a: any) => !(a.studentId === studentId && a.testId === test.id && a.date === entry.date));
      return [...filtered, attempt];
    });

    // Remove retake permission
    setTestRetakes((prev: any[]) => prev.filter((r: any) => !(r.studentId === studentId && r.testId === test.id)));

    // Save grade for real tests
    const isReal = entry.testType === 'real';
    if (isReal) {
      const testCol = journalColumns.find((c: any) => c.date === entry.date && c.subject === entry.subject && c.type === 'test');
      if (testCol) {
        setGrades((prev: any[]) => {
          const filtered = prev.filter((g: any) => !(g.studentId === studentId && g.date === entry.date && g.subject === entry.subject && g.columnId === testCol.id));
          return [...filtered, { id: `g${Date.now()}`, studentId, subject: entry.subject, value: grade, date: entry.date, columnId: testCol.id }];
        });
      }
    }

    setTestResult({ correct, total, percent, grade, isReal, timeSpent });
    setTestFinished(true);
  }, [takingTest, answers, testStartTime, studentId, setTestAttempts, setTestRetakes, setGrades, journalColumns]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If taking test - show test interface
  if (takingTest && !testFinished) {
    const test = takingTest.test;
    const q = test.questions[currentQuestion];
    const remaining = test.timeLimit > 0 ? test.timeLimit * 60 - testTimer : null;

    return (
      <div className="animate-fadeIn max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-5 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">{test.title}</h2>
              <p className="text-violet-200 text-sm mt-1">Вопрос {currentQuestion + 1} из {test.questions.length}</p>
            </div>
            <div className="text-right">
              {remaining !== null && (
                <div className={`text-2xl font-mono font-bold ${remaining < 60 ? 'text-red-300 animate-pulse' : ''}`}>
                  {formatTimer(remaining)}
                </div>
              )}
              <div className="text-violet-200 text-xs mt-1">Прошло: {formatTimer(testTimer)}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${((currentQuestion + 1) / test.questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
              Вопрос {currentQuestion + 1}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 mt-3">{q.text}</h3>
            {q.formula && <div className="mt-2 p-3 bg-gray-50 rounded-lg font-mono text-gray-700">{q.formula}</div>}
            {q.image && <img src={q.image} alt="" className="mt-3 max-w-full rounded-lg" />}
          </div>

          {q.type === 'single' && (
            <div className="space-y-2">
              {q.options.map((opt: any) => (
                <label key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    answers[q.id] === opt.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    answers[q.id] === opt.id ? 'border-violet-500' : 'border-gray-300'
                  }`}>
                    {answers[q.id] === opt.id && <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />}
                  </div>
                  <span className="font-medium text-gray-800">{opt.text}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'multiple' && (
            <div className="space-y-2">
              {q.options.map((opt: any) => {
                const selected = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).includes(opt.id) : false;
                return (
                  <label key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selected ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                      selected ? 'border-violet-500 bg-violet-500' : 'border-gray-300'
                    }`}>
                      {selected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="font-medium text-gray-800">{opt.text}</span>
                  </label>
                );
              })}
            </div>
          )}

          {q.type === 'text' && (
            <input type="text" value={(answers[q.id] as string) || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              placeholder="Введите ответ..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 text-lg" />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 text-gray-700 hover:bg-gray-200">
            <ArrowLeft className="w-4 h-4" /> Назад
          </button>

          <div className="flex gap-1.5">
            {test.questions.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  i === currentQuestion ? 'bg-violet-600 text-white' :
                  answers[test.questions[i].id] ? 'bg-violet-100 text-violet-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>

          {currentQuestion < test.questions.length - 1 ? (
            <button onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-violet-600 text-white hover:bg-violet-700 transition-all">
              Следующий <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={finishTest}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium bg-green-600 text-white hover:bg-green-700 transition-all">
              <CheckCircle className="w-4 h-4" /> Завершить тест
            </button>
          )}
        </div>
      </div>
    );
  }

  // Test result screen
  if (takingTest && testFinished && testResult) {
    const resultColor = testResult.grade >= 4 ? 'green' : testResult.grade === 3 ? 'yellow' : 'red';
    return (
      <div className="animate-fadeIn max-w-lg mx-auto">
        <div className={`bg-gradient-to-br from-${resultColor}-50 to-${resultColor}-100 rounded-2xl p-8 text-center border border-${resultColor}-200`}>
          <div className={`w-20 h-20 rounded-full bg-${resultColor}-200 flex items-center justify-center mx-auto mb-4`}>
            {testResult.grade >= 4 ? <CheckCircle className="w-10 h-10 text-green-600" /> : <AlertCircle className="w-10 h-10 text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Тест завершён!</h2>
          <p className="text-gray-600 mb-6">{takingTest.test.title}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Правильных</div>
              <div className="text-2xl font-bold text-gray-900">{testResult.correct}/{testResult.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Процент</div>
              <div className="text-2xl font-bold text-gray-900">{testResult.percent}%</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Оценка</div>
              <div className={`text-3xl font-bold ${testResult.grade >= 4 ? 'text-green-600' : testResult.grade === 3 ? 'text-yellow-600' : 'text-red-600'}`}>{testResult.grade}</div>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-sm text-gray-500">Время</div>
              <div className="text-2xl font-bold text-gray-900">{formatTimer(testResult.timeSpent)}</div>
            </div>
          </div>

          {testResult.isReal ? (
            <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">✓ Оценка выставлена в журнал</p>
          ) : (
            <p className="text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">Тренировочный тест — оценка не выставляется</p>
          )}

          <button onClick={() => { setTakingTest(null); setTestFinished(false); setTestResult(null); }}
            className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
            Вернуться в дневник
          </button>
        </div>
      </div>
    );
  }

  // Confirmation dialog
  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scaleIn">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Начать тест?</h3>
            <p className="text-gray-600 mb-1">{showConfirm.test.title}</p>
            <p className="text-sm text-gray-500 mb-2">{showConfirm.test.questions.length} вопросов</p>
            {showConfirm.test.timeLimit > 0 && (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                <Clock className="w-4 h-4 inline mr-1" />
                Ограничение: {showConfirm.test.timeLimit} мин.
              </p>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowConfirm(null)}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              Отмена
            </button>
            <button onClick={() => startTest(showConfirm.test, showConfirm.entry)}
              className="flex-1 px-4 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors">
              Начать
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal diary view
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Дневник</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {weekDates[0].getDate()} - {weekDates[5].getDate()} {MONTH_NAMES_GEN[weekDates[5].getMonth()]}
          </span>
          <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); }}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {weekDates.map((date, dayIdx) => {
          const dateStr = formatDate(date);
          const dayLessons = lessons.filter((l: any) => l.date === dateStr).sort((a: any, b: any) => a.lessonNumber - b.lessonNumber);
          if (dayLessons.length === 0) return null;
          const dow = date.getDay();
          const dayNameIdx = dow === 0 ? 6 : dow - 1;

          return (
            <div key={dayIdx} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{DAY_NAMES[dayNameIdx]}</h3>
                  <span className="text-sm text-gray-500">{date.getDate()} {MONTH_NAMES_GEN[date.getMonth()]}</span>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-2 text-left w-8">№</th>
                    <th className="px-4 py-2 text-left">Предмет</th>
                    <th className="px-4 py-2 text-left">Тема</th>
                    <th className="px-4 py-2 text-left">Домашнее задание</th>
                    <th className="px-4 py-2 text-center w-20">Оценка</th>
                  </tr>
                </thead>
                <tbody>
                  {dayLessons.map((lesson: any) => {
                    const entry = diaryEntries.find((e: any) => e.date === dateStr && e.subject === lesson.subject && e.lessonNumber === lesson.lessonNumber);
                    const dayGrades = myGrades.filter(g => g.date === dateStr && g.subject === lesson.subject);
                    const testObj = entry?.testId ? tests.find((t: any) => t.id === entry.testId) : null;

                    // Check test attempt status
                    const attempt = testObj ? testAttempts.find((a: any) => a.studentId === studentId && a.testId === testObj.id && a.date === dateStr) : null;
                    const retakeAllowed = testObj ? testRetakes.some((r: any) => r.studentId === studentId && r.testId === testObj.id) : false;

                    return (
                      <tr key={lesson.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500 font-medium">{lesson.lessonNumber}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{lesson.subject}</td>
                        <td className="px-4 py-3 text-gray-600">{entry?.topic || '—'}</td>
                        <td className="px-4 py-3">
                          {/* Homework text first */}
                          {entry?.homework && (
                            <p className="text-gray-600 mb-1">{entry.homework}</p>
                          )}
                          {/* Then test icon */}
                          {testObj && (
                            <div className="mt-1">
                              {attempt && !retakeAllowed ? (
                                // Already completed
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-xs font-medium text-gray-700 truncate">{testObj.title}</div>
                                    <div className="text-[10px] text-gray-500">Оценка: {attempt.grade} ({attempt.percent}%)</div>
                                  </div>
                                </div>
                              ) : retakeAllowed ? (
                                // Retake available
                                <button onClick={() => setShowConfirm({ test: testObj, entry })}
                                  className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors w-full text-left">
                                  <div className="w-8 h-8 rounded-lg bg-amber-200 flex items-center justify-center flex-shrink-0">
                                    <Play className="w-4 h-4 text-amber-700" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-amber-800 truncate">{testObj.title}</div>
                                    <div className="text-[10px] text-amber-600">Пересдача доступна</div>
                                  </div>
                                </button>
                              ) : (
                                // Not taken yet
                                <button onClick={() => setShowConfirm({ test: testObj, entry })}
                                  className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg border border-violet-200 hover:bg-violet-100 transition-colors w-full text-left group">
                                  <div className="w-8 h-8 rounded-lg bg-violet-200 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-300 transition-colors">
                                    <Play className="w-4 h-4 text-violet-700" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-violet-800 truncate">{testObj.title}</div>
                                    <div className="text-[10px] text-violet-500">{testObj.questions.length} вопр. {testObj.timeLimit > 0 ? `· ${testObj.timeLimit} мин` : ''}</div>
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                          {!entry?.homework && !testObj && <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {dayGrades.map((g: any, i: number) => (
                              <span key={i} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                                g.value === 5 ? 'bg-green-100 text-green-700' :
                                g.value === 4 ? 'bg-blue-100 text-blue-700' :
                                g.value === 3 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>{g.value}</span>
                            ))}
                            {dayGrades.length === 0 && <span className="text-gray-400">—</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==================== REPORTS ====================
const Reports: React.FC<{ myGrades: any[] }> = ({ myGrades }) => {
  const avgBySubject = useMemo(() => {
    const map: Record<string, number[]> = {};
    myGrades.forEach(g => {
      if (!map[g.subject]) map[g.subject] = [];
      map[g.subject].push(g.value);
    });
    return Object.entries(map).map(([subject, vals]) => ({
      subject,
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      count: vals.length,
    }));
  }, [myGrades]);

  const distribution = useMemo(() => {
    const d = { 5: 0, 4: 0, 3: 0, 2: 0 } as Record<number, number>;
    myGrades.forEach(g => { d[g.value] = (d[g.value] || 0) + 1; });
    return d;
  }, [myGrades]);

  const totalGrades = myGrades.length;

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Отчёты</h2>
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
                  <div className={`h-full rounded-full transition-all ${item.avg >= 4.5 ? 'bg-green-500' : item.avg >= 3.5 ? 'bg-blue-500' : item.avg >= 2.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${(item.avg / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-6">Распределение оценок</h3>
          <div className="flex items-end justify-center gap-6 h-48 mt-8">
            {[5, 4, 3, 2].map(v => {
              const count = distribution[v] || 0;
              const pct = totalGrades > 0 ? (count / totalGrades) * 100 : 0;
              const colors = { 5: 'bg-green-500', 4: 'bg-blue-500', 3: 'bg-yellow-500', 2: 'bg-red-500' };
              return (
                <div key={v} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold text-gray-700">{count}</span>
                  <div className={`w-14 rounded-t-lg ${colors[v as keyof typeof colors]} transition-all`}
                    style={{ height: `${Math.max(pct * 1.6, 8)}px` }} />
                  <span className="text-sm font-bold text-gray-600">{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
