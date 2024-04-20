import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { customerId, priceId } = await req.json();

  if (!customerId || !priceId)
    return new NextResponse('Customer Id or Price Id is missing', {
      status: 400,
    });

  const addOnExists = await db.agency.findFirst({
    where: {
      customerId,
    },
    include: {
      AddOns: true,
    },
  });

  try {
    if (addOnExists?.AddOns?.subscriptionId && addOnExists.AddOns.active) {
      //update the subscription instead of creating one.
      if (!addOnExists.AddOns.subscriptionId) {
        throw new Error('Could not find the subscription Id to update the subscription.');
      }

      console.log('Updating the subscription');

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        addOnExists.AddOns.subscriptionId,
      );

      const subscription = await stripe.subscriptions.update(addOnExists.AddOns.subscriptionId, {
        cancel_at_period_end: false,
        items: [
          {
            id: currentSubscriptionDetails.items.data[0].id,
            deleted: true,
          },
          {
            price: priceId,
          },
        ],
        expand: ['latest_invoice.payment_intent'],
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } else {
      console.log('Creating a addon sub');

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      return NextResponse.json({
        subscriptionId: subscription.id,
        //@ts-ignore
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    }
  } catch (error) {
    console.log('🔴 Error', error);

    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}
