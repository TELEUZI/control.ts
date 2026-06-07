# Drag and Drop (DND) System

A full-featured drag and drop system for the `@control.ts/min` package, providing intuitive component movement with parent tracking, visual feedback, and flexible configuration.

## Features

- ✅ **Parent Tracking**: Every component knows its parent and can be moved between containers
- ✅ **Full DND System**: Complete drag and drop with mouse event handling
- ✅ **Visual Feedback**: Ghost elements, drop indicators, and hover states
- ✅ **Drag Handles**: Optional drag handles for precise control
- ✅ **Drop Zones**: Configurable drop targets with validation
- ✅ **Event Hooks**: Full control over drag lifecycle
- ✅ **Flexible API**: Works with existing components or create new ones
- ✅ **TypeScript Support**: Fully typed for better developer experience

## Installation

The DND system is included in `@control.ts/min`. Simply import what you need:

```typescript
import { createDraggable, createDropZone, makeDraggable, makeDropZone, DragDropManager } from '@control.ts/min';
```

Don't forget to import the CSS:

```typescript
import '@control.ts/min/dnd/dnd.css';
```

## Quick Start

### Basic Sortable List

```typescript
import { createDropZone, createDraggable } from '@control.ts/min';

// Create a drop zone (container)
const list = createDropZone(
  { tag: 'div', className: 'my-list' },
  {
    orientation: 'vertical',
    onDrop: (item, zone, index) => {
      console.log(`Item dropped at position ${index}`);
    },
  },
);

// Create draggable items
const item1 = createDraggable({ tag: 'div', txt: 'Item 1' }, {});
const item2 = createDraggable({ tag: 'div', txt: 'Item 2' }, {});
const item3 = createDraggable({ tag: 'div', txt: 'Item 3' }, {});

// Add items to list
list.append(item1);
list.append(item2);
list.append(item3);

// Mount to DOM
document.body.appendChild(list.node);
```

### Drag Between Containers

```typescript
const todoList = createDropZone({ tag: 'div' }, { orientation: 'vertical' });
const doneList = createDropZone({ tag: 'div' }, { orientation: 'vertical' });

const task = createDraggable(
  { tag: 'div', txt: 'My Task' },
  {
    onDragEnd: (component, success) => {
      console.log(`Drag ${success ? 'succeeded' : 'failed'}`);
    },
  },
);

todoList.append(task);

// Now you can drag the task from todoList to doneList!
```

### Using Drag Handles

```typescript
const item = createDraggable(
  { tag: 'div' },
  {
    handle: '.drag-handle', // CSS selector for the handle
    onDragStart: (component) => console.log('Started dragging'),
  },
);

// Add content
const content = new BaseComponent({ tag: 'span', txt: 'Item content' });
const handle = new BaseComponent({
  tag: 'span',
  txt: '⋮⋮',
  className: 'drag-handle',
});

item.append(content);
item.append(handle);
```

## API Reference

### Parent Tracking Methods

All `BaseComponent` instances now have these methods:

#### `component.parent: BaseComponent | null`

Reference to the parent component.

#### `component.moveTo(newParent: BaseComponent, index?: number): void`

Move this component to a new parent at an optional index.

```typescript
const parent1 = new BaseComponent({ tag: 'div' });
const parent2 = new BaseComponent({ tag: 'div' });
const child = new BaseComponent({ tag: 'span' });

parent1.append(child);
child.moveTo(parent2, 0); // Move to parent2 at index 0
```

#### `component.remove(): void`

Remove this component from its parent and the DOM.

```typescript
const parent = new BaseComponent({ tag: 'div' });
const child = new BaseComponent({ tag: 'span' });
parent.append(child);

child.remove(); // Removes from parent and DOM
```

#### `component.removeChild(child: BaseComponent): void`

Remove a specific child component.

```typescript
parent.removeChild(child);
```

#### `component.insertBefore(child: BaseComponent, reference: BaseComponent | null): void`

Insert a child before a reference child.

```typescript
parent.insertBefore(newChild, existingChild);
```

### DraggableComponent

#### `createDraggable(props, options, ...children)`

Create a new draggable component.

**Options:**

- `handle?: string` - CSS selector for drag handle (default: entire element)
- `dragClass?: string` - Class applied during drag (default: none)
- `ghostClass?: string` - Class for drag preview (default: 'dragging-ghost')
- `onDragStart?: (component) => void` - Called when drag starts
- `onDragEnd?: (component, success) => void` - Called when drag ends
- `disabled?: boolean` - Disable dragging (default: false)

**Methods:**

- `setDraggable(enabled: boolean)` - Enable/disable dragging
- `isDraggableEnabled(): boolean` - Check if dragging is enabled
- `destroy()` - Clean up event listeners

### DropZoneComponent

#### `createDropZone(props, options, ...children)`

Create a new drop zone component.

**Options:**

- `accepts?: (draggable) => boolean` - Validation function for drops
- `onDrop?: (draggable, dropZone, index) => void` - Called when item is dropped
- `onDragOver?: (draggable) => void` - Called when dragging over
- `onDragLeave?: () => void` - Called when leaving drop zone
- `dropIndicatorClass?: string` - Custom class for drop indicator
- `orientation?: 'vertical' | 'horizontal'` - Layout direction (default: 'vertical')

**Methods:**

- `canAccept(draggable): boolean` - Check if a draggable can be dropped
- `showDropIndicator(index: number)` - Show drop indicator at index
- `hideDropIndicator()` - Hide drop indicator
- `handleDrop(draggable, index)` - Handle a drop operation
- `getOrientation()` - Get the orientation
- `destroy()` - Clean up and unregister

### Factory Functions

#### `makeDraggable(component, options)`

Convert an existing component to draggable.

```typescript
const component = new BaseComponent({ tag: 'div', txt: 'Convert me' });
const draggable = makeDraggable(component, {
  onDragStart: (comp) => console.log('Dragging!'),
});
```

#### `makeDropZone(component, options)`

Convert an existing component to a drop zone.

```typescript
const component = new BaseComponent({ tag: 'div' });
const dropZone = makeDropZone(component, {
  orientation: 'horizontal',
});
```

### DragDropManager

Singleton that coordinates all drag and drop operations.

```typescript
import { DragDropManager } from '@control.ts/min';

const manager = DragDropManager.getInstance();
const currentDrag = manager.getCurrentDrag();
```

**Methods:**

- `getInstance(): DragDropManager` - Get singleton instance
- `registerDropZone(zone)` - Register a drop zone
- `unregisterDropZone(zone)` - Unregister a drop zone
- `startDrag(data)` - Start a drag operation
- `updateDrag(x, y)` - Update drag position
- `endDrag()` - End current drag
- `getCurrentDrag()` - Get current drag data

## CSS Classes

The DND system uses these CSS classes:

- `.dragging-ghost` - Ghost element following cursor
- `.drag-source` - Source element being dragged
- `.drop-indicator` - Line showing drop position
- `.drop-indicator.vertical` - Vertical drop indicator
- `.drop-indicator.horizontal` - Horizontal drop indicator
- `.drop-zone-active` - Active drop zone
- `.drag-handle` - Drag handle element

You can customize these in your own CSS or use the provided `dnd.css`.

## Advanced Examples

### Custom Drop Validation

```typescript
const dropZone = createDropZone(
  { tag: 'div' },
  {
    accepts: (draggable) => {
      // Only accept items with specific class
      return draggable.node.classList.contains('allowed');
    },
    onDrop: (item, zone, index) => {
      console.log('Valid item dropped!');
    },
  },
);
```

### Horizontal Layout

```typescript
const horizontalList = createDropZone(
  {
    tag: 'div',
    style: { display: 'flex', flexDirection: 'row' },
  },
  {
    orientation: 'horizontal',
  },
);
```

### Nested Drop Zones

```typescript
const outerZone = createDropZone({ tag: 'div' }, {});
const innerZone = createDropZone({ tag: 'div' }, {});

outerZone.append(innerZone);

// Items can be dropped in both zones
// The system prevents dropping a parent into its own children
```

### Dynamic Enable/Disable

```typescript
const item = createDraggable({ tag: 'div' }, {});

// Disable dragging
item.setDraggable(false);

// Re-enable later
item.setDraggable(true);
```

## Running the Demo

A complete interactive demo is available:

```typescript
import { runDndDemo } from '@control.ts/min/src/examples/dnd-demo';

runDndDemo();
```

Or run it directly:

```bash
cd packages/min
npm run dev
# Open the demo HTML file
```

## Testing

Run the DND tests:

```bash
cd packages/min
npm test src/tests/dnd.test.ts
```

## Browser Support

The DND system uses standard DOM APIs and works in all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Considerations

- **Ghost elements** are created on-demand and removed after drag
- **Drop indicators** are reused per drop zone
- **Event listeners** are properly cleaned up on destroy
- **Parent tracking** has minimal overhead (single reference)

## Migration from Other Libraries

If you're coming from other DND libraries:

| Feature            | SortableJS | react-beautiful-dnd | @control.ts/min |
| ------------------ | ---------- | ------------------- | --------------- |
| Parent tracking    | ❌         | ❌                  | ✅              |
| Drag handles       | ✅         | ✅                  | ✅              |
| Drop zones         | ✅         | ✅                  | ✅              |
| Event hooks        | ✅         | ✅                  | ✅              |
| TypeScript         | ⚠️         | ✅                  | ✅              |
| Framework-agnostic | ✅         | ❌                  | ✅              |
| Bundle size        | ~45KB      | ~35KB               | ~8KB            |

## Troubleshooting

### Items not dragging

- Check if `disabled: true` is set
- Ensure the component has a parent
- Verify CSS doesn't have `pointer-events: none`

### Drop indicator not showing

- Check if drop zone has `orientation` set correctly
- Ensure drop zone has children for positioning
- Verify CSS is imported

### Items dropping in wrong position

- Check if you're adjusting index for same-parent moves
- Verify `orientation` matches your layout (flex-direction)

## Contributing

Found a bug or have a feature request? Please open an issue on GitHub!

## License

MIT
