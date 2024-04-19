'use client';

import { PricesList } from '@/lib/types';
import { useModal } from '@/providers/modal-provider';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

import CancelAddOnForm from '@/components/forms/subscription-form/cancel-addon-form';
import CancelSubscriptionForm from '@/components/forms/subscription-form/cancel-subscription-form';
import SubscriptionFormWrapper from '@/components/forms/subscription-form/subscription-form-wrapper';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type PricingCardProps = {
  features: string[];
  buttonCta: string;
  title: string;
  description: string;
  amt: string;
  duration: string;
  highlightTitle: string;
  highlightDescription: string;
  customerId: string;
  prices: PricesList['data'];
  planExists: boolean;
  priceId?: string;
  addOnIsSubscribed?: boolean;
  addOnIsCanceled?: boolean;
  addOnCurrentPeriodEndDate?: Date | null;
  subscriptionIsSubscribed?: boolean;
  subscriptionIsCanceled?: boolean;
  subscriptionCurrentPeriodEndDate?: Date | null;
  subscriptionStatus?: string;
  addOnStatus?: string;
};

const PricingCard = ({
  amt,
  buttonCta,
  customerId,
  description,
  duration,
  features,
  highlightDescription,
  highlightTitle,
  planExists,
  prices,
  title,
  priceId,
  addOnIsSubscribed,
  addOnIsCanceled,
  addOnCurrentPeriodEndDate,
  subscriptionIsSubscribed,
  subscriptionIsCanceled,
  subscriptionCurrentPeriodEndDate,
  subscriptionStatus,
  addOnStatus,
}: PricingCardProps) => {
  const { setOpen } = useModal();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const handleManagePlan = async () => {
    setOpen(
      <CustomModal
        title={'Manage Your Plan'}
        subheading="You can change your plan at any time from the billings settings"
      >
        <SubscriptionFormWrapper
          priceId={priceId}
          customerId={customerId}
          planExists={planExists}
          subscriptionStatus={subscriptionStatus}
          addOnStatus={addOnStatus}
        />
      </CustomModal>,

      async () => ({
        plans: {
          defaultPriceId: plan ? plan : '',
          plans: prices,
        },
      }),
    );
  };

  const handleCancelPlan = async () => {
    setOpen(
      <CustomModal
        title={'Cancel Subscription'}
        subheading="Are you sure you want to cancel the Subscription?"
      >
        <CancelSubscriptionForm customerId={customerId} planExists={planExists} />
      </CustomModal>,

      async () => ({
        plans: {
          defaultPriceId: plan ? plan : '',
          plans: prices,
        },
      }),
    );
  };

  const handleCancelAddOn = async () => {
    setOpen(
      <CustomModal title={'Cancel AddOn'} subheading="Are you sure you want to cancel the AddOn?">
        <CancelAddOnForm customerId={customerId} planExists={planExists} />
      </CustomModal>,

      async () => ({
        plans: {
          defaultPriceId: plan ? plan : '',
          plans: prices,
        },
      }),
    );
  };

  return (
    <Card
      className={clsx('flex flex-col justify-between lg:w-1/2', {
        'border border-primary': subscriptionIsSubscribed || addOnIsSubscribed,
      })}
    >
      <div>
        <CardHeader className="flex flex-col md:!flex-row justify-between">
          <div>
            <CardTitle className="mb-2">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <p className="text-6xl font-bold md:ml-2">
            {amt}
            <span className="text-xs font-light text-muted-foreground">{duration}</span>
          </p>
        </CardHeader>
        <CardContent>
          <ul>
            {features.map((feature) => (
              <li key={feature} className="list-disc ml-4 text-muted-foreground">
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </div>
      <CardFooter>
        <Card className="w-full">
          <div className="rounded-lg border gap-4 p-4">
            <div>
              <p className="mb-1">{highlightTitle}</p>
              <p className="text-sm text-muted-foreground">{highlightDescription}</p>
            </div>

            <Button
              disabled={buttonCta === 'Subscribe' && !addOnIsCanceled && addOnIsSubscribed}
              className="md:w-fit w-full text-white mt-4 mb-2"
              onClick={handleManagePlan}
            >
              {buttonCta}
            </Button>

            {subscriptionIsSubscribed ? (
              subscriptionIsCanceled ? null : (
                <Button
                  className="md:w-fit md:ml-2 w-full bg-destructive hover:bg-red-600 text-white mb-2"
                  onClick={handleCancelPlan}
                >
                  {'Cancel Plan'}
                </Button>
              )
            ) : null}

            {addOnIsSubscribed ? (
              addOnIsCanceled ? null : (
                <Button
                  className="md:w-fit md:ml-2 w-full bg-destructive hover:bg-red-600 text-white mb-2"
                  onClick={handleCancelAddOn}
                >
                  {'Cancel AddOn'}
                </Button>
              )
            ) : null}

            {addOnIsSubscribed ? (
              <p className="rounded-full text-xs font-medium text-muted-foreground">
                {addOnIsCanceled ? 'Your plan will be canceled on ' : 'Your plan renews on '}
                {format(addOnCurrentPeriodEndDate!, 'dd.MM.yyyy')}.
              </p>
            ) : null}

            {subscriptionIsSubscribed ? (
              <p className="rounded-full text-xs font-medium text-muted-foreground">
                {subscriptionIsCanceled ? 'Your plan will be canceled on ' : 'Your plan renews on '}
                {format(subscriptionCurrentPeriodEndDate!, 'dd.MM.yyyy')}.
              </p>
            ) : null}
          </div>
        </Card>
      </CardFooter>
    </Card>
  );
};

export default PricingCard;
