import { CrispProvider } from '@/providers/crisp-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <CrispProvider />
      {children}
    </ClerkProvider>
  );
};

export default Layout;
