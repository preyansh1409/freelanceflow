import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (isToday(d))    return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'dd MMM yyyy');
};

export const isOverdue = (dateStr) => {
  if (!dateStr) return false;
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return isPast(d) && !isToday(d);
};
