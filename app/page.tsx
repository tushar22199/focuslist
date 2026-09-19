'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Circle,
  ClipboardList,
  Edit3,
  Filter,
  ListFilter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Priority = 'High' | 'Medium' | 'Low'
type FilterMode = 'All' | 'Active' | 'Completed'
type Task = { id: string; title: string; priority: Priority; completed: boolean; createdAt: number }

const initialTasks: Task[] = [
  { id: '1', title: 'Review project brief', priority: 'High', completed: false, createdAt: 3 },
  { id: '2', title: 'Reply to team messages', priority: 'Medium', completed: false, createdAt: 2 },
  { id: '3', title: 'Plan tomorrow\'s priorities', priority: 'Low', completed: true, createdAt: 1 },
]

const priorityStyles: Record<Priority, string> = {
  High: 'bg-rose-50 text-rose-700 ring-rose-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
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

  useEffect(() => {
    const saved = window.localStorage.getItem('focuslist-tasks')
    setTasks(saved ? JSON.parse(saved) : initialTasks)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) window.localStorage.setItem('focuslist-tasks', JSON.stringify(tasks))
  }, [tasks, hydrated])

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((task) => task.completed).length,
    pending: tasks.filter((task) => !task.completed).length,
  }), [tasks])

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || (filter === 'Completed' ? task.completed : !task.completed)
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter
    return matchesSearch && matchesFilter && matchesPriority
  }), [tasks, search, filter, priorityFilter])

  function submitTask(event: React.FormEvent) {
    event.preventDefault()
    const cleanTitle = title.trim()
    if (!cleanTitle) return
    if (editingId) {
      setTasks((current) => current.map((task) => task.id === editingId ? { ...task, title: cleanTitle, priority } : task))
      setEditingId(null)
    } else {
      setTasks((current) => [{ id: crypto.randomUUID(), title: cleanTitle, priority, completed: false, createdAt: Date.now() }, ...current])
    }
    setTitle('')
    setPriority('Medium')
  }

  function startEditing(task: Task) {
    setEditingId(task.id)
    setTitle(task.title)
    setPriority(task.priority)
    document.getElementById('task-title')?.focus()
  }

  function cancelEditing() {
    setEditingId(null)
    setTitle('')
    setPriority('Medium')
  }

  return (
    <main className="min-h-screen bg-[#f7f8f6] text-[#18332a]">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-10">
        <header className="mb-9 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#183f32] text-white shadow-sm"><ClipboardList aria-hidden="true" /></div>
            <div><p className="text-lg font-semibold tracking-tight">FocusList</p><p className="text-xs text-[#718078]">Your day, made clear.</p></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#dfe7e1] bg-white px-3 py-2 text-xs font-medium text-[#61736a] sm:flex"><Sparkles className="size-3.5 text-[#e39b42]" /> Small steps, big progress</div>
        </header>

        <section className="mb-9 grid gap-7 lg:grid-cols-[1fr_300px] lg:items-end">
          <div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#7e9087]">Today&apos;s focus</p><h1 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-[#18332a] sm:text-5xl">Make space for what matters.</h1><p className="mt-4 max-w-lg text-base leading-7 text-[#718078]">Capture your priorities, keep momentum, and finish the day feeling lighter.</p></div>
          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-[#e2e9e3] bg-white p-2 shadow-[0_8px_30px_rgba(24,51,42,0.04)]">
            <Stat label="Total" value={stats.total} />
            <Stat label="Done" value={stats.completed} accent="text-[#3d8b70]" />
            <Stat label="Pending" value={stats.pending} accent="text-[#c58132]" />
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-3xl border border-[#e1e9e2] bg-white p-5 shadow-[0_8px_30px_rgba(24,51,42,0.04)] lg:sticky lg:top-6">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-semibold">{editingId ? 'Edit task' : 'Add a task'}</h2>{editingId && <button onClick={cancelEditing} className="rounded-full p-1 text-[#718078] hover:bg-[#f1f5f1]" aria-label="Cancel editing"><X className="size-4" /></button>}</div>
            <form onSubmit={submitTask} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="task-title">What needs doing?<input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Finish presentation" className="h-11 rounded-xl border border-[#dce6de] bg-[#fbfcfb] px-3 text-sm font-normal outline-none transition placeholder:text-[#a1afa7] focus:border-[#6c9b87] focus:ring-4 focus:ring-[#dff0e7]" /></label>
              <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="task-priority">Priority<select id="task-priority" value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="h-11 rounded-xl border border-[#dce6de] bg-[#fbfcfb] px-3 text-sm font-normal outline-none focus:border-[#6c9b87] focus:ring-4 focus:ring-[#dff0e7]">{(['High', 'Medium', 'Low'] as Priority[]).map((item) => <option key={item}>{item}</option>)}</select></label>
              <button type="submit" className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-[#183f32] px-4 text-sm font-semibold text-white transition hover:bg-[#245846] focus:outline-none focus:ring-4 focus:ring-[#cde7d9]"><Plus className="size-4" />{editingId ? 'Save changes' : 'Add task'}</button>
            </form>
            <div className="mt-6 rounded-2xl bg-[#f5f8f5] p-4 text-xs leading-5 text-[#73847b]"><p className="font-semibold text-[#486357]">A gentle reminder</p><p className="mt-1">You don&apos;t have to do everything today. Start with one thing.</p></div>
          </aside>

          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-[#e1e9e2] bg-white p-3 shadow-[0_8px_30px_rgba(24,51,42,0.04)] sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#91a098]" /><input aria-label="Search tasks" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search your tasks..." className="h-10 w-full rounded-xl border border-[#e2e9e3] bg-[#fbfcfb] pl-9 pr-3 text-sm outline-none focus:border-[#6c9b87] focus:ring-4 focus:ring-[#dff0e7]" /></div><div className="relative"><Filter className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#91a098]" /><select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as 'All' | Priority)} className="h-10 w-full appearance-none rounded-xl border border-[#e2e9e3] bg-[#fbfcfb] pl-9 pr-8 text-sm outline-none focus:border-[#6c9b87] sm:w-36">{['All', 'High', 'Medium', 'Low'].map((item) => <option key={item} value={item}>{item === 'All' ? 'All priorities' : item}</option>)}</select></div></div>
              <div className="flex items-center gap-1 border-t border-[#eef2ee] pt-3"><ListFilter className="mr-1 size-4 text-[#91a098]" />{(['All', 'Active', 'Completed'] as FilterMode[]).map((item) => <button key={item} onClick={() => setFilter(item)} className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold transition', filter === item ? 'bg-[#e7f2eb] text-[#286147]' : 'text-[#7a8981] hover:bg-[#f3f6f3]')}>{item}<span className="ml-1.5 opacity-60">{item === 'All' ? stats.total : item === 'Active' ? stats.pending : stats.completed}</span></button>)}</div>
            </div>

            <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Your tasks <span className="ml-1 text-sm font-normal text-[#91a098]">{visibleTasks.length}</span></h2>{stats.total > 0 && <p className="text-xs text-[#91a098]">{stats.completed} of {stats.total} completed</p>}</div>
            <div className="flex flex-col gap-2.5">{visibleTasks.length > 0 ? visibleTasks.map((task) => <TaskRow key={task.id} task={task} onToggle={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} onEdit={() => startEditing(task)} onDelete={() => setTasks((current) => current.filter((item) => item.id !== task.id))} />) : <div className="rounded-3xl border border-dashed border-[#cad9ce] bg-white px-6 py-16 text-center"><CheckCircle2 className="mx-auto size-10 text-[#a2c5af]" /><h3 className="mt-3 font-semibold">Nothing here yet</h3><p className="mt-1 text-sm text-[#84948b]">Try changing your filters or add a new task.</p></div>}</div>
          </div>
        </section>
        <footer className="mt-10 text-center text-xs text-[#9aa79f]">FocusList · Your tasks are saved automatically in this browser.</footer>
      </div>
    </main>
  )
}

function Stat({ label, value, accent = 'text-[#18332a]' }: { label: string; value: number; accent?: string }) {
  return <div className="rounded-2xl bg-[#f7faf7] px-2 py-3 text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#94a29a]">{label}</p><p className={cn('mt-1 text-2xl font-semibold tracking-tight', accent)}>{value}</p></div>
}

function TaskRow({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  return <article className={cn('group flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-[0_4px_20px_rgba(24,51,42,0.03)] transition hover:border-[#c7d9cc] hover:shadow-[0_8px_24px_rgba(24,51,42,0.07)]', task.completed ? 'border-[#e7eee8]' : 'border-[#e1e9e2]')}>
    <button onClick={onToggle} aria-label={task.completed ? `Mark ${task.title} as active` : `Mark ${task.title} as completed`} className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus:ring-4 focus:ring-[#dff0e7]', task.completed ? 'border-[#5d9d7b] bg-[#5d9d7b] text-white' : 'border-[#b9c9be] text-transparent hover:border-[#5d9d7b]')}>{task.completed ? <Check className="size-3.5" strokeWidth={3} /> : <Circle className="size-3.5" />}</button>
    <div className="min-w-0 flex-1"><p className={cn('truncate text-sm font-medium', task.completed && 'text-[#99a59e] line-through')}>{task.title}</p><span className={cn('mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset', priorityStyles[task.priority])}>{task.priority}</span></div>
    <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"><button onClick={onEdit} className="rounded-lg p-2 text-[#84938b] hover:bg-[#f0f5f1] hover:text-[#286147]" aria-label={`Edit ${task.title}`}><Edit3 className="size-4" /></button><button onClick={onDelete} className="rounded-lg p-2 text-[#84938b] hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${task.title}`}><Trash2 className="size-4" /></button></div>
  </article>
}
