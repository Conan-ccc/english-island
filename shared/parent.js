// Parent gate and parent panel (text is fine here: adults only). This game never asks for names.
import { exportCode, importCode, defaultState, saveState, clearSave } from './save.js';
import { isMastered } from './mastery.js';
import { CHARACTERS } from './characters.js';
import { islandUnits } from './island-content.js';
import { ISLANDS, LETTERS } from './curriculum.js';

// "Mark as cleared" grows the character one stage, the same as clearing the island in play
export const clearStage = stage => Math.min(7, stage + 1);

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Long-press the top-right 64px zone for 2s, then answer a simple addition.
export function installParentGate(onPass) {
  const zone = document.createElement('div');
  zone.className = 'parent-zone';
  zone.style.cssText = 'position:fixed;top:0;right:0;width:64px;height:64px;z-index:90;touch-action:none';
  let timer = null;
  zone.addEventListener('pointerdown', () => { clearTimeout(timer); timer = setTimeout(() => openParentGate(onPass), 2000); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) zone.addEventListener(ev, () => clearTimeout(timer));
  document.body.appendChild(zone);
  return zone;
}

export function openParentGate(onPass) {
  const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 8);
  const ans = a + b;
  const opts = new Set([ans]);
  while (opts.size < 3) opts.add(ans + (Math.floor(Math.random() * 7) - 3) || ans + 4);
  const list = [...opts].sort(() => Math.random() - 0.5);
  const ov = document.createElement('div');
  ov.className = 'overlay parent-gate';
  ov.style.cssText = 'background:rgba(60,40,60,.55);display:flex;align-items:center;justify-content:center';
  ov.innerHTML = `<div style="background:#fff;border-radius:24px;padding:28px 32px;text-align:center;min-width:300px">
    <div style="font-size:15px;color:#888;margin-bottom:8px">보호자 확인</div>
    <div style="font-size:34px;font-weight:700;margin-bottom:18px">${a} + ${b} = ?</div>
    <div style="display:flex;gap:12px;justify-content:center">${list.map(n => `<button class="btn-pic gate-opt" data-n="${n}" style="font-size:26px;width:80px">${n}</button>`).join('')}</div>
    <button class="gate-close" style="margin-top:18px;border:none;background:none;color:#999;font-size:15px">닫기</button></div>`;
  ov.addEventListener('click', e => {
    const btn = e.target.closest('.gate-opt');
    if (btn) { ov.remove(); if (Number(btn.dataset.n) === ans) onPass(); return; }
    if (e.target.closest('.gate-close') || e.target === ov) ov.remove();
  });
  document.body.appendChild(ov);
  return ov;
}

const label = (n, k) => (ISLANDS[n].kind === 'letter' ? `${k} ${LETTERS[k].ipa}` : k);

export function progressHtml(state) {
  const h = state.subjects.english;
  const ch = CHARACTERS.find(c => c.id === h.characterId);
  const rows = Object.keys(ISLANDS).map(Number).map(n => {
    const isl = h.islands[String(n)];
    const items = islandUnits(n);
    if (!isl) return `<tr><td>${n}섬<br><span style="color:#888;font-size:12px">${ISLANDS[n].title}</span></td><td>아직 안 감</td><td>0/${items.length}</td><td>0일</td></tr>`;
    const mastered = items.filter(it => isMastered(isl, it));
    const left = items.filter(it => !isMastered(isl, it)).map(it => {
      const m = isl.mastery[it] || { count: 0, types: [] };
      return `${esc(label(n, it))}(${m.count}회·놀이 ${m.types.length}종)`;
    });
    const btn = isl.cleared ? '' : `<button class="pp-clear" data-n="${n}" style="border:none;background:#f3eef3;border-radius:8px;padding:4px 8px;font-size:13px">완료로 처리</button>`;
    return `<tr><td>${n}섬<br><span style="color:#888;font-size:12px">${ISLANDS[n].title}</span></td><td>${isl.cleared ? '완료' : '진행 중'} ${btn}</td><td>${mastered.length}/${items.length} 익힘${left.length ? '<br><span style="color:#888;font-size:12px">남은 것: ' + left.join(', ') + '</span>' : ''}</td><td>${isl.days.length}일</td></tr>`;
  }).join('');
  return `<div>캐릭터: <b>${ch ? esc(ch.name) : '아직 없음'}</b> · ${h.stage + 1}단계 / 8단계</div>
    <table class="pp-progress" style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px"><tr style="color:#888"><td>섬</td><td>상태</td><td>익힌 것</td><td>놀이한 날</td></tr>${rows}</table>`;
}

// onChange(state) is called whenever the parent saves.
export function openParentPanel(state, onChange) {
  // saves mostly happen on island pages; try one now so the warning reflects reality
  saveState(state);
  const s = state.settings;
  const ov = document.createElement('div');
  ov.className = 'overlay parent-panel';
  ov.style.cssText = 'background:rgba(60,40,60,.55);overflow:auto;-webkit-overflow-scrolling:touch';
  const check = (cls, on, text) => `<label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" class="${cls}" ${on ? 'checked' : ''} style="width:22px;height:22px"> ${text}</label>`;
  ov.innerHTML = `<div style="background:#fff;max-width:640px;margin:32px auto;border-radius:24px;padding:24px 28px;font-size:16px;line-height:1.5">
    <div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0">보호자 공간</h2>
      <button class="pp-close btn-pic" style="font-size:15px">닫기</button></div>
    ${state.saveError ? '<div class="pp-warn" style="background:#FFE3E3;color:#B00020;padding:10px;border-radius:12px;margin-top:12px">저장이 안 되고 있어요. 저장 공간을 확인하거나 백업 코드를 보관해 주세요.</div>' : ''}
    <h3>소리</h3><input class="pp-vol" type="range" min="0" max="1" step="0.1" value="${s.volume}" style="width:100%">
    ${check('pp-music', s.music !== false, '배경음악 켜기')}
    ${check('pp-names', !!s.letterNames, '글자 이름도 들려주기 (예: "ess, sss, sun") — 기본은 켜짐')}
    ${check('pp-upper', s.showUpper !== false, '대문자도 옆에 작게 보이기 (예: "S s")')}
    <h3>한글 섬 친구</h3><div style="font-size:13px;color:#888">한글 섬에서 키우는 친구를 고르면, 영어 섬에서는 다른 친구가 태어나요.</div>
    <select class="pp-exclude" style="padding:8px;border-radius:10px;margin-top:6px"><option value="">고르지 않음</option>${CHARACTERS.map(c => `<option value="${c.id}" ${s.excludeCharacter === c.id ? 'selected' : ''}>${esc(c.name)} (${esc(c.kind)})</option>`).join('')}</select>
    <h3>발음 확인</h3><div style="font-size:13px;color:#888">글자 소리가 어색하면 <a href="tools/voice-check.html" target="_blank">발음 확인 페이지</a>에서 글자마다 다른 소리나 "단어로 대신"을 고를 수 있어요.</div>
    <h3>진행 상황</h3>${progressHtml(state)}
    <h3>백업</h3><div style="font-size:13px;color:#888">이 코드를 메모나 카톡에 보관해 두면, 아이패드를 바꾸거나 데이터가 지워져도 그대로 이어서 할 수 있어요.</div>
    <textarea class="pp-code" readonly style="width:100%;height:70px;font-size:12px;border-radius:10px;border:1px solid #ddd;padding:8px">${esc(exportCode(state))}</textarea>
    <button class="pp-copy" style="border:none;background:#BFEDE2;border-radius:10px;padding:8px 14px">코드 복사</button>
    <h3>백업 불러오기</h3>
    <textarea class="pp-restore" placeholder="EI1:로 시작하는 코드를 붙여넣기" style="width:100%;height:60px;font-size:12px;border-radius:10px;border:1px solid #ddd;padding:8px"></textarea>
    <button class="pp-restore-btn" style="border:none;background:#f3eef3;border-radius:10px;padding:8px 14px">불러오기</button>
    <span class="pp-restore-msg" style="font-size:14px;margin-left:8px"></span>
    <h3>처음부터 다시</h3><div style="font-size:13px;color:#888">영어 섬의 캐릭터와 진행 상황만 지워져요(한글 섬 기록은 그대로). 아래 칸에 <b>다시</b>를 입력하고 버튼을 누르세요.</div>
    <input class="pp-reset-word" style="padding:8px;border-radius:10px;border:1px solid #ddd;width:120px"> <button class="pp-reset" style="border:none;background:#FFE3E3;color:#B00020;border-radius:10px;padding:8px 14px">모두 지우기</button>
    <div style="margin-top:24px;text-align:right"><button class="pp-save btn-pic" style="font-size:18px;background:#BFEDE2;padding:10px 26px">저장</button></div>
  </div>`;
  const $ = q => ov.querySelector(q);
  const collect = () => {
    s.volume = Number($('.pp-vol').value);
    s.music = $('.pp-music').checked;
    s.letterNames = $('.pp-names').checked;
    s.showUpper = $('.pp-upper').checked;
    s.excludeCharacter = $('.pp-exclude').value || null;
  };
  ov.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('.pp-copy')) { const c = $('.pp-code'); c.select(); navigator.clipboard?.writeText(c.value).catch(() => document.execCommand('copy')); t.textContent = '복사됨'; return; }
    if (t.closest('.pp-restore-btn')) {
      try {
        const st = importCode($('.pp-restore').value);
        Object.keys(state).forEach(k => delete state[k]); Object.assign(state, st);
        onChange(state); ov.remove();
      } catch (err) {
        $('.pp-restore-msg').textContent = err.message === 'hangul-code' ? '한글 섬 코드예요. 영어 섬 코드(EI1:)를 넣어 주세요.' : err.message === 'newer-save' ? '더 새 버전의 코드예요. 앱을 새로 고친 뒤 다시 해 주세요.' : '코드가 올바르지 않아요.';
      }
      return;
    }
    if (t.closest('.pp-reset')) {
      if ($('.pp-reset-word').value.trim() !== '다시') return;
      const keep = { settings: state.settings };
      clearSave();
      const fresh = defaultState();
      Object.keys(state).forEach(k => delete state[k]); Object.assign(state, fresh, keep);
      onChange(state); ov.remove(); return;
    }
    if (t.closest('.pp-clear')) {
      const n = String(Number(t.closest('.pp-clear').dataset.n));
      if (!confirm(n + '섬을 완료로 처리할까요? 캐릭터가 한 단계 자라요.')) return;
      const h = state.subjects.english;
      h.islands[n].cleared = true;
      h.stage = clearStage(h.stage);
      onChange(state); ov.remove(); return;
    }
    if (t.closest('.pp-close')) { ov.remove(); return; }
    if (t.closest('.pp-save')) { collect(); onChange(state); ov.remove(); }
  });
  document.body.appendChild(ov);
  return ov;
}
