import { BaseComponent } from '@control.ts/signals';
import type { Priority, TagName, Task } from '@interfaces/task.interface';

import { nextTaskId } from '../../../data';
import styles from './add-task-form.module.scss';

interface Props {
  columnId: Task['columnId'];
  onAdd: (task: Task) => void;
}

class AddTaskFormComponent extends BaseComponent {
  private readonly formEl: HTMLElement;
  private readonly triggerBtn: HTMLButtonElement;
  private readonly textarea: HTMLTextAreaElement;
  private readonly prioritySelect: HTMLSelectElement;
  private readonly tagSelect: HTMLSelectElement;

  constructor({ columnId, onAdd }: Props) {
    super({ className: '' });

    // ── Textarea ──────────────────────────────────────────────────
    this.textarea = document.createElement('textarea');
    this.textarea.className = styles.textarea;
    this.textarea.placeholder = 'Task title…';
    this.textarea.rows = 3;

    // ── Selects ───────────────────────────────────────────────────
    this.prioritySelect = this.buildSelect(['high', 'medium', 'low'] as Priority[], 'medium');
    this.tagSelect = this.buildSelect(['feature', 'bug', 'docs', 'refactor', 'test', 'chore'] as TagName[]);

    // ── Footer buttons ────────────────────────────────────────────
    const cancelBtn = document.createElement('button');
    cancelBtn.className = styles.cancel;
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.hide());

    const confirmBtn = document.createElement('button');
    confirmBtn.className = styles.confirm;
    confirmBtn.textContent = 'Add task';
    confirmBtn.addEventListener('click', () => {
      const title = this.textarea.value.trim();
      if (!title) return;

      onAdd({
        id: nextTaskId(),
        title,
        priority: this.prioritySelect.value as Priority,
        tag: this.tagSelect.value as TagName,
        columnId,
      });

      this.textarea.value = '';
      this.hide();
    });

    const footer = document.createElement('div');
    footer.className = styles.footer;
    footer.append(this.prioritySelect, this.tagSelect, cancelBtn, confirmBtn);

    // ── Form wrapper ──────────────────────────────────────────────
    this.formEl = document.createElement('div');
    this.formEl.className = styles.form;
    this.formEl.append(this.textarea, footer);

    // ── Trigger button ────────────────────────────────────────────
    this.triggerBtn = document.createElement('button');
    this.triggerBtn.className = styles.trigger;
    this.triggerBtn.innerHTML = '<span>＋</span> Add task';
    this.triggerBtn.addEventListener('click', () => this.show());

    this.node.append(this.triggerBtn, this.formEl);
  }

  private buildSelect<T extends string>(options: T[], defaultValue?: string): HTMLSelectElement {
    const sel = document.createElement('select');
    sel.className = styles.select;
    for (const opt of options) {
      const el = document.createElement('option');
      el.value = opt;
      el.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
      sel.appendChild(el);
    }
    if (defaultValue) sel.value = defaultValue;
    return sel;
  }

  private show(): void {
    this.formEl.classList.add(styles.visible);
    this.triggerBtn.style.display = 'none';
    this.textarea.focus();
  }

  private hide(): void {
    this.formEl.classList.remove(styles.visible);
    this.triggerBtn.style.display = '';
  }
}

export const AddTaskForm = (props: Props) => new AddTaskFormComponent(props);
