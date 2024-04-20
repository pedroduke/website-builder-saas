import type { OurFileRouter } from '@/app/api/uploadthing/core';
import { generateUploadButton, generateUploadDropzone, generateUploader } from '@uploadthing/react';
import { generateReactHelpers } from '@uploadthing/react';

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();
