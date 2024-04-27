'use client';

import { deleteMedia, saveActivityLogsNotification } from '@/lib/queries';
import { Media } from '@prisma/client';
import { Copy, MoreHorizontal, Trash } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { toast } from '../ui/use-toast';

type MediaCardProps = {
  file: Media;
};

const MediaCard = ({ file }: MediaCardProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <AlertDialog>
      <DropdownMenu>
        <article className="border w-full rounded-lg bg-muted">
          <div className="relative aspect-square">
            <Image src={file.link} alt="preview image" fill className="object-cover rounded-lg" />
          </div>
          <p className="opacity-0 h-0 w-0">{file.name}</p>
          <div className="p-4 relative text-black dark:text-white">
            <p>{file.name}</p>
            <p className="text-muted-foreground text-xs">{file.createdAt.toDateString()}</p>
            <div className="absolute top-4 right-4 p-[1px] cursor-pointer ">
              <DropdownMenuTrigger>
                <MoreHorizontal />
              </DropdownMenuTrigger>
            </div>
          </div>

          <DropdownMenuContent>
            <DropdownMenuLabel>Menu</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                navigator.clipboard.writeText(file.link);
                toast({ title: 'Copied To Clipboard' });
              }}
            >
              <Copy size={15} /> Copy Image Link
            </DropdownMenuItem>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2">
                <Trash size={15} /> Delete File
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </article>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            Are you sure you want to delete this file? All subaccount using this file will no longer
            have access to it!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            className="bg-destructive hover:bg-red-600 text-white"
            onClick={async () => {
              setLoading(true);
              const response = await deleteMedia(file.id);
              await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Deleted a media file | ${response?.name}`,
                subaccountId: response.subAccountId,
              });
              toast({
                title: 'Deleted File',
                description: 'Successfully deleted the file',
              });
              setLoading(false);
              router.refresh();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MediaCard;
