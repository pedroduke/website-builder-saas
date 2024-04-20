'use client';

import { useModal } from '@/providers/modal-provider';

import ContactUserForm from '@/components/forms/contact-user-form';
import CustomModal from '@/components/global/custom-modal';
import { Button } from '@/components/ui/button';

type CreateContactButtonProps = {
  subaccountId: string;
};

const CreateContactButton = ({ subaccountId }: CreateContactButtonProps) => {
  const { setOpen } = useModal();

  const handleCreateContact = async () => {
    setOpen(
      <CustomModal
        title="Create or Update Contact Information"
        subheading="Contacts are like customers."
      >
        <ContactUserForm subaccountId={subaccountId} />
      </CustomModal>,
    );
  };

  return (
    <Button className="text-white" onClick={handleCreateContact}>
      Create Contact
    </Button>
  );
};

export default CreateContactButton;
