import React, { useState } from 'react';
import { useData } from '../context';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Edit2, Trash2, X, Save
} from 'lucide-react';
import { type Lesson, DAY_NAMES, DAY_NAMES_SHORT, MONTH_NAMES, MONTH_NAMES_GEN, SUBJECTS, getWeekDates, getMonthDays, formatDate } from '../data';

interface ScheduleProps {
  editable?: boolean;
}

const LESSON_NUMBERS = [1, 2, 3, 4, 5, 6, 7];

export const Schedule: React.FC<ScheduleProps> = ({ editable = false }) => {
  const { lessons, setLessons } = useData();
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [modalData, setModalData] = useState({
    subject: '', date: '', lessonNumber: 1,
    startTime: '', endTime: '',
  });
  const [popupDay, setPopupDay] = useState<{ date: Date } | null>(null);

  const weekDates = getWeekDates(currentDate);

  const navigateWeek = (dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const navigateMonth = (dir: number) => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const navigateDay = (dir: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + dir);
    setSelectedDate(d);
    setCurrentDate(d);
  };

  const goToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getLessonsForDate = (dateStr: string) => {
    return lessons.filter(l => l.date === dateStr).sort((a, b) => a.lessonNumber - b.lessonNumber);
  };

  const openAddModal = (dateStr: string, lessonNumber: number) => {
    setEditingLesson(null);
    setModalData({ subject: SUBJECTS[0], date: dateStr, lessonNumber, startTime: '', endTime: '' });
    setShowModal(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setModalData({
      subject: lesson.subject,
      date: lesson.date,
      lessonNumber: lesson.lessonNumber,
      startTime: lesson.startTime || '',
      endTime: lesson.endTime || '',
    });
    setShowModal(true);
  };

  const saveLesson = () => {
    if (!modalData.subject || !modalData.date) return;
    const lessonData = {
      subject: modalData.subject,
      date: modalData.date,
      lessonNumber: modalData.lessonNumber,
      startTime: modalData.startTime || undefined,
      endTime: modalData.endTime || undefined,
    };
    if (editingLesson) {
      setLessons(prev => prev.map(l => l.id === editingLesson.id ? { ...l, ...lessonData } : l));
    } else {
      const newLesson: Lesson = { id: `l${Date.now()}`, ...lessonData };
      setLessons(prev => [...prev, newLesson]);
    }
    setShowModal(false);
  };

  const deleteLesson = (id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const getSubjectColor = (subject: string): string => {
    const colors: Record<string, string> = {
      'Математика': 'bg-blue-100 text-blue-800 border-blue-200',
      'Русский язык': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Обществознание': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'География': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="animate-fadeIn">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            Сегодня
          </button>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => viewMode === 'week' ? navigateWeek(-1) : viewMode === 'month' ? navigateMonth(-1) : navigateDay(-1)}
              className="p-2 hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => viewMode === 'week' ? navigateWeek(1) : viewMode === 'month' ? navigateMonth(1) : navigateDay(1)}
              className="p-2 hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 ml-2">
            {viewMode === 'week' && `${weekDates[0].getDate()} - ${weekDates[5].getDate()} ${MONTH_NAMES[weekDates[5].getMonth()]} ${weekDates[5].getFullYear()}`}
            {viewMode === 'month' && `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            {viewMode === 'day' && `${DAY_NAMES[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}, ${selectedDate.getDate()} ${MONTH_NAMES[selectedDate.getMonth()]}`}
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
          {(['day', 'week', 'month'] as const).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === mode ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
              {mode === 'day' ? 'День' : mode === 'week' ? 'Неделя' : 'Месяц'}
            </button>
          ))}
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-14 p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">№</th>
                  {weekDates.map((date, i) => (
                    <th key={i}
                      className={`p-3 text-center border-l border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${isToday(date) ? 'bg-primary-50' : ''}`}
                      onClick={() => { setSelectedDate(date); setViewMode('day'); }}>
                      <div className="text-xs font-medium text-gray-500 uppercase">{DAY_NAMES_SHORT[i]}</div>
                      <div className={`text-lg font-bold mt-0.5 ${isToday(date) ? 'text-primary-600' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LESSON_NUMBERS.map(num => (
                  <tr key={num} className="border-b border-gray-100 last:border-b-0">
                    <td className="p-2 text-center">
                      <div className="text-sm font-bold text-gray-400">{num}</div>
                    </td>
                    {weekDates.map((weekDate, dayIdx) => {
                      const dateStr = formatDate(weekDate);
                      const lesson = lessons.find(l => l.date === dateStr && l.lessonNumber === num);
                      return (
                        <td key={dayIdx} className={`p-1.5 border-l border-gray-200 ${isToday(weekDate) ? 'bg-primary-50/50' : ''}`}>
                          {lesson ? (
                            <div className={`p-2 rounded-lg border text-xs ${getSubjectColor(lesson.subject)} transition-all hover:shadow-md cursor-pointer relative group`}
                              onClick={() => editable && openEditModal(lesson)}>
                              <div className="font-semibold truncate">{lesson.subject}</div>
                              {lesson.startTime && (
                                <div className="opacity-70 text-[10px] mt-0.5">{lesson.startTime}-{lesson.endTime}</div>
                              )}
                              {editable && (
                                <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                                  <button onClick={e => { e.stopPropagation(); openEditModal(lesson); }}
                                    className="p-0.5 rounded bg-white/80 hover:bg-white"><Edit2 className="w-3 h-3" /></button>
                                  <button onClick={e => { e.stopPropagation(); deleteLesson(lesson.id); }}
                                    className="p-0.5 rounded bg-white/80 hover:bg-red-100 text-red-500"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              )}
                            </div>
                          ) : editable ? (
                            <button onClick={() => openAddModal(dateStr, num)}
                              className="w-full h-full min-h-[60px] rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all flex items-center justify-center">
                              <Plus className="w-4 h-4 text-gray-400" />
                            </button>
                          ) : (
                            <div className="min-h-[60px]" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm relative">
          <div className="grid grid-cols-7">
            {DAY_NAMES_SHORT.concat('Вс').map(d => (
              <div key={d} className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                {d}
              </div>
            ))}
            {getMonthDays(currentDate.getFullYear(), currentDate.getMonth()).map((date, i) => {
              if (!date) return <div key={i} className="p-2 min-h-[80px] border-b border-r border-gray-100 bg-gray-50/50" />;
              const dateStr = formatDate(date);
              const dayLessons = getLessonsForDate(dateStr);
              return (
                <div key={i}
                  className={`p-2 min-h-[80px] border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${isToday(date) ? 'bg-primary-50' : ''}`}
                  onClick={() => setPopupDay({ date })}>
                  <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-primary-600 font-bold' : 'text-gray-700'}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-0.5">
                    {dayLessons.slice(0, 3).map(l => (
                      <div key={l.id} className="text-[10px] truncate text-gray-500 bg-gray-100 rounded px-1 py-0.5">
                        {l.subject}
                      </div>
                    ))}
                    {dayLessons.length > 3 && (
                      <div className="text-[10px] text-gray-400">+{dayLessons.length - 3}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Day Popup */}
          {popupDay && (() => {
            const dateStr = formatDate(popupDay.date);
            const dayLessons = getLessonsForDate(dateStr);
            const dow = popupDay.date.getDay();
            const dayIdx = dow === 0 ? 6 : dow - 1;
            const dayName = DAY_NAMES[dayIdx];
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setPopupDay(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scaleIn" onClick={e => e.stopPropagation()}>
                  <div className="px-5 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{dayName}</h3>
                        <p className="text-primary-100 text-sm">{popupDay.date.getDate()} {MONTH_NAMES_GEN[popupDay.date.getMonth()]} {popupDay.date.getFullYear()}</p>
                      </div>
                      <button onClick={() => setPopupDay(null)} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {dayLessons.length === 0 ? (
                      <div className="text-center py-8">
                        <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Нет уроков в этот день</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {dayLessons.map(lesson => (
                          <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary-700">{lesson.lessonNumber}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-sm">{lesson.subject}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {lesson.startTime && lesson.endTime ? (
                                <div className="text-xs font-medium text-gray-700">{lesson.startTime}-{lesson.endTime}</div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => {
                      setSelectedDate(popupDay.date);
                      setCurrentDate(popupDay.date);
                      setViewMode('day');
                      setPopupDay(null);
                    }} className="w-full py-2.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors border border-primary-200">
                      Подробнее →
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Day View */}
      {viewMode === 'day' && (() => {
        const dateStr = formatDate(selectedDate);
        const dayLessons = getLessonsForDate(dateStr);
        return (
          <div className="space-y-3">
            {dayLessons.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">Нет уроков в этот день</p>
              </div>
            ) : dayLessons.map((lesson, idx) => (
              <div key={lesson.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-all animate-fadeIn"
                style={{ animationDelay: `${idx * 50}ms` }}>
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary-100 flex flex-col items-center justify-center">
                  <div className="text-lg font-bold text-primary-700">{lesson.lessonNumber}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900">{lesson.subject}</h3>
                </div>
                <div className="text-right flex-shrink-0">
                  {lesson.startTime && lesson.endTime ? (
                    <div className="text-sm font-medium text-gray-700">{lesson.startTime} - {lesson.endTime}</div>
                  ) : (
                    <div className="text-sm font-medium text-gray-400 italic">Время не указано</div>
                  )}
                </div>
                {editable && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEditModal(lesson)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button onClick={() => deleteLesson(lesson.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {editable && (
              <button onClick={() => openAddModal(dateStr, dayLessons.length + 1)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Добавить урок
              </button>
            )}
          </div>
        );
      })()}

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-scaleIn" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                {editingLesson ? 'Редактировать урок' : 'Добавить урок'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Предмет</label>
                <select value={modalData.subject} onChange={e => setModalData(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
                  <input type="date" value={modalData.date} onChange={e => setModalData(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Урок №</label>
                  <select value={modalData.lessonNumber} onChange={e => setModalData(p => ({ ...p, lessonNumber: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Время начала</label>
                  <input type="time" value={modalData.startTime} onChange={e => setModalData(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Время окончания</label>
                  <input type="time" value={modalData.endTime} onChange={e => setModalData(p => ({ ...p, endTime: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <p className="text-xs text-gray-400">Время указывать необязательно</p>
            </div>
            <div className="flex gap-3 pt-2">
              {editingLesson && (
                <button onClick={() => { deleteLesson(editingLesson.id); setShowModal(false); }}
                  className="px-4 py-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-medium">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                Отмена
              </button>
              <button onClick={saveLesson}
                className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
