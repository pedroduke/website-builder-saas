'use client';

import { useModal } from '@/providers/modal-provider';

import { Button } from '@/components/ui/button';

import UploadMediaForm from '../forms/upload-media';
import CustomModal from '../global/custom-modal';

type MediaUploadButtonProps = {
  subaccountId: string;
};

const MediaUploadButton = ({ subaccountId }: MediaUploadButtonProps) => {
  const { isOpen, setOpen, setClose } = useModal();

  return (
    <Button
      className="text-white"
      onClick={() => {
        setOpen(
          <CustomModal title="Upload Media" subheading="Upload a file to your media bucket">
            <UploadMediaForm subaccountId={subaccountId} />
          </CustomModal>,
        );
      }}
    >
      Upload
    </Button>
  );
};

export default MediaUploadButton;
