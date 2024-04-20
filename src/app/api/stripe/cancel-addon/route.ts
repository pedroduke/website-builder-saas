import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  const { customerId } = await req.json();
  if (!customerId)
    return new NextResponse('Customer Id is missing', {
      status: 400,
    });

  const addOnExists = await db.agency.findFirst({
    where: { customerId },
    include: { AddOns: true },
  });

  try {
    if (addOnExists?.AddOns?.subscriptionId) {
      if (!addOnExists.AddOns.subscriptionId) {
        throw new Error('Could not find the subscription Id to cancel the subscription.');
      }
      console.log('Canceling the subscription');

      const currentSubscriptionDetails = await stripe.subscriptions.retrieve(
        addOnExists.AddOns.subscriptionId,
      );

      const subscription = await stripe.subscriptions.update(addOnExists.AddOns.subscriptionId, {
        cancel_at_period_end: true,
      });

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
