import { getAuthUserDetails } from '@/lib/queries';

import MenuOptions from './menu-options';

type SidebarProps = {
  id: string;
  type: 'agency' | 'subaccount';
};

const Sidebar = async ({ id, type }: SidebarProps) => {
  const user = await getAuthUserDetails();

  if (!user) return;

  if (!user.Agency) return;

  const details =
    type === 'agency'
      ? user?.Agency
      : user?.Agency.SubAccount.find((subaccount) => subaccount.id === id);

  const isWhiteLabeledAgency = user.Agency.whiteLabel;

  if (!details) return;

  let sidebarLogo = user.Agency.agencyLogo || '/assets/auro-logo.png';

  if (!isWhiteLabeledAgency) {
    if (type === 'subaccount') {
      sidebarLogo =
        user?.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.subAccountLogo ||
        user.Agency.agencyLogo;
    }
  }

  const sidebarOpt =
    type === 'agency'
      ? user.Agency.SidebarOption || []
      : user.Agency.SubAccount.find((subaccount) => subaccount.id === id)?.SidebarOption || [];

  const subacounts = user.Agency.SubAccount.filter((subaccount) =>
    user.Permissions.find((permission) => subaccount.id && permission.access),
  );

  return (
    <>
      <MenuOptions
        defaultOpen={true}
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subacounts}
        user={user}
      />
      <MenuOptions
        details={details}
        id={id}
        sidebarLogo={sidebarLogo}
        sidebarOpt={sidebarOpt}
        subAccounts={subacounts}
        user={user}
      />
    </>
  );
};

export default Sidebar;
