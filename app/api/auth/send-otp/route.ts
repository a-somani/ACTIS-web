import { sendEmailOtp } from '@/utils/auth/email-auth-server';

interface RequestBody {
  email?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const result = await sendEmailOtp({ email: body.email ?? '' });

  if (result.error) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
