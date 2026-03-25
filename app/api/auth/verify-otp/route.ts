import { verifyEmailOtp } from '@/utils/auth/email-auth-server';

interface RequestBody {
  email?: string;
  token?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const result = await verifyEmailOtp({ email: body.email ?? '', token: body.token ?? '' });

  if (result.error) {
    return Response.json(result, { status: 400 });
  }

  return Response.json(result);
}
