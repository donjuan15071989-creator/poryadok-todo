import { render, screen, fireEvent } from '@testing-library/react';
import { TaskList } from './TaskList';

describe('TaskList', () => {
  const tasks = [
    { id: '1', title: 'Active task', completed: false, createdAt: '2024-01-01T00:00:00.000Z', dueDate: null, priority: 'normal' },
    { id: '2', title: 'Completed task', completed: true, createdAt: '2024-01-02T00:00:00.000Z', dueDate: null, priority: 'normal' },
    { id: '3', title: 'Another active', completed: false, createdAt: '2024-01-03T00:00:00.000Z', dueDate: null, priority: 'normal' },
  ];

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdateDueDate = vi.fn();
  const mockOnUpdatePriority = vi.fn();
  const mockSetSearchQuery = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
    mockOnUpdateDueDate.mockClear();
    mockOnUpdatePriority.mockClear();
    mockSetSearchQuery.mockClear();
  });

  it('renders all tasks when filter is all', () => {
    render(<TaskList tasks={tasks} filter="all" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={tasks} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={3} />);

    expect(screen.getByText('Active task')).toBeInTheDocument();
    expect(screen.getByText('Completed task')).toBeInTheDocument();
    expect(screen.getByText('Another active')).toBeInTheDocument();
  });

  it('renders only active tasks when filter is active', () => {
    render(<TaskList tasks={tasks} filter="active" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={tasks.filter(t => !t.completed)} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={2} />);

    expect(screen.getByText('Active task')).toBeInTheDocument();
    expect(screen.getByText('Another active')).toBeInTheDocument();
    expect(screen.queryByText('Completed task')).not.toBeInTheDocument();
  });

  it('renders only completed tasks when filter is completed', () => {
    render(<TaskList tasks={tasks} filter="completed" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={tasks.filter(t => t.completed)} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={1} />);

    expect(screen.getByText('Completed task')).toBeInTheDocument();
    expect(screen.queryByText('Active task')).not.toBeInTheDocument();
    expect(screen.queryByText('Another active')).not.toBeInTheDocument();
  });

  it('shows empty state when no tasks at all', () => {
    render(<TaskList tasks={[]} filter="all" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={[]} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={0} />);

    expect(screen.getByText('Пока всё спокойно')).toBeInTheDocument();
    expect(screen.getByText('Добавьте первую задачу — и начнем наводить порядок')).toBeInTheDocument();
  });

  it('shows empty state for active filter when no active tasks', () => {
    const onlyCompleted = [{ id: '1', title: 'Done', completed: true, createdAt: '2024-01-01T00:00:00.000Z', dueDate: null, priority: 'normal' }];
    render(<TaskList tasks={onlyCompleted} filter="active" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={[]} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={0} />);

    expect(screen.getByText('Все задачи выполнены')).toBeInTheDocument();
  });

  it('shows empty state for completed filter when no completed tasks', () => {
    const onlyActive = [{ id: '1', title: 'Active', completed: false, createdAt: '2024-01-01T00:00:00.000Z', dueDate: null, priority: 'normal' }];
    render(<TaskList tasks={onlyActive} filter="completed" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={[]} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={0} />);

    expect(screen.getByText('Здесь появятся выполненные задачи')).toBeInTheDocument();
  });

  it('passes correct task to onToggle', () => {
    render(<TaskList tasks={tasks} filter="all" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={tasks} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={3} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Отметить задачу как выполненную: Active task' });
    fireEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('1');
  });

  it('passes correct task to onDelete', () => {
    render(<TaskList tasks={tasks} filter="all" onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} onUpdatePriority={mockOnUpdatePriority} searchedTasks={tasks} searchQuery="" setSearchQuery={mockSetSearchQuery} searchResultCount={3} />);

    const deleteButton = screen.getByRole('button', { name: 'Удалить задачу: Active task' });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });
});