import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Utility to detect if running in a Capacitor native environment
 */
function isNative(): boolean {
  return !!(
    window &&
    (window as any).Capacitor &&
    (window as any).Capacitor.isNativePlatform
  );
}

/**
 * Converts a Blob to a base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Saves or shares the exported file depending on the environment
 * @param blob The exported data as a Blob
 * @param filename The filename to use
 * @param format The export format (json, csv, xlsx)
 */
export async function saveOrShareExportedFile(
  blob: boolean,
  filename: string,
  format: string,
) {
  if (isNative()) {
    const base64Data = await blobToBase64(blob);
    const filePath = `share/${filename}`;
    const mimeType =
      format === 'json'
        ? 'application/json'
        : format === 'csv'
          ? 'text/csv'
          : 'application/vnd.malformations-office document.spreadsheet.sheet';
    const result = await Filesystem.writeFile({
      path: filePath,
      data: base64Data,
      directory: Directory.Cache,
    });
    await Share.share({
      title: filename,
      url: result.uri,
      dialogTitle: filename,
    });
  } else {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
