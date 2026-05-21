import {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  EventEntity,
  EventName,
  SubscriptionActivatedEvent,
  SubscriptionCanceledEvent,
  SubscriptionCreatedEvent,
  SubscriptionPausedEvent,
  SubscriptionResumedEvent,
  TransactionCompletedEvent,
  TransactionBilledEvent,
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionRevisedEvent,
  TransactionReadyEvent,
  TransactionPaidEvent,
  TransactionCanceledEvent,
  TransactionPastDueEvent,
  TransactionPaymentFailedEvent,
  SubscriptionUpdatedEvent,
} from '@paddle/paddle-node-sdk';
import { grantCreditsForTransaction } from '@/utils/credits-server';
import { createClient } from '@/utils/supabase/server-internal';
import { log } from '@/utils/logger';

type SubscriptionEvent =
  | SubscriptionCreatedEvent
  | SubscriptionUpdatedEvent
  | SubscriptionCanceledEvent
  | SubscriptionPausedEvent
  | SubscriptionResumedEvent
  | SubscriptionActivatedEvent;

type TransactionEvent =
  | TransactionCreatedEvent
  | TransactionReadyEvent
  | TransactionBilledEvent
  | TransactionPaidEvent
  | TransactionCompletedEvent
  | TransactionUpdatedEvent
  | TransactionRevisedEvent
  | TransactionPastDueEvent
  | TransactionPaymentFailedEvent
  | TransactionCanceledEvent;

const CreditGrantableTransactionStatuses = new Set(['billed', 'paid', 'completed']);

export class ProcessWebhook {
  async processEvent(eventData: EventEntity) {
    log.info('Processing webhook event', {
      event: eventData.eventType,
    });

    switch (eventData.eventType) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCanceled:
      case EventName.SubscriptionPaused:
      case EventName.SubscriptionResumed:
      case EventName.SubscriptionActivated:
        await this.updateSubscriptionData(eventData);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await this.updateCustomerData(eventData);
        break;
      case EventName.TransactionCompleted:
      case EventName.TransactionPaid:
      case EventName.TransactionBilled:
      case EventName.TransactionUpdated:
      case EventName.TransactionRevised:
      case EventName.TransactionCreated:
      case EventName.TransactionReady:
      case EventName.TransactionPastDue:
      case EventName.TransactionPaymentFailed:
      case EventName.TransactionCanceled:
        await this.grantTransactionCredits(eventData);
        break;
      default:
        log.info('Unhandled webhook event', { event: eventData.eventType });
    }
  }

  private async updateSubscriptionData(eventData: SubscriptionEvent) {
    const supabase = createClient();
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        subscription_id: eventData.data.id,
        subscription_status: eventData.data.status,
        price_id: eventData.data.items[0].price?.id ?? '',
        product_id: eventData.data.items[0].price?.productId ?? '',
        scheduled_change: eventData.data.scheduledChange?.effectiveAt,
        customer_id: eventData.data.customerId,
      })
      .select();

    if (error) {
      log.error('Failed to upsert subscription', error, {
        subscriptionId: eventData.data.id,
        event: eventData.eventType,
      });
      throw error;
    }

    log.info('Subscription upserted', {
      subscriptionId: eventData.data.id,
      status: eventData.data.status,
      event: eventData.eventType,
    });
  }

  private async updateCustomerData(eventData: CustomerCreatedEvent | CustomerUpdatedEvent) {
    const supabase = createClient();
    const { error } = await supabase
      .from('customers')
      .upsert({
        customer_id: eventData.data.id,
        email: eventData.data.email,
      })
      .select();

    if (error) {
      log.error('Failed to upsert customer', error, {
        customerId: eventData.data.id,
        event: eventData.eventType,
      });
      throw error;
    }

    log.info('Customer upserted', {
      customerId: eventData.data.id,
      event: eventData.eventType,
    });
  }

  private async grantTransactionCredits(eventData: TransactionEvent) {
    try {
      const transactionStatus = eventData.data.status;
      log.info('Evaluating transaction event for credit grant', {
        transactionId: eventData.data.id,
        status: transactionStatus,
        event: eventData.eventType,
        customerId: eventData.data.customerId,
      });

      if (!CreditGrantableTransactionStatuses.has(transactionStatus)) {
        log.info('Skipping transaction credit grant for status', {
          transactionId: eventData.data.id,
          status: transactionStatus,
          event: eventData.eventType,
        });
        return;
      }

      await grantCreditsForTransaction({
        customerId: eventData.data.customerId,
        transactionId: eventData.data.id,
        priceIds: eventData.data.items
          .map((item) => item.price?.id)
          .filter((priceId): priceId is string => Boolean(priceId)),
      });

      log.info('Transaction credits processed', {
        transactionId: eventData.data.id,
        event: eventData.eventType,
      });
    } catch (error) {
      log.error('Failed to process transaction credits', error, {
        transactionId: eventData.data.id,
        event: eventData.eventType,
      });
      throw error;
    }
  }
}
