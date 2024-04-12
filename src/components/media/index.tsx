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
        <CommandInput placeholder="Search for file name..." />
        <CommandList className="pb-40 max-h-full">
          <CommandEmpty>
            {!data?.Media.length ? (
              <>
                <p className="text-muted-foreground font-bold">No Media Files.</p>
                <p className="text-muted-foreground">Try and Upload new Media Files.</p>
              </>
            ) : (
              <div className="flex items-center justify-center w-full flex-col">
                <FolderSearch size={200} className="dark:text-muted text-slate-300" />
                <p className="text-muted-foreground ">Empty! No files to show.</p>
                <p className="text-muted-foreground ">Try and search different files.</p>
              </div>
            )}
          </CommandEmpty>
          <CommandGroup>
            <div className="flex flex-wrap gap-4 pt-4">
              {data?.Media.map((file) => (
                <CommandItem
                  key={file.id}
                  className="p-0 max-w-[300px] w-full rounded-lg !bg-transparent !font-medium"
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
