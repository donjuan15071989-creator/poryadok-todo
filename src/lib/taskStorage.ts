import type { Task, TaskPriority } from '../types/task';

const STORAGE_KEY = 'poryadok.tasks.v1';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function isValidPriority(priority: unknown): priority is TaskPriority {
  return priority === 'normal' || priority === 'important' || priority === 'high';
}

function isValidTask(task: unknown): task is Task {
  if (!task || typeof task !== 'object') return false;
  const t = task as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.completed === 'boolean' &&
    typeof t.createdAt === 'string'
  );
}

function normalizeTask(task: Task): Task {
  const dueDate = task.dueDate;
  const validDueDate = dueDate && typeof dueDate === 'string' && isValidCalendarDate(dueDate) ? dueDate : null;

  const priority = task.priority;
  const validPriority = isValidPriority(priority) ? priority : 'normal';

  return {
    ...task,
    dueDate: validDueDate,
    priority: validPriority,
  };
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }

    if (!Array.isArray(parsed)) return [];

    const seenIds = new Set<string>();
    const validTasks: Task[] = [];

    for (const item of parsed) {
      if (!isValidTask(item)) continue;
      if (seenIds.has(item.id)) continue;
      seenIds.add(item.id);
      validTasks.push(normalizeTask(item));
    }

    return validTasks;
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): { success: boolean; error?: string } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return { success: true };
  } catch {
    return { success: false, error: 'Не удалось сохранить изменения в браузере. После обновления страницы они могут пропасть' };
  }
}

export function createTask(title: string, dueDate: string | null = null, priority: TaskPriority = 'normal'): Task {
  const trimmed = title.trim();
  return {
    id: generateId(),
    title: trimmed,
    completed: false,
    createdAt: new Date().toISOString(),
    dueDate,
    priority,
  };
}