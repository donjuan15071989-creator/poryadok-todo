import { useRef, useCallback, type KeyboardEvent, type ChangeEvent } from 'react';

interface TaskSearchProps {
  query: string;
  onChange: (query: string) => void;
  onClear: () => void;
  resultCount?: number;
  hasQuery: boolean;
}

export function TaskSearch({ query, onChange, onClear, resultCount, hasQuery }: TaskSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        onClear();
        // Keep focus in the input after clearing
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [onClear]
  );

  return (
    <div className="task-search">
      <label htmlFor="search-input" className="task-search__label">
        Поиск задач
      </label>
      <div className="task-search__input-wrapper">
        <input
          ref={inputRef}
          id="search-input"
          type="search"
          className="task-search__input"
          placeholder="Найти по названию"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Поиск задач по названию"
          autoComplete="off"
        />
        {hasQuery && (
          <button
            type="button"
            className="task-search__clear"
            onClick={onClear}
            aria-label="Очистить поиск"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {hasQuery && resultCount !== undefined && (
        <div className="task-search__result-count" aria-live="polite" aria-atomic="true">
          Найдено: {resultCount}
        </div>
      )}
    </div>
  );
}