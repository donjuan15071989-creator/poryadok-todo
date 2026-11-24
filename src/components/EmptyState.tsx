import type { FilterType } from '../types/task';

interface EmptyStateProps {
  filter: FilterType;
  hasTasks: boolean;
  hasQuery?: boolean;
  onClear?: () => void;
}

export function EmptyState({ filter, hasTasks, hasQuery, onClear }: EmptyStateProps) {
  let title: string;
  let text: string;
  let showClearButton = false;

  if (!hasTasks) {
    title = 'Пока всё спокойно';
    text = 'Добавьте первую задачу — и начнем наводить порядок';
  } else if (hasQuery) {
    title = 'Ничего не найдено';
    text = 'Попробуйте изменить запрос или выбранный фильтр';
    showClearButton = true;
  } else if (filter === 'active') {
    title = 'Все задачи выполнены';
    text = 'Отличная работа! Можно добавить новые задачи или отдохнуть.';
  } else if (filter === 'completed') {
    title = 'Здесь появятся выполненные задачи';
    text = 'Когда задача будет отмечена как выполненная, она покажется в этом списке.';
  } else {
    title = 'Пока всё спокойно';
    text = 'Добавьте первую задачу — и начнем наводить порядок';
  }

  return (
    <div className="empty-state" role="status" aria-live="polite">
      <svg className="empty-state__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__text">{text}</p>
      {showClearButton && onClear && (
        <button
          type="button"
          className="empty-state__clear"
          onClick={onClear}
          aria-label="Очистить поиск"
        >
          Очистить поиск
        </button>
      )}
    </div>
  );
}