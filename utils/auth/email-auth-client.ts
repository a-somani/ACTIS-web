'use client';

import type { AuthLookupResult, AuthLookupStatus } from '@/components/authentication/types';

interface AuthErrorResult {
  error: string;
}

interface SendOtpResult {
  success: true;
  status: AuthLookupStatus;
}

interface VerifyOtpResult {
  success: true;
}

async function postJson<T extends object>(url: string, payload: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as T | AuthErrorResult;
  if (!response.ok) {
    throw new Error('error' in data ? data.error : 'Request failed.');
  }

  return data as T;
}

export async function inspectAuthEmailClient(email: string): Promise<AuthLookupResult> {
  return postJson<AuthLookupResult>('/api/auth/inspect-email', { email });
}

export async function sendEmailOtpClient(email: string): Promise<SendOtpResult> {
  return postJson<SendOtpResult>('/api/auth/send-otp', { email });
}

export async function verifyEmailOtpClient(email: string, token: string): Promise<VerifyOtpResult> {
  return postJson<VerifyOtpResult>('/api/auth/verify-otp', { email, token });
}
