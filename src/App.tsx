import { useTasks } from './hooks/useTasks';
import { TaskForm } from './components/TaskForm';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { CatWalk } from './components/CatWalk';
import { pluralizeTasks } from './lib/pluralize';
import { useRef } from 'react';

function App() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const {
    tasks,
    filter,
    setFilter,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskDueDate,
    updateTaskPriority,
    activeCount,
    storageWarning,
    dismissWarning,
    // Search
    searchQuery,
    setSearchQuery,
    searchedTasks,
    searchResultCount,
  } = useTasks();

  return (
    <div className="app">
      <main className="main">
        <header className="header">
          <div className="header__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <h1 className="header__title">Порядок</h1>
          <p className="header__subtitle">Меньше хаоса. Больше сделанного.</p>
        </header>

        <section
          ref={cardRef}
          className="card"
          aria-labelledby="card-heading"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <h2 id="card-heading" className="visually-hidden">Список задач</h2>

          <TaskForm onAdd={addTask} />

          <div className="task-panel">
            <div className="task-panel__counter" aria-live="polite" aria-atomic="true">
              {pluralizeTasks(activeCount)}
            </div>
            <TaskFilters filter={filter} onChange={setFilter} />
          </div>

          <TaskList
            tasks={tasks}
            filter={filter}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onUpdateDueDate={updateTaskDueDate}
            onUpdatePriority={updateTaskPriority}
            searchedTasks={searchedTasks}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResultCount={searchResultCount}
          />

          {storageWarning && (
            <div className="storage-warning" role="alert">
              <span>{storageWarning}</span>
              <button type="button" onClick={dismissWarning} className="storage-warning__dismiss" aria-label="Скрыть предупреждение">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </section>

        <CatWalk cardRef={cardRef} />

        <footer className="footer">
          <p>Задачи хранятся локально в этом браузере. Данные не синхронизируются между устройствами.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;