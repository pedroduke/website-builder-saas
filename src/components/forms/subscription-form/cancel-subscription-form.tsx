'use client';

import { useModal } from '@/providers/modal-provider';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

type Props = {
  customerId: string;
  planExists: boolean;
};

const CancelSubscriptionForm = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal();

  const router = useRouter();

  const handleCancelingSubscription = () => {
    if (!planExists) return;
    const cancelSubscritpion = async () => {
      const subscriptionResponse = await fetch('/api/stripe/cancel-subscription', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
        }),
      });

      toast({
        title: 'Success',
        description: 'Canceled your subscriptions',
      });

      setClose();
      router.refresh();
    };
    cancelSubscritpion();
  };
  return (
    <div className="flex justify-end">
      {planExists && (
        <Button
          onClick={handleCancelingSubscription}
          className="bg-destructive hover:bg-red-600 text-white ml-2"
        >
          Cancel Subscription
        </Button>
      )}
    </div>
  );
};

export default CancelSubscriptionForm;
