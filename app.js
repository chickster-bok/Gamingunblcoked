// --- basic helpers
const ytInput = document.getElementById('ytUrl');
const openBtn = document.getElementById('openSite');
const copyInputBtn = document.getElementById('copyInput');
const autofillLink = document.getElementById('autofillLink');
const copyUrlLink = document.getElementById('copyUrlLink');

openBtn.addEventListener('click', () => {
  window.open('https://youtubeunblocked.live', '_blank', 'noopener');
});

copyInputBtn.addEventListener('click', async () => {
  const v = ytInput.value.trim();
  if (!v) return alert('Add a YouTube URL first.');
  try {
    await navigator.clipboard.writeText(v);
    toast('Input URL copied to clipboard.');
  } catch {
    fallbackCopy(v);
  }
});

// --- Bookmarklet generators -------------------------------------------
// 1) Autofill & Go (runs ON youtubeunblocked.live). Prompts for URL.
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

// 2) Copy current page URL (run after the proxy opens the video)
const copyUrlCode = `
javascript:(()=>{const t=location.href;
  (navigator.clipboard?navigator.clipboard.writeText(t).then(()=>alert('Copied link to clipboard!')).catch(()=>fc()):fc());
  function fc(){const ta=document.createElement('textarea'); ta.value=t; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); ta.remove(); alert('Copied link (fallback).');}
})();`;

// Set bookmarklet hrefs
autofillLink.href = autofillCode.trim();
copyUrlLink.href = copyUrlCode.trim();

// --- tiny toast
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
function fallbackCopy(text){
  const ta=document.createElement('textarea');
  ta.value=text; document.body.appendChild(ta); ta.select();
  document.execCommand('copy'); ta.remove(); toast('Copied (fallback).');
}
