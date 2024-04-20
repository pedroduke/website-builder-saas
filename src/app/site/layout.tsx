import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

import Navigation from '@/components/site/navigation';
import StickyBar from '@/components/site/sticky-bar';

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <main className="h-full md:h-min">
        <nav className="mb-20">
          <StickyBar />
          <Navigation />
        </nav>
        {children}
      </main>
    </ClerkProvider>
  );
};

export default layout;
