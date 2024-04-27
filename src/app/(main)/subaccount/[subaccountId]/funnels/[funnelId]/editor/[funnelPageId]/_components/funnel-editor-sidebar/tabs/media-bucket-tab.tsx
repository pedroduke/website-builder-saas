'use client';

import { GetMediaFiles } from '@/lib/types';

import MediaComponentFunnel from '@/components/media/media-component-funnel';

type Props = {
  subaccountId: string;
  data: GetMediaFiles;
};

const MediaBucketTab = (props: Props) => {
  return (
    <div className="h-full overflow-hidden p-4">
      <MediaComponentFunnel data={props.data} subaccountId={props.subaccountId} />
    </div>
  );
};

export default MediaBucketTab;
