import 'server-only';

import type { User } from '@supabase/supabase-js';
import { resolveCreditPackFromPriceId } from '@/utils/credit-packs';
import { createClient } from '@/utils/supabase/server-internal';
import {
  CreateGenerationCreditCost,
  CreditGrantByTierId,
  getCurrentCreditPeriodKey,
  getSubscriptionCreditReference,
  getWelcomeCreditReference,
  resolveCreditTierFromPriceId,
  WelcomeCreditGrant,
  type CreditTierId,
} from '@/utils/credits';
import { getPaddleInstance } from '@/utils/paddle/get-paddle-instance';

type CreditTransactionKind = 'welcome_grant' | 'subscription_grant' | 'credit_pack_grant' | 'generation_debit';

interface CreditAccountRow {
  balance: number;
}

interface CreditSummary {
  balance: number;
  generationCost: number;
  activeTierId: CreditTierId | null;
  activeTierName: string | null;
}

const ActiveSubscriptionStatuses = ['active', 'trialing', 'past_due'];

function createCreditDescription(kind: CreditTransactionKind, tierName?: string | null): string {
  if (kind === 'welcome_grant') {
    return 'Welcome credits';
  }

  if (kind === 'subscription_grant') {
    return tierName ? `${tierName} monthly credits` : 'Subscription credits';
  }

  if (kind === 'credit_pack_grant') {
    return tierName ? `${tierName} credit pack` : 'Credit pack';
  }

  return 'ACTIS Create generation';
}

async function ensureCreditAccount(userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from('credit_accounts').upsert({ user_id: userId }).select('user_id').single();

  if (error) {
    throw error;
  }
}

async function getCreditAccount(userId: string): Promise<CreditAccountRow> {
  const supabase = createClient();
  const { data, error } = await supabase.from('credit_accounts').select('balance').eq('user_id', userId).single();

  if (error) {
    throw error;
  }

  return data as CreditAccountRow;
}

async function hasCreditReference(userId: string, kind: CreditTransactionKind, reference: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', kind)
    .eq('reference', reference)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

async function applyCreditDelta(params: {
  userId: string;
  amount: number;
  kind: CreditTransactionKind;
  description: string;
  reference: string;
}): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc('apply_credit_delta', {
    p_user_id: params.userId,
    p_delta: params.amount,
    p_kind: params.kind,
    p_description: params.description,
    p_reference: params.reference,
  });

  if (error) {
    throw error;
  }

  return Number(data ?? 0);
}

async function getActiveSubscriptionTier(email: string | null | undefined) {
  if (!email) {
    return null;
  }

  const supabase = createClient();
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('email', email);

  if (customersError) {
    throw customersError;
  }

  const customerIds = (customers ?? []).map((customer) => customer.customer_id).filter(Boolean);
  if (!customerIds.length) {
    return null;
  }

  const { data: subscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('price_id, subscription_status, updated_at')
    .in('customer_id', customerIds)
    .in('subscription_status', ActiveSubscriptionStatuses)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (subscriptionsError) {
    throw subscriptionsError;
  }

  const latestSubscription = subscriptions?.[0];
  return resolveCreditTierFromPriceId(latestSubscription?.price_id);
}

async function linkCustomerToUserByEmail(userId: string, email: string | null | undefined) {
  if (!email) {
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from('customers').update({ user_id: userId }).eq('email', email).is('user_id', null);

  if (error) {
    throw error;
  }
}

async function upsertCustomerRecord(customerId: string, email: string | null | undefined) {
  if (!email) {
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('customers')
    .upsert({ customer_id: customerId, email }, { onConflict: 'customer_id' })
    .select('customer_id')
    .single();

  if (error) {
    throw error;
  }
}

async function maybeGrantCredits(params: {
  userId: string;
  amount: number;
  kind: CreditTransactionKind;
  description: string;
  reference: string;
}): Promise<void> {
  const alreadyGranted = await hasCreditReference(params.userId, params.kind, params.reference);
  if (alreadyGranted) {
    return;
  }

  await applyCreditDelta(params);
}

export async function syncCreditsForUser(user: Pick<User, 'id' | 'email'>): Promise<CreditSummary> {
  await ensureCreditAccount(user.id);
  await linkCustomerToUserByEmail(user.id, user.email);

  await maybeGrantCredits({
    userId: user.id,
    amount: WelcomeCreditGrant,
    kind: 'welcome_grant',
    description: createCreditDescription('welcome_grant'),
    reference: getWelcomeCreditReference(),
  });

  const activeTier = await getActiveSubscriptionTier(user.email);
  if (activeTier) {
    const periodKey = getCurrentCreditPeriodKey();
    await maybeGrantCredits({
      userId: user.id,
      amount: CreditGrantByTierId[activeTier.id],
      kind: 'subscription_grant',
      description: createCreditDescription('subscription_grant', activeTier.name),
      reference: getSubscriptionCreditReference(activeTier.id, periodKey),
    });
  }

  const account = await getCreditAccount(user.id);

  return {
    balance: account.balance,
    generationCost: CreateGenerationCreditCost,
    activeTierId: activeTier?.id ?? null,
    activeTierName: activeTier?.name ?? null,
  };
}

export async function consumeGenerationCredits(user: Pick<User, 'id'>, reference?: string): Promise<number> {
  await ensureCreditAccount(user.id);

  return applyCreditDelta({
    userId: user.id,
    amount: -CreateGenerationCreditCost,
    kind: 'generation_debit',
    description: createCreditDescription('generation_debit'),
    reference: reference ?? `generation:${crypto.randomUUID()}`,
  });
}

async function resolveUserIdForCustomer(customerId: string): Promise<string | null> {
  const supabase = createClient();
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('user_id, email')
    .eq('customer_id', customerId)
    .maybeSingle();

  if (customerError) {
    throw customerError;
  }

  let customerEmail = customer?.email ?? null;
  if (customer?.user_id) {
    return customer.user_id;
  }

  if (!customerEmail) {
    const paddleCustomer = await getPaddleInstance().customers.get(customerId);
    customerEmail = paddleCustomer.email ?? null;
    await upsertCustomerRecord(customerId, customerEmail);
  }

  if (!customerEmail) {
    return null;
  }

  const authClient = createClient().schema('auth');
  const { data: users, error: usersError } = await authClient
    .from('users')
    .select('id,email')
    .eq('email', customerEmail)
    .limit(1);

  if (usersError) {
    throw usersError;
  }

  const userId = users?.[0]?.id ?? null;
  if (!userId) {
    return null;
  }

  const { error: updateError } = await supabase
    .from('customers')
    .update({ user_id: userId })
    .eq('customer_id', customerId);

  if (updateError) {
    throw updateError;
  }

  return userId;
}

export async function grantCreditsForTransaction(params: {
  customerId: string | null;
  transactionId: string;
  priceIds: string[];
}) {
  if (!params.customerId) {
    return;
  }

  const userId = await resolveUserIdForCustomer(params.customerId);
  if (!userId) {
    return;
  }

  for (const priceId of params.priceIds) {
    const pack = resolveCreditPackFromPriceId(priceId);
    if (!pack) {
      continue;
    }

    await maybeGrantCredits({
      userId,
      amount: pack.credits,
      kind: 'credit_pack_grant',
      description: createCreditDescription('credit_pack_grant', pack.name),
      reference: `transaction:${params.transactionId}:${pack.id}`,
    });
  }
}
