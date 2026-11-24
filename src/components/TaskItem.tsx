import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { Task, TaskPriority } from '../types/task';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateDueDate: (id: string, dueDate: string | null) => void;
  onUpdatePriority: (id: string, priority: TaskPriority) => void;
}

function formatCreatedAt(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Дата создания неизвестна';
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '');
  } catch {
    return 'Дата создания неизвестна';
  }
}

function formatDueDate(dueDate: string | null, completed: boolean): { text: string; className: string } | null {
  if (!dueDate) return null;

  const [year, month, day] = dueDate.split('-').map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const formatted = due.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // For completed tasks, never show overdue warning
  if (completed) {
    if (diffDays < 0) {
      return { text: `Срок: ${formatted}`, className: 'task-item__due--future' };
    }
    if (diffDays === 0) {
      return { text: 'Срок: сегодня', className: 'task-item__due--today' };
    }
    if (diffDays === 1) {
      return { text: 'Срок: завтра', className: 'task-item__due--tomorrow' };
    }
    return { text: `Срок: ${formatted}`, className: 'task-item__due--future' };
  }

  // For active tasks
  if (diffDays < 0) {
    return { text: `Просрочена · срок: ${formatted}`, className: 'task-item__due--overdue' };
  }
  if (diffDays === 0) {
    return { text: 'Срок: сегодня', className: 'task-item__due--today' };
  }
  if (diffDays === 1) {
    return { text: 'Срок: завтра', className: 'task-item__due--tomorrow' };
  }
  return { text: `Срок: ${formatted}`, className: 'task-item__due--future' };
}

function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'important': return 'Важный';
    case 'high': return 'Высокий';
    default: return 'Обычный';
  }
}

function getPriorityClassName(priority: TaskPriority): string {
  switch (priority) {
    case 'important': return 'task-item__priority--important';
    case 'high': return 'task-item__priority--high';
    default: return 'task-item__priority--normal';
  }
}

export function TaskItem({ task, onToggle, onDelete, onUpdateDueDate, onUpdatePriority }: TaskItemProps) {
  const checkboxLabel = task.completed
    ? `Отметить задачу как активную: ${task.title}`
    : `Отметить задачу как выполненную: ${task.title}`;

  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [editPriority, setEditPriority] = useState<TaskPriority>(task.priority);
  const dueDateButtonRef = useRef<HTMLButtonElement>(null);
  const dueDateInputRef = useRef<HTMLInputElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);
  const prioritySelectRef = useRef<HTMLSelectElement>(null);

  const dueDateInfo = formatDueDate(task.dueDate, task.completed);
  const showPriorityBadge = task.priority !== 'normal';

  useEffect(() => {
    if (isEditingDueDate) {
      dueDateInputRef.current?.focus();
    }
  }, [isEditingDueDate]);

  useEffect(() => {
    if (isEditingPriority) {
      prioritySelectRef.current?.focus();
    }
  }, [isEditingPriority]);

  const handleOpenDueDateEditor = () => {
    setEditDueDate(task.dueDate || '');
    setIsEditingDueDate(true);
  };

  const handleSaveDueDate = (dueDateToSave?: string | null | React.MouseEvent<HTMLButtonElement>) => {
    // Check if it's a mouse event (called directly from onClick)
    const isEvent = dueDateToSave && typeof dueDateToSave === 'object' && 'nativeEvent' in dueDateToSave;
    const dateToSave = isEvent ? (editDueDate || null) : (dueDateToSave !== undefined ? dueDateToSave : (editDueDate || null));
    onUpdateDueDate(task.id, dateToSave);
    setIsEditingDueDate(false);
    dueDateButtonRef.current?.focus();
  };

  const handleCancelDueDate = () => {
    setEditDueDate(task.dueDate || '');
    setIsEditingDueDate(false);
    dueDateButtonRef.current?.focus();
  };

  const handleOpenPriorityEditor = () => {
    setEditPriority(task.priority);
    setIsEditingPriority(true);
  };

  const handleSavePriority = () => {
    onUpdatePriority(task.id, editPriority);
    setIsEditingPriority(false);
    priorityButtonRef.current?.focus();
  };

  const handleCancelPriority = () => {
    setEditPriority(task.priority);
    setIsEditingPriority(false);
    priorityButtonRef.current?.focus();
  };

  const handlePriorityKeyDown = (e: KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      handleSavePriority();
    } else if (e.key === 'Escape') {
      handleCancelPriority();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveDueDate();
    } else if (e.key === 'Escape') {
      handleCancelDueDate();
    }
  };

  const handleBlur = () => {
    // Small delay to allow click on buttons to register
    setTimeout(() => {
      if (isEditingDueDate) {
        handleCancelDueDate();
      }
      if (isEditingPriority) {
        handleCancelPriority();
      }
    }, 100);
  };

  return (
    <li className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
      <label className="task-item__label">
        <input
          type="checkbox"
          className="task-item__checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={checkboxLabel}
        />
        <span className="task-item__checkmark" aria-hidden="true" />
        <div className="task-item__content">
          <span className="task-item__text">{task.title}</span>
          <div className="task-item__meta">
            <time
              className="task-item__created"
              dateTime={task.createdAt}
            >
              Создана: {formatCreatedAt(task.createdAt)}
            </time>
            {dueDateInfo && (
              <time className={`task-item__due ${dueDateInfo.className}`} dateTime={task.dueDate || undefined}>
                {dueDateInfo.text}
              </time>
            )}
            {showPriorityBadge && (
              <span className={`task-item__priority ${getPriorityClassName(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>
            )}
          </div>
        </div>
      </label>
      <div className="task-item__actions">
        <button
          ref={dueDateButtonRef}
          type="button"
          className="task-item__due-btn"
          onClick={handleOpenDueDateEditor}
          aria-label={task.dueDate ? `Изменить срок выполнения: ${formatDueDate(task.dueDate, task.completed)?.text}` : 'Назначить срок выполнения'}
          aria-expanded={isEditingDueDate}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </button>
        <button
          ref={priorityButtonRef}
          type="button"
          className="task-item__priority-btn"
          onClick={handleOpenPriorityEditor}
          aria-label={`Изменить приоритет: ${getPriorityLabel(task.priority)}`}
          aria-expanded={isEditingPriority}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
            <path d="M2 7l10 5 10-5" />
          </svg>
        </button>
        {isEditingDueDate && (
          <div className="task-item__due-editor" onBlur={handleBlur}>
            <input
              ref={dueDateInputRef}
              type="date"
              className="task-item__due-input"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Срок выполнения"
            />
            <button
              type="button"
              className="task-item__due-save"
              onClick={handleSaveDueDate}
              aria-label="Сохранить срок"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>
            <button
              type="button"
              className="task-item__due-cancel"
              onClick={handleCancelDueDate}
              aria-label="Отмена"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            {task.dueDate && (
              <button
                type="button"
                className="task-item__due-clear"
                onClick={() => {
                  handleSaveDueDate(null);
                }}
                aria-label="Убрать срок"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 6h18" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        )}
        {isEditingPriority && (
          <div className="task-item__priority-editor" onBlur={handleBlur}>
            <select
              ref={prioritySelectRef}
              className="task-item__priority-select"
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
              onKeyDown={handlePriorityKeyDown}
              aria-label="Приоритет"
            >
              <option value="normal">Обычный</option>
              <option value="important">Важный</option>
              <option value="high">Высокий</option>
            </select>
            <button
              type="button"
              className="task-item__priority-save"
              onClick={handleSavePriority}
              aria-label="Сохранить приоритет"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>
            <button
              type="button"
              className="task-item__priority-cancel"
              onClick={handleCancelPriority}
              aria-label="Отмена"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <button
          type="button"
          className="task-item__delete"
          onClick={() => onDelete(task.id)}
          aria-label={`Удалить задачу: ${task.title}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </li>
  );
}