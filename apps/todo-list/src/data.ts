import type { ColumnDef, Task } from '@interfaces/task.interface';

let taskCounter = 12;

export function nextTaskId(): string {
  taskCounter += 1;
  return `CTL-${String(taskCounter).padStart(3, '0')}`;
}

export const COLUMN_DEFS: ColumnDef[] = [
  {
    id: 'todo',
    title: 'To Do',
    accentColor: 'var(--accent-todo)',
    emptyIcon: '📋',
    emptyText: 'No tasks yet — click + to add one',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    accentColor: 'var(--accent-progress)',
    emptyIcon: '🔧',
    emptyText: 'Drag tasks here when you start working',
  },
  {
    id: 'done',
    title: 'Done',
    accentColor: 'var(--accent-done)',
    emptyIcon: '✅',
    emptyText: 'Completed tasks will appear here',
  },
  {
    id: 'blocked',
    title: 'Blocked',
    accentColor: 'var(--accent-blocked)',
    emptyIcon: '🚫',
    emptyText: 'Tasks with blockers go here',
  },
];

export const SEED_TASKS: Task[] = [
  {
    id: 'CTL-001',
    title: 'Design drag-and-drop API surface for @control.ts/min',
    priority: 'high',
    tag: 'feature',
    columnId: 'done',
  },
  {
    id: 'CTL-002',
    title: 'Write unit tests for DraggableComponent',
    priority: 'medium',
    tag: 'test',
    columnId: 'done',
  },
  {
    id: 'CTL-003',
    title: 'Fix ghost element snap-to-center on fast drags',
    priority: 'high',
    tag: 'bug',
    columnId: 'done',
  },
  { id: 'CTL-004', title: 'Implement nested drop zone detection', priority: 'high', tag: 'feature', columnId: 'done' },
  {
    id: 'CTL-005',
    title: 'Update DND_README.md with packaged CSS path',
    priority: 'low',
    tag: 'docs',
    columnId: 'done',
  },
  {
    id: 'CTL-006',
    title: 'Refactor vite.config.mts to support multi-entry builds',
    priority: 'medium',
    tag: 'refactor',
    columnId: 'done',
  },
  {
    id: 'CTL-007',
    title: 'Build Kanban demo app in apps/todo-list',
    priority: 'high',
    tag: 'feature',
    columnId: 'in-progress',
  },
  {
    id: 'CTL-008',
    title: 'Add touch/pointer-events support to draggable',
    priority: 'medium',
    tag: 'feature',
    columnId: 'in-progress',
  },
  { id: 'CTL-009', title: 'Publish @control.ts/min 0.3.0 to npm', priority: 'high', tag: 'chore', columnId: 'todo' },
  {
    id: 'CTL-010',
    title: 'Add keyboard accessibility (arrow keys) to DND',
    priority: 'medium',
    tag: 'feature',
    columnId: 'todo',
  },
  {
    id: 'CTL-011',
    title: 'Integrate @control.ts/signals for reactive board state',
    priority: 'medium',
    tag: 'feature',
    columnId: 'blocked',
  },
  { id: 'CTL-012', title: 'Add Storybook stories for DND components', priority: 'low', tag: 'docs', columnId: 'todo' },
];
