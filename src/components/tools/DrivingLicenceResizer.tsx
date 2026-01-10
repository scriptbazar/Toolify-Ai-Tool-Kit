
'use client';

import { ImageResizerBox } from './ImageResizerBox';
import { ImageIcon, PenLine } from 'lucide-react';

export function DrivingLicenceResizer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ImageResizerBox
        title="Photo"
        icon={ImageIcon}
        targetWidth={213}
        targetHeight={213}
        maxSizeKb={50}
        dpi={300}
      />
      <ImageResizerBox
        title="Signature"
        icon={PenLine}
        targetWidth={400}
        targetHeight={200}
        maxSizeKb={50}
        dpi={600}
      />
    </div>
  );
}
