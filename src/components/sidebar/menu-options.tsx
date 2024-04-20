'use client';

import { icons } from '@/lib/constants';
import { useModal } from '@/providers/modal-provider';
import { Agency, AgencySidebarOption, SubAccount, SubAccountSidebarOption } from '@prisma/client';
import clsx from 'clsx';
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet';

import SubAccountDetails from '../forms/subaccount-details';
import CustomModal from '../global/custom-modal';

type MenuOptionsProps = {
  defaultOpen?: boolean;
  subAccounts: SubAccount[];
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[];
  sidebarLogo: string;
  details: any;
  user: any;
  id: string;
  subAccountData?: SubAccount[];
  subscription?: boolean;
  addOns?: boolean;
};

const MenuOptions = ({
  defaultOpen,
  subAccounts,
  sidebarOpt,
  sidebarLogo,
  details,
  user,
  id,
  subAccountData,
  subscription,
  addOns,
}: MenuOptionsProps) => {
  const { setOpen } = useModal();
  const pathname = usePathname();

  let str = 'all-';

  const [isMounted, setIsMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openState = useMemo(() => (defaultOpen ? { open: true } : {}), [defaultOpen]);

  const checkSubscriptionStatus =
    (subAccountData!.length >= 3 && !subscription) || (subAccountData!.length >= 3 && !addOns);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return;

  return (
    <Sheet modal={false} open={menuOpen} onOpenChange={setMenuOpen} {...openState}>
      <SheetTrigger asChild className="absolute left-4 top-4 z-[100] md:!hidden flex">
        <Button variant="outline" size={'icon'}>
          <Menu />
        </Button>
      </SheetTrigger>

      <SheetContent
        showX={!defaultOpen}
        side={'left'}
        className={clsx('bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6', {
          'hidden md:inline-block z-0 w-[300px]': defaultOpen,
          'inline-block md:hidden z-[100] w-full overflow-auto': !defaultOpen,
        })}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="Sidebar Logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full my-4 flex items-center justify-between py-8"
                variant="ghost"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">{details.address}</span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts..." />
                <CommandList className="pb-16">
                  <CommandEmpty>No Results Found</CommandEmpty>
                  {(user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') &&
                    user?.Agency && (
                      <CommandGroup heading="Agency">
                        <CommandItem className="!bg-transparent my-2 text-primary broder-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="Agency Logo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1 text-black dark:text-white">
                                {user?.Agency?.name}
                                <span className="text-muted-foreground">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="Agency Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1 text-black dark:text-white">
                                  {user?.Agency?.name}
                                  <span className="text-muted-foreground">
                                    {user?.Agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  <CommandGroup heading="Accounts">
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                          <CommandItem
                            className="!bg-transparent my-2 broder-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all"
                            key={subaccount.id}
                          >
                            {defaultOpen ? (
                              <Link
                                href={`/subaccount/${subaccount.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subaccount.subAccountLogo}
                                    alt="sub account Logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1 text-black dark:text-white">
                                  {subaccount.name}
                                  <span className="text-muted-foreground">
                                    {subaccount.address}
                                  </span>
                                </div>
                              </Link>
                            ) : (
                              <SheetClose asChild>
                                <Link
                                  href={`/subaccount/${subaccount.id}`}
                                  className="flex gap-4 w-full h-full"
                                >
                                  <div className="relative w-16">
                                    <Image
                                      src={subaccount.subAccountLogo}
                                      alt="sub account Logo"
                                      fill
                                      className="rounded-md object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    {subaccount.name}
                                    <span className="text-muted-foreground">
                                      {subaccount.address}
                                    </span>
                                  </div>
                                </Link>
                              </SheetClose>
                            )}
                          </CommandItem>
                        ))
                      : 'No Accounts'}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2 text-white"
                      disabled={checkSubscriptionStatus}
                      onClick={() => {
                        setOpen(
                          <CustomModal
                            title="Create a Sub Account"
                            subheading="You can switch between your agency account and the sub account from the sidebar"
                          >
                            <SubAccountDetails
                              agencyDetails={user?.Agency as Agency}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>,
                        );
                      }}
                    >
                      <PlusCircleIcon size={15} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
                {checkSubscriptionStatus ? (
                  <p className="text-xs text-muted-foreground mt-1">
                    You have reached the limit. Consider upgrade your subscription.
                  </p>
                ) : null}
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs mb-2">MENU LINKS</p>
          <Separator className="mb-4" />
          <nav className="relative">
            <Command className="rounded-lg overflow-visible bg-transparent">
              <CommandInput placeholder="Search..." />
              <CommandList className="py-2 overflow-visible">
                <CommandEmpty>No Results Found</CommandEmpty>
                <CommandGroup className="overflow-visible">
                  {sidebarOpt.map((option) => {
                    let val;
                    const result = icons.find((icon) => icon.value === option.icon);
                    if (result) {
                      val = <result.path />;
                    }
                    return (
                      <CommandItem
                        key={option.id}
                        className={clsx(
                          'md:w-[320px] w-full mb-2 ',
                          pathname.split('/').includes(option.name.toLocaleLowerCase()) ||
                            pathname
                              .split('/')
                              .includes(
                                str.concat(option.name.split(' ').join('').toLocaleLowerCase()),
                              ) ||
                            pathname === option.link
                            ? 'bg-primary font-bold text-white'
                            : '',
                        )}
                      >
                        <Link
                          href={option.link}
                          className={clsx(
                            'flex items-center gap-2 hover:bg-transparent rounded-md transition-all md:w-full w-[320px]',
                            pathname.split('/').includes(option.name.toLocaleLowerCase()) ||
                              pathname
                                .split('/')
                                .includes(
                                  str.concat(option.name.split(' ').join('').toLocaleLowerCase()),
                                ) ||
                              pathname === option.link
                              ? 'pointer-events-none'
                              : '',
                          )}
                          onClick={() => !defaultOpen && setMenuOpen(false)}
                        >
                          {val}
                          <span>{option.name}</span>
                        </Link>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MenuOptions;
