'use client';

import { Crisp } from 'crisp-sdk-web';
import { useEffect } from 'react';

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure('aeaf671c-9ab6-42cc-bd2b-dc2c832bfd41');
  }, []);

  return null;
};
