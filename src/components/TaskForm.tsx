import { useRef, useCallback, type FormEvent, type KeyboardEvent } from 'react';
import type { TaskPriority } from '../types/task';

interface TaskFormProps {
  onAdd: (title: string, dueDate?: string | null, priority?: TaskPriority) => void;
}

export function TaskForm({ onAdd }: TaskFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dueDateRef = useRef<HTMLInputElement>(null);
  const priorityRef = useRef<HTMLSelectElement>(null);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const title = (formData.get('title') as string).trim();
      const dueDate = formData.get('dueDate') as string | null;
      const priority = (formData.get('priority') as TaskPriority) || 'normal';
      if (!title) return;
      if (title.length > 200) return;
      onAdd(title, dueDate || null, priority);
      e.currentTarget.reset();
      inputRef.current?.focus();
      // Reset priority to default after successful submit
      if (priorityRef.current) {
        priorityRef.current.value = 'normal';
      }
    },
    [onAdd]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Prevent form submission during IME composition
      if (e.nativeEvent.isComposing) {
        return;
      }
    },
    []
  );

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label htmlFor="task-input" className="task-form__label">
        Новая задача
      </label>
      <div className="task-form__input-wrapper">
        <input
          ref={inputRef}
          id="task-input"
          type="text"
          name="title"
          className="task-form__input"
          placeholder="Что нужно сделать?"
          maxLength={200}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <div className="task-form__field-group">
          <label htmlFor="due-date" className="task-form__field-label">
            Срок выполнения
          </label>
          <input
            ref={dueDateRef}
            id="due-date"
            type="date"
            name="dueDate"
            className="task-form__due-date"
            aria-label="Срок выполнения задачи"
          />
        </div>
        <div className="task-form__field-group">
          <label htmlFor="priority" className="task-form__field-label">
            Приоритет
          </label>
          <select
            ref={priorityRef}
            id="priority"
            name="priority"
            className="task-form__priority"
            aria-label="Приоритет задачи"
            defaultValue="normal"
          >
            <option value="normal">Обычный</option>
            <option value="important">Важный</option>
            <option value="high">Высокий</option>
          </select>
        </div>
        <button type="submit" className="task-form__submit" aria-label="Добавить задачу">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </form>
  );
}