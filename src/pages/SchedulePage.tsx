import { useState } from 'react';
import { useScheduleStore, getWeekStart, getPreviousWeek, getNextWeek, formatWeekRange } from '../data/store';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SchedulePage() {
  const { schedule } = useScheduleStore();
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());

  const weekSchedule = schedule.filter(s => s.weekStart === currentWeek);
  const isCurrentWeek = currentWeek === getWeekStart();

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Расписание занятий</h2>
        <p className="mt-4 text-lg text-gray-600">
          Готовься к ОГЭ эффективно. Следи за актуальным расписанием своих курсов.
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentWeek(getPreviousWeek(currentWeek))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Предыдущая неделя"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">{formatWeekRange(currentWeek)}</div>
          {isCurrentWeek && <div className="text-sm text-indigo-600 font-medium">Текущая неделя</div>}
        </div>

        <button
          onClick={() => setCurrentWeek(getNextWeek(currentWeek))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Следующая неделя"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <ScheduleGrid weekStart={currentWeek} />
      
      {weekSchedule.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">На этой неделе занятий нет.</p>
        </div>
      )}
    </div>
  );
}
