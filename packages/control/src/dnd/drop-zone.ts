import type { AnyBaseComponent } from '../base-component';
import { BaseComponent } from '../base-component';
import type { Props } from '../control';
import { DragDropManager } from './drag-drop-manager';
import type { DraggableComponent } from './draggable';

export interface DropZoneOptions {
  accepts?: (draggable: DraggableComponent) => boolean;
  onDrop?: (draggable: AnyBaseComponent, dropZone: AnyBaseComponent, index: number) => void;
  onDragOver?: (draggable: AnyBaseComponent) => void;
  onDragLeave?: () => void;
  dropIndicatorClass?: string;
  orientation?: 'vertical' | 'horizontal';
}

export class DropZoneComponent<T extends HTMLElement = HTMLElement> extends BaseComponent<T> {
  private dropOptions: DropZoneOptions;
  private dropIndicator: HTMLElement | null = null;

  constructor(props: Props<T>, options: DropZoneOptions, ...children: AnyBaseComponent[]) {
    super(props, ...children);
    this.dropOptions = {
      orientation: 'vertical',
      ...options,
    };
    DragDropManager.getInstance().registerDropZone(this);
  }

  public canAccept(draggable: DraggableComponent): boolean {
    // Don't allow dropping on self
    // @ts-expect-error - this is a valid check
    if (draggable === this) return false;

    // Don't allow dropping on own children
    if (this.isDescendantOf(draggable)) return false;

    // Check custom accept function
    if (this.dropOptions.accepts) {
      return this.dropOptions.accepts(draggable);
    }

    return true;
  }

  private isDescendantOf(component: AnyBaseComponent): boolean {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let current: AnyBaseComponent | null = this;
    while (current) {
      if (current === component) return true;
      current = current.parent;
    }
    return false;
  }

  public showDropIndicator(index: number): void {
    // Create indicator if it doesn't exist
    if (!this.dropIndicator) {
      this.dropIndicator = document.createElement('div');
      this.dropIndicator.className = this.dropOptions.dropIndicatorClass || 'drop-indicator';
      this.dropIndicator.classList.add(this.dropOptions.orientation || 'vertical');
    }

    // Position the indicator
    if (index < this.children.length) {
      const referenceChild = this.children[index];
      if (!referenceChild) {
        throw new Error('Reference child node not found');
      }
      this.node.insertBefore(this.dropIndicator, referenceChild.node);
    } else {
      this.node.appendChild(this.dropIndicator);
    }

    // Notify callback
    const dragData = DragDropManager.getInstance().getCurrentDrag();
    if (dragData) {
      this.dropOptions.onDragOver?.(dragData.draggable);
    }
  }

  public hideDropIndicator(): void {
    if (this.dropIndicator && this.dropIndicator.parentNode) {
      this.dropIndicator.remove();
    }

    // Notify callback
    this.dropOptions.onDragLeave?.();
  }

  public handleDrop(draggable: AnyBaseComponent, index: number): void {
    // Adjust index if dragging within same parent
    let adjustedIndex = index;
    if (draggable.parent === this) {
      const currentIndex = this.children.indexOf(draggable);
      if (currentIndex !== -1 && currentIndex < index) {
        adjustedIndex--;
      }
    }

    // Move the component
    draggable.moveTo(this, adjustedIndex);

    // Notify callback
    this.dropOptions.onDrop?.(draggable, this, adjustedIndex);
  }

  public getOrientation(): 'vertical' | 'horizontal' {
    return this.dropOptions.orientation || 'vertical';
  }

  public override destroy(): void {
    DragDropManager.getInstance().unregisterDropZone(this);
    this.dropIndicator?.remove();
    super.destroy();
  }
}
