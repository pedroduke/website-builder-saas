import { getMedia } from '@/lib/queries';

import MediaComponent from '@/components/media';

type MediaPageProps = {
  params: {
    subaccountId: string;
  };
};

const MediaPage = async ({ params }: MediaPageProps) => {
  const data = await getMedia(params.subaccountId);

  return <MediaComponent data={data} subaccountId={params.subaccountId} />;
};

export default MediaPage;
