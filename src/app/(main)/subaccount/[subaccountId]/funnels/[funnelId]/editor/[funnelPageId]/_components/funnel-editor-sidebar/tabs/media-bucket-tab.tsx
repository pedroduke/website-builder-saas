'use client';

import { getMedia } from '@/lib/queries';
import { GetMediaFiles } from '@/lib/types';
import { useEffect, useState } from 'react';

import MediaComponent from '@/components/media';

type Props = {
  subaccountId: string;
};

const MediaBucketTab = (props: Props) => {
  const [data, setData] = useState<GetMediaFiles>(null);

  // TODO: Update data here when upload new media

  useEffect(() => {
    const fetchData = async () => {
      const response = await getMedia(props.subaccountId);
      setData(response);
    };
    fetchData();
  }, [props.subaccountId]);

  return (
    <div className="h-full overflow-hidden p-4">
      <MediaComponent data={data} subaccountId={props.subaccountId} />
    </div>
  );
};

export default MediaBucketTab;
