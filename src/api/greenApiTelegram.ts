import type {
  AuthCredentials,
  GreenApiNotification,
  SendMessageResponse,
  StateInstanceResponse,
} from '@/types/telegram';

const BASE_URL = 'https://4100.api.green-api.com';

function buildUrl(
  method: string,
  { idInstance, apiTokenInstance }: AuthCredentials,
  suffix?: string | number,
): string {
  const parts = [
    BASE_URL,
    `waInstance${idInstance}`,
    method,
    apiTokenInstance,
  ];
  if (suffix !== undefined) parts.push(String(suffix));
  return parts.join('/');
}

async function greenApiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message || body?.error || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => '');
    }
    throw new Error(
      `GREEN-API request failed (${res.status})${detail ? ': ' + detail : ''}`,
    );
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null as unknown as T;
  }
  return (await res.json()) as T;
}

export function getStateInstance(
  credentials: AuthCredentials,
): Promise<StateInstanceResponse> {
  return greenApiFetch<StateInstanceResponse>(
    buildUrl('getStateInstance', credentials),
  );
}

export function sendMessage(
  credentials: AuthCredentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  return greenApiFetch<SendMessageResponse>(
    buildUrl('sendMessage', credentials),
    {
      method: 'POST',
      body: JSON.stringify({ chatId, message }),
    },
  );
}

export function receiveNotification(
  credentials: AuthCredentials,
): Promise<GreenApiNotification | null> {
  return greenApiFetch<GreenApiNotification | null>(
    buildUrl('receiveNotification', credentials),
  );
}

export function deleteNotification(
  credentials: AuthCredentials,
  receiptId: number,
): Promise<void> {
  return greenApiFetch<void>(
    buildUrl('deleteNotification', credentials, receiptId),
    { method: 'DELETE' },
  );
}

export interface ContactInfoResponse {
  avatar?: string;
  name?: string;
  contactName?: string;
  email?: string;
  category?: string;
  chatId?: string;
}

export function getContactInfo(
  credentials: AuthCredentials,
  chatId: string,
): Promise<ContactInfoResponse> {
  return greenApiFetch<ContactInfoResponse>(
    buildUrl('getContactInfo', credentials),
    {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    },
  );
}
