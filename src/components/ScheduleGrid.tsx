import { useScheduleStore, DAYS, ClassSession } from '../data/store';
import { Calendar, Clock, MapPin, User, Pencil } from 'lucide-react';

interface ScheduleGridProps {
  onSessionClick?: (session: ClassSession) => void;
  weekStart: string;
}

export function ScheduleGrid({ onSessionClick, weekStart }: ScheduleGridProps) {
  const { schedule } = useScheduleStore();

  const getSessionsForDay = (day: string) => {
    return schedule
      .filter(s => s.day === day && s.weekStart === weekStart)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const subjectColors: Record<string, string> = {
    'Русский язык': 'bg-red-50 text-red-700 border-red-200',
    'Математика': 'bg-blue-50 text-blue-700 border-blue-200',
    'Обществознание': 'bg-purple-50 text-purple-700 border-purple-200',
    'География': 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {DAYS.map(day => {
        const sessions = getSessionsForDay(day);
        if (sessions.length === 0) return null;

        return (
          <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <h3 className="font-semibold text-gray-900">{day}</h3>
            </div>
            <div className="p-4 space-y-4 flex-1">
              {sessions.map(session => (
                <div 
                  key={session.id} 
                  onClick={() => onSessionClick && onSessionClick(session)}
                  className={`
                    p-3 rounded-lg border relative group
                    ${subjectColors[session.subject] || 'bg-gray-50 text-gray-700 border-gray-200'}
                    ${onSessionClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
                  `}
                >
                  <div className="font-bold text-lg mb-1 pr-6">{session.subject}</div>
                  
                  {onSessionClick && (
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="w-4 h-4" />
                    </div>
                  )}

                  <div className="space-y-1 text-sm opacity-90">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>Каб. {session.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{session.teacher}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
