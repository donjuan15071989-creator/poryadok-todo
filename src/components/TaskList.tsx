import type { Task, FilterType } from '../types/task';
import { TaskItem } from './TaskItem';
import { EmptyState } from './EmptyState';
import { TaskSearch } from './TaskSearch';

interface TaskListProps {
  tasks: Task[];
  filter: FilterType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateDueDate: (id: string, dueDate: string | null) => void;
  onUpdatePriority: (id: string, priority: import('../types/task').TaskPriority) => void;
  searchedTasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResultCount: number;
}

export function TaskList({
  tasks,
  filter,
  onToggle,
  onDelete,
  onUpdateDueDate,
  onUpdatePriority,
  searchedTasks,
  searchQuery,
  setSearchQuery,
  searchResultCount
}: TaskListProps) {
  const hasTasks = tasks.length > 0;
  const hasQuery = searchQuery.trim() !== '';

  return (
    <div className="task-list">
      <TaskSearch
        query={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        resultCount={searchResultCount}
        hasQuery={hasQuery}
      />
      <ul className="task-list__items" role="list" aria-label="Список задач">
        {searchedTasks.length > 0 ? (
          searchedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdateDueDate={onUpdateDueDate}
              onUpdatePriority={onUpdatePriority}
            />
          ))
        ) : (
          <EmptyState filter={filter} hasTasks={hasTasks} hasQuery={hasQuery} onClear={() => setSearchQuery('')} />
        )}
      </ul>
    </div>
  );
}