import { currentUser } from '@clerk/nextjs';
import Stripe from 'stripe';

import { addOnProducts, pricingCards } from '../constants';
import { db } from '../db';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2024-04-10',
  appInfo: {
    name: 'Aura App',
    version: '0.1.0',
  },
});

const DAY_IN_MS = 86_400_00;

export const checkSubscription = async () => {
  const authUser = await currentUser();

  if (!authUser) {
    return {
      ...pricingCards[0],
      subscriptionIsSubscribed: false,
      subscriptionIsCanceled: false,
      subscriptionCurrentPeriodEndDate: null,
      subscriptionStatus: '',
    };
  }

  const userDetails = await db.user.findUnique({
    where: {
      id: authUser.id,
    },
  });

  if (!userDetails) {
    return {
      ...pricingCards[0],
      subscriptionIsSubscribed: false,
      subscriptionIsCanceled: false,
      subscriptionCurrentPeriodEndDate: null,
      subscriptionStatus: '',
    };
  }

  const userSubscription = await db.subscription.findUnique({
    where: {
      agencyId: userDetails.agencyId || undefined,
    },
    select: {
      subscriptionId: true,
      currentPeriodEndDate: true,
      customerId: true,
      priceId: true,
    },
  });

  if (!userSubscription) {
    return {
      ...pricingCards[0],
      subscriptionIsSubscribed: false,
      subscriptionIsCanceled: false,
      subscriptionCurrentPeriodEndDate: null,
      subscriptionStatus: '',
    };
  }

  const subscriptionIsSubscribed = Boolean(
    userSubscription.priceId &&
      userSubscription.currentPeriodEndDate && // 86400000 = 1 day
      userSubscription.currentPeriodEndDate.getTime() + 86_400_000 > Date.now(),
  );

  const plan = subscriptionIsSubscribed
    ? pricingCards.find((plan) => plan.priceId === userSubscription.priceId)
    : null;

  let subscriptionIsCanceled = false;
  let subscriptionStatus;
  if (subscriptionIsSubscribed && userSubscription.subscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(userSubscription.subscriptionId);
    subscriptionStatus = stripePlan.status;
    if (stripePlan.cancel_at_period_end) subscriptionIsCanceled = true;
  }

  return {
    ...plan,
    subscriptionSubscriptionId: userSubscription.subscriptionId,
    subscriptionCurrentPeriodEndDate: userSubscription.currentPeriodEndDate,
    subscriptionCustomerId: userSubscription.customerId,
    subscriptionIsSubscribed,
    subscriptionIsCanceled,
    subscriptionStatus,
  };
};

export const checkAddOn = async () => {
  const authUser = await currentUser();

  if (!authUser) {
    return {
      ...addOnProducts[0],
      addOnIsSubscribed: false,
      addOnIsCanceled: false,
      addOnCurrentPeriodEndDate: null,
      addOnStatus: '',
    };
  }

  const userDetails = await db.user.findUnique({
    where: {
      id: authUser.id,
    },
  });

  if (!userDetails) {
    return {
      ...addOnProducts[0],
      addOnIsSubscribed: false,
      addOnIsCanceled: false,
      addOnCurrentPeriodEndDate: null,
      addOnStatus: '',
    };
  }

  const userAddOn = await db.addOns.findUnique({
    where: {
      agencyId: userDetails.agencyId || undefined,
    },
    select: {
      subscriptionId: true,
      currentPeriodEndDate: true,
      customerId: true,
      priceId: true,
    },
  });

  if (!userAddOn) {
    return {
      ...addOnProducts[0],
      addOnIsSubscribed: false,
      addOnIsCanceled: false,
      addOnCurrentPeriodEndDate: null,
      addOnStatus: '',
    };
  }

  const addOnIsSubscribed = Boolean(
    userAddOn.priceId &&
      userAddOn.currentPeriodEndDate && // 86400000 = 1 day
      userAddOn.currentPeriodEndDate.getTime() + 86_400_000 > Date.now(),
  );

  const plan = addOnIsSubscribed
    ? pricingCards.find((plan) => plan.priceId === userAddOn.priceId)
    : null;

  let addOnIsCanceled = false;
  let addOnStatus;
  if (addOnIsSubscribed && userAddOn.subscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(userAddOn.subscriptionId);
    addOnStatus = stripePlan.status;
    if (stripePlan.cancel_at_period_end) addOnIsCanceled = true;
  }

  return {
    ...plan,
    addOnSubscriptionId: userAddOn.subscriptionId,
    addOnCurrentPeriodEndDate: userAddOn.currentPeriodEndDate,
    addOnCustomerId: userAddOn.customerId,
    addOnIsSubscribed,
    addOnIsCanceled,
    addOnStatus,
  };
};
