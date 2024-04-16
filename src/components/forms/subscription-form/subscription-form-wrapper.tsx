'use client';

import { addOnProducts, pricingCards } from '@/lib/constants';
import { getStripe } from '@/lib/stripe/stripe-client';
import { useModal } from '@/providers/modal-provider';
import { Plan } from '@prisma/client';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementsOptions } from '@stripe/stripe-js';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

import SubscriptionForm from '.';

type Props = {
  customerId: string;
  planExists: boolean;
  priceId?: string;
  subscriptionStatus?: string;
  addOnStatus?: string;
};

const SubscriptionFormWrapper = ({
  priceId,
  customerId,
  planExists,
  subscriptionStatus,
  addOnStatus,
}: Props) => {
  const { data, setClose } = useModal();
  const router = useRouter();
  const checkStatus = (!planExists && subscriptionStatus !== 'active') || addOnStatus !== 'active';

  const [selectedPriceId, setSelectedPriceId] = useState<Plan | string | ''>(
    data?.plans?.defaultPriceId || '',
  );

  const [subscription, setSubscription] = useState<{
    subscriptionId: string;
    clientSecret: string;
  }>({ subscriptionId: '', clientSecret: '' });

  const options: StripeElementsOptions = useMemo(
    () => ({
      clientSecret: subscription?.clientSecret,
      appearance: {
        theme: 'flat',
        variables: {
          fontFamily: ' "Gill Sans", sans-serif',
          fontLineHeight: '1.5',
          borderRadius: '10px',
          colorBackground: '#F6F8FA',
          accessibleColorOnColorPrimary: '#262626',
        },
        rules: {
          '.Block': {
            backgroundColor: 'var(--colorBackground)',
            boxShadow: 'none',
            padding: '12px',
          },
          '.Input': {
            padding: '12px',
          },
          '.Input:disabled, .Input--invalid:disabled': {
            color: 'lightgray',
          },
          '.Tab': {
            padding: '10px 12px 8px 12px',
            border: 'none',
          },
          '.Tab:hover': {
            border: 'none',
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)',
          },
          '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
            border: 'none',
            backgroundColor: '#fff',
            boxShadow:
              '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)',
          },
          '.Label': {
            fontWeight: '500',
          },
        },
      },
    }),
    [subscription],
  );

  useEffect(() => {
    if (!selectedPriceId) return;

    const createSecret = async () => {
      const subscriptionResponse = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId: selectedPriceId,
        }),
      });

      const subscriptionResponseData = await subscriptionResponse.json();

      setSubscription({
        clientSecret: subscriptionResponseData.clientSecret,
        subscriptionId: subscriptionResponseData.subscriptionId,
      });

      if (planExists && subscriptionStatus === 'active') {
        toast({
          title: 'Success',
          description: 'Your plan has been successfully upgraded!',
        });

        setClose();
        router.refresh();
      }
    };

    const createSecretAddOn = async () => {
      const addOnResponse = await fetch('/api/stripe/create-addon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId: selectedPriceId,
        }),
      });

      const addOnResponseData = await addOnResponse.json();

      setSubscription({
        clientSecret: addOnResponseData.clientSecret,
        subscriptionId: addOnResponseData.subscriptionId,
      });

      if (planExists && addOnStatus === 'active') {
        toast({
          title: 'Success',
          description: 'Your plan has been successfully upgraded!',
        });

        setClose();
        router.refresh();
      }
    };

    if (priceId === addOnProducts[0].priceId) {
      createSecretAddOn();
    } else {
      createSecret();
    }
  }, [data, selectedPriceId, customerId]);

  return (
    <div className="border-none transition-all">
      <div className="flex flex-col gap-4">
        {data.plans?.plans.map((price) => (
          <Card
            onClick={() => setSelectedPriceId(price.id as string)}
            key={price.id}
            className={clsx('relative cursor-pointer transition-all hover:border-primary/60', {
              'border-primary': selectedPriceId === price.id,
            })}
          >
            <CardHeader>
              <CardTitle>
                ${price.unit_amount ? price.unit_amount / 100 : '0'}
                <p className="text-sm text-muted-foreground mt-2">
                  {price.nickname || addOnProducts[0].title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pricingCards.find((p) => p.priceId === price.id)?.description ||
                    addOnProducts[0].description}
                </p>
              </CardTitle>
            </CardHeader>
            {selectedPriceId === price.id && (
              <div className="w-2 h-2 bg-teal-600 rounded-full absolute top-4 right-4" />
            )}
          </Card>
        ))}

        {options.clientSecret && checkStatus && (
          <div className="m-2">
            <h1 className="text-xl mb-2">Payment Method</h1>
            <Elements stripe={getStripe()} options={options}>
              <SubscriptionForm selectedPriceId={selectedPriceId} />
            </Elements>
          </div>
        )}

        {!options.clientSecret && selectedPriceId && (
          <div className="flex items-center justify-center w-full h-40">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionFormWrapper;
