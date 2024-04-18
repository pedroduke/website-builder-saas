import { addOnProducts, pricingCards } from '@/lib/constants';
import { db } from '@/lib/db';
import { checkAddOn, checkSubscription, stripe } from '@/lib/stripe';
import clsx from 'clsx';
import React from 'react';

import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import PricingCard from './_components/pricing-card';

type Props = {
  params: { agencyId: string };
};

const page = async ({ params }: Props) => {
  const addOns = await stripe.products.list({
    ids: addOnProducts.map((product) => product.id),
    expand: ['data.default_price'],
  });

  const {
    subscriptionIsSubscribed,
    subscriptionIsCanceled,
    subscriptionCurrentPeriodEndDate,
    subscriptionStatus,
  } = await checkSubscription();

  const { addOnIsSubscribed, addOnIsCanceled, addOnCurrentPeriodEndDate, addOnStatus } =
    await checkAddOn();

  const agencySubscription = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      Subscription: true,
    },
  });

  const agencyAddOns = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    select: {
      customerId: true,
      AddOns: true,
    },
  });

  const prices = await stripe.prices.list({
    product: process.env.NEXT_AURA_PRODUCT_ID,
    active: true,
  });

  const addOnPrices = await stripe.prices.list({
    product: process.env.NEXT_AURA_ADDON_ID,
    active: true,
  });

  const priceIdProps = addOnPrices.data[0].id;

  const currentPlanDetails = pricingCards.find(
    (c) => c.priceId === agencySubscription?.Subscription?.priceId,
  );

  const charges = await stripe.charges.list({
    limit: 50,
    customer: agencySubscription?.customerId,
  });

  const allCharges = [
    ...charges.data.map((charge) => ({
      description: charge.description,
      id: charge.id,
      date: `${new Date(charge.created * 1000).toLocaleTimeString()} ${new Date(
        charge.created * 1000,
      ).toLocaleDateString()}`,
      status: 'Paid',
      amount: `$${charge.amount / 100}`,
    })),
  ];

  return (
    <>
      <h1 className="text-4xl p-4">Billing</h1>
      <Separator className=" mb-6" />
      <div className="flex flex-col lg:!flex-row justify-between gap-8">
        <PricingCard
          planExists={agencySubscription?.Subscription?.active === true}
          prices={prices.data}
          customerId={agencySubscription?.customerId || ''}
          amt={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.price || '$0'
              : '$0'
          }
          buttonCta={
            agencySubscription?.Subscription?.active === true ? 'Change Plan' : 'Get Started'
          }
          highlightDescription="Want to modify your plan? You can do this here. If you have
          further question contact support@aura-app.com"
          highlightTitle="Plan Options"
          description={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.description || 'Lets get started'
              : 'Lets get started! Pick a plan that works best for you.'
          }
          duration="/month"
          features={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.features || []
              : currentPlanDetails?.features ||
                pricingCards.find((pricing) => pricing.title === 'Starter')?.features ||
                []
          }
          title={
            agencySubscription?.Subscription?.active === true
              ? currentPlanDetails?.title || 'Starter'
              : 'Starter'
          }
          subscriptionIsSubscribed={subscriptionIsSubscribed}
          subscriptionIsCanceled={subscriptionIsCanceled}
          subscriptionCurrentPeriodEndDate={subscriptionCurrentPeriodEndDate}
          subscriptionStatus={subscriptionStatus}
        />
        {agencySubscription?.Subscription?.active === true &&
          addOns.data.map((addOn) => (
            <PricingCard
              planExists={agencyAddOns?.AddOns?.active === true}
              prices={addOnPrices.data}
              customerId={agencyAddOns?.customerId || ''}
              key={addOn.id}
              amt={
                //@ts-ignore
                addOn.default_price?.unit_amount
                  ? //@ts-ignore
                    `$${addOn.default_price.unit_amount / 100}`
                  : '$0'
              }
              buttonCta={'Subscribe'}
              description="Dedicated support line & teams channel for support"
              duration="/month"
              features={['24/7 Priority Support']}
              title={'24/7 Priority Support'}
              highlightTitle="Get support now!"
              highlightDescription="Get priority support and skip the long long with the click of a button."
              priceId={priceIdProps}
              addOnIsSubscribed={addOnIsSubscribed}
              addOnIsCanceled={addOnIsCanceled}
              addOnCurrentPeriodEndDate={addOnCurrentPeriodEndDate}
              addOnStatus={addOnStatus}
            />
          ))}
      </div>
      <h2 className="text-2xl p-4">Payment History</h2>
      <Table className="bg-card border-[1px] border-border rounded-md">
        <TableHeader className="rounded-md">
          <TableRow>
            <TableHead className="w-[200px]">Description</TableHead>
            <TableHead className="w-[200px]">Invoice Id</TableHead>
            <TableHead className="w-[300px]">Date</TableHead>
            <TableHead className="w-[200px]">Paid</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-medium truncate">
          {allCharges.map((charge) => (
            <TableRow key={charge.id}>
              <TableCell>{charge.description}</TableCell>
              <TableCell className="text-muted-foreground">{charge.id}</TableCell>
              <TableCell>{charge.date}</TableCell>
              <TableCell>
                <p
                  className={clsx('', {
                    'text-teal-600': charge.status.toLowerCase() === 'paid',
                    'text-orange-600': charge.status.toLowerCase() === 'pending',
                    'text-red-600': charge.status.toLowerCase() === 'failed',
                  })}
                >
                  {charge.status.toUpperCase()}
                </p>
              </TableCell>
              <TableCell className="text-right">{charge.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default page;
