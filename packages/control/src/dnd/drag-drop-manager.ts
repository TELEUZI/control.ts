import type { AnyBaseComponent } from '../base-component';
import type { DraggableComponent } from './draggable';
import type { DropZoneComponent } from './drop-zone';

export interface DragEventData {
  draggable: DraggableComponent;
  dropZone: DropZoneComponent | null;
  originalParent: AnyBaseComponent;
  mouseX: number;
  mouseY: number;
}

export class DragDropManager {
  private static instance: DragDropManager;
  private currentDrag: DragEventData | null = null;
  private dropZones: Set<DropZoneComponent> = new Set();
  private activeDropZone: DropZoneComponent | null = null;
  private dropIndicators: Map<DropZoneComponent, HTMLElement> = new Map();

  private constructor() {}

  public static getInstance(): DragDropManager {
    if (!DragDropManager.instance) {
      DragDropManager.instance = new DragDropManager();
    }
    return DragDropManager.instance;
  }

  public static reset(): void {
    if (DragDropManager.instance) {
      DragDropManager.instance.currentDrag = null;
      DragDropManager.instance.dropZones.clear();
      DragDropManager.instance.activeDropZone = null;
      DragDropManager.instance.dropIndicators.clear();
    }
  }

  public registerDropZone(zone: DropZoneComponent): void {
    this.dropZones.add(zone);
  }

  public unregisterDropZone(zone: DropZoneComponent): void {
    this.dropZones.delete(zone);
    this.dropIndicators.get(zone)?.remove();
    this.dropIndicators.delete(zone);
  }

  public startDrag(data: DragEventData): void {
    this.currentDrag = data;
    // Add drag class to source element
    data.draggable.node.classList.add('drag-source');
  }

  public updateDrag(mouseX: number, mouseY: number): void {
    if (!this.currentDrag) return;

    this.currentDrag.mouseX = mouseX;
    this.currentDrag.mouseY = mouseY;

    // Find drop zone at current position
    const dropZone = this.findDropZoneAtPoint(mouseX, mouseY);

    if (dropZone !== this.activeDropZone) {
      // Left previous drop zone
      if (this.activeDropZone) {
        this.activeDropZone.hideDropIndicator();
        this.activeDropZone.node.classList.remove('drop-zone-active');
      }

      // Entered new drop zone
      if (dropZone && dropZone.canAccept(this.currentDrag.draggable)) {
        this.activeDropZone = dropZone;
        dropZone.node.classList.add('drop-zone-active');
      } else {
        this.activeDropZone = null;
      }
    }

    // Update drop indicator position
    if (this.activeDropZone) {
      const dropIndex = this.calculateDropIndex(this.activeDropZone, mouseX, mouseY);
      this.showDropIndicator(this.activeDropZone, dropIndex);
    }
  }

  public endDrag(): void {
    if (!this.currentDrag) return;

    // Remove drag class
    this.currentDrag.draggable.node.classList.remove('drag-source');

    // Handle drop
    if (this.activeDropZone) {
      const dropIndex = this.calculateDropIndex(this.activeDropZone, this.currentDrag.mouseX, this.currentDrag.mouseY);
      this.activeDropZone.handleDrop(this.currentDrag.draggable, dropIndex);
      this.activeDropZone.hideDropIndicator();
      this.activeDropZone.node.classList.remove('drop-zone-active');
    }

    // Cleanup
    this.hideDropIndicators();
    this.activeDropZone = null;
    this.currentDrag = null;
  }

  public getCurrentDrag(): DragEventData | null {
    return this.currentDrag;
  }

  private findDropZoneAtPoint(x: number, y: number): DropZoneComponent | null {
    // Use elementFromPoint to find the element at the cursor position
    const element = document.elementFromPoint(x, y);
    if (!element) return null;

    // Traverse DOM upwards to find the innermost drop zone
    if (!(element instanceof HTMLElement)) return null;
    let current: HTMLElement | null = element;
    while (current) {
      for (const zone of this.dropZones) {
        if (zone.node === current) {
          return zone;
        }
      }
      current = current.parentElement;
    }

    return null;
  }

  private calculateDropIndex(zone: DropZoneComponent, mouseX: number, mouseY: number): number {
    // Exclude the dragging element itself if it is currently in the zone
    const draggingElement = this.currentDrag?.draggable;
    const children = zone.children.filter((child) => child !== draggingElement);
    if (children.length === 0) return 0;

    const orientation = zone.getOrientation();

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child) {
        throw new Error('Child node not found');
      }
      const rect = child.node.getBoundingClientRect();

      if (orientation === 'vertical') {
        const midpoint = rect.top + rect.height / 2;
        if (mouseY < midpoint) {
          return i;
        }
      } else {
        const midpoint = rect.left + rect.width / 2;
        if (mouseX < midpoint) {
          return i;
        }
      }
    }

    return children.length;
  }

  private showDropIndicator(zone: DropZoneComponent, position: number): void {
    zone.showDropIndicator(position);
  }

  private hideDropIndicators(): void {
    for (const zone of this.dropZones) {
      zone.hideDropIndicator();
    }
  }
}
