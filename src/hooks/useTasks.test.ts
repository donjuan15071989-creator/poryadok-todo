import { renderHook, act } from '@testing-library/react';
import { useTasks } from './useTasks';
import { localStorageMock } from '../test/setup';

describe('useTasks', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('initialization', () => {
    it('loads tasks from localStorage on mount', () => {
      const savedTasks = [
        { id: '1', title: 'Task 1', completed: false, createdAt: '2024-01-01T00:00:00.000Z', dueDate: null, priority: 'normal' },
        { id: '2', title: 'Task 2', completed: true, createdAt: '2024-01-02T00:00:00.000Z', dueDate: null, priority: 'normal' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTasks));

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toEqual(savedTasks);
      expect(result.current.activeCount).toBe(1);
    });

    it('starts with empty tasks when localStorage is empty', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toEqual([]);
      expect(result.current.activeCount).toBe(0);
    });

    it('handles corrupted JSON gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toEqual([]);
    });

    it('handles non-array data gracefully', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ not: 'an array' }));

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toEqual([]);
    });

    it('filters out invalid task objects', () => {
      const mixedData = [
        { id: '1', title: 'Valid', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '2', title: 'Invalid', completed: 'yes', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '3', title: 123, completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
        null,
        { id: '4', title: 'Also valid', completed: true, createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mixedData));

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks.map(t => t.id)).toEqual(['1', '4']);
    });

    it('removes duplicate IDs', () => {
      const duplicatedData = [
        { id: '1', title: 'First', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
        { id: '1', title: 'Duplicate', completed: true, createdAt: '2024-01-02T00:00:00.000Z' },
        { id: '2', title: 'Second', completed: false, createdAt: '2024-01-03T00:00:00.000Z' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(duplicatedData));

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].title).toBe('First');
    });
  });

  describe('adding tasks', () => {
    it('adds a task via addTask', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('New task');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('New task');
      expect(result.current.tasks[0].completed).toBe(false);
      expect(result.current.tasks[0].id).toBeDefined();
      expect(result.current.tasks[0].createdAt).toBeDefined();
    });

    it('trims whitespace from task title', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('  Trimmed task  ');
      });

      expect(result.current.tasks[0].title).toBe('Trimmed task');
    });

    it('rejects empty string', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('');
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('rejects string with only whitespace', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('   ');
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('rejects task longer than 200 characters', () => {
      const { result } = renderHook(() => useTasks());
      const longTitle = 'a'.repeat(201);

      act(() => {
        result.current.addTask(longTitle);
      });

      expect(result.current.tasks).toHaveLength(0);
    });

    it('accepts task with exactly 200 characters', () => {
      const { result } = renderHook(() => useTasks());
      const maxTitle = 'a'.repeat(200);

      act(() => {
        result.current.addTask(maxTitle);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe(maxTitle);
    });

    it('adds new tasks at the beginning of the list', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('First');
        result.current.addTask('Second');
      });

      expect(result.current.tasks[0].title).toBe('Second');
      expect(result.current.tasks[1].title).toBe('First');
    });

    it('allows duplicate task texts with different IDs', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Same task');
        result.current.addTask('Same task');
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks[0].id).not.toBe(result.current.tasks[1].id);
      expect(result.current.tasks[0].title).toBe(result.current.tasks[1].title);
    });

    it('increments active count when adding active task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
      });

      expect(result.current.activeCount).toBe(1);

      act(() => {
        result.current.addTask('Task 2');
      });

      expect(result.current.activeCount).toBe(2);
    });
  });

  describe('toggling tasks', () => {
    it('toggles task completion status', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task to toggle');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.toggleTask(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);
      expect(result.current.activeCount).toBe(0);

      act(() => {
        result.current.toggleTask(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(false);
      expect(result.current.activeCount).toBe(1);
    });

    it('does not reorder tasks when toggling', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('First');
        result.current.addTask('Second');
        result.current.addTask('Third');
      });

      const firstId = result.current.tasks[2].id; // First added is at the end
      const secondId = result.current.tasks[1].id;

      act(() => {
        result.current.toggleTask(firstId);
      });

      // Order should remain the same
      expect(result.current.tasks[2].id).toBe(firstId);
      expect(result.current.tasks[1].id).toBe(secondId);
    });
  });

  describe('deleting tasks', () => {
    it('deletes the correct task by ID', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task 1');
        result.current.addTask('Task 2');
        result.current.addTask('Task 3');
      });

      const taskToDeleteId = result.current.tasks[1].id; // Middle task

      act(() => {
        result.current.deleteTask(taskToDeleteId);
      });

      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks.find(t => t.id === taskToDeleteId)).toBeUndefined();
    });

    it('shows empty state after deleting last task', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Only task');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.deleteTask(taskId);
      });

      expect(result.current.tasks).toHaveLength(0);
      expect(result.current.activeCount).toBe(0);
    });

    it('does not toggle checkbox when deleting', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.toggleTask(taskId);
      });

      expect(result.current.tasks[0].completed).toBe(true);

      act(() => {
        result.current.deleteTask(taskId);
      });

      expect(result.current.tasks).toHaveLength(0);
    });
  });

  describe('filtering', () => {
    it('filters tasks correctly', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Active 1');
        result.current.addTask('Active 2');
      });

      const completedId = result.current.tasks[0].id;

      act(() => {
        result.current.toggleTask(completedId);
      });

      // Default filter 'all'
      expect(result.current.filteredTasks).toHaveLength(2);

      act(() => {
        result.current.setFilter('active');
      });

      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].completed).toBe(false);

      act(() => {
        result.current.setFilter('completed');
      });

      expect(result.current.filteredTasks).toHaveLength(1);
      expect(result.current.filteredTasks[0].completed).toBe(true);
    });
  });

  describe('persistence', () => {
    it('saves tasks to localStorage after changes', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Persisted task');
      });

      awaitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'poryadok.tasks.v1',
          expect.stringContaining('Persisted task')
        );
      });
    });

    it('saves empty array after deleting all tasks', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.deleteTask(taskId);
      });

      awaitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'poryadok.tasks.v1',
          '[]'
        );
      });
    });

    it('restores tasks after remount', () => {
      const savedTasks = [
        { id: '1', title: 'Restored', completed: false, createdAt: '2024-01-01T00:00:00.000Z', dueDate: null, priority: 'normal' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedTasks));

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toEqual(savedTasks);

      // Simulate remount by creating new hook
      const { result: result2 } = renderHook(() => useTasks());

      expect(result2.current.tasks).toEqual(savedTasks);
    });

    it('handles localStorage write error gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task');
      });

      expect(result.current.storageWarning).toBeTruthy();
      expect(result.current.storageWarning).toContain('Не удалось сохранить');
    });

    it('continues working in memory when localStorage fails', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task');
      });

      // Task should still be in memory
      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Task');
    });

    it('dismisses storage warning', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task');
      });

      expect(result.current.storageWarning).toBeTruthy();

      act(() => {
        result.current.dismissWarning();
      });

      expect(result.current.storageWarning).toBeNull();
    });
  });

  describe('due date functionality', () => {
    it('adds task with due date', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task with due date', '2024-12-31');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].title).toBe('Task with due date');
      expect(result.current.tasks[0].dueDate).toBe('2024-12-31');
    });

    it('adds task without due date', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task without due date');
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].dueDate).toBeNull();
    });

    it('updates task due date', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.updateTaskDueDate(taskId, '2024-12-31');
      });

      expect(result.current.tasks[0].dueDate).toBe('2024-12-31');
    });

    it('clears task due date', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task with due date', '2024-12-31');
      });

      const taskId = result.current.tasks[0].id;

      act(() => {
        result.current.updateTaskDueDate(taskId, null);
      });

      expect(result.current.tasks[0].dueDate).toBeNull();
    });

    it('updating due date does not change createdAt', () => {
      const { result } = renderHook(() => useTasks());

      act(() => {
        result.current.addTask('Task');
      });

      const taskId = result.current.tasks[0].id;
      const originalCreatedAt = result.current.tasks[0].createdAt;

      act(() => {
        result.current.updateTaskDueDate(taskId, '2024-12-31');
      });

      expect(result.current.tasks[0].createdAt).toBe(originalCreatedAt);
    });

    it('loads old tasks without dueDate as null', () => {
      const oldTasks = [
        { id: '1', title: 'Old task', completed: false, createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(oldTasks));

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].dueDate).toBeNull();
    });

    it('handles invalid dueDate from storage', () => {
      const invalidTasks = [
        { id: '1', title: 'Task', completed: false, createdAt: '2024-01-01T00:00:00.000Z', dueDate: 'invalid-date' },
        { id: '2', title: 'Task 2', completed: false, createdAt: '2024-01-01T00:00:00.000Z', dueDate: '2024-13-45' },
        { id: '3', title: 'Task 3', completed: false, createdAt: '2024-01-01T00:00:00.000Z', dueDate: '2024-12-31' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(invalidTasks));

      const { result } = renderHook(() => useTasks());

      expect(result.current.tasks).toHaveLength(3);
      expect(result.current.tasks[0].dueDate).toBeNull();
      expect(result.current.tasks[1].dueDate).toBeNull();
      expect(result.current.tasks[2].dueDate).toBe('2024-12-31');
    });
  });
});

// Helper for async assertions
function awaitFor(fn: () => void) {
  return new Promise<void>((resolve) => {
    const check = () => {
      try {
        fn();
        resolve();
      } catch {
        setTimeout(check, 10);
      }
    };
    check();
  });
}