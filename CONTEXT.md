# control.ts Domain Glossary

A lightweight and versatile UI library offering simple element/component factories and seamless integration with Preact Signals for reactive state management.

## Language

**Control**:
The core abstract class that wraps a raw DOM element and manages its basic lifecycle (event listeners, attribute manipulation, and subscription tracking).
_Avoid_: Component (when referring to the core abstract class), ElementWrapper.

**BaseComponent**:
A concrete class extending `Control` that implements parent-child hierarchies, DOM tree node insertion/movement, and component destruction hooks.
_Avoid_: Component, NodeWrapper.

**Signal**:
A reactive state wrapper utilizing Preact Signals that triggers DOM property or child tree updates upon value changes.
_Avoid_: State, Observable.

**Factory**:
A function designed to instantiate a standard DOM element or a `BaseComponent` (e.g., `div()`, `button$()`).
_Avoid_: Creator, Builder.

**Functional Component**:
A function that acts as a component creator, wrapping instantiation logic and optionally subclassing `BaseComponent` via `bcToFc`.
_Avoid_: Stateless component.
