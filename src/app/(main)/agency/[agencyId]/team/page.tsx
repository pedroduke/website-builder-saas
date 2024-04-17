import { db } from '@/lib/db';
import { currentUser } from '@clerk/nextjs';
import { Plus } from 'lucide-react';

import SendInvitation from '@/components/forms/send-invitation';

import { columns } from './columns';
import DataTable from './data-table';

type TeamPageProps = {
  params: {
    agencyId: string;
  };
};

const TeamPage = async ({ params }: TeamPageProps) => {
  const authUser = await currentUser();

  const teamMembers = await db.user.findMany({
    where: {
      Agency: {
        id: params.agencyId,
      },
    },
    include: {
      Agency: {
        include: {
          SubAccount: true,
          Subscription: true,
          AddOns: true,
        },
      },
      Permissions: {
        include: {
          SubAccount: true,
        },
      },
    },
  });

  if (!authUser) return;

  const agencyDetails = await db.agency.findUnique({
    where: {
      id: params.agencyId,
    },
    include: {
      SubAccount: true,
      Subscription: true,
      AddOns: true,
    },
  });

  if (!agencyDetails) return;

  return (
    <DataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Add
        </>
      }
      modalChildren={<SendInvitation agencyId={agencyDetails.id} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
      teamMembersData={teamMembers}
      subscription={!!agencyDetails.Subscription}
      addOns={!!agencyDetails.Subscription}
    ></DataTable>
  );
};

export default TeamPage;
