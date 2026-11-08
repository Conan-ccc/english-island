// Evolution scene: shake -> white flash -> new stage -> stars
import { charHtml } from './characters.js';
import { playSfx, burst } from './fx.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

export async function playEvolution(container, id, from, to) {
  const ov = document.createElement('div');
  ov.className = 'overlay evolve';
  ov.style.cssText = 'display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#FFF8D6 0%,#FFE3F0 60%,#E9DDFF 100%)';
  const box = document.createElement('div');
  box.style.cssText = 'width:min(40vw,56vh);transition:filter .6s, transform .6s';
  box.innerHTML = charHtml(id, from);
  ov.appendChild(box);
  (container || document.body).appendChild(ov);
  // preload the new stage so the swap is instant
  const pre = new Image(); pre.src = (box.querySelector('img')?.src || '').replace(/-\d\.webp$/, `-${to + 1}.webp`);
  playSfx('whoosh');
  box.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: 300, iterations: 4 });
  await wait(1200);
  box.style.filter = 'brightness(4) saturate(0)'; box.style.transform = 'scale(1.15)';
  playSfx('sparkle');
  await wait(700);
  box.innerHTML = charHtml(id, to);
  box.style.filter = 'none'; box.style.transform = 'scale(1)';
  const r = box.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 'stars');
  playSfx('fanfare');
  await wait(400);
  burst(r.left + r.width * 0.3, r.top + r.height * 0.4, 'hearts');
  await wait(1900);
  ov.style.transition = 'opacity .4s'; ov.style.opacity = '0';
  await wait(400);
  ov.remove();
}
