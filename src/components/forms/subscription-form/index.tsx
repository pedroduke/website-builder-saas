'use client';

import { Plan } from '@prisma/client';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

type Props = {
  selectedPriceId: string | Plan;
};

const SubscriptionForm = ({ selectedPriceId }: Props) => {
  const { toast } = useToast();
  const elements = useElements();
  const stripeHook = useStripe();
  const [priceError, setPriceError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    if (!selectedPriceId) {
      setPriceError('You need to select a plan to subscribe.');
      return;
    }

    setPriceError('');
    event.preventDefault();

    if (!stripeHook || !elements) return;

    try {
      setIsLoading(true);
      const { error } = await stripeHook.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_URL}/agency`,
        },
      });

      if (error) {
        throw new Error();
      }

      toast({
        title: 'Payment successfull',
        description: 'Your payment has been successfully processed. ',
      });

      setIsLoading(false);
    } catch (error) {
      console.log(error);

      toast({
        variant: 'destructive',
        title: 'Payment failed',
        description: 'We couldnt process your payment. Please try a different card',
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <small className="text-destructive">{priceError}</small>
      <PaymentElement />
      <Button disabled={!stripeHook} className="mt-4 w-full text-white">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submiting...
          </>
        ) : (
          'Submit'
        )}
      </Button>
    </form>
  );
};
export default SubscriptionForm;
