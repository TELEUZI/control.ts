import { $, $$, BaseComponent, div$, h1$, p$, span$ } from '@control.ts/signals';

import { COLUMN_DEFS, SEED_TASKS } from '../../../data';
import styles from './board.module.scss';
import type { KanbanColumnComponent } from './kanban-column/kanban-column';
import { KanbanColumn } from './kanban-column/kanban-column';

class BoardPageComponent extends BaseComponent {
  constructor() {
    // Build columns before super() so we can close over the array
    const columnDefs = COLUMN_DEFS;
    const columns: KanbanColumnComponent[] = [];

    const board = div$({ className: styles.board });

    for (const def of columnDefs) {
      const initialTasks = SEED_TASKS.filter((t) => t.columnId === def.id);
      // defer onChange — will reference this.totalCount/doneCount lazily
      const col = KanbanColumn({
        def,
        initialTasks,
        onChange: () => syncStats(),
      });
      columns.push(col);
      board.append(col);
    }

    // Local sync function — reads columns array; called lazily after construction
    const totalCount = $(0);
    const doneCount = $(0);

    const syncStats = () => {
      let total = 0;
      let done = 0;
      for (const [i, col] of columns.entries()) {
        const len = col.dropZone.children.length;
        col.syncCount();
        total += len;
        if (i === 2) done = len; // "Done" is third column
      }
      totalCount.value = total;
      doneCount.value = done;
    };

    // ── super() — all children here ───────────────────────────────
    super(
      { className: styles.page },
      // Header
      div$(
        { className: styles.header },
        div$(
          { className: styles.headerInner },
          div$({ className: styles.logo, txt: '⊞' }),
          div$(
            {},
            h1$({ className: styles.appTitle, txt: 'Kanban Board' }),
            p$({ className: styles.appSubtitle, txt: 'Powered by @control.ts/min drag-and-drop' }),
          ),
          div$(
            { className: styles.stats },
            div$(
              { className: styles.statItem },
              span$({ className: styles.statValue, textContent: $$(() => String(totalCount.value)) }),
              span$({ className: styles.statLabel, txt: 'Total' }),
            ),
            div$(
              { className: styles.statItem },
              span$({ className: styles.statValue, textContent: $$(() => String(doneCount.value)) }),
              span$({ className: styles.statLabel, txt: 'Done' }),
            ),
          ),
        ),
      ),
      // Board wrapper
      div$(
        { className: styles.wrapper },
        div$(
          { className: styles.inner },
          // Instructions
          div$(
            { className: styles.instructions },
            span$({ className: styles.instructionItem, txt: '🖱️ Drag cards between columns' }),
            span$({ className: styles.instructionItem, txt: '↕️ Reorder within a column' }),
            span$({ className: styles.instructionItem, txt: '⠿ Grab handle to start dragging' }),
            span$({ className: styles.instructionItem, txt: '＋ Add tasks with the button below each column' }),
          ),
          // Progress bar
          div$(
            { className: styles.progressWrap },
            div$({
              className: styles.progressFill,
              style: $$(() => ({
                width: totalCount.value > 0 ? `${Math.round((doneCount.value / totalCount.value) * 100)}%` : '0%',
              })),
            }),
          ),
          board,
        ),
      ),
    );

    // Seed initial stats
    syncStats();
  }
}

export const BoardPage = () => new BoardPageComponent();
