import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  const { customerId } = await req.json();
  if (!customerId)
    return new NextResponse('Customer Id is missing', {
      status: 400,
    });

  const subscriptionExists = await db.agency.findFirst({
    where: { customerId },
    include: { Subscription: true },
  });

  try {
    if (
      subscriptionExists?.Subscription?.subscriptionId &&
      subscriptionExists?.Subscription?.active
    ) {
      if (!subscriptionExists.Subscription.subscriptionId) {
        throw new Error('Could not find the subscription Id to cancel the subscription.');
      }
      console.log('Canceling the subscription');

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        subscriptionExists.Subscription.subscriptionId,
      );

      const subscription = await stripe.subscriptions.update(
        subscriptionExists.Subscription.subscriptionId,
        {
          cancel_at_period_end: true,
        },
      );

      return NextResponse.json({
        subscriptionId: subscription.id,
      });
    }
  } catch (error) {
    console.log('🔴 Error', error);
    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}
