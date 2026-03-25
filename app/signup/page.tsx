import { EmailAuthForm } from '@/components/authentication/email-auth-form';
import { LoginGradient } from '@/components/gradients/login-gradient';
import '../../styles/login.css';
import { LoginCardGradient } from '@/components/gradients/login-card-gradient';

export default function SignupPage() {
  return (
    <div>
      <LoginGradient />
      <div className={'flex flex-col'}>
        <div
          className={
            'mx-auto mt-[112px] bg-background/80 w-[343px] md:w-[488px] gap-5 flex-col rounded-lg login-card-border backdrop-blur-[6px]'
          }
        >
          <LoginCardGradient />
          <EmailAuthForm mode="signup" />
        </div>
      </div>
    </div>
  );
}
