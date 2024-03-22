import { mount } from '@control.ts/signals';

import { PageWrapper } from './page';

mount(document.querySelector<HTMLDivElement>('#app')!, PageWrapper());
