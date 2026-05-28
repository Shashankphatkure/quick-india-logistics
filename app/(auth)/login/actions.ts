'use server';

import { redirect } from 'next/navigation';
import { loginWithPassword, logout } from '@/lib/auth';

export type LoginState = { error?: string } | undefined;

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const remember = formData.get('remember') === 'on';

  if (!username || !password) {
    return { error: 'Username and password are required' };
  }

  const result = await loginWithPassword({ username, password, remember });
  if (!result.ok) return { error: result.error };

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await logout();
  redirect('/login');
}
