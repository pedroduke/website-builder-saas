'use client';

import { saveActivityLogsNotification, upsertFunnelPage } from '@/lib/queries';
import { DeviceTypes, useEditor } from '@/providers/editor/editor-provider';
import { FunnelPage } from '@prisma/client';
import clsx from 'clsx';
import {
  ArrowLeftCircle,
  EyeIcon,
  Laptop,
  Loader2,
  Redo2,
  Smartphone,
  Tablet,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FocusEventHandler, useEffect, useState } from 'react';

import { ModeToggle } from '@/components/global/mode-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

type Props = {
  funnelId: string;
  funnelPageDetails: FunnelPage;
  subaccountId: string;
};

const FunnelEditorNavigation = ({ funnelId, funnelPageDetails, subaccountId }: Props) => {
  const router = useRouter();
  const { state, dispatch } = useEditor();

  const [isLoadingSave, setIsLoadingSave] = useState(false);

  useEffect(() => {
    dispatch({
      type: 'SET_FUNNELPAGE_ID',
      payload: {
        funnelPageId: funnelPageDetails.id,
      },
    });
  }, [funnelPageDetails]);

  const handleOnBlurTitleChange: FocusEventHandler<HTMLInputElement> = async (event) => {
    if (event.target.value) {
      await upsertFunnelPage(
        subaccountId,
        {
          id: funnelPageDetails.id,
          name: event.target.value,
          order: funnelPageDetails.order,
        },
        funnelId,
      );

      toast({
        title: 'Success',
        description: 'Saved Funnel Page title',
      });
      router.refresh();
    } else {
      toast({
        title: 'Oopps!',
        description: 'You need to have a title!',
      });
      event.target.value = funnelPageDetails.name;
    }
  };

  const handlePreviewClick = () => {
    dispatch({ type: 'TOGGLE_PREVIEW_MODE' });
    dispatch({ type: 'TOGGLE_LIVE_MODE' });
  };

  const handleUndo = () => {
    dispatch({ type: 'UNDO' });
  };

  const handleRedo = () => {
    dispatch({ type: 'REDO' });
  };

  const handleOnSave = async () => {
    const content = JSON.stringify(state.editor.elements);
    try {
      setIsLoadingSave(true);
      const response = await upsertFunnelPage(
        subaccountId,
        {
          ...funnelPageDetails,
          content,
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
        description: 'Saved Editor',
      });
      setIsLoadingSave(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Oopps!',
        description: 'Could not save editor',
      });
      setIsLoadingSave(false);
    }
  };

  return (
    <TooltipProvider>
      <nav
        className={clsx(
          'border-b-[1px] flex items-center justify-between p-4 gap-2 transition-all',
          {
            '!h-0 !p-0 !overflow-hidden': state.editor.previewMode,
          },
        )}
      >
        <aside className="flex items-center gap-4 max-w-[260px] w-[300px]">
          <Link href={`/subaccount/${subaccountId}/funnels/${funnelId}`}>
            <ArrowLeftCircle />
          </Link>
          <Input
            defaultValue={funnelPageDetails.name}
            className="border-none h-5 m-0 p-0 text-lg"
            onBlur={handleOnBlurTitleChange}
          />
          <span className="text-sm text-muted-foreground">Path: /{funnelPageDetails.pathName}</span>
        </aside>
        <aside>
          <Tabs
            defaultValue="Desktop"
            className="w-fit"
            value={state.editor.device}
            onValueChange={(value) => {
              dispatch({
                type: 'CHANGE_DEVICE',
                payload: {
                  device: value as DeviceTypes,
                },
              });
            }}
          >
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-fit">
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Desktop"
                    className="data-[state=active]:bg-muted w-10 h-10 p-0"
                  >
                    <Laptop />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Desktop</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Tablet"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Tablet />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Tablet</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <TabsTrigger
                    value="Mobile"
                    className="w-10 h-10 p-0 data-[state=active]:bg-muted"
                  >
                    <Smartphone />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Mobile</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>
        </aside>
        <aside className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
            onClick={handlePreviewClick}
          >
            <EyeIcon />
          </Button>
          <Button
            disabled={!(state.history.currentIndex > 0)}
            onClick={handleUndo}
            variant="ghost"
            size="icon"
            className="hover:bg-muted"
          >
            <Undo2 />
          </Button>
          <Button
            disabled={!(state.history.currentIndex < state.history.history.length - 1)}
            onClick={handleRedo}
            variant="ghost"
            size="icon"
            className="hover:bg-muted mr-4"
          >
            <Redo2 />
          </Button>
          <div className="flex flex-col item-center mr-4">
            <div className="flex flex-row items-center gap-4">
              Draft
              <Switch disabled defaultChecked={true} />
              Publish
            </div>
            <span className="text-muted-foreground text-sm">
              Last updated {funnelPageDetails.updatedAt.toLocaleDateString()}
            </span>
          </div>
          <Button className="text-white" onClick={handleOnSave}>
            {isLoadingSave ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
          <ModeToggle />
        </aside>
      </nav>
    </TooltipProvider>
  );
};

export default FunnelEditorNavigation;
