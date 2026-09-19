'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, CheckCircle2, Circle, ClipboardList, Edit3, Filter, ListFilter, Plus, Search, Sparkles, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Priority = 'High' | 'Medium' | 'Low'
type FilterMode = 'All' | 'Active' | 'Completed'
type Task = { id: string; title: string; priority: Priority; completed: boolean; createdAt: number }

const initialTasks: Task[] = [
  { id: '1', title: 'Review project brief', priority: 'High', completed: false, createdAt: 3 },
  { id: '2', title: 'Reply to team messages', priority: 'Medium', completed: false, createdAt: 2 },
  { id: '3', title: "Plan tomorrow's priorities", priority: 'Low', completed: true, createdAt: 1 },
]

const priorityStyles: Record<Priority, string> = {
  High: 'retro-tag-red', Medium: 'retro-tag-yellow', Low: 'retro-tag-blue',
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('Medium')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterMode>('All')
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All')
  const [search, setSearch] = useState('')

  useEffect(() => { const saved = window.localStorage.getItem('focuslist-tasks'); setTasks(saved ? JSON.parse(saved) : initialTasks); setHydrated(true) }, [])
  useEffect(() => { if (hydrated) window.localStorage.setItem('focuslist-tasks', JSON.stringify(tasks)) }, [tasks, hydrated])

  const stats = useMemo(() => ({ total: tasks.length, completed: tasks.filter((task) => task.completed).length, pending: tasks.filter((task) => !task.completed).length }), [tasks])
  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || (filter === 'Completed' ? task.completed : !task.completed)
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter
    return matchesSearch && matchesFilter && matchesPriority
  }), [tasks, search, filter, priorityFilter])

  function submitTask(event: React.FormEvent) {
    event.preventDefault(); const cleanTitle = title.trim(); if (!cleanTitle) return
    if (editingId) setTasks((current) => current.map((task) => task.id === editingId ? { ...task, title: cleanTitle, priority } : task))
    else setTasks((current) => [{ id: crypto.randomUUID(), title: cleanTitle, priority, completed: false, createdAt: Date.now() }, ...current])
    setEditingId(null); setTitle(''); setPriority('Medium')
  }
  function startEditing(task: Task) { setEditingId(task.id); setTitle(task.title); setPriority(task.priority); document.getElementById('task-title')?.focus() }
  function cancelEditing() { setEditingId(null); setTitle(''); setPriority('Medium') }

  return (
    <main className="retro-desktop min-h-screen px-3 py-5 text-[#17263b] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="retro-window mb-4">
          <div className="retro-titlebar"><span className="flex items-center gap-2"><ClipboardList className="size-3.5" /> FOCUSLIST MODERN</span><WindowButtons /></div>
          <nav className="retro-menubar"><span>File</span><span>Tasks</span><span>Options</span><span>View</span><span>Help</span><span className="ml-auto hidden sm:inline">VISUAL</span></nav>
        </header>

        <section className="retro-window mb-4">
          <div className="retro-titlebar"><span>FOCUSLIST // DAILY CONTROL CENTER</span><WindowButtons /></div>
          <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1fr_260px]">
            <div><p className="retro-kicker">[ TODAY&apos;S FOCUS ]</p><h1 className="retro-heading">Make space for what matters.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#344b66]">Capture your priorities, keep momentum, and finish the day feeling lighter.</p><div className="mt-5 flex flex-wrap gap-2"><span className="retro-chip"><Sparkles className="size-3" /> SMALL STEPS, BIG PROGRESS</span><span className="retro-chip">SYS_READY</span></div></div>
            <div className="retro-screen"><p className="mb-3 text-[10px] font-bold tracking-[0.18em] text-[#b8d5ee]">STATUS MONITOR</p><div className="grid grid-cols-3 gap-2"><Stat label="TOTAL" value={stats.total} /><Stat label="DONE" value={stats.completed} /><Stat label="PENDING" value={stats.pending} /></div><div className="mt-4 flex justify-between text-[10px] text-[#b8d5ee]"><span>DAILY PROGRESS</span><span>{stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%</span></div><div className="retro-progress mt-2"><div style={{ width: `${stats.total ? (stats.completed / stats.total) * 100 : 0}%` }} /></div></div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[285px_1fr]">
          <aside className="retro-window h-fit"><div className="retro-titlebar"><span>{editingId ? 'EDIT TASK' : 'NEW TASK'}</span><WindowButtons /></div><div className="p-4"><form onSubmit={submitTask} className="flex flex-col gap-3"><label className="retro-label" htmlFor="task-title">TASK NAME<input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Finish presentation" className="retro-input" /></label><label className="retro-label" htmlFor="task-priority">PRIORITY<select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="retro-input">{(['High', 'Medium', 'Low'] as Priority[]).map((item) => <option key={item}>{item}</option>)}</select></label><button type="submit" className="retro-button retro-button-primary"><Plus className="size-4" /> {editingId ? 'SAVE CHANGES' : 'ADD TASK'}</button>{editingId && <button type="button" onClick={cancelEditing} className="retro-button">CANCEL</button>}</form><div className="retro-note mt-5"><b>REMINDER //</b><p className="mt-1">You don&apos;t have to do everything today. Start with one thing.</p></div></div></aside>

          <div className="min-w-0"><div className="retro-window mb-4"><div className="retro-titlebar"><span>PLAYLIST EDITOR // TASKS</span><WindowButtons /></div><div className="p-3"><div className="flex flex-col gap-2 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#59708a]" /><input aria-label="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." className="retro-input pl-9" /></div><div className="relative"><Filter className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#59708a]" /><select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'All' | Priority)} className="retro-input w-full pl-8 sm:w-36"><option value="All">All priorities</option>{(['High', 'Medium', 'Low'] as Priority[]).map((item) => <option key={item}>{item}</option>)}</select></div></div><div className="mt-3 flex flex-wrap items-center gap-1 border-t border-[#afbdd0] pt-3"><ListFilter className="mr-1 size-4" />{(['All', 'Active', 'Completed'] as FilterMode[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={cn('retro-tab', filter === item && 'retro-tab-active')}>{item}<span className="ml-1 opacity-60">{item === 'All' ? stats.total : item === 'Active' ? stats.pending : stats.completed}</span></button>)}</div></div></div><div className="mb-2 flex items-center justify-between px-1"><h2 className="text-sm font-bold tracking-wide">YOUR TASKS <span className="font-normal text-[#61758b]">({visibleTasks.length})</span></h2><p className="text-[10px] text-[#61758b]">{stats.completed}/{stats.total} COMPLETE</p></div><div className="flex flex-col gap-2">{visibleTasks.length > 0 ? visibleTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} onEdit={() => startEditing(task)} onDelete={() => setTasks((current) => current.filter((item) => item.id !== task.id))} />) : <div className="retro-empty"><CheckCircle2 className="mx-auto size-9" /><h3 className="mt-2 font-bold">NOTHING HERE YET</h3><p className="mt-1 text-xs">Try changing your filters or add a new task.</p></div>}</div></div>
        </section>
        <footer className="mt-5 text-center text-[10px] tracking-widest text-[#526b86]">FOCUSLIST // LOCAL DATABASE // ALL SYSTEMS NOMINAL</footer>
      </div>
    </main>
  )
}

function WindowButtons() { return <span className="flex gap-1"><i /><i /><i /><i /></span> }
function Stat({ label, value }: { label: string; value: number }) { return <div className="text-center"><p className="text-[9px] font-bold text-[#9ebbd5]">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p></div> }
function TaskRow({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) { return <article className={cn('retro-track group flex items-center gap-3 p-3', task.completed && 'retro-track-done')}><button onClick={onToggle} aria-label={task.completed ? `Mark ${task.title} as active` : `Mark ${task.title} as completed`} className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border-2', task.completed ? 'border-[#d7e7f6] bg-[#527ea8] text-white' : 'border-[#6f8298] text-transparent')} >{task.completed ? <Check className="size-3.5" strokeWidth={3} /> : <Circle className="size-3.5" />}</button><div className="min-w-0 flex-1"><p className={cn('truncate text-sm font-semibold', task.completed && 'text-[#6e8294] line-through')}>{task.title}</p><span className={cn('retro-tag', priorityStyles[task.priority])}>{task.priority.toUpperCase()}</span></div><div className="flex shrink-0 gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><button onClick={onEdit} className="retro-icon" aria-label={`Edit ${task.title}`}><Edit3 className="size-3.5" /></button><button onClick={onDelete} className="retro-icon" aria-label={`Delete ${task.title}`}><Trash2 className="size-3.5" /></button></div></article> }

