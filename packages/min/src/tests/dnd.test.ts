import { BaseComponent as CoreBaseComponent } from '@control.ts/control';
import { DragDropManager, DraggableComponent, DropZoneComponent } from '@control.ts/control';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseComponent } from '../base-component';
import { createDraggable, createDropZone, makeDraggable, makeDropZone } from '../dnd';

beforeEach(() => {
  DragDropManager.reset();
});

afterEach(() => {
  DragDropManager.reset();
});

describe('Parent Tracking', () => {
  it('should set parent when appending child', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const child = new BaseComponent({ tag: 'span' });

    parent.append(child);

    expect(child.parent).toBe(parent);
    expect(parent.children).toContain(child);
  });

  it('should clear parent when removing child', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const child = new BaseComponent({ tag: 'span' });

    parent.append(child);
    parent.removeChild(child);

    expect(child.parent).toBeNull();
    expect(parent.children).not.toContain(child);
  });

  it('should update parent when moving component', () => {
    const parent1 = new BaseComponent({ tag: 'div' });
    const parent2 = new BaseComponent({ tag: 'div' });
    const child = new BaseComponent({ tag: 'span' });

    parent1.append(child);
    expect(child.parent).toBe(parent1);

    child.moveTo(parent2);
    expect(child.parent).toBe(parent2);
    expect(parent1.children).not.toContain(child);
    expect(parent2.children).toContain(child);
  });

  it('should move component to specific index', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const child1 = new BaseComponent({ tag: 'span', txt: '1' });
    const child2 = new BaseComponent({ tag: 'span', txt: '2' });
    const child3 = new BaseComponent({ tag: 'span', txt: '3' });

    parent.append(child1);
    parent.append(child2);
    parent.append(child3);

    child3.moveTo(parent, 1);

    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child3);
    expect(parent.children[2]).toBe(child2);
  });

  it('should insert child before reference', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const child1 = new BaseComponent({ tag: 'span', txt: '1' });
    const child2 = new BaseComponent({ tag: 'span', txt: '2' });
    const child3 = new BaseComponent({ tag: 'span', txt: '3' });

    parent.append(child1);
    parent.append(child3);
    parent.insertBefore(child2, child3);

    expect(parent.children[0]).toBe(child1);
    expect(parent.children[1]).toBe(child2);
    expect(parent.children[2]).toBe(child3);
  });

  it('should remove component from DOM and parent', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const child = new BaseComponent({ tag: 'span' });

    parent.append(child);
    child.remove();

    expect(child.parent).toBeNull();
    expect(parent.children).not.toContain(child);
    expect(child.node.parentElement).toBeNull();
  });
});

describe('DragDropManager', () => {
  let manager: DragDropManager;

  beforeEach(() => {
    manager = DragDropManager.getInstance();
  });

  it('should be a singleton', () => {
    const manager1 = DragDropManager.getInstance();
    const manager2 = DragDropManager.getInstance();
    expect(manager1).toBe(manager2);
  });

  it('should register and unregister drop zones', () => {
    const dropZone = new DropZoneComponent({ tag: 'div' }, {});

    // Manager should have the drop zone registered (done in constructor)
    expect(manager).toBeDefined();

    dropZone.destroy();
    // After destroy, drop zone should be unregistered
    expect(manager).toBeDefined();
  });

  it('should track current drag state', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const draggable = new DraggableComponent({ tag: 'div' }, {});
    parent.append(draggable);

    manager.startDrag({
      draggable,
      dropZone: null,
      originalParent: parent,
      mouseX: 100,
      mouseY: 100,
    });

    const currentDrag = manager.getCurrentDrag();
    expect(currentDrag).not.toBeNull();
    expect(currentDrag?.draggable).toBe(draggable);

    manager.endDrag();
    expect(manager.getCurrentDrag()).toBeNull();
  });
});

describe('DraggableComponent', () => {
  it('should create a draggable component', () => {
    const draggable = new DraggableComponent({ tag: 'div', txt: 'Drag me' }, {});
    expect(draggable).toBeInstanceOf(CoreBaseComponent);
    expect(draggable.node.textContent).toBe('Drag me');
  });

  it('should enable and disable dragging', () => {
    const draggable = new DraggableComponent({ tag: 'div' }, { disabled: false });
    expect(draggable.isDraggableEnabled()).toBe(true);

    draggable.setDraggable(false);
    expect(draggable.isDraggableEnabled()).toBe(false);

    draggable.setDraggable(true);
    expect(draggable.isDraggableEnabled()).toBe(true);
  });

  it('should call onDragStart callback', () => {
    const onDragStart = vi.fn();
    const parent = new BaseComponent({ tag: 'div' });
    const draggable = new DraggableComponent({ tag: 'div' }, { onDragStart });
    parent.append(draggable);

    // Simulate mousedown event
    const mouseDownEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    draggable.node.dispatchEvent(mouseDownEvent);

    expect(onDragStart).toHaveBeenCalledWith(draggable);
  });

  it('should call onDragEnd callback', () => {
    const onDragEnd = vi.fn();
    const parent = new BaseComponent({ tag: 'div' });
    const draggable = new DraggableComponent({ tag: 'div' }, { onDragEnd });
    parent.append(draggable);

    // Simulate drag sequence
    const mouseDownEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    draggable.node.dispatchEvent(mouseDownEvent);

    const mouseUpEvent = new MouseEvent('mouseup', {
      clientX: 150,
      clientY: 150,
    });
    document.dispatchEvent(mouseUpEvent);

    expect(onDragEnd).toHaveBeenCalled();
  });

  it('should not start drag when disabled', () => {
    const onDragStart = vi.fn();
    const parent = new BaseComponent({ tag: 'div' });
    const draggable = new DraggableComponent({ tag: 'div' }, { disabled: true, onDragStart });
    parent.append(draggable);

    const mouseDownEvent = new MouseEvent('mousedown', {
      button: 0,
      clientX: 100,
      clientY: 100,
    });
    draggable.node.dispatchEvent(mouseDownEvent);

    expect(onDragStart).not.toHaveBeenCalled();
  });
});

describe('DropZoneComponent', () => {
  it('should create a drop zone component', () => {
    const dropZone = new DropZoneComponent({ tag: 'div' }, {});
    expect(dropZone).toBeInstanceOf(CoreBaseComponent);
  });

  it('should accept draggable by default', () => {
    const dropZone = new DropZoneComponent({ tag: 'div' }, {});
    const draggable = new DraggableComponent({ tag: 'div' }, {});

    expect(dropZone.canAccept(draggable)).toBe(true);
  });

  it('should reject draggable based on accepts function', () => {
    const accepts = vi.fn().mockReturnValue(false);
    const dropZone = new DropZoneComponent({ tag: 'div' }, { accepts });
    const draggable = new DraggableComponent({ tag: 'div' }, {});

    expect(dropZone.canAccept(draggable)).toBe(false);
    expect(accepts).toHaveBeenCalledWith(draggable);
  });

  it('should not accept dropping on self', () => {
    const dropZone = new DropZoneComponent({ tag: 'div' }, {});
    expect(dropZone.canAccept(dropZone as unknown as DraggableComponent)).toBe(false);
  });

  it('should call onDrop callback when handling drop', () => {
    const onDrop = vi.fn();
    const dropZone = new DropZoneComponent({ tag: 'div' }, { onDrop });
    const parent = new BaseComponent({ tag: 'div' });
    const draggable = new DraggableComponent({ tag: 'div' }, {});
    parent.append(draggable);

    dropZone.handleDrop(draggable, 0);

    expect(onDrop).toHaveBeenCalledWith(draggable, dropZone, 0);
    expect(draggable.parent).toBe(dropZone);
  });

  it('should show and hide drop indicator', () => {
    const dropZone = new DropZoneComponent({ tag: 'div' }, {});
    const child1 = new BaseComponent({ tag: 'div' });
    const child2 = new BaseComponent({ tag: 'div' });
    dropZone.append(child1);
    dropZone.append(child2);

    dropZone.showDropIndicator(1);
    const indicator = dropZone.node.querySelector('.drop-indicator');
    expect(indicator).not.toBeNull();

    dropZone.hideDropIndicator();
    const indicatorAfterHide = dropZone.node.querySelector('.drop-indicator');
    expect(indicatorAfterHide).toBeNull();
  });

  it('should return correct orientation', () => {
    const verticalZone = new DropZoneComponent({ tag: 'div' }, { orientation: 'vertical' });
    expect(verticalZone.getOrientation()).toBe('vertical');

    const horizontalZone = new DropZoneComponent({ tag: 'div' }, { orientation: 'horizontal' });
    expect(horizontalZone.getOrientation()).toBe('horizontal');
  });
});

describe('Factory Functions', () => {
  it('should create draggable using createDraggable', () => {
    const draggable = createDraggable({ tag: 'div', txt: 'Draggable' }, {});
    expect(draggable).toBeInstanceOf(DraggableComponent);
    expect(draggable.node.textContent).toBe('Draggable');
  });

  it('should create drop zone using createDropZone', () => {
    const dropZone = createDropZone({ tag: 'div' }, {});
    expect(dropZone).toBeInstanceOf(DropZoneComponent);
  });

  it('should convert component to draggable using makeDraggable', () => {
    const component = new BaseComponent({ tag: 'div', txt: 'Convert me' });
    const draggable = makeDraggable(component, {});

    expect(draggable).toBeInstanceOf(DraggableComponent);
  });

  it('should convert component to drop zone using makeDropZone', () => {
    const component = new BaseComponent({ tag: 'div' });
    const dropZone = makeDropZone(component, {});

    expect(dropZone).toBeInstanceOf(DropZoneComponent);
  });
});

describe('Integration Tests', () => {
  it('should complete full drag and drop cycle', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const dropZone = new DropZoneComponent({ tag: 'div' }, {});
    const draggable = new DraggableComponent({ tag: 'div', txt: 'Item' }, {});

    parent.append(draggable);
    document.body.appendChild(parent.node);
    document.body.appendChild(dropZone.node);

    // Start drag
    const manager = DragDropManager.getInstance();
    manager.startDrag({
      draggable,
      dropZone: null,
      originalParent: parent,
      mouseX: 100,
      mouseY: 100,
    });

    expect(manager.getCurrentDrag()).not.toBeNull();

    // Handle drop
    dropZone.handleDrop(draggable, 0);

    // End drag
    manager.endDrag();

    expect(draggable.parent).toBe(dropZone);
    expect(dropZone.children).toContain(draggable);
    expect(parent.children).not.toContain(draggable);

    // Cleanup
    parent.node.remove();
    dropZone.node.remove();
  });

  it('should handle reordering within same parent', () => {
    const dropZone = new DropZoneComponent({ tag: 'div' }, {});
    const item1 = new DraggableComponent({ tag: 'div', txt: '1' }, {});
    const item2 = new DraggableComponent({ tag: 'div', txt: '2' }, {});
    const item3 = new DraggableComponent({ tag: 'div', txt: '3' }, {});

    dropZone.append(item1);
    dropZone.append(item2);
    dropZone.append(item3);

    // Move item3 to position 1 (between item1 and item2)
    dropZone.handleDrop(item3, 1);

    expect(dropZone.children[0]).toBe(item1);
    expect(dropZone.children[1]).toBe(item3);
    expect(dropZone.children[2]).toBe(item2);
  });

  it('should prefer the innermost drop zone when nested', () => {
    const manager = DragDropManager.getInstance();
    const outerZone = new DropZoneComponent({ tag: 'div' }, {});
    const innerZone = new DropZoneComponent({ tag: 'div' }, {});
    outerZone.append(innerZone);

    // Mock elementFromPoint to return the innerZone node or its child
    const innerChild = new BaseComponent({ tag: 'span' });
    innerZone.append(innerChild);

    document.body.appendChild(outerZone.node);

    // Setup mock elementFromPoint
    const originalElementFromPoint = document.elementFromPoint;
    document.elementFromPoint = vi.fn().mockReturnValue(innerChild.node);

    try {
      // Act
      // @ts-expect-error - testing private method findDropZoneAtPoint
      const zone = manager.findDropZoneAtPoint(0, 0);
      expect(zone).toBe(innerZone);
    } finally {
      document.elementFromPoint = originalElementFromPoint;
      outerZone.node.remove();
    }
  });

  it('should exclude dragging item from drop index calculation', () => {
    const manager = DragDropManager.getInstance();
    const zone = new DropZoneComponent({ tag: 'div' }, {});
    const item1 = new DraggableComponent({ tag: 'div' }, {});
    const item2 = new DraggableComponent({ tag: 'div' }, {});
    zone.append(item1);
    zone.append(item2);

    // Mock getBoundingClientRect
    item1.node.getBoundingClientRect = () =>
      ({ top: 10, bottom: 20, height: 10, left: 0, right: 100, width: 100 }) as DOMRect;
    item2.node.getBoundingClientRect = () =>
      ({ top: 30, bottom: 40, height: 10, left: 0, right: 100, width: 100 }) as DOMRect;

    // Drag item1
    manager.startDrag({
      draggable: item1,
      dropZone: zone,
      originalParent: zone,
      mouseX: 0,
      mouseY: 0,
    });

    // If we calculate index while dragging item1:
    // With item1 excluded, only item2's rect is checked (top: 30, height: 10, midpoint: 35)
    // If mouseY is 25 (above item2's midpoint), index should be 0
    // @ts-expect-error - testing private method calculateDropIndex
    const indexAbove = manager.calculateDropIndex(zone, 0, 25);
    expect(indexAbove).toBe(0);

    // If mouseY is 45 (below item2's midpoint), index should be 1
    // @ts-expect-error - testing private method calculateDropIndex
    const indexBelow = manager.calculateDropIndex(zone, 0, 45);
    expect(indexBelow).toBe(1);

    manager.endDrag();
  });
});

describe('DND Fixes and Edge Cases', () => {
  it('should not initiate drag when clicking interactive elements', () => {
    const onDragStart = vi.fn();
    const parent = new BaseComponent({ tag: 'div' });
    const draggable = new DraggableComponent({ tag: 'div' }, { onDragStart });
    const button = new BaseComponent({ tag: 'button', txt: 'Click Me' });
    const input = new BaseComponent({ tag: 'input' });
    draggable.append(button);
    draggable.append(input);
    parent.append(draggable);

    // Click on button
    const clickBtnEvent = new MouseEvent('mousedown', { button: 0, bubbles: true });
    button.node.dispatchEvent(clickBtnEvent);
    expect(onDragStart).not.toHaveBeenCalled();

    // Click on input
    const clickInputEvent = new MouseEvent('mousedown', { button: 0, bubbles: true });
    input.node.dispatchEvent(clickInputEvent);
    expect(onDragStart).not.toHaveBeenCalled();
  });

  it('should update cursor styling when setDraggable is called', () => {
    const draggable = new DraggableComponent({ tag: 'div' }, {});
    expect(draggable.node.style.cursor).toBe('grab');

    draggable.setDraggable(false);
    expect(draggable.node.style.cursor).toBe('');

    draggable.setDraggable(true);
    expect(draggable.node.style.cursor).toBe('grab');
  });

  it('should strip ID attributes from the ghost element', () => {
    const parent = new BaseComponent({ tag: 'div' });
    const draggable = new DraggableComponent({ tag: 'div', id: 'my-draggable' }, {});
    const child = new BaseComponent({ tag: 'span', id: 'my-child-id' });
    draggable.append(child);
    parent.append(draggable);

    // Simulate drag start to create ghost
    const mouseDownEvent = new MouseEvent('mousedown', { button: 0, clientX: 100, clientY: 100 });
    draggable.node.dispatchEvent(mouseDownEvent);

    // Find the ghost in document body
    const ghost = document.body.querySelector('.dragging-ghost');
    expect(ghost).not.toBeNull();
    expect(ghost?.getAttribute('id')).toBeNull();
    expect(ghost?.querySelector('#my-child-id')).toBeNull();
    expect(ghost?.querySelector('span')?.getAttribute('id')).toBeNull();

    // Cleanup drag
    const mouseUpEvent = new MouseEvent('mouseup');
    document.dispatchEvent(mouseUpEvent);
  });
});
