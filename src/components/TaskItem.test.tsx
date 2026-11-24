import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';

// Use a fixed date far in the future to avoid timezone/overdue issues
const FUTURE_DATE = '2099-12-31';
const FUTURE_DATE_FORMATTED = '31.12.2099';
const PAST_DATE = '2020-01-01';

describe('TaskItem', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test task',
    completed: false,
    createdAt: '2024-06-15T12:00:00.000Z', // Mid-year to avoid DST issues
    dueDate: null,
  };

  const mockOnToggle = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnUpdateDueDate = vi.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
    mockOnUpdateDueDate.mockClear();
  });

  it('renders task text', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    expect(screen.getByText('Test task')).toBeInTheDocument();
  });

  it('renders unchecked checkbox for active task', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Отметить задачу как выполненную: Test task' });
    expect(checkbox).not.toBeChecked();
  });

  it('renders checked checkbox for completed task', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Отметить задачу как активную: Test task' });
    expect(checkbox).toBeChecked();
  });

  it('calls onToggle when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Отметить задачу как выполненную: Test task' });
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('task-1');
  });

  it('renders delete button with correct aria-label', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const deleteButton = screen.getByRole('button', { name: 'Удалить задачу: Test task' });
    expect(deleteButton).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const deleteButton = screen.getByRole('button', { name: 'Удалить задачу: Test task' });
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith('task-1');
  });

  it('applies completed styling when task is completed', () => {
    const completedTask = { ...mockTask, completed: true };
    render(<TaskItem task={completedTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const taskItem = screen.getByText('Test task').closest('li');
    expect(taskItem).toHaveClass('task-item--completed');
  });

  it('renders created date', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    // Date format may vary by locale/timezone, just check it contains the date
    expect(screen.getByText(/Создана: 1[45]\.06\.2024/)).toBeInTheDocument();
  });

  it('renders due date badge for future date', () => {
    const taskWithDueDate = { ...mockTask, dueDate: FUTURE_DATE };
    render(<TaskItem task={taskWithDueDate} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    expect(screen.getByText(`Срок: ${FUTURE_DATE_FORMATTED}`)).toBeInTheDocument();
  });

  it('shows due date button', () => {
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const dueBtn = screen.getByRole('button', { name: 'Назначить срок выполнения' });
    expect(dueBtn).toBeInTheDocument();
  });

  it('opens due date editor on button click', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const dueBtn = screen.getByRole('button', { name: 'Назначить срок выполнения' });
    await user.click(dueBtn);

    expect(screen.getByLabelText('Срок выполнения')).toBeInTheDocument();
  });

  it('saves due date on save button click', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const dueBtn = screen.getByRole('button', { name: 'Назначить срок выполнения' });
    await user.click(dueBtn);

    const input = screen.getByLabelText('Срок выполнения');
    await user.type(input, FUTURE_DATE);

    const saveBtn = screen.getByRole('button', { name: 'Сохранить срок' });
    await user.click(saveBtn);

    expect(mockOnUpdateDueDate).toHaveBeenCalledWith('task-1', FUTURE_DATE);
  });

  it('cancels due date edit on cancel button click', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const dueBtn = screen.getByRole('button', { name: 'Назначить срок выполнения' });
    await user.click(dueBtn);

    const input = screen.getByLabelText('Срок выполнения');
    await user.type(input, FUTURE_DATE);

    const cancelBtn = screen.getByRole('button', { name: 'Отмена' });
    await user.click(cancelBtn);

    expect(mockOnUpdateDueDate).not.toHaveBeenCalled();
  });

  it('cancels due date edit on Escape key', async () => {
    const user = userEvent.setup();
    render(<TaskItem task={mockTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const dueBtn = screen.getByRole('button', { name: 'Назначить срок выполнения' });
    await user.click(dueBtn);

    const input = screen.getByLabelText('Срок выполнения');
    await user.type(input, FUTURE_DATE);
    await user.keyboard('{Escape}');

    expect(mockOnUpdateDueDate).not.toHaveBeenCalled();
  });

  it('clears due date when clear button clicked', async () => {
    const user = userEvent.setup();
    const taskWithDueDate = { ...mockTask, dueDate: FUTURE_DATE };
    render(<TaskItem task={taskWithDueDate} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    const dueBtn = screen.getByRole('button', { name: `Изменить срок выполнения: Срок: ${FUTURE_DATE_FORMATTED}` });
    await user.click(dueBtn);

    const clearBtn = screen.getByRole('button', { name: 'Убрать срок' });
    await user.click(clearBtn);

    expect(mockOnUpdateDueDate).toHaveBeenCalledWith('task-1', null);
  });

  it('shows due date for completed task without overdue warning', () => {
    const completedTask = { ...mockTask, completed: true, dueDate: PAST_DATE };
    render(<TaskItem task={completedTask} onToggle={mockOnToggle} onDelete={mockOnDelete} onUpdateDueDate={mockOnUpdateDueDate} />);

    // For completed tasks, past dates should just show the date without "overdue" warning
    expect(screen.getByText(/Срок: 0[12]\.01\.2020/)).toBeInTheDocument();
    expect(screen.queryByText('Просрочена')).not.toBeInTheDocument();
  });
});