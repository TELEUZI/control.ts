import type { DraggableComponent } from '@control.ts/signals';
import { createDraggable, div$, span$ } from '@control.ts/signals';
import type { Priority, TagName, Task } from '@interfaces/task.interface';

import styles from './task-card.module.scss';

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'var(--accent-blocked)',
  medium: 'var(--accent-progress)',
  low: 'var(--accent-done)',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
};

const TAG_CLASS: Record<TagName, string> = {
  feature: styles.tagFeature,
  bug: styles.tagBug,
  docs: styles.tagDocs,
  refactor: styles.tagRefactor,
  test: styles.tagTest,
  chore: styles.tagChore,
};

const PRIORITY_CARD_CLASS: Record<Priority, string> = {
  high: styles.priorityHigh,
  medium: styles.priorityMedium,
  low: styles.priorityLow,
};

export function createTaskCard(task: Task, onChange?: () => void): DraggableComponent {
  const handle = span$({ className: styles.handle, txt: '⠿' });

  const top = div$(
    { className: styles.top },
    span$({ className: styles.taskId, txt: task.id }),
    span$({ className: styles.title, txt: task.title }),
    handle,
  );

  const priorityDot = span$({
    className: styles.priorityDot,
    style: { background: PRIORITY_COLORS[task.priority] },
  });

  const meta = div$(
    { className: styles.meta },
    span$({ className: `${styles.tag} ${TAG_CLASS[task.tag]}`, txt: task.tag }),
    div$({ className: styles.priority }, priorityDot, span$({ txt: PRIORITY_LABELS[task.priority] })),
  );

  const card = createDraggable(
    { tag: 'div', className: `${styles.card} ${PRIORITY_CARD_CLASS[task.priority]}` },
    {
      handle: `.${styles.handle}`,
      dragClass: 'drag-source',
      ghostClass: 'dragging-ghost',
      onDragEnd: () => onChange?.(),
    },
    top,
    meta,
  );

  card.node.dataset['taskId'] = task.id;

  return card;
}
