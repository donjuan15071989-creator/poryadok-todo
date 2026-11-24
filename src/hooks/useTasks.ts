import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Task, FilterType, TaskPriority } from '../types/task';
import { loadTasks, saveTasks, createTask } from '../lib/taskStorage';

interface UseTasksReturn {
  tasks: Task[];
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  addTask: (title: string, dueDate?: string | null, priority?: TaskPriority) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTaskDueDate: (id: string, dueDate: string | null) => void;
  updateTaskPriority: (id: string, priority: TaskPriority) => void;
  filteredTasks: Task[];
  activeCount: number;
  storageWarning: string | null;
  dismissWarning: () => void;
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchedTasks: Task[];
  searchResultCount: number;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [filter, setFilter] = useState<FilterType>('all');
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mark as initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);

  // Save tasks whenever they change (after initialization)
  useEffect(() => {
    if (!initialized) return;
    const result = saveTasks(tasks);
    if (!result.success && result.error) {
      setStorageWarning(result.error);
    }
  }, [tasks, initialized]);

  const addTask = useCallback((title: string, dueDate: string | null = null, priority: TaskPriority = 'normal') => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (trimmed.length > 200) return;

    const newTask = createTask(trimmed, dueDate, priority);
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const updateTaskDueDate = useCallback((id: string, dueDate: string | null) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, dueDate } : task
      )
    );
  }, []);

  const updateTaskPriority = useCallback((id: string, priority: TaskPriority) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, priority } : task
      )
    );
  }, []);

  // First apply filters, then search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });
  }, [tasks, filter]);

  // Then apply search
  const searchedTasks = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return filteredTasks;

    const lowerQuery = trimmedQuery.toLowerCase();
    return filteredTasks.filter((task) =>
      task.title.toLowerCase().includes(lowerQuery)
    );
  }, [filteredTasks, searchQuery]);

  const searchResultCount = searchedTasks.length;

  const activeCount = tasks.filter((t) => !t.completed).length;

  const dismissWarning = useCallback(() => {
    setStorageWarning(null);
  }, []);

  return {
    tasks,
    filter,
    setFilter,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskDueDate,
    updateTaskPriority,
    filteredTasks,
    activeCount,
    storageWarning,
    dismissWarning,
    // Search
    searchQuery,
    setSearchQuery,
    searchedTasks,
    searchResultCount,
  };
}