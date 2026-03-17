import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Plus, Trash2, Calendar, AlertCircle, X, Sparkles, ChevronDown, Filter, Clock, Wand2, Edit2 } from 'lucide-react';
import confetti from 'canvas-confetti';

type Priority = 'low' | 'medium' | 'high';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  subtasks?: Subtask[];
}

export default function TodoWidget() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('aura_todos');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        priority: t.priority || 'medium',
        subtasks: t.subtasks || []
      }));
    }
    return [];
  });

  const [newTask, setNewTask] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'dueDate' | 'priority'>('default');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [breakingDownId, setBreakingDownId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('aura_todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTodos([{ 
      id: Date.now().toString(), 
      text: newTask.trim(), 
      completed: false,
      priority: newPriority,
      dueDate: newDueDate || undefined
    }, ...todos]);
    setNewTask('');
    setNewDueDate('');
    setNewPriority('medium');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        if (isCompleting) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          });
        }
        return { ...t, completed: isCompleting };
      }
      return t;
    }));
  };

  const confirmDelete = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
    setDeletingId(null);
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const saveEdit = (id: string) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    setTodos(todos.map(t => t.id === id ? { ...t, text: editValue.trim() } : t));
    setEditingId(null);
  };

  const toggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos(todos.map(t => {
      if (t.id === todoId && t.subtasks) {
        return {
          ...t,
          subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st)
        };
      }
      return t;
    }));
  };

  const breakDownTask = async (todoId: string, text: string) => {
    setBreakingDownId(todoId);
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a productivity assistant. Break the user\'s task into 3-5 short, actionable subtasks. Return ONLY a JSON array of strings.' },
            { role: 'user', content: text }
          ],
          jsonMode: true
        })
      });
      let data = await response.text();
      data = data.replace(/```json/g, '').replace(/```/g, '').trim();
      const subtasksText = JSON.parse(data);
      if (Array.isArray(subtasksText)) {
        const subtasks = subtasksText.map((st: string) => ({ id: Math.random().toString(), text: st, completed: false }));
        setTodos(todos.map(t => t.id === todoId ? { ...t, subtasks: [...(t.subtasks || []), ...subtasks] } : t));
      }
    } catch (e) {
      console.error("Failed to break down task", e);
    }
    setBreakingDownId(null);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length === 0 ? 0 : (completedCount / todos.length) * 100;

  let displayedTodos = [...todos];
  if (filterPriority !== 'all') {
    displayedTodos = displayedTodos.filter(t => t.priority === filterPriority);
  }
  if (sortBy === 'dueDate') {
    displayedTodos.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  } else if (sortBy === 'priority') {
    const pWeight = { high: 3, medium: 2, low: 1 };
    displayedTodos.sort((a, b) => pWeight[b.priority] - pWeight[a.priority]);
  }

  const priorityColors = {
    low: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    high: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
  };

  return (
    <div className="apple-glass-heavy rounded-[32px] p-6 flex flex-col h-full relative overflow-hidden">
      {/* Background glow based on progress */}
      <div 
        className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full transition-opacity duration-1000 pointer-events-none mix-blend-screen"
        style={{ opacity: progress / 100 }}
      />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-aura-text flex items-center gap-2">
            Tasks
            {progress === 100 && <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />}
          </h2>
          <p className="text-sm font-medium text-aura-muted">{completedCount} of {todos.length} completed</p>
        </div>
        <div className="w-12 h-12 rounded-full border-[3px] border-white/10 dark:border-white/5 flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-black/5 dark:text-white/5" />
            <circle
              cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8"
              strokeDasharray="289.026"
              strokeDashoffset={289.026 - (289.026 * progress) / 100}
              className="text-blue-500 transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="text-xs font-semibold text-aura-text relative z-10">{Math.round(progress)}%</span>
        </div>
      </div>

      <form onSubmit={addTodo} className="mb-4 relative z-10">
        <div className="relative">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-2xl py-3 pl-4 pr-12 text-aura-text placeholder:text-aura-muted focus:outline-none focus:border-blue-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!newTask.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <AnimatePresence>
          {newTask.trim() && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="flex gap-2 mt-2 overflow-hidden"
            >
              <select 
                value={newPriority} 
                onChange={e => setNewPriority(e.target.value as Priority)} 
                className="bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs font-medium text-aura-text outline-none appearance-none cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                <option value="low" className="bg-white dark:bg-black text-aura-text">Low Priority</option>
                <option value="medium" className="bg-white dark:bg-black text-aura-text">Medium Priority</option>
                <option value="high" className="bg-white dark:bg-black text-aura-text">High Priority</option>
              </select>
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-aura-muted pointer-events-none" />
                <input 
                  type="date" 
                  value={newDueDate} 
                  onChange={e => setNewDueDate(e.target.value)} 
                  className="w-full bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-aura-text outline-none [color-scheme:light] dark:[color-scheme:dark] cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-aura-muted" />
          <select 
            value={filterPriority} 
            onChange={e => setFilterPriority(e.target.value as Priority | 'all')}
            className="bg-transparent text-xs font-medium text-aura-muted outline-none cursor-pointer hover:text-aura-text transition-colors appearance-none"
          >
            <option value="all" className="bg-white dark:bg-black">All Priorities</option>
            <option value="high" className="bg-white dark:bg-black">High Only</option>
            <option value="medium" className="bg-white dark:bg-black">Medium Only</option>
            <option value="low" className="bg-white dark:bg-black">Low Only</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-aura-muted">Sort:</span>
          <select 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-medium text-aura-muted outline-none cursor-pointer hover:text-aura-text transition-colors appearance-none"
          >
            <option value="default" className="bg-white dark:bg-black">Default</option>
            <option value="dueDate" className="bg-white dark:bg-black">Due Date</option>
            <option value="priority" className="bg-white dark:bg-black">Priority</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar relative z-10">
        <AnimatePresence mode="popLayout">
          {displayedTodos.map(todo => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`group flex flex-col p-3 rounded-2xl border transition-all ${
                todo.completed 
                  ? 'bg-black/5 dark:bg-white/5 border-transparent' 
                  : 'apple-glass-heavy border-white/10 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      todo.completed
                        ? 'bg-blue-500 border-blue-500 text-white scale-110 shadow-sm'
                        : 'border-black/20 dark:border-white/20 text-transparent hover:border-black/40 dark:hover:border-white/40'
                    }`}
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </button>
                  
                  {editingId === todo.id ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(todo.id)}
                      onKeyDown={e => e.key === 'Enter' && saveEdit(todo.id)}
                      className="bg-black/5 dark:bg-white/5 border border-blue-500/50 rounded-lg px-2 py-1 text-sm font-medium text-aura-text outline-none w-full"
                    />
                  ) : (
                    <div className="flex flex-col overflow-hidden">
                      <span 
                        onClick={() => startEdit(todo)}
                        className={`truncate cursor-text transition-all font-medium ${
                          todo.completed ? 'text-aura-muted line-through' : 'text-aura-text'
                        }`}
                      >
                        {todo.text}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md border uppercase tracking-wider font-semibold ${priorityColors[todo.priority]}`}>
                          {todo.priority}
                        </span>
                        {todo.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-aura-muted bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded-md">
                            <Clock className="w-3 h-3" />
                            {new Date(todo.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!todo.completed && (
                    <button
                      onClick={() => breakDownTask(todo.id, todo.text)}
                      disabled={breakingDownId === todo.id}
                      className="p-1.5 text-aura-muted hover:text-purple-500 hover:bg-purple-500/10 rounded-xl transition-all disabled:opacity-50"
                      title="AI Breakdown"
                    >
                      <Wand2 className={`w-4 h-4 ${breakingDownId === todo.id ? 'animate-pulse' : ''}`} />
                    </button>
                  )}
                  
                  {deletingId === todo.id ? (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="flex items-center gap-1 bg-red-500/10 rounded-xl p-1">
                      <button onClick={() => confirmDelete(todo.id)} className="p-1 text-red-500 hover:bg-red-500/20 rounded-lg"><Check className="w-3 h-3"/></button>
                      <button onClick={() => setDeletingId(null)} className="p-1 text-aura-muted hover:bg-black/10 dark:hover:bg-white/10 rounded-lg"><X className="w-3 h-3"/></button>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setDeletingId(todo.id)}
                      className="p-1.5 text-aura-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subtasks */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="ml-8 mt-3 space-y-1.5">
                  {todo.subtasks.map(st => (
                    <div key={st.id} className="flex items-center gap-2 text-sm group/st">
                      <button 
                        onClick={() => toggleSubtask(todo.id, st.id)} 
                        className={`flex-shrink-0 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          st.completed ? 'bg-blue-500 border-blue-500' : 'border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40'
                        }`}
                      >
                        {st.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`truncate transition-all font-medium ${st.completed ? 'text-aura-muted line-through' : 'text-aura-text/80'}`}>
                        {st.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {displayedTodos.length === 0 && (
          <div className="text-center text-aura-muted py-8">
            <p className="font-medium">No tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
