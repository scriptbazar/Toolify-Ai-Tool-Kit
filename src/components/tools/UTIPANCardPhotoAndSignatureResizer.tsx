
'use client';

import { ImageResizerBox } from './ImageResizerBox';
import { ImageIcon, PenLine } from 'lucide-react';

const PHOTO_WIDTH = 213;
const PHOTO_HEIGHT = 213;
const SIGNATURE_WIDTH = 400;
const SIGNATURE_HEIGHT = 200;
const MAX_PHOTO_SIZE_KB = 30;
const MAX_SIGNATURE_SIZE_KB = 60;
const PHOTO_DPI = 300;
const SIGNATURE_DPI = 600;


export function UTIPANCardPhotoAndSignatureResizer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ImageResizerBox 
        title="Photo"
        icon={ImageIcon}
        targetWidth={PHOTO_WIDTH}
        targetHeight={PHOTO_HEIGHT}
        maxSizeKb={MAX_PHOTO_SIZE_KB}
        dpi={PHOTO_DPI}
      />
      <ImageResizerBox 
        title="Signature"
        icon={PenLine}
        targetWidth={SIGNATURE_WIDTH}
        targetHeight={SIGNATURE_HEIGHT}
        maxSizeKb={MAX_SIGNATURE_SIZE_KB}
        dpi={SIGNATURE_DPI}
      />
    </div>
  );
}
