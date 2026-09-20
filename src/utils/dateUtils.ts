// Turkish date formatting and datetime-local conversion utilities

const TR_MONTHS_SHORT = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'
];

/**
 * Ensures a date string is in YYYY-MM-DDTHH:mm format for <input type="datetime-local" />
 */
export function toDateTimeLocalValue(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date();
    now.setMinutes(0, 0, 0);
    return formatToInputString(now);
  }

  // If already in YYYY-MM-DDTHH:mm or YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 16);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return `${dateStr}T09:00`;
  }

  // Parse strings like "18 Eki 2024" or "18 Eki 2024, 14:30"
  const parts = dateStr.trim().split(/[\s,]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthIndex = TR_MONTHS_SHORT.findIndex(
      m => m.toLowerCase() === parts[1].toLowerCase()
    );
    const year = parseInt(parts[2], 10);

    if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) {
      let hours = 9;
      let minutes = 0;

      if (parts[3] && parts[3].includes(':')) {
        const [h, m] = parts[3].split(':').map(n => parseInt(n, 10));
        if (!isNaN(h)) hours = h;
        if (!isNaN(m)) minutes = m;
      }

      const d = new Date(year, monthIndex, day, hours, minutes);
      return formatToInputString(d);
    }
  }

  // Fallback: try native Date parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return formatToInputString(parsed);
  }

  // Fallback default
  const fallback = new Date();
  fallback.setMinutes(0, 0, 0);
  return formatToInputString(fallback);
}

function formatToInputString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

/**
 * Formats an ISO or datetime-local string to clean Turkish human readable string:
 * "18 Eki 2024, 14:00" or "18 Eki 2024"
 */
export function formatDateTimeDisplay(dateStr?: string, includeTime = true): string {
  if (!dateStr) return '';

  // Check if it already looks like "18 Eki 2024"
  if (/^\d{1,2}\s+[A-Za-zĞÜŞİÖÇğüşıöç]+\s+\d{4}/.test(dateStr)) {
    return dateStr;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return dateStr;
  }

  const day = date.getDate();
  const month = TR_MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (includeTime && (date.getHours() !== 0 || date.getMinutes() !== 0)) {
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }

  return `${day} ${month} ${year}`;
}

/**
 * Calculates remaining days or status badge note for a given due date
 */
export function calculateDueNote(dueDateStr?: string): string {
  if (!dueDateStr) return '';

  let targetDate: Date;
  if (/^\d{4}-\d{2}-\d{2}/.test(dueDateStr)) {
    targetDate = new Date(dueDateStr);
  } else {
    const parts = dueDateStr.trim().split(/[\s,]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const monthIndex = TR_MONTHS_SHORT.findIndex(
        m => m.toLowerCase() === parts[1].toLowerCase()
      );
      const year = parseInt(parts[2], 10);
      targetDate = new Date(year, monthIndex, day);
    } else {
      targetDate = new Date(dueDateStr);
    }
  }

  if (isNaN(targetDate.getTime())) return '';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDay = new Date(targetDate);
  targetDay.setHours(0, 0, 0, 0);

  const diffTime = targetDay.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `${Math.abs(diffDays)} gün gecikti`;
  } else if (diffDays === 0) {
    return 'Bugün son';
  } else if (diffDays === 1) {
    return 'Yarın son';
  } else if (diffDays <= 7) {
    return `${diffDays} gün kaldı`;
  } else if (diffDays <= 14) {
    return '1 hafta kaldı';
  } else {
    return `${diffDays} gün kaldı`;
  }
}

export type DateRangeFilter = 'all' | 'this-week' | 'next-week' | 'this-month';

function parseDateValue(dateStr: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
    return new Date(dateStr);
  }

  const parts = dateStr.trim().split(/[\s,]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthIndex = TR_MONTHS_SHORT.findIndex(
      month => month.toLowerCase() === parts[1].toLowerCase()
    );
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && monthIndex !== -1 && !isNaN(year)) {
      const [hours = 0, minutes = 0] = (parts[3] || '').split(':').map(Number);
      return new Date(year, monthIndex, day, hours, minutes);
    }
  }

  return new Date(dateStr);
}

export function isDateInRange(dateStr: string | undefined, range: DateRangeFilter, referenceDate = new Date()): boolean {
  if (range === 'all') return true;
  if (!dateStr) return false;

  const date = parseDateValue(dateStr);
  if (isNaN(date.getTime())) return false;

  const startOfDay = (value: Date) => {
    const result = new Date(value);
    result.setHours(0, 0, 0, 0);
    return result;
  };
  const endOfDay = (value: Date) => {
    const result = new Date(value);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  const today = startOfDay(referenceDate);
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() + mondayOffset);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  if (range === 'this-week') {
    return date >= thisWeekStart && date <= endOfDay(thisWeekEnd);
  }

  if (range === 'next-week') {
    const nextWeekStart = new Date(thisWeekStart);
    nextWeekStart.setDate(thisWeekStart.getDate() + 7);
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
    return date >= nextWeekStart && date <= endOfDay(nextWeekEnd);
  }

  if (range === 'this-month') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return date >= monthStart && date <= endOfDay(monthEnd);
  }

  return true;
}
