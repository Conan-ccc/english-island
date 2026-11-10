// Balloon party: a few seconds of popping balloons after a play is finished (no question, just fun)
const COLORS = [['#FFC1D6', '#FF6FA5'], ['#BFE3FF', '#5EA8F2'], ['#FFF0B0', '#F5C542'], ['#CFF5C8', '#5DBB6A'], ['#E2D5FF', '#9B7BEA'], ['#FFD9B8', '#FF9A4D']];

export function balloonParty({ sfx, burst, characterHtml = '', count = 10, ms = 6500 } = {}) {
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.className = 'overlay party';
    ov.style.cssText = 'background:linear-gradient(#BFE9FF,#FFE9F3);overflow:hidden;touch-action:none;opacity:0;transition:opacity .3s';
    // the child's friend cheers at the bottom (balloons pass in front of it)
    if (characterHtml) ov.innerHTML = `<div class="party-char" style="position:absolute;left:50%;bottom:2%;width:min(20vw,28vh);translate:-50% 0;pointer-events:none"><div style="animation:boing .9s ease-out infinite;transform-origin:50% 90%">${characterHtml}</div></div>`;
    document.body.appendChild(ov);
    requestAnimationFrame(() => { ov.style.opacity = '1'; });
    const h = window.innerHeight;
    let left = count, ended = false;
    const end = () => {
      if (ended) return;
      ended = true; clearTimeout(timer);
      ov.style.opacity = '0';
      setTimeout(() => { ov.remove(); resolve(); }, 320);
    };
    const timer = setTimeout(end, ms);
    for (let i = 0; i < count; i++) {
      const [c1, c2] = COLORS[i % COLORS.length];
      const size = 110 + Math.random() * 50;
      const b = document.createElement('div');
      b.className = 'balloon';
      b.style.cssText = `position:absolute;left:${6 + ((i * 37) % 84) + Math.random() * 4}%;top:${h + 20}px;width:${size}px;height:${size * 1.22}px;border-radius:50% 50% 48% 48%;background:radial-gradient(circle at 34% 28%,#fff 0,${c1} 22%,${c2} 100%);box-shadow:inset -10px -14px 0 rgba(0,0,0,.07);cursor:pointer;touch-action:none`;
      b.innerHTML = `<div style="position:absolute;left:50%;top:100%;width:2px;height:${size * 0.9}px;background:rgba(120,90,110,.45);translate:-50% 0;pointer-events:none"></div><div style="position:absolute;left:50%;top:97%;width:14px;height:10px;background:${c2};border-radius:40% 40% 50% 50%;translate:-50% 0;pointer-events:none"></div>`;
      ov.appendChild(b);
      const sway = (Math.random() - 0.5) * 140;
      const anim = b.animate([
        { transform: 'translate(0,0) rotate(-4deg)' },
        { transform: `translate(${sway}px,${-(h + 420) / 2}px) rotate(5deg)` },
        { transform: `translate(${-sway / 2}px,${-(h + 420)}px) rotate(-3deg)` },
      ], { duration: 4200 + Math.random() * 1400, delay: i * 260, easing: 'linear', fill: 'forwards' });
      const gone = () => { if (b.isConnected) { b.remove(); left -= 1; if (left <= 0) end(); } };
      anim.onfinish = gone;
      b.addEventListener('pointerdown', e => {
        e.preventDefault();
        if (!b.isConnected) return;
        const r = b.getBoundingClientRect();
        burst?.(r.left + r.width / 2, r.top + r.height / 2, i % 2 ? 'hearts' : 'stars');
        sfx?.('pop');
        gone();
      });
    }
  });
}
