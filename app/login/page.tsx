import { EmailAuthForm } from '@/components/authentication/email-auth-form';
import { LoginGradient } from '@/components/gradients/login-gradient';
import '../../styles/login.css';

export default function LoginPage() {
  return (
    <div>
      <LoginGradient />
      <div className={'flex flex-col'}>
        <div className={'mx-auto mt-[112px] flex w-[343px] flex-col gap-5 rounded-lg border border-border bg-background p-1 md:w-[488px]'}>
          <EmailAuthForm mode="login" />
        </div>
      </div>
    </div>
  );
}
