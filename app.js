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

// --- main flow ------------------------------------------------------------
openBtn?.addEventListener('click', () => {
  window.open('https://youtubeunblocked.live', '_blank', 'noopener');
});

generateBtn?.addEventListener('click', async () => {
  const raw = ytInput?.value.trim();
  if (!raw) {
    alert('Enter a YouTube link to convert.');
    ytInput?.focus();
    return;
  }

  const proxyUrl = buildProxyUrl(raw);
  if (!proxyUrl) {
    alert('That does not look like a valid YouTube link.');
    return;
  }

  if (resultUrlEl) {
    resultUrlEl.textContent = proxyUrl;
    resultUrlEl.title = proxyUrl;
  }

  showResultCard();

  const copied = await copyText(proxyUrl, 'Unblocked link copied to clipboard.');
  if (!copied) {
    toast('Link ready below. Tap copy if needed.');
  }

  if (resultStatus) {
    const ts = new Date().toLocaleTimeString();
    resultStatus.textContent = copied
      ? `Generated at ${ts}`
      : `Generated at ${ts} — copy using the button below.`;
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
javascript:(()=>{const t=location.href;
  (navigator.clipboard?navigator.clipboard.writeText(t).then(()=>alert('Copied link to clipboard!')).catch(()=>fc()):fc());
  function fc(){const ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); alert('Copied link (fallback).');}
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

function showResultCard(){
  if (!resultCard) return;
  resultCard.classList.remove('hidden');
}

function buildProxyUrl(raw){
  if (!raw) return null;

  let value = raw.trim();
  if (!value) return null;

  if (!/^[a-zA-Z][\w+.-]*:/.test(value)) {
    value = `https://${value}`;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const hostname = url.hostname.replace(/^www\./i, '').toLowerCase();

  if (hostname === 'youtu.be') {
    const id = url.pathname.replace(/^\//, '').trim();
    if (!id) return null;
    const proxy = new URL('https://youtubeunblocked.live/watch');
    proxy.searchParams.set('v', id);
    url.searchParams.forEach((v, key) => {
      if (key.toLowerCase() !== 'v') proxy.searchParams.set(key, v);
    });
    if (url.hash) proxy.hash = url.hash;
    return proxy.toString();
  }

  if (hostname.endsWith('youtube.com')) {
    url.protocol = 'https:';
    url.hostname = 'youtubeunblocked.live';
    return url.toString();
  }

  return null;
}
