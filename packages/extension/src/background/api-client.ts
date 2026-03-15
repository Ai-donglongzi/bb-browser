/**
 * API Client for bb-browser Extension
 * 负责向 Daemon 回传命令执行结果
 */

import { getUpstreamConfig, DAEMON_TOKEN_HEADER } from './constants';

export interface CommandResult {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * 向 Daemon 发送命令执行结果
 */
export async function sendResult(result: CommandResult): Promise<void> {
  const { baseUrl, token } = await getUpstreamConfig();
  const url = `${baseUrl}/result`;
  console.log('[APIClient] Sending result:', result.id, result.success);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { [DAEMON_TOKEN_HEADER]: token } : {}),
      },
      body: JSON.stringify(result),
    });

    if (!response.ok) {
      console.error('[APIClient] Failed to send result:', response.status, response.statusText);
      return;
    }

    const data = await response.json();
    console.log('[APIClient] Result sent successfully:', data);
  } catch (error) {
    console.error('[APIClient] Error sending result:', error);
  }
}
