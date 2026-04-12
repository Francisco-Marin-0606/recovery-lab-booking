import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  isBefore,
  startOfToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface CalendarPanelProps {
  currentMonth: Date;
  selectedDate: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date) => void;
}

export default function CalendarPanel({
  currentMonth,
  selectedDate,
  onMonthChange,
  onDateSelect,
}: CalendarPanelProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const dayLabels = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-6">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-gray-500 uppercase tracking-widest">
            {format(currentMonth, "yyyy")}
          </span>
          <h2 className="text-3xl font-bold text-gray-900 capitalize">
            {format(currentMonth, "MMMM", { locale: es })}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {dayLabels.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-bold text-gray-400 uppercase tracking-tighter"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isPast = isBefore(day, startOfToday());

          return (
            <button
              key={day.toString()}
              disabled={isPast && !isSameDay(day, startOfToday())}
              onClick={() => onDateSelect(day)}
              className={`
                relative h-14 flex flex-col items-center justify-center rounded-xl transition-all
                ${isSelected ? "bg-black text-white shadow-lg scale-105 z-10" : "hover:bg-gray-50"}
                ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                ${isPast && !isSameDay(day, startOfToday()) ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <span className="text-sm font-semibold">{format(day, "d")}</span>
              {isSameDay(day, new Date()) && !isSelected && (
                <div className="absolute bottom-2 w-1 h-1 bg-red-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
