'use client';

import {
  deleteFunnelePage,
  getFunnels,
  saveActivityLogsNotification,
  upsertFunnelPage,
} from '@/lib/queries';
import { FunnelPageSchema } from '@/lib/types';
import { useModal } from '@/providers/modal-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { FunnelPage } from '@prisma/client';
import { CopyPlusIcon, Loader2, Trash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import { z } from 'zod';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';

interface CreateFunnelPageProps {
  defaultData?: FunnelPage;
  funnelId: string;
  order: number;
  subaccountId: string;
}

const CreateFunnelPage: React.FC<CreateFunnelPageProps> = ({
  defaultData,
  funnelId,
  order,
  subaccountId,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCopy, setIsLoadingCopy] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { setClose } = useModal();

  const form = useForm<z.infer<typeof FunnelPageSchema>>({
    resolver: zodResolver(FunnelPageSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      pathName: '',
    },
  });

  useEffect(() => {
    if (defaultData) {
      form.reset({ name: defaultData.name, pathName: defaultData.pathName });
    }
  }, [defaultData]);

  const onSubmit = async (values: z.infer<typeof FunnelPageSchema>) => {
    if (order !== 0 && !values.pathName)
      return form.setError('pathName', {
        message:
          "Pages other than the first page in the funnel require a path name example 'secondstep'.",
      });
    try {
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...values,
          id: defaultData?.id || v4(),
          order: defaultData?.order || order,
          pathName: values.pathName || '',
        },
        funnelId,
      );

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a funnel page | ${response?.name}`,
        subaccountId: subaccountId,
      });

      toast({
        title: 'Success',
        description: 'Saves Funnel Page Details',
      });

      setClose();
      router.refresh();
    } catch (error) {
      console.log(error);

      toast({
        variant: 'destructive',
        title: 'Oopps!',
        description: 'Could Save Funnel Page Details',
      });
      setClose();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Page</CardTitle>
        <CardDescription>
          Funnel pages are flow in the order they are created by default. You can move them around
          to change their order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting || order === 0}
              control={form.control}
              name="pathName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Path Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Path for the page"
                      {...field}
                      value={field.value?.toLowerCase()}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Button
                className="w-22 self-end text-white"
                disabled={form.formState.isSubmitting}
                type="submit"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Page...
                  </>
                ) : (
                  'Save Page'
                )}
              </Button>

              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  className="w-22 self-end border-destructive text-destructive hover:bg-destructive hover:text-white"
                  disabled={isLoading}
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);

                    const response = await deleteFunnelePage(defaultData.id);

                    await saveActivityLogsNotification({
                      agencyId: undefined,
                      description: `Deleted a funnel page | ${response?.name}`,
                      subaccountId: subaccountId,
                    });

                    toast({
                      title: 'Success',
                      description: 'Deleted the funnel page',
                    });
                    setIsLoading(false);
                    router.refresh();
                  }}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash size={20} />}
                </Button>
              )}
              {defaultData?.id && (
                <Button
                  variant={'outline'}
                  size={'icon'}
                  disabled={isLoadingCopy}
                  type="button"
                  onClick={async () => {
                    setIsLoadingCopy(true);
                    const response = await getFunnels(subaccountId);
                    const lastFunnelPage = response.find((funnel) => funnel.id === funnelId)
                      ?.FunnelPages.length;

                    await upsertFunnelPage(
                      subaccountId,
                      {
                        ...defaultData,
                        id: v4(),
                        order: lastFunnelPage ? lastFunnelPage : 0,
                        visits: 0,
                        name: `${defaultData.name} Copy`,
                        pathName: `${defaultData.pathName}copy`,
                        content: defaultData.content,
                      },
                      funnelId,
                    );

                    toast({
                      title: 'Success',
                      description: 'Saved Funnel Page Details',
                    });

                    setIsLoadingCopy(false);
                    router.refresh();
                  }}
                >
                  {isLoadingCopy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CopyPlusIcon size={20} />
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateFunnelPage;
