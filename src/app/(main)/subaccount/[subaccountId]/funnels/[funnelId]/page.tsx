import { getFunnel } from '@/lib/queries';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import FunnelSettings from './_components/funnel-settings';
import FunnelSteps from './_components/funnel-steps';

type FunnelPageProps = {
  params: {
    funnelId: string;
    subaccountId: string;
  };
};

const FunnelPage = async ({ params }: FunnelPageProps) => {
  const funnelPages = await getFunnel(params.funnelId);

  if (!funnelPages) {
    return redirect(`/subaccount/${params.subaccountId}/funnels`);
  }

  return (
    <>
      <Link
        href={`/subaccount/${params.subaccountId}/funnels`}
        className="flex items-center gap-2 mb-4 text-muted-foreground"
      >
        <ArrowLeft size={15} />
        Back
      </Link>
      <h1 className="text-3xl mb-8">{funnelPages.name}</h1>
      <Tabs defaultValue="steps" className="w-full">
        <TabsList className="grid  grid-cols-2 w-[50%] bg-transparent ">
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="steps">
          <FunnelSteps
            funnel={funnelPages}
            subaccountId={params.subaccountId}
            pages={funnelPages.FunnelPages}
            funnelId={params.funnelId}
          />
        </TabsContent>
        <TabsContent value="settings">
          <FunnelSettings subaccountId={params.subaccountId} defaultData={funnelPages} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default FunnelPage;
