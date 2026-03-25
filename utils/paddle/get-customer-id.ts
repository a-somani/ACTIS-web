import { createClient } from '@/utils/supabase/server';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';
import { log } from '@/utils/logger';

export async function getCustomerId() {
  const supabase = await createClient();
  const user = await supabase.auth.getUser();
  const email = user.data.user?.email?.toLowerCase();

  if (email) {
    const customersData = await supabase
      .from('customers')
      .select('customer_id,email')
      .eq('email', email)
      .single();

    if (customersData?.data?.customer_id) {
      return customersData?.data?.customer_id as string;
    }

    try {
      const customerCollection = getPaddleInstance().customers.list({
        email: [email],
        perPage: 1,
      });
      const paddleCustomers = await customerCollection.next();
      const fallbackCustomerId = paddleCustomers[0]?.id;

      if (fallbackCustomerId) {
        await supabase.from('customers').upsert({
          customer_id: fallbackCustomerId,
          email,
        });

        log.info('Recovered Paddle customer mapping from API', {
          action: 'getCustomerId',
          customerId: fallbackCustomerId,
          email,
        });

        return fallbackCustomerId;
      }
    } catch (error) {
      log.error('Failed to recover Paddle customer mapping', error, {
        action: 'getCustomerId',
        email,
      });
    }
  }

  return '';
}
