import { AddTaskForm } from '@components/add-task-form/add-task-form';
import { createTaskCard } from '@components/task-card/task-card';
import type { DropZoneComponent } from '@control.ts/signals';
import { $, $$, BaseComponent, createDropZone, div$, span$ } from '@control.ts/signals';
import type { ColumnDef, Task } from '@interfaces/task.interface';

import styles from './kanban-column.module.scss';

interface Props {
  def: ColumnDef;
  initialTasks: Task[];
  onChange: () => void;
}

class KanbanColumnComponent extends BaseComponent {
  public readonly dropZone: DropZoneComponent;

  // Initialized as class field — evaluated after super() so the lazy
  // computed $$(() => ...) in the constructor args is safe because it
  // only reads this.count when its value is first subscribed to.
  private readonly count = $(0);

  constructor({ def, initialTasks, onChange }: Props) {
    // Build the drop zone before super() so we can close over it
    const dropZone = createDropZone(
      { tag: 'div', className: styles.cards },
      {
        orientation: 'vertical',
        onDragOver: () => dropZone.node.classList.add('drop-zone-active'),
        onDragLeave: () => dropZone.node.classList.remove('drop-zone-active'),
        onDrop: () => {
          dropZone.node.classList.remove('drop-zone-active');
          requestAnimationFrame(() => {
            this.count.value = dropZone.children.length;
            onChange();
          });
        },
      },
    );

    const addForm = AddTaskForm({
      columnId: def.id,
      onAdd: (task) => {
        const card = createTaskCard(task, () => {
          requestAnimationFrame(() => {
            this.count.value = dropZone.children.length;
            onChange();
          });
        });
        dropZone.append(card);

        // Animate in
        card.node.style.opacity = '0';
        card.node.style.transform = 'translateY(-8px)';
        requestAnimationFrame(() => {
          card.node.style.transition = 'opacity 200ms ease, transform 200ms ease';
          card.node.style.opacity = '1';
          card.node.style.transform = '';
          setTimeout(() => {
            card.node.style.transition = '';
          }, 220);
        });

        this.count.value = dropZone.children.length;
        onChange();
      },
    });

    // ── Call super() — children are built here. ──────────────────────
    // The computed $$(() => ...) is lazy: it only reads this.count after
    // super() returns and field initializers have run, so no undefined access.
    super({ className: styles.column, style: { borderTop: `3px solid ${def.accentColor}` } });
    this.appendChildren([
      div$(
        { className: styles.header },
        span$({ className: styles.dot, style: { background: def.accentColor } }),
        span$({ className: styles.title, txt: def.title }),
        span$({ className: styles.count, textContent: $$(() => String(this.count.value)) }),
      ),
      dropZone,
      div$({ className: styles.formWrapper }, addForm),
    ]);

    this.dropZone = dropZone;

    // Now that super() has returned, count field is initialized — seed it.
    this.count.value = initialTasks.length;

    for (const task of initialTasks) {
      const card = createTaskCard(task, () => {
        requestAnimationFrame(() => {
          this.count.value = dropZone.children.length;
          onChange();
        });
      });
      dropZone.append(card);
    }
  }

  public syncCount(): void {
    this.count.value = this.dropZone.children.length;
  }
}

export const KanbanColumn = (props: Props) => new KanbanColumnComponent(props);
export type { KanbanColumnComponent };
