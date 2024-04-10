'use client';

import { useModal } from '@/providers/modal-provider';
import { DialogDescription } from '@radix-ui/react-dialog';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';

type CustomModalProps = {
  title: string;
  subheading: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const CustomModal = ({ children, defaultOpen, subheading, title }: CustomModalProps) => {
  const { isOpen, setClose } = useModal();
  return (
    <Dialog open={isOpen || defaultOpen} onOpenChange={setClose}>
      <DialogContent className="md:max-h-[700px] md:h-5/6 h-screen bg-card">
        <ScrollArea>
          <DialogHeader className="pt-8 text-left mb-4">
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            <DialogDescription>{subheading}</DialogDescription>
          </DialogHeader>
          {children}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
