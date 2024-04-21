import { addOnProducts } from '@/lib/constants';
import { stripe } from '@/lib/stripe';
import { addOnCreated, subscriptionCreated } from '@/lib/stripe/stripe-actions';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeWebhookEvents = new Set([
  'product.created',
  'product.updated',
  'price.created',
  'price.updated',
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: NextRequest) {
  let stripeEvent: Stripe.Event;
  const body = await req.text();
  const sig = headers().get('Stripe-Signature');
  const webhookSecret =
    process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_CONNECTED_SECRET;

  try {
    if (!sig || !webhookSecret) {
      console.log('🔴 Error Stripe webhook secret or the signature does not exist.');
      return;
    }

    stripeEvent = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (error: any) {
    console.log(`🔴 Error ${error.message}`);

    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // @ts-ignore
  const handleExternalAccountUpdate = (connectedAccountId, externalAccount) => {
    // Transfer funds to a connected account
    console.log('Connected account ID: ' + connectedAccountId);
    console.log(JSON.stringify(externalAccount));
  };

  // @ts-ignore
  const handleAccountUpdate = (account) => {
    // Collect more required information
    console.log(JSON.stringify(account));
  };

  try {
    if (stripeWebhookEvents.has(stripeEvent.type)) {
      const subscription = stripeEvent.data.object as Stripe.Subscription;

      if (
        !subscription.metadata.connectAccountPayments &&
        !subscription.metadata.connectAccountSubscriptions
      ) {
        switch (stripeEvent.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated': {
            // @ts-ignore
            if (subscription.plan.id === addOnProducts[0].priceId) {
              await addOnCreated(subscription, subscription.customer as string);
            }
            if (subscription.status === 'active') {
              // @ts-ignore
              if (subscription.plan.id === addOnProducts[0].priceId) {
                await addOnCreated(subscription, subscription.customer as string);
              } else {
                await subscriptionCreated(subscription, subscription.customer as string);
              }
              console.log('CREATED FROM WEBHOOK 💳', subscription);
            } else {
              console.log(
                'SKIPPED AT CREATED FROM WEBHOOK 💳 because subscription status is not active',
                subscription,
              );
              break;
            }
          }
          case 'account.external_account.updated': {
            const externalAccount = stripeEvent.data.object;
            const connectedAccountId = stripeEvent.account;
            handleExternalAccountUpdate(connectedAccountId, externalAccount);
          }
          case 'account.updated': {
            const account = stripeEvent.data.object;
            handleAccountUpdate(account);
          }

          default:
            console.log('👉🏻 Unhandled relevant event!', stripeEvent.type);
        }
      } else {
        console.log(
          'SKIPPED FROM WEBHOOK 💳 because subscription was from a connected account not for the application',
          subscription,
        );
      }
    }
  } catch (error) {
    console.log(error);

    return new NextResponse('🔴 Webhook Error', { status: 400 });
  }
  return NextResponse.json(
    {
      webhookActionReceived: true,
    },
    {
      status: 200,
    },
  );
}
