'use client';

import { getMedia } from '@/lib/queries';
import { GetMediaFiles } from '@/lib/types';
import { useEditor } from '@/providers/editor/editor-provider';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent } from '@/components/ui/tabs';

import TabList from './tabs';
import ComponentsTab from './tabs/components-tab';
import LayersTab from './tabs/layers-tab';
import MediaBucketTab from './tabs/media-bucket-tab';
import SettingsTab from './tabs/settings-tab';

type Props = {
  subaccountId: string;
  mediaFiles: GetMediaFiles;
};

const FunnelEditorSidebar = ({ subaccountId, mediaFiles }: Props) => {
  const { state, dispatch } = useEditor();
  const [data, setData] = useState(mediaFiles);

  if (data?.Media.length !== mediaFiles?.Media.length) {
    setData(mediaFiles);
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMedia(subaccountId);
      setData(response);
    };
    fetchData();
  }, [subaccountId]);

  return (
    <Sheet open={true} modal={false}>
      <Tabs className="w-full" defaultValue="Settings">
        <SheetContent
          showX={false}
          side="right"
          className={clsx(
            'mt-[97px] w-16 z-[50] shadow-none p-0 focus:border-none transition-all overflow-hidden',
            { hidden: state.editor.previewMode },
          )}
        >
          <TabList />
        </SheetContent>
        <SheetContent
          showX={false}
          side="right"
          className={clsx(
            'mt-[97px] w-80 z-[40] shadow-none p-0 mr-16 bg-background h-full transition-all overflow-hidden ',
            { hidden: state.editor.previewMode },
          )}
        >
          <div className="grid gap-4 h-full pb-36 overflow-auto">
            <TabsContent value="Settings">
              <SheetHeader className="text-left p-6">
                <SheetTitle>Styles</SheetTitle>
                <SheetDescription>
                  Show your creativity! You can customize every component as you like.
                </SheetDescription>
              </SheetHeader>
              <SettingsTab />
            </TabsContent>
            <TabsContent value="Media">
              <MediaBucketTab subaccountId={subaccountId} data={data} />
            </TabsContent>
            <TabsContent value="Layers">
              <LayersTab />
            </TabsContent>
            <TabsContent value="Components">
              <SheetHeader className="text-left p-6 ">
                <SheetTitle>Components</SheetTitle>
                <SheetDescription>You can drag and drop components on the canvas</SheetDescription>
              </SheetHeader>
              <ComponentsTab />
            </TabsContent>
          </div>
        </SheetContent>
      </Tabs>
    </Sheet>
  );
};

export default FunnelEditorSidebar;
