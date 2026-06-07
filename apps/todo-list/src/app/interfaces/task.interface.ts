export type Priority = 'high' | 'medium' | 'low';
export type TagName = 'feature' | 'bug' | 'docs' | 'refactor' | 'test' | 'chore';
export type ColumnId = 'todo' | 'in-progress' | 'done' | 'blocked';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  tag: TagName;
  columnId: ColumnId;
}

export interface ColumnDef {
  id: ColumnId;
  title: string;
  accentColor: string;
  emptyIcon: string;
  emptyText: string;
}
