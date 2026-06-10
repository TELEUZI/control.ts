# SSR Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Control.ts SSR                            │
│                                                                   │
│  ┌────────────────┐         ┌────────────────┐                  │
│  │  Server-Side   │         │  Client-Side   │                  │
│  │   Rendering    │────────▶│   Hydration    │                  │
│  │   (ssr.ts)     │         │  (hydrate.ts)  │                  │
│  └────────────────┘         └────────────────┘                  │
│         │                            │                           │
│         │                            │                           │
│         ▼                            ▼                           │
│  ┌────────────────────────────────────────────┐                 │
│  │       Universal Factories                   │                 │
│  │       (factories-ssr.ts)                    │                 │
│  └────────────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
┌──────────┐
│  Client  │
│ Browser  │
└────┬─────┘
     │
     │ 1. HTTP Request
     ▼
┌─────────────────┐
│   Node.js       │
│   Server        │
│  ┌───────────┐  │
│  │ Express/  │  │
│  │ Fastify   │  │
│  └─────┬─────┘  │
│        │        │
│        │ 2. Route Handler
│        ▼        │
│  ┌───────────┐  │
│  │   SSR     │  │
│  │  Engine   │  │
│  └─────┬─────┘  │
│        │        │
│        │ 3. Render
│        ▼        │
│  ┌───────────┐  │
│  │   App     │  │
│  │ Component │  │
│  └─────┬─────┘  │
│        │        │
│        │ 4. Generate HTML
│        ▼        │
│  ┌───────────┐  │
│  │   HTML    │  │
│  │  String   │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ 5. HTTP Response
         ▼
┌──────────────────┐
│   Client         │
│   Browser        │
│  ┌────────────┐  │
│  │   HTML     │  │
│  │  Rendered  │  │ ◀─── User sees content immediately!
│  └────────────┘  │
│        │         │
│        │ 6. Load JS
│        ▼         │
│  ┌────────────┐  │
│  │ Hydration  │  │
│  │  Engine    │  │
│  └────┬───────┘  │
│        │         │
│        │ 7. Attach Events
│        ▼         │
│  ┌────────────┐  │
│  │Interactive │  │ ◀─── App is now interactive!
│  │    App     │  │
│  └────────────┘  │
└──────────────────┘
```

## Component Rendering Flow

### Server-Side

```
┌─────────────────────────────────────────────────────────────┐
│                    Server Rendering                          │
└─────────────────────────────────────────────────────────────┘

1. Initialize SSR Context
   ┌────────────────────┐
   │ createSSRContext() │
   └──────────┬─────────┘
              │
              ▼
   ┌────────────────────┐
   │  SSR Context       │
   │  - isServer: true  │
   │  - componentId: 0  │
   │  - hydrationData   │
   │  - signals         │
   └──────────┬─────────┘
              │
              ▼

2. Create Component
   ┌────────────────────┐
   │  new App()         │
   └──────────┬─────────┘
              │
              ▼
   ┌────────────────────┐
   │  Component Tree    │
   │  ┌──────────────┐  │
   │  │     App      │  │
   │  │  ┌────────┐  │  │
   │  │  │ Header │  │  │
   │  │  └────────┘  │  │
   │  │  ┌────────┐  │  │
   │  │  │  Main  │  │  │
   │  │  └────────┘  │  │
   │  │  ┌────────┐  │  │
   │  │  │ Footer │  │  │
   │  │  └────────┘  │  │
   │  └──────────────┘  │
   └──────────┬─────────┘
              │
              ▼

3. Render to HTML
   ┌────────────────────┐
   │ renderToDocument() │
   └──────────┬─────────┘
              │
              ▼
   ┌────────────────────────────────────┐
   │  HTML String                       │
   │  <!DOCTYPE html>                   │
   │  <html>                            │
   │    <head>...</head>                │
   │    <body>                          │
   │      <div id="app" data-hydrate="0">│
   │        <div class="header">...</div>│
   │        <main>...</main>            │
   │        <footer>...</footer>        │
   │      </div>                        │
   │      <script id="__CONTROL_        │
   │        HYDRATION_DATA__">          │
   │        {"0": {...}}                │
   │      </script>                     │
   │      <script src="/client.js">     │
   │    </body>                         │
   │  </html>                           │
   └────────────────────────────────────┘
```

### Client-Side

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Hydration                          │
└─────────────────────────────────────────────────────────────┘

1. Browser Receives HTML
   ┌────────────────────┐
   │   HTML Document    │
   │   (Already Visible)│
   └──────────┬─────────┘
              │
              ▼

2. Load JavaScript
   ┌────────────────────┐
   │  client.js loads   │
   └──────────┬─────────┘
              │
              ▼

3. Check for Hydration Data
   ┌────────────────────────┐
   │ isHydrationAvailable() │
   └──────────┬─────────────┘
              │
        ┌─────┴─────┐
        │           │
     Yes│           │No
        ▼           ▼
   ┌─────────┐  ┌──────────────┐
   │ Hydrate │  │ Client Render│
   └────┬────┘  └──────────────┘
        │
        ▼

4. Load Hydration Data
   ┌────────────────────┐
   │ loadHydrationData()│
   └──────────┬─────────┘
              │
              ▼
   ┌────────────────────┐
   │  Hydration Map     │
   │  {                 │
   │    0: {id, tag,    │
   │        props, ...} │
   │  }                 │
   └──────────┬─────────┘
              │
              ▼

5. Create Component Instances
   ┌────────────────────┐
   │  new App()         │
   └──────────┬─────────┘
              │
              ▼

6. Match to Existing DOM
   ┌────────────────────────────┐
   │  Find elements with        │
   │  data-hydrate attributes   │
   └──────────┬─────────────────┘
              │
              ▼
   ┌────────────────────────────┐
   │  Match components to DOM   │
   │  Component 0 ──▶ <div>     │
   │  Component 1 ──▶ <header>  │
   │  Component 2 ──▶ <main>    │
   └──────────┬─────────────────┘
              │
              ▼

7. Attach Event Handlers
   ┌────────────────────────────┐
   │  button.onclick = handler  │
   │  form.onsubmit = handler   │
   │  etc...                    │
   └──────────┬─────────────────┘
              │
              ▼

8. Remove Hydration Markers
   ┌────────────────────────────┐
   │  Remove data-hydrate attrs │
   │  Remove hydration script   │
   └──────────┬─────────────────┘
              │
              ▼

   ┌────────────────────────────┐
   │   ✅ Fully Interactive!    │
   └────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      Data Flow                                │
└──────────────────────────────────────────────────────────────┘

Server Side:
┌─────────┐    ┌──────────┐    ┌─────────┐    ┌──────────┐
│Database │───▶│ Fetch    │───▶│Component│───▶│   HTML   │
│   API   │    │  Data    │    │ Render  │    │  String  │
└─────────┘    └──────────┘    └─────────┘    └────┬─────┘
                                                     │
                                                     │
                                    ┌────────────────┴────────┐
                                    │                         │
                                    ▼                         ▼
                            ┌──────────────┐        ┌─────────────┐
                            │ HTML Content │        │  Hydration  │
                            │  (Visible)   │        │    Data     │
                            └──────────────┘        └─────────────┘
                                    │                         │
                                    └────────────┬────────────┘
                                                 │
                                                 │ Send to Client
                                                 ▼
                                         ┌───────────────┐
                                         │    Browser    │
                                         └───────┬───────┘
                                                 │
                                    ┌────────────┴────────┐
                                    │                     │
                                    ▼                     ▼
                            ┌──────────────┐    ┌─────────────┐
                            │ Display HTML │    │  Load JS    │
                            │  Immediately │    │   Bundle    │
                            └──────────────┘    └──────┬──────┘
                                                       │
                                                       ▼
                                              ┌─────────────┐
                                              │  Hydrate    │
                                              │ Components  │
                                              └──────┬──────┘
                                                     │
                                                     ▼
                                              ┌─────────────┐
                                              │ Interactive │
                                              │     App     │
                                              └─────────────┘
```

## Component Lifecycle

```
┌──────────────────────────────────────────────────────────────┐
│                   Component Lifecycle                         │
└──────────────────────────────────────────────────────────────┘

Server:
  constructor()
      │
      ├─ Environment check (typeof document !== 'undefined')
      │
      ├─ Server path:
      │    └─ Create minimal node representation
      │
      └─ Browser path:
           └─ Create actual DOM node
           └─ Call render()

  render() [Browser only]
      │
      └─ Create child elements
      └─ Attach to _node

  toString()
      │
      └─ Return outerHTML

Client (Hydration via Engine):
  constructor()
      │
      └─ Same as above (browser path)

  Hydration Engine
      │
      ├─ Match component to existing DOM
      ├─ Attach event handlers
      └─ Update references (e.g. _node)

  [Component is now interactive]
```

## Module Dependencies

```
┌──────────────────────────────────────────────────────────────┐
│                   Module Dependencies                         │
└──────────────────────────────────────────────────────────────┘

index.ts
  │
  ├─▶ control.ts (base Control class)
  │
  ├─▶ ssr.ts
  │    ├─ Depends on: control.ts, factories.ts, virtual-node.ts
  │    └─ Exports: renderToDocument, createSSRContext, etc.
  │
  ├─▶ hydrate.ts
  │    ├─ Depends on: control.ts, ssr.ts
  │    └─ Exports: mountWithHydration, hydrate, etc.
  │
  ├─▶ factories-ssr.ts
  │    ├─ Depends on: control.ts, ssr.ts
  │    └─ Exports: createElementFactoryUniversal, h, etc.
  │
  ├─▶ factories.ts (client-only factories)
  │
  ├─▶ element-tags.ts (HTML element factories)
  │
  └─▶ mount.ts (mounting utilities)
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   Security Layers                             │
└──────────────────────────────────────────────────────────────┘

User Input
    │
    ▼
┌─────────────────┐
│  HTML Escaping  │  ◀─── Escape <, >, &, ", '
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Attribute     │  ◀─── Sanitize all attributes
│  Sanitization   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Safe JSON     │  ◀─── type="application/json"
│  Serialization  │       (not executable)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Safe HTML     │  ◀─── XSS-safe output
│    Output       │
└─────────────────┘
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────────────┐
│                Performance Optimizations                      │
└──────────────────────────────────────────────────────────────┘

1. Minimal Hydration Data
   ┌────────────────────┐
   │ Only serialize:    │
   │ - Component ID     │
   │ - Tag name         │
   │ - Essential props  │
   │ - Event types      │
   └────────────────────┘

2. Lazy Loading (Future)
   ┌────────────────────┐
   │ Hydrate on:        │
   │ - Viewport entry   │
   │ - User interaction │
   │ - Priority basis   │
   └────────────────────┘

3. Code Splitting
   ┌────────────────────┐
   │ Split by:          │
   │ - Route            │
   │ - Component        │
   │ - Feature          │
   └────────────────────┘

4. Caching
   ┌────────────────────┐
   │ Cache:             │
   │ - Rendered HTML    │
   │ - Component output │
   │ - API responses    │
   └────────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Error Handling                              │
└──────────────────────────────────────────────────────────────┘

Server Error:
  renderToDocument()
      │
      ├─ Try: Render component
      │   └─ Success ──▶ Return HTML
      │
      └─ Catch: Error
          └─ Log error
          └─ Return fallback HTML
          └─ Or: Send error response

Client Error:
  mountWithHydration()
      │
      ├─ Try: Hydrate
      │   └─ Success ──▶ Interactive app
      │
      └─ Catch: Hydration error
          └─ Log error
          └─ Fallback to client render
          └─ mount(root, new App())

Development Mode:
  ┌────────────────────┐
  │ Hydration Warnings │
  │ - Mismatch alerts  │
  │ - Validation logs  │
  └────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   Deployment Options                          │
└──────────────────────────────────────────────────────────────┘

Option 1: Traditional Server
┌─────────────┐
│   Nginx/    │
│   Apache    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Node.js   │
│   Server    │
│  (Express)  │
└─────────────┘

Option 2: Serverless
┌─────────────┐
│   AWS       │
│   Lambda    │
└─────────────┘

Option 3: Edge Computing
┌─────────────┐
│ Cloudflare  │
│   Workers   │
└─────────────┘

Option 4: Hybrid
┌─────────────┐     ┌─────────────┐
│     CDN     │────▶│   Origin    │
│  (Static)   │     │   Server    │
└─────────────┘     └─────────────┘
```

---

This architecture provides:

- ✅ Clear separation of concerns
- ✅ Scalable design
- ✅ Security by default
- ✅ Performance optimized
- ✅ Error resilient
- ✅ Developer friendly

**Ready for production!** 🚀
