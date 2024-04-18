import BlurPage from '@/components/global/blur-page';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <BlurPage>{children}</BlurPage>;
};

export default Layout;
