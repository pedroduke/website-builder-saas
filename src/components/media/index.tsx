import { GetMediaFiles } from '@/lib/types';
import { FolderSearch } from 'lucide-react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import MediaCard from './media-card';
import MediaUploadButton from './media-upload-button';

type MediaComponentProps = {
  data: GetMediaFiles;
  subaccountId: string;
};

const MediaComponent = ({ data, subaccountId }: MediaComponentProps) => {
  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">Media Bucket</h1>
        <MediaUploadButton subaccountId={subaccountId} />
      </div>
      <Command className="bg-transparent">
        <CommandInput placeholder="Search for a file name..." />
        <CommandList className="pb-40 max-h-full">
          <CommandEmpty>
            {!data?.Media.length ? (
              <div className="flex items-center justify-center w-full flex-col">
                <FolderSearch size={200} className="dark:text-muted text-slate-300" />
                <p className="text-muted-foreground ">No Media Files Uploaded</p>
                <p className="text-muted-foreground ">Try and Upload new Media Files.</p>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full flex-col">
                <FolderSearch size={200} className="dark:text-muted text-slate-300" />
                <p className="text-muted-foreground ">Could not find the file name.</p>
                <p className="text-muted-foreground ">Try and search for a different file.</p>
              </div>
            )}
          </CommandEmpty>
          <CommandGroup>
            <div className="flex flex-wrap flex-col md:flex-row gap-4 pt-4">
              {data?.Media.map((file) => (
                <CommandItem
                  key={file.id}
                  className="p-0 max-w-[100%] md:max-w-[32%] w-full rounded-lg !bg-transparent !font-medium"
                >
                  <MediaCard file={file} />
                </CommandItem>
              ))}
            </div>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export default MediaComponent;