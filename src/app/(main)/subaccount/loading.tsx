import { Loader2 } from 'lucide-react';
import React from 'react';

const LoadingAgencyPage = () => {
  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <Loader2 className="h-10 w-10 animate-spin" />
    </div>
  );
};

export default LoadingAgencyPage;
