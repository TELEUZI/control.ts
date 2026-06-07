import type { AnyBaseComponent } from '../base-component';
import type { Props } from '../control';
import type { DraggableOptions } from './draggable';
import { DraggableComponent } from './draggable';
import type { DropZoneOptions } from './drop-zone';
import { DropZoneComponent } from './drop-zone';

/**
 * Convert a regular BaseComponent to a draggable component.
 * Works with components from both `@control.ts/min` and `@control.ts/signals`.
 *
 * @param component - The component to make draggable
 * @param options - Draggable configuration options
 * @returns The same component with draggable functionality
 */
export function makeDraggable<T extends AnyBaseComponent>(component: T, options: DraggableOptions = {}): T {
  // Store original properties
  const originalNode = component.node;
  const originalParent = component.parent;
  const originalChildren = [...component.children];

  // Create a draggable component with the same base props
  const draggableProps: Props = {
    tag: originalNode.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
  };

  // Copy attributes
  for (let i = 0; i < originalNode.attributes.length; i++) {
    const attr = originalNode.attributes[i];
    if (!attr) {
      continue;
    }
    (draggableProps as Record<string, unknown>)[attr.name] = attr.value;
  }

  const draggable = new DraggableComponent(draggableProps, options);

  // Copy children
  for (const child of originalChildren) {
    draggable.append(child);
  }

  // Replace in parent
  if (originalParent) {
    const index = originalParent.children.indexOf(component);
    if (index !== -1) {
      originalParent.children[index] = draggable;
      draggable.parent = originalParent;
    }
  }

  // Replace in DOM
  originalNode.replaceWith(draggable.node);

  return draggable as unknown as T;
}

/**
 * Convert a regular BaseComponent to a drop zone component.
 * Works with components from both `@control.ts/min` and `@control.ts/signals`.
 *
 * @param component - The component to make a drop zone
 * @param options - Drop zone configuration options
 * @returns The same component with drop zone functionality
 */
export function makeDropZone<T extends AnyBaseComponent>(component: T, options: DropZoneOptions = {}): T {
  // Store original properties
  const originalNode = component.node;
  const originalParent = component.parent;
  const originalChildren = [...component.children];

  // Create a drop zone component with the same base props
  const dropZoneProps: Props = {
    tag: originalNode.tagName.toLowerCase() as keyof HTMLElementTagNameMap,
  };

  // Copy attributes
  for (let i = 0; i < originalNode.attributes.length; i++) {
    const attr = originalNode.attributes[i];
    if (!attr) {
      continue;
    }
    (dropZoneProps as Record<string, unknown>)[attr.name] = attr.value;
  }

  const dropZone = new DropZoneComponent(dropZoneProps, options);

  // Copy children
  for (const child of originalChildren) {
    dropZone.append(child);
  }

  // Replace in parent
  if (originalParent) {
    const index = originalParent.children.indexOf(component);
    if (index !== -1) {
      originalParent.children[index] = dropZone;
      dropZone.parent = originalParent;
    }
  }

  // Replace in DOM
  originalNode.replaceWith(dropZone.node);

  return dropZone as unknown as T;
}

/**
 * Create a new draggable component directly.
 * Works with both `@control.ts/min` and `@control.ts/signals`.
 *
 * @param props - Component properties
 * @param options - Draggable configuration options
 * @param children - Child components
 * @returns A new DraggableComponent
 */
export function createDraggable<T extends HTMLElement = HTMLElement>(
  props: Props<T>,
  options: DraggableOptions = {},
  ...children: AnyBaseComponent[]
): DraggableComponent<T> {
  return new DraggableComponent<T>(props, options, ...children);
}

/**
 * Create a new drop zone component directly.
 * Works with both `@control.ts/min` and `@control.ts/signals`.
 *
 * @param props - Component properties
 * @param options - Drop zone configuration options
 * @param children - Child components
 * @returns A new DropZoneComponent
 */
export function createDropZone<T extends HTMLElement = HTMLElement>(
  props: Props<T>,
  options: DropZoneOptions = {},
  ...children: AnyBaseComponent[]
): DropZoneComponent<T> {
  return new DropZoneComponent<T>(props, options, ...children);
}

// Export all DND classes and types
export type { DragEventData } from './drag-drop-manager';
export { DragDropManager } from './drag-drop-manager';
export type { DraggableOptions } from './draggable';
export { DraggableComponent } from './draggable';
export type { DropZoneOptions } from './drop-zone';
export { DropZoneComponent } from './drop-zone';
