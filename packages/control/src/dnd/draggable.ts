import type { AnyBaseComponent } from '../base-component';
import { BaseComponent } from '../base-component';
import type { Props } from '../control';
import { DragDropManager } from './drag-drop-manager';

export interface DraggableOptions {
  handle?: string; // CSS selector for drag handle
  dragClass?: string; // Class applied during drag
  ghostClass?: string; // Class for drag preview
  onDragStart?: (component: AnyBaseComponent) => void;
  onDragEnd?: (component: AnyBaseComponent, success: boolean) => void;
  disabled?: boolean;
}

export class DraggableComponent<T extends HTMLElement = HTMLElement> extends BaseComponent<T> {
  private dragOptions: DraggableOptions;
  private isDragging = false;
  private dragGhost: HTMLElement | null = null;
  private handleElement: HTMLElement | null = null;
  private grabOffsetX = 0;
  private grabOffsetY = 0;

  constructor(props: Props<T>, options: DraggableOptions, ...children: AnyBaseComponent[]) {
    super(props, ...children);
    this.dragOptions = { ...options };
    this.setupDragListeners();
  }

  private setupDragListeners(): void {
    // Use event delegation on the component itself
    // This way it works even if handle is added later
    this.node.addEventListener('mousedown', this.onMouseDownDelegate);

    // Set cursor on the whole element or handle
    if (!this.dragOptions.handle && !this.dragOptions.disabled) {
      this.node.style.cursor = 'grab';
    }
  }

  private onMouseDownDelegate = (e: MouseEvent): void => {
    // Guard against starting a drag from an interactive form element or editable content
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.isContentEditable
    ) {
      return;
    }

    // Check if we should handle this mousedown
    if (this.dragOptions.handle) {
      // With handle: check if click is on handle or its children
      const handle = this.node.querySelector(this.dragOptions.handle);

      if (!handle || (!handle.contains(target) && handle !== target)) {
        return; // Click was not on the handle
      }

      // Update handleElement reference
      this.handleElement = handle as HTMLElement;
      this.handleElement.style.cursor = 'grab';
    }

    // Prevent default and stop propagation before starting drag
    e.preventDefault();
    e.stopPropagation();

    // Proceed with drag
    this.onMouseDown(e);
  };

  /**
   * Refresh drag listeners (useful when handle styling needs to be updated)
   */
  public refreshDragListeners(): void {
    if (this.dragOptions.handle) {
      const handle = this.node.querySelector(this.dragOptions.handle);
      if (handle) {
        this.handleElement = handle as HTMLElement;
        this.handleElement.style.cursor = this.dragOptions.disabled ? '' : 'grab';
      }
    }
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (this.dragOptions.disabled) return;

    // Only handle left mouse button
    if (e.button !== 0) return;

    this.isDragging = true;

    if (this.handleElement) {
      this.handleElement.style.cursor = 'grabbing';
    }

    // Calculate grab offset relative to the element's bounding rect
    const rect = this.node.getBoundingClientRect();
    this.grabOffsetX = e.clientX - rect.left;
    this.grabOffsetY = e.clientY - rect.top;

    // Create ghost element
    this.dragGhost = this.node.cloneNode(true) as HTMLElement;
    this.dragGhost.classList.add(this.dragOptions.ghostClass || 'dragging-ghost');

    // Strip IDs from ghost and its children to avoid duplicates in DOM
    this.dragGhost.removeAttribute('id');
    this.dragGhost.querySelectorAll('[id]').forEach((el) => {
      el.removeAttribute('id');
    });

    this.dragGhost.style.position = 'fixed';
    this.dragGhost.style.pointerEvents = 'none';
    this.dragGhost.style.left = `${e.clientX - this.grabOffsetX}px`;
    this.dragGhost.style.top = `${e.clientY - this.grabOffsetY}px`;
    document.body.appendChild(this.dragGhost);

    // Apply drag class
    if (this.dragOptions.dragClass) {
      this.node.classList.add(this.dragOptions.dragClass);
    }

    // Notify callback
    this.dragOptions.onDragStart?.(this);

    // Start drag in manager
    if (this.parent) {
      DragDropManager.getInstance().startDrag({
        draggable: this,
        dropZone: null,
        originalParent: this.parent,
        mouseX: e.clientX,
        mouseY: e.clientY,
      });
    }

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;

    e.preventDefault();

    if (this.dragGhost) {
      this.dragGhost.style.left = `${e.clientX - this.grabOffsetX}px`;
      this.dragGhost.style.top = `${e.clientY - this.grabOffsetY}px`;
    }

    DragDropManager.getInstance().updateDrag(e.clientX, e.clientY);
  };

  private onMouseUp = (e: MouseEvent): void => {
    if (!this.isDragging) return;

    e.preventDefault();

    this.isDragging = false;

    if (this.handleElement) {
      this.handleElement.style.cursor = 'grab';
    }

    // Remove ghost element
    this.dragGhost?.remove();
    this.dragGhost = null;

    // Remove drag class
    if (this.dragOptions.dragClass) {
      this.node.classList.remove(this.dragOptions.dragClass);
    }

    // Get current drag data to check if drop was successful
    const dragData = DragDropManager.getInstance().getCurrentDrag();
    const success = dragData !== null;

    // End drag in manager
    DragDropManager.getInstance().endDrag();

    // Notify callback
    this.dragOptions.onDragEnd?.(this, success);

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  public setDraggable(enabled: boolean): void {
    this.dragOptions.disabled = !enabled;
    if (!this.dragOptions.handle) {
      this.node.style.cursor = enabled ? 'grab' : '';
    } else {
      const handle = this.node.querySelector(this.dragOptions.handle);
      if (handle) {
        (handle as HTMLElement).style.cursor = enabled ? 'grab' : '';
      }
    }
  }

  public isDraggableEnabled(): boolean {
    return !this.dragOptions.disabled;
  }

  public override destroy(): void {
    this.node.removeEventListener('mousedown', this.onMouseDownDelegate);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    this.dragGhost?.remove();
    super.destroy();
  }
}
