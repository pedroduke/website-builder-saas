import { getNotificationAndUser, verifyAndAcceptInvitation } from '@/lib/queries';
import { checkAddOn } from '@/lib/stripe';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

import BlurPage from '@/components/global/blur-page';
import InfoBar from '@/components/global/infobar';
import Sidebar from '@/components/sidebar';

import UnauthorizedPage from '../unauthorized/page';

type Props = {
  children: React.ReactNode;
  params: {
    agencyId: string;
  };
};

const layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();

  if (!user) {
    return redirect('/');
  }

  if (!agencyId) {
    return redirect('/agency');
  }

  if (
    user.privateMetadata.role !== 'AGENCY_OWNER' &&
    user.privateMetadata.role !== 'AGENCY_ADMIN'
  ) {
    return <UnauthorizedPage />;
  }

  let allNotifications: any = [];

  const notifications = await getNotificationAndUser(agencyId);

  if (notifications) allNotifications = notifications;

  const { addOnIsSubscribed } = await checkAddOn();

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={params.agencyId} type="agency" />
      <div className="md:pl-[300px]">
        <InfoBar notifications={allNotifications} addOnIsSubscribed={addOnIsSubscribed} />
        <div className="relative">
          <BlurPage>{children}</BlurPage>
        </div>
      </div>
    </div>
  );
};

export default layout;
