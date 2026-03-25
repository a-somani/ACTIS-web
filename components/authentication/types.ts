export type AuthDialogMode = 'login' | 'signup';
export type AuthStep = 'email' | 'options' | 'otp';

export type AuthLookupStatus = 'new_user' | 'google_only' | 'email_only' | 'google_and_email';

export interface AuthLookupResult {
  status: AuthLookupStatus;
  email: string;
}

export interface AuthDialogCopy {
  title: string;
  description: string;
  emailLabel?: string;
}

export interface AuthSwitchCopy {
  label: string;
  action: string;
}
