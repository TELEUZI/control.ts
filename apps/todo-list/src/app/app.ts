import { mount } from '@control.ts/signals';

import { BoardPage } from './pages/board/board';

export function App(): void {
  mount(document.querySelector<HTMLDivElement>('#app')!, BoardPage());
}
