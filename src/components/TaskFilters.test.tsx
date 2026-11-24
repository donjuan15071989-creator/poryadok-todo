import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFilters } from './TaskFilters';

describe('TaskFilters', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all three filter buttons', () => {
    render(<TaskFilters filter="all" onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: 'Все' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Активные' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выполненные' })).toBeInTheDocument();
  });

  it('marks active filter with aria-pressed', () => {
    render(<TaskFilters filter="active" onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: 'Активные' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Все' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Выполненные' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onChange when filter button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskFilters filter="all" onChange={mockOnChange} />);

    await user.click(screen.getByRole('button', { name: 'Активные' }));

    expect(mockOnChange).toHaveBeenCalledWith('active');
  });

  it('applies active class to current filter', () => {
    render(<TaskFilters filter="completed" onChange={mockOnChange} />);

    const completedBtn = screen.getByRole('button', { name: 'Выполненные' });
    expect(completedBtn).toHaveClass('task-filters__btn--active');
  });
});