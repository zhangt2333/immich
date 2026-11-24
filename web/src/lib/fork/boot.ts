import { mount } from 'svelte';
import Root from './Root.svelte';
import { comboStore } from './combos.svelte.ts';

const ROOT_ID = 'fork-root';

export const boot = () => {
  comboStore.load();

  if (document.querySelector(`#${ROOT_ID}`)) {
    return;
  }

  const target = document.createElement('div');
  target.id = ROOT_ID;
  document.body.append(target);

  requestAnimationFrame(() => void mount(Root, { target }));
};
