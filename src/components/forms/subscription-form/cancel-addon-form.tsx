'use client';

import { useModal } from '@/providers/modal-provider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

type Props = {
  customerId: string;
  planExists: boolean;
};

const CancelAddOnForm = ({ customerId, planExists }: Props) => {
  const { data, setClose } = useModal();

  const router = useRouter();

  const handleCancelingAddOn = () => {
    if (!planExists) return;
    const cancelAddOn = async () => {
      const subscriptionResponse = await fetch('/api/stripe/cancel-addon', {
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
        description: 'Canceled your addOn',
      });

      setClose();
      router.refresh();
    };
    cancelAddOn();
  };

  return (
    <div className="flex justify-end">
      {planExists && (
        <Button
          onClick={handleCancelingAddOn}
          className="bg-destructive hover:bg-red-600 text-white ml-2"
        >
          Cancel AddOn
        </Button>
      )}
    </div>
  );
};

export default CancelAddOnForm;
