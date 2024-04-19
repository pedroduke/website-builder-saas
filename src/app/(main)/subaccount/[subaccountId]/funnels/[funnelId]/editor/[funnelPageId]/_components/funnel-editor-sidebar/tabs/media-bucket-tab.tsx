'use client';

import { GetMediaFiles } from '@/lib/types';

import MediaComponent from '@/components/media';

type Props = {
  subaccountId: string;
  data: GetMediaFiles;
};

const MediaBucketTab = (props: Props) => {
  return (
    <div className="h-full overflow-hidden p-4">
      <MediaComponent data={props.data} subaccountId={props.subaccountId} />
    </div>
  );
};

export default MediaBucketTab;
