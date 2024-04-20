'use client';

import { useModal } from '@/providers/modal-provider';
import { Agency, AgencySidebarOption, SubAccount, User } from '@prisma/client';
import { PlusCircleIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import SubAccountDetails from '@/components/forms/subaccount-details';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';

type CreateSubAccountButtonProps = {
  user: User & {
    Agency:
      | (
          | Agency
          | (null & {
              SubAccount: SubAccount[];
              SideBarOption: AgencySidebarOption[];
            })
        )
      | null;
  };
  id: string;
  className: string;
  subAccountData?: SubAccount[];
  subscription?: boolean;
  addOns?: boolean;
};

const CreateSubAccountButton = ({
  className,
  id,
  user,
  subAccountData,
  subscription,
  addOns,
}: CreateSubAccountButtonProps) => {
  const { setOpen } = useModal();
  const agencyDetails = user.Agency;

  if (!agencyDetails) return;

  if (!subAccountData) return;

  const checkSubscriptionStatus =
    (subAccountData.length >= 3 && !subscription) || (subAccountData.length >= 3 && !addOns);

  return (
    <>
      <Button
        disabled={checkSubscriptionStatus}
        className={twMerge('w-full flex gap-4', className)}
        onClick={() => {
          setOpen(
            <CustomModal
              title="Create a Sub Account"
              subheading="You can switch between your agency account and the sub account from the sidebar"
            >
              <SubAccountDetails
                agencyDetails={agencyDetails}
                userId={user.id}
                userName={user.name}
              />
            </CustomModal>,
          );
        }}
      >
        <PlusCircleIcon size={15} />
        Create Sub Account
      </Button>
      {checkSubscriptionStatus ? (
        <p className="text-xs text-muted-foreground mb-2 flex justify-end">
          You have reached the limit. Consider upgrade your subscription.
        </p>
      ) : null}
    </>
  );
};

export default CreateSubAccountButton;
