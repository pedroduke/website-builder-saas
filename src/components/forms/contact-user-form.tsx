'use client';

import { saveActivityLogsNotification, upsertContact } from '@/lib/queries';
import { ContactUserFormSchema } from '@/lib/types';
import { useModal } from '@/providers/modal-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from '../ui/use-toast';

interface ContactUserFormProps {
  subaccountId: string;
}

const ContactUserForm: React.FC<ContactUserFormProps> = ({ subaccountId }) => {
  const { setClose, data } = useModal();
  const router = useRouter();

  const form = useForm<z.infer<typeof ContactUserFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(ContactUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (data.contact) {
      form.reset(data.contact);
    }
  }, [data, form.reset]);

  const isLoading = form.formState.isLoading;

  const handleSubmit = async (values: z.infer<typeof ContactUserFormSchema>) => {
    try {
      const response = await upsertContact({
        email: values.email,
        subAccountId: subaccountId,
        name: values.name,
      });

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a contact | ${response?.name}`,
        subaccountId: subaccountId,
      });

      toast({
        title: 'Success',
        description: 'Saved contact details',
      });

      setClose();
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oopps!',
        description: 'Could not save contact details',
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contact Info</CardTitle>
        <CardDescription>
          You can assign tickets to contacts and set a value for each contact in the ticket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="mt-4 text-white" disabled={isLoading} type="submit">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Contact Details...
                </>
              ) : (
                'Save Contact Details'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContactUserForm;
