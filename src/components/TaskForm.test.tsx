import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  const mockOnAdd = vi.fn();

  beforeEach(() => {
    mockOnAdd.mockClear();
  });

  it('renders label, input, and submit button', () => {
    render(<TaskForm onAdd={mockOnAdd} />);

    expect(screen.getByLabelText('Новая задача')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Что нужно сделать?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Добавить задачу' })).toBeInTheDocument();
  });

  it('calls onAdd with input value on submit', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, 'Test task');
    await user.click(screen.getByRole('button', { name: 'Добавить задачу' }));

    expect(mockOnAdd).toHaveBeenCalledWith('Test task', null, 'normal');
  });

  it('calls onAdd on Enter key', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, 'Enter task{enter}');

    expect(mockOnAdd).toHaveBeenCalledWith('Enter task', null, 'normal');
  });

  it('trims whitespace from input', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, '  Trimmed  {enter}');

    expect(mockOnAdd).toHaveBeenCalledWith('Trimmed', null, 'normal');
  });

  it('does not call onAdd for empty input', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const button = screen.getByRole('button', { name: 'Добавить задачу' });
    await user.click(button);

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('does not call onAdd for whitespace only', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, '   {enter}');

    expect(mockOnAdd).not.toHaveBeenCalled();
  });

  it('clears input after successful submit', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, 'Task to clear{enter}');

    expect(input).toHaveValue('');
  });

  it('focuses input after submit', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    await user.type(input, 'Focus test{enter}');

    expect(input).toHaveFocus();
  });

  it('respects maxLength of 200', async () => {
    const user = userEvent.setup();
    render(<TaskForm onAdd={mockOnAdd} />);

    const input = screen.getByPlaceholderText('Что нужно сделать?');
    const longText = 'a'.repeat(250);
    await user.type(input, longText);

    expect(input).toHaveValue('a'.repeat(200));
  });
});