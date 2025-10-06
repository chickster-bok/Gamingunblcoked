// --- element references ---------------------------------------------------
const ytInput = document.getElementById('ytUrl');
const openBtn = document.getElementById('openSite');
const copyInputBtn = document.getElementById('copyInput');
const generateBtn = document.getElementById('generateLink');
const resultCard = document.getElementById('resultCard');
const resultUrlEl = document.getElementById('resultUrl');
const copyResultBtn = document.getElementById('copyResult');
const resultStatus = document.getElementById('resultStatus');
const autofillLink = document.getElementById('autofillLink');
const copyUrlLink = document.getElementById('copyUrlLink');
const resultCard = document.getElementById('resultCard');
const resultUrlEl = document.getElementById('resultUrl');
const copyResultBtn = document.getElementById('copyResult');
const resultStatus = document.getElementById('resultStatus');

const PROXY_ORIGINS = new Set([
  'https://youtubeunblocked.live',
  'http://youtubeunblocked.live'
]);

openBtn.addEventListener('click', () => {
  const win = window.open('https://youtubeunblocked.live', '_blank', 'noopener');
  if (!win) {
    alert('Allow pop-ups for this site so the helper can open youtubeunblocked.live.');
    return;
  }
  showResultCard('Waiting for the proxy to send back a link…');
  toast('Opened youtubeunblocked.live in a new tab. Run the bookmarklets there.');
});

copyInputBtn.addEventListener('click', async () => {
  const v = ytInput.value.trim();
  if (!v) return alert('Add a YouTube URL first.');
  await copyText(v, 'Input URL copied to clipboard.');
});

copyResultBtn?.addEventListener('click', async () => {
  const text = resultUrlEl?.textContent?.trim();
  if (!text || text.includes('…')) {
    alert('No proxied link yet. Open the proxy tab and use the bookmarklets first.');
    return;
  }
  await copyText(text, 'Proxied link copied again.');
});

window.addEventListener('message', async (event) => {
  const { data, origin } = event;
  if (!data || typeof data !== 'object') return;
  if (data.type !== 'proxied-url') return;
  if (origin && origin !== 'null' && !PROXY_ORIGINS.has(origin)) return;

  const url = typeof data.url === 'string' ? data.url.trim() : '';
  if (!url) return;

  showResultCard('Link received from proxy.');
  if (resultUrlEl) resultUrlEl.textContent = url;
  const copied = await copyText(url, 'Proxy URL copied to clipboard!');
  if (!copied) {
    toast('Proxy URL ready below. Click “Copy proxied link again”.');
  }

  if (resultStatus) {
    const ts = new Date().toLocaleTimeString();
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    resultStatus.textContent = `Last received at ${ts}${title ? ` — ${title}` : ''}`;
  }
});

copyInputBtn?.addEventListener('click', async () => {
  const value = ytInput?.value.trim();
  if (!value) {
    alert('Add a YouTube URL first.');
    ytInput?.focus();
    return;
  }
  await copyText(value, 'Original link copied to clipboard.');
});

copyResultBtn?.addEventListener('click', async () => {
  const text = resultUrlEl?.textContent?.trim();
  if (!text || text.includes('…')) {
    alert('Generate an unblocked link first.');
    return;
  }
  const copied = await copyText(text, 'Unblocked link copied again.');
  if (copied && resultStatus) {
    const ts = new Date().toLocaleTimeString();
    resultStatus.textContent = `Copied again at ${ts}`;
  }
});

// --- legacy bookmarklet helpers ------------------------------------------
const autofillCode = `
javascript:(async()=>{try{
  const u = prompt('YouTube URL to unblock:');
  if(!u) return;
  const pick = (...sels)=>sels.map(s=>document.querySelector(s)).find(Boolean);
  const input = pick(
    'input[name="url"]','input#url','input[type="url"]','input[type="text"]',
    'textarea[name="url"]','textarea',
    'input[placeholder*="Enter an URL" i]','input[placeholder*="URL" i]',
    'input[placeholder*="search" i]','input[aria-label*="url" i]'
  );
  if(!input){ alert('Could not find the URL field.'); return; }
  input.value=''; input.dispatchEvent(new Event('input',{bubbles:true}));
  input.focus(); document.execCommand('insertText',false,u);
  const btn = Array.from(document.querySelectorAll('button,input[type=submit],a'))
    .find(el => /\\b(go!?|unblock|generate|submit)\\b/i.test((el.textContent||el.value||'')));
  setTimeout(()=>{ (btn && btn.click()) || input.closest('form')?.submit(); }, 150);
}catch(e){ alert('Autofill error: '+e.message); }})();`;

const copyUrlCode = `
javascript:(()=>{const t=location.href;const send=()=>{try{window.opener&&window.opener.postMessage({type:'proxied-url',url:t,title:document.title||''},'*');}catch(e){}};
  const fallback=()=>{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();send();alert('Copied link (fallback).');};
  (navigator.clipboard?navigator.clipboard.writeText(t).then(()=>{send();alert('Copied link to clipboard!');}).catch(()=>fallback()):fallback());
})();`;

autofillLink && (autofillLink.href = autofillCode.trim());
copyUrlLink && (copyUrlLink.href = copyUrlCode.trim());

// --- utilities ------------------------------------------------------------
function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  Object.assign(el.style, {
    position:'fixed', inset:'auto 16px 16px auto',
    background:'#1f2a44', color:'#e9eefb', padding:'10px 14px',
    borderRadius:'12px', boxShadow:'0 6px 24px rgba(0,0,0,.35)', zIndex:99999
  });
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1800);
}
function fallbackCopy(text, msg='Copied (fallback).'){
  const ta=document.createElement('textarea');
  ta.value=text; document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); ta.remove(); toast(msg);
}
async function copyText(text, message){
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    if (message) toast(message);
    return true;
  } catch {
    fallbackCopy(text, message || 'Copied (fallback).');
    return false;
  }
}
function showResultCard(status){
  if (!resultCard) return;
  resultCard.classList.remove('hidden');
  if (status && resultStatus) resultStatus.textContent = status;
}
