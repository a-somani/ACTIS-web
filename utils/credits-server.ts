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
import { log } from '@/utils/logger';

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

interface SyncCreditsOptions {
  syncRecentCreditPackTransactions?: boolean;
}

const ActiveSubscriptionStatuses = ['active', 'trialing', 'past_due'];
const DuplicateCreditReferenceConstraint = 'idx_credit_transactions_user_reference';
const RecentCreditPackEligibleTransactionStatuses = new Set(['paid', 'completed', 'billed']);
const RecentCreditPackTransactionPageSize = 5;

function isDuplicateCreditReferenceError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const maybeError = error as { code?: string; message?: string };
  return (
    maybeError.code === '23505' &&
    (maybeError.message?.includes(DuplicateCreditReferenceConstraint) ?? false)
  );
}

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

async function resolveCustomerIdsForUser(user: Pick<User, 'id' | 'email'>): Promise<string[]> {
  const supabase = createClient();
  const customerIds = new Set<string>();
  const normalizedEmail = user.email?.toLowerCase() ?? null;
  let recoveredFromPaddle = 0;

  const { data: linkedCustomers, error: linkedCustomersError } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('user_id', user.id);

  if (linkedCustomersError) {
    throw linkedCustomersError;
  }

  for (const customer of linkedCustomers ?? []) {
    if (customer.customer_id) {
      customerIds.add(customer.customer_id);
    }
  }

  if (normalizedEmail) {
    const { data: emailCustomers, error: emailCustomersError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', normalizedEmail);

    if (emailCustomersError) {
      throw emailCustomersError;
    }

    for (const customer of emailCustomers ?? []) {
      if (customer.customer_id) {
        customerIds.add(customer.customer_id);
      }
    }
  }

  if (!customerIds.size && normalizedEmail) {
    const customerCollection = getPaddleInstance().customers.list({
      email: [normalizedEmail],
      perPage: 10,
    });
    const paddleCustomers = await customerCollection.next();

    for (const customer of paddleCustomers ?? []) {
      if (!customer.id || !customer.email) {
        continue;
      }

      await supabase.from('customers').upsert(
        {
          customer_id: customer.id,
          email: customer.email.toLowerCase(),
          user_id: user.id,
        },
        { onConflict: 'customer_id' },
      );

      customerIds.add(customer.id);
      recoveredFromPaddle += 1;
    }
  }

  const resolvedCustomerIds = Array.from(customerIds);
  log.info('Resolved customer IDs for credit sync', {
    action: 'resolveCustomerIdsForUser',
    userId: user.id,
    customerCount: resolvedCustomerIds.length,
    recoveredFromPaddle,
  });

  return resolvedCustomerIds;
}

function getCreditPackPriceIdsFromTransaction(
  transaction: {
    items?: Array<{ price?: { id?: string | null } | null; priceId?: string | null } | null> | null;
  } | null,
): string[] {
  if (!transaction?.items?.length) {
    return [];
  }

  const priceIds = transaction.items
    .flatMap((item) => {
      if (!item) {
        return [];
      }

      if (typeof item.price?.id === 'string' && item.price.id.length > 0) {
        return [item.price.id];
      }

      if (typeof item.priceId === 'string' && item.priceId.length > 0) {
        return [item.priceId];
      }

      return [];
    })
    .filter(Boolean);

  return Array.from(new Set(priceIds));
}

async function syncRecentCreditPackTransactionsForUser(user: Pick<User, 'id' | 'email'>): Promise<void> {
  const customerIds = await resolveCustomerIdsForUser(user);
  if (!customerIds.length) {
    log.info('No customers found for recent credit-pack sync', {
      action: 'syncRecentCreditPackTransactionsForUser',
      userId: user.id,
    });
    return;
  }

  log.info('Starting recent credit-pack transaction sync', {
    action: 'syncRecentCreditPackTransactionsForUser',
    userId: user.id,
    customerCount: customerIds.length,
  });

  const paddle = getPaddleInstance();

  for (const customerId of customerIds) {
    const transactionCollection = paddle.transactions.list({
      customerId: [customerId],
      perPage: RecentCreditPackTransactionPageSize,
    });
    const recentTransactions = await transactionCollection.next();
    log.info('Fetched recent transactions for credit-pack sync', {
      action: 'syncRecentCreditPackTransactionsForUser',
      userId: user.id,
      customerId,
      transactionCount: recentTransactions?.length ?? 0,
    });

    for (const transaction of recentTransactions ?? []) {
      if (!transaction.id || !RecentCreditPackEligibleTransactionStatuses.has(transaction.status)) {
        log.info('Skipping transaction during recent credit-pack sync', {
          action: 'syncRecentCreditPackTransactionsForUser',
          userId: user.id,
          customerId,
          transactionId: transaction.id ?? null,
          status: transaction.status,
        });
        continue;
      }

      const priceIds = getCreditPackPriceIdsFromTransaction(transaction);
      for (const priceId of priceIds) {
        const pack = resolveCreditPackFromPriceId(priceId);
        if (!pack) {
          log.info('Skipping non-credit-pack price during recent sync', {
            action: 'syncRecentCreditPackTransactionsForUser',
            userId: user.id,
            customerId,
            transactionId: transaction.id,
            priceId,
          });
          continue;
        }

        log.info('Applying credit-pack grant from recent transaction sync', {
          action: 'syncRecentCreditPackTransactionsForUser',
          userId: user.id,
          customerId,
          transactionId: transaction.id,
          priceId,
          packId: pack.id,
          credits: pack.credits,
        });

        await maybeGrantCredits({
          userId: user.id,
          amount: pack.credits,
          kind: 'credit_pack_grant',
          description: createCreditDescription('credit_pack_grant', pack.name),
          reference: `transaction:${transaction.id}:${pack.id}`,
        });
      }
    }
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
    log.info('Skipping duplicate credit grant by reference', {
      action: 'maybeGrantCredits',
      userId: params.userId,
      kind: params.kind,
      reference: params.reference,
    });
    return;
  }

  try {
    const balanceAfter = await applyCreditDelta(params);
    log.info('Applied credit delta', {
      action: 'maybeGrantCredits',
      userId: params.userId,
      kind: params.kind,
      reference: params.reference,
      amount: params.amount,
      balanceAfter,
    });
  } catch (error) {
    if (isDuplicateCreditReferenceError(error)) {
      log.info('Duplicate credit reference ignored after race', {
        action: 'maybeGrantCredits',
        userId: params.userId,
        kind: params.kind,
        reference: params.reference,
      });
      return;
    }

    log.error('Credit delta failed', error, {
      action: 'maybeGrantCredits',
      userId: params.userId,
      kind: params.kind,
      reference: params.reference,
      amount: params.amount,
    });
    throw error;
  }
}

export async function syncCreditsForUser(
  user: Pick<User, 'id' | 'email'>,
  options: SyncCreditsOptions = {},
): Promise<CreditSummary> {
  log.info('Starting credit sync for user', {
    action: 'syncCreditsForUser',
    userId: user.id,
    syncRecentCreditPackTransactions: Boolean(options.syncRecentCreditPackTransactions),
  });

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

  if (options.syncRecentCreditPackTransactions) {
    await syncRecentCreditPackTransactionsForUser(user);
  }

  const account = await getCreditAccount(user.id);

  const summary = {
    balance: account.balance,
    generationCost: CreateGenerationCreditCost,
    activeTierId: activeTier?.id ?? null,
    activeTierName: activeTier?.name ?? null,
  };

  log.info('Completed credit sync for user', {
    action: 'syncCreditsForUser',
    userId: user.id,
    balance: summary.balance,
    activeTierId: summary.activeTierId,
  });

  return summary;
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
    log.info('Resolved user from direct customer mapping', {
      action: 'resolveUserIdForCustomer',
      customerId,
      userId: customer.user_id,
    });
    return customer.user_id;
  }

  if (!customerEmail) {
    const paddleCustomer = await getPaddleInstance().customers.get(customerId);
    customerEmail = paddleCustomer.email ?? null;
    await upsertCustomerRecord(customerId, customerEmail);
  }

  if (!customerEmail) {
    log.warn('Unable to resolve customer email for mapping', {
      action: 'resolveUserIdForCustomer',
      customerId,
    });
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
    log.warn('No auth user found for customer email', {
      action: 'resolveUserIdForCustomer',
      customerId,
      hasCustomerEmail: Boolean(customerEmail),
    });
    return null;
  }

  const { error: updateError } = await supabase
    .from('customers')
    .update({ user_id: userId })
    .eq('customer_id', customerId);

  if (updateError) {
    throw updateError;
  }

  log.info('Resolved and linked user for customer', {
    action: 'resolveUserIdForCustomer',
    customerId,
    userId,
  });

  return userId;
}

export async function grantCreditsForTransaction(params: {
  customerId: string | null;
  transactionId: string;
  priceIds: string[];
}) {
  if (!params.customerId) {
    log.warn('Skipping credit grant: missing customer ID on transaction', {
      action: 'grantCreditsForTransaction',
      transactionId: params.transactionId,
    });
    return;
  }

  log.info('Processing transaction credit grant', {
    action: 'grantCreditsForTransaction',
    transactionId: params.transactionId,
    customerId: params.customerId,
    priceIdCount: params.priceIds.length,
  });

  const userId = await resolveUserIdForCustomer(params.customerId);
  if (!userId) {
    log.warn('Skipping credit grant: user mapping not found', {
      action: 'grantCreditsForTransaction',
      transactionId: params.transactionId,
      customerId: params.customerId,
    });
    return;
  }

  for (const priceId of params.priceIds) {
    const pack = resolveCreditPackFromPriceId(priceId);
    if (!pack) {
      log.info('Skipping non-credit-pack price on transaction', {
        action: 'grantCreditsForTransaction',
        transactionId: params.transactionId,
        customerId: params.customerId,
        priceId,
      });
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
