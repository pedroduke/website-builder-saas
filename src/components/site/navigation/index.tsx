'use client';

import { UserButton, useAuth } from '@clerk/nextjs';
import { User } from '@clerk/nextjs/server';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';

import { ModeToggle } from '@/components/global/mode-toggle';

type NavigationProps = {
  user?: null | User;
};

const Navigation = ({ user }: NavigationProps) => {
  const { isSignedIn } = useAuth();

  return (
    <div className="sticky inset-x-0 top-0 right-0 left-0 p-4 flex items-center justify-between z-30 bg-background/80 backdrop-blur-md">
      <aside className="flex items-center gap-2">
        <Image src={'/assets/aura-logo.png'} width={40} height={40} alt="aura logo" />
        <span className="text-xl font-bold">Aura.</span>
      </aside>
      <nav className="hidden md:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <Link href={'#'} className="">
            Pricing
          </Link>
          <Link href={'#'} className="">
            About
          </Link>
          <Link href={'#'} className="">
            Documentation
          </Link>
          <Link href={'#'} className="">
            Features
          </Link>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link
          href={isSignedIn ? '/agency' : '/agency/sign-in'}
          className={clsx('bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80', {
            'bg-transparent hover:bg-transparent/10 !text-black dark:!text-white': isSignedIn,
          })}
        >
          {isSignedIn ? 'Dashboard' : 'Login'}
        </Link>
        <UserButton afterSignOutUrl="/" />
        <ModeToggle />
      </aside>
    </div>
  );
};

export default Navigation;
