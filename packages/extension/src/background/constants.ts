/**
 * bb-browser Extension Constants
 */

export const DEFAULT_DAEMON_PORT = 19824;
export const DEFAULT_DAEMON_HOST = 'localhost';
export const DEFAULT_DAEMON_BASE_URL = `http://${DEFAULT_DAEMON_HOST}:${DEFAULT_DAEMON_PORT}`;

// 保持向后兼容的导出
export const DAEMON_PORT = DEFAULT_DAEMON_PORT;
export const DAEMON_HOST = DEFAULT_DAEMON_HOST;
export const DAEMON_BASE_URL = DEFAULT_DAEMON_BASE_URL;

export const SSE_RECONNECT_DELAY = 3000; // 3 秒
export const SSE_MAX_RECONNECT_ATTEMPTS = 5;

const STORAGE_KEY_UPSTREAM_URL = 'upstreamUrl';
const STORAGE_KEY_ALLOW_REMOTE_UPSTREAM = 'allowRemoteUpstream';

function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
}

function normalizeBaseUrl(url: unknown): string {
  return typeof url === 'string' && url.trim() ? url.trim().replace(/\/+$/, '') : '';
}

/**
 * 获取上游 URL（默认仅允许 loopback）
 */
export async function getUpstreamUrl(): Promise<string> {
  try {
    const result = await chrome.storage.sync.get([
      STORAGE_KEY_UPSTREAM_URL,
      STORAGE_KEY_ALLOW_REMOTE_UPSTREAM,
    ]);

    const allowRemote = result[STORAGE_KEY_ALLOW_REMOTE_UPSTREAM] === true;
    const rawUrl = normalizeBaseUrl(result[STORAGE_KEY_UPSTREAM_URL]);

    if (!rawUrl) {
      return DEFAULT_DAEMON_BASE_URL;
    }

    try {
      const parsed = new URL(rawUrl);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(`Unsupported protocol: ${parsed.protocol}`);
      }
      if (!allowRemote && !isLoopbackHost(parsed.hostname)) {
        console.warn('[Security] Blocking non-local upstream URL because remote upstream is disabled:', rawUrl);
        return DEFAULT_DAEMON_BASE_URL;
      }
      return rawUrl;
    } catch (error) {
      console.warn('[Security] Invalid upstream URL, falling back to default:', error);
    }
  } catch {
    // storage 不可用时用默认值
  }

  return DEFAULT_DAEMON_BASE_URL;
}

/**
 * 设置上游 URL
 */
export async function setUpstreamUrl(url: string): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY_UPSTREAM_URL]: url });
}
