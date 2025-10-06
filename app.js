// --- basic helpers
const ytInput = document.getElementById('ytUrl');
const generateBtn = document.getElementById('generateLink');
const copyInputBtn = document.getElementById('copyInput');
const resultCard = document.getElementById('resultCard');
const resultUrlEl = document.getElementById('resultUrl');
const copyResultBtn = document.getElementById('copyResult');
const resultStatus = document.getElementById('resultStatus');

generateBtn.addEventListener('click', async () => {
  const raw = ytInput.value.trim();
  if (!raw) {
    alert('Enter a YouTube link to convert.');
    ytInput.focus();
    return;
  }

  const proxyUrl = buildProxyUrl(raw);
  if (!proxyUrl) {
    alert('That does not look like a valid YouTube link.');
    return;
  }

  if (resultUrlEl) resultUrlEl.textContent = proxyUrl;
  showResultCard('Copied unblocked link to clipboard.');
  const copied = await copyText(proxyUrl, 'Unblocked link copied to clipboard.');
  if (!copied) toast('Link ready below. Tap copy if needed.');

  if (resultStatus) {
    const ts = new Date().toLocaleTimeString();
    resultStatus.textContent = `Generated at ${ts}`;
  }
});

copyInputBtn.addEventListener('click', async () => {
  const v = ytInput.value.trim();
  if (!v) return alert('Add a YouTube URL first.');
  await copyText(v, 'Original link copied to clipboard.');
});

copyResultBtn?.addEventListener('click', async () => {
  const text = resultUrlEl?.textContent?.trim();
  if (!text || text.includes('…')) {
    alert('Generate an unblocked link first.');
    return;
  }
  await copyText(text, 'Unblocked link copied again.');
});

// --- tiny toast ---------------------------------------------------------
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
