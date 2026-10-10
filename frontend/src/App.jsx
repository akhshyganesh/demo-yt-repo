import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Circle, ListTodo, Plus, Sparkles, Trash2 } from "lucide-react";

const filters = ["All tasks", "In progress", "Completed"];

async function request(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers }
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || "Something went wrong. Please try again.");
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [todos, setTodos] = useState([]);
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/api/todos")
      .then(setTodos)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const remaining = todos.filter((todo) => !todo.completed).length;
  const completed = todos.length - remaining;
  const visibleTodos = useMemo(() => {
    if (activeFilter === "In progress") return todos.filter((todo) => !todo.completed);
    if (activeFilter === "Completed") return todos.filter((todo) => todo.completed);
    return todos;
  }, [activeFilter, todos]);

  async function addTodo(event) {
    event.preventDefault();
    const title = newTitle.trim();
    if (!title || saving) return;

    setSaving(true);
    setError("");
    try {
      const todo = await request("/api/todos", {
        method: "POST",
        body: JSON.stringify({ title })
      });
      setTodos((current) => [todo, ...current]);
      setNewTitle("");
      setActiveFilter(filters[0]);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateTodo(todo, updates) {
    setError("");
    try {
      const updated = await request(`/api/todos/${todo._id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      setTodos((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  async function deleteTodo(todo) {
    setError("");
    try {
      await request(`/api/todos/${todo._id}`, { method: "DELETE" });
      setTodos((current) => current.filter((item) => item._id !== todo._id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function clearCompleted() {
    setError("");
    try {
      await request("/api/todos?completed=true", { method: "DELETE" });
      setTodos((current) => current.filter((todo) => !todo.completed));
    } catch (clearError) {
      setError(clearError.message);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Daylist home">
          <span className="brand-mark"><Check size={17} strokeWidth={3} /></span>
          <span>daylist<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-note"><span className="status-dot" /> A little more focus, every day</div>
      </header>

      <section className="todo-layout">
        <aside className="intro">
          <div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL SPACE</div>
          <h1>Make room<br />for what <span>matters.</span></h1>
          <p>A clear mind starts with a simple list. Take it one thing at a time.</p>
          <div className="progress-card">
            <div className="progress-heading"><span>LIST PROGRESS</span><span>{todos.length ? Math.round((completed / todos.length) * 100) : 0}%</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${todos.length ? (completed / todos.length) * 100 : 0}%` }} /></div>
            <div className="progress-caption">{completed} of {todos.length} {todos.length === 1 ? "task" : "tasks"} complete</div>
          </div>
          <div className="gentle-reminder"><span className="reminder-icon">✳</span><span>Small steps still move<br />you forward.</span></div>
        </aside>

        <section className="todo-card" aria-label="Todo list">
          <div className="card-heading">
            <div>
              <div className="date-label">{new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase()}</div>
              <h2>Today's focus</h2>
            </div>
            <div className="task-count"><ListTodo size={16} /><span>{remaining} left</span></div>
          </div>

          <form className="add-form" onSubmit={addTodo}>
            <Plus className="add-icon" size={19} />
            <input
              aria-label="New task"
              maxLength={200}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="What needs your attention?"
              value={newTitle}
            />
            <button aria-label="Add task" className="add-button" disabled={!newTitle.trim() || saving} type="submit">
              <span>{saving ? "Adding" : "Add task"}</span><ChevronDown size={15} className="submit-arrow" />
            </button>
          </form>

          <nav className="filter-tabs" aria-label="Filter tasks">
            {filters.map((filter) => (
              <button
                aria-pressed={activeFilter === filter}
                className={activeFilter === filter ? "filter-tab active" : "filter-tab"}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}<span className="filter-count">{filter === "All tasks" ? todos.length : filter === "Completed" ? completed : remaining}</span>
              </button>
            ))}
          </nav>

          {error && <div className="error-message" role="alert">{error}</div>}

          <div className="task-list" aria-live="polite">
            {loading ? (
              <div className="empty-state"><span className="loader" /><p>Getting your list ready…</p></div>
            ) : visibleTodos.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">{activeFilter === "Completed" ? "✓" : "✳"}</span>
                <h3>{todos.length === 0 ? "A fresh start." : activeFilter === "Completed" ? "Nothing checked off yet." : "You're all caught up."}</h3>
                <p>{todos.length === 0 ? "Add your first task and take it from there." : activeFilter === "Completed" ? "Finished tasks will find a home here." : "Enjoy the breathing room. You've earned it."}</p>
              </div>
            ) : (
              visibleTodos.map((todo) => (
                <article className={todo.completed ? "todo-row is-complete" : "todo-row"} key={todo._id}>
                  <button
                    aria-label={todo.completed ? `Mark ${todo.title} incomplete` : `Complete ${todo.title}`}
                    className="check-button"
                    onClick={() => updateTodo(todo, { completed: !todo.completed })}
                    type="button"
                  >
                    {todo.completed ? <Check size={14} strokeWidth={2.7} /> : <Circle size={20} strokeWidth={1.6} />}
                  </button>
                  <span className="todo-title">{todo.title}</span>
                  <button aria-label={`Delete ${todo.title}`} className="delete-button" onClick={() => deleteTodo(todo)} type="button">
                    <Trash2 size={16} />
                  </button>
                </article>
              ))
            )}
          </div>

          <footer className="card-footer">
            <span><span className="footer-sparkle">✳</span> One thing at a time.</span>
            {completed > 0 && <button className="clear-button" onClick={clearCompleted} type="button">Clear completed</button>}
          </footer>
        </section>
      </section>
      <footer className="page-footer">MADE FOR A CALMER, CLEARER DAY <span>·</span> DAYLIST {new Date().getFullYear()}</footer>
    </main>
  );
}

export default App;
