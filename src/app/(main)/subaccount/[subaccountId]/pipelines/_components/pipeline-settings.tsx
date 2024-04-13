'use client';

import { deletePipeline, saveActivityLogsNotification } from '@/lib/queries';
import { Pipeline } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';

import CreatePipelineForm from '@/components/forms/create-pipeline-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

type PipelineSettingsProps = {
  pipelineId: string;
  subaccountId: string;
  pipelines: Pipeline[];
};

const PipelineSettings = ({ pipelineId, subaccountId, pipelines }: PipelineSettingsProps) => {
  const router = useRouter();

  return (
    <AlertDialog>
      <div>
        <div className="flex items-center justify-end mb-4">
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Pipeline</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="items-center">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-red-600 text-white"
                onClick={async () => {
                  try {
                    const response = await deletePipeline(pipelineId);

                    await saveActivityLogsNotification({
                      agencyId: undefined,
                      description: `Deleted a Pipeline | ${response?.name}`,
                      subaccountId,
                    });

                    toast({
                      title: 'Deleted',
                      description: 'Pipeline is deleted',
                    });

                    router.replace(`/subaccount/${subaccountId}/pipelines`);
                  } catch (error) {
                    toast({
                      variant: 'destructive',
                      title: 'Oopps!',
                      description: 'Could not Delete Pipeline',
                    });
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </div>
        <CreatePipelineForm
          subAccountId={subaccountId}
          defaultData={pipelines.find((p) => p.id === pipelineId)}
        />
      </div>
    </AlertDialog>
  );
};

export default PipelineSettings;
