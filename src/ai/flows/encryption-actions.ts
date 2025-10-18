
'use server';

import { z } from 'zod';
import CryptoJS from 'crypto-js';

const ProcessFileInputSchema = z.object({
  mode: z.enum(['encrypt', 'decrypt']),
  fileDataUrl: z.string(),
  password: z.string(),
});

type ProcessFileInput = z.infer<typeof ProcessFileInputSchema>;

export async function encryptOrDecryptFile(
  input: ProcessFileInput
): Promise<{ success: boolean; dataUrl?: string; message?: string }> {
  try {
    const { mode, fileDataUrl, password } = ProcessFileInputSchema.parse(input);

    if (mode === 'encrypt') {
      const encrypted = CryptoJS.AES.encrypt(fileDataUrl, password).toString();
      // Convert the encrypted string to a Base64 Data URL so it can be downloaded.
      const encryptedDataUrl = `data:text/plain;base64,${Buffer.from(encrypted).toString('base64')}`;
      return { success: true, dataUrl: encryptedDataUrl };
    } else { // decrypt
      // The file content is a Data URL of the encrypted text file.
      const response = await fetch(fileDataUrl);
      const encryptedText = await response.text();
      
      const decryptedBytes = CryptoJS.AES.decrypt(encryptedText, password);
      const decryptedDataUrl = decryptedBytes.toString(CryptoJS.enc.Utf8);
      
      if (!decryptedDataUrl) {
        throw new Error("Decryption failed. Check your password or the file content.");
      }
      return { success: true, dataUrl: decryptedDataUrl };
    }
  } catch (error: any) {
    console.error(`[${input.mode}] Error:`, error);
    return {
      success: false,
      message: error.message || `An error occurred during file ${input.mode}.`,
    };
  }
}
