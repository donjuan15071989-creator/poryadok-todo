import type { FilterType } from '../types/task';

interface TaskFiltersProps {
  filter: FilterType;
  onChange: (filter: FilterType) => void;
}

const filters: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
];

export function TaskFilters({ filter, onChange }: TaskFiltersProps) {
  return (
    <div className="task-filters" role="group" aria-label="Фильтры задач">
      {filters.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={`task-filters__btn ${filter === value ? 'task-filters__btn--active' : ''}`}
          onClick={() => onChange(value)}
          aria-pressed={filter === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}