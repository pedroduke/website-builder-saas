'use client';

import {
  deleteSubAccount,
  getSubAccountDetails,
  saveActivityLogsNotification,
} from '@/lib/queries';
import { useRouter } from 'next/navigation';

type DeleteButtonProps = {
  subaccountId: string;
};

const DeleteButton = ({ subaccountId }: DeleteButtonProps) => {
  const router = useRouter();

  return (
    <div
      className="text-white"
      onClick={async () => {
        const response = await getSubAccountDetails(subaccountId);
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Deleted a Sub Account | ${response?.name}`,
          subaccountId,
        });
        await deleteSubAccount(subaccountId);
        router.refresh();
      }}
    >
      Delete Sub Account
    </div>
  );
};

export default DeleteButton;
