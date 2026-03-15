const STORAGE_KEY_UPSTREAM_URL = 'upstreamUrl';
const STORAGE_KEY_UPSTREAM_TOKEN = 'upstreamToken';
const STORAGE_KEY_ALLOW_REMOTE_UPSTREAM = 'allowRemoteUpstream';
const DEFAULT_URL = 'http://localhost:19824';

const urlInput = document.getElementById('url') as HTMLInputElement;
const tokenInput = document.getElementById('token') as HTMLInputElement;
const allowRemoteInput = document.getElementById('allowRemote') as HTMLInputElement;
const saveBtn = document.getElementById('save') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLDivElement;

// 加载当前设置
chrome.storage.sync.get(
  [STORAGE_KEY_UPSTREAM_URL, STORAGE_KEY_UPSTREAM_TOKEN, STORAGE_KEY_ALLOW_REMOTE_UPSTREAM],
  (result) => {
    urlInput.value = result[STORAGE_KEY_UPSTREAM_URL] || '';
    urlInput.placeholder = DEFAULT_URL;
    tokenInput.value = result[STORAGE_KEY_UPSTREAM_TOKEN] || '';
    allowRemoteInput.checked = result[STORAGE_KEY_ALLOW_REMOTE_UPSTREAM] === true;
  }
);

saveBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  const token = tokenInput.value.trim();
  const allowRemote = allowRemoteInput.checked;
  await chrome.storage.sync.set({
    [STORAGE_KEY_UPSTREAM_URL]: url,
    [STORAGE_KEY_UPSTREAM_TOKEN]: token,
    [STORAGE_KEY_ALLOW_REMOTE_UPSTREAM]: allowRemote,
  });
  const effectiveUrl = url || DEFAULT_URL;
  statusDiv.textContent = `Saved. Upstream: ${effectiveUrl}. Remote upstream ${allowRemote ? 'enabled' : 'disabled'}.`;
  statusDiv.className = 'status saved';
  setTimeout(() => { statusDiv.textContent = ''; }, 3000);
});
