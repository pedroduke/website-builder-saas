import { getFunnels } from '@/lib/queries';
import { Plus } from 'lucide-react';
import React from 'react';

import FunnelForm from '@/components/forms/funnel-form';

import { columns } from './columns';
import FunnelsDataTable from './data-table';

const Funnels = async ({ params }: { params: { subaccountId: string } }) => {
  const funnels = await getFunnels(params.subaccountId);
  if (!funnels) return null;

  return (
    <FunnelsDataTable
      actionButtonText={
        <>
          <Plus size={15} />
          Create Funnel
        </>
      }
      modalChildren={<FunnelForm subAccountId={params.subaccountId} />}
      filterValue="name"
      columns={columns}
      data={funnels}
    />
  );
};

export default Funnels;
