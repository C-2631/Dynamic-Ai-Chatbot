import { FileCategory } from '@/types/chat';

/**
 * Strict Multi-modal File Validation for Interactive Prototype
 * Adheres strictly to Section 7 of MASTER PROMPT:
 * - Document: .pdf, .doc, .docx, .ppt, .pptx
 * - Image: .png, .jpg (Strictly reject .jpeg, .gif, .webp, .svg, etc.)
 * - Video: .mp4, .avi (Strictly reject .mov, .mkv, .webm, etc.)
 */
export const ALLOWED_EXTENSIONS_BY_CATEGORY: Record<FileCategory, string[]> = {
  document: ['.pdf', '.doc', '.docx', '.ppt', '.pptx'],
  image: ['.png', '.jpg'],
  video: ['.mp4', '.avi'],
};

export const ALL_ALLOWED_EXTENSIONS = [
  ...ALLOWED_EXTENSIONS_BY_CATEGORY.document,
  ...ALLOWED_EXTENSIONS_BY_CATEGORY.image,
  ...ALLOWED_EXTENSIONS_BY_CATEGORY.video,
];

export const CATEGORY_ACCEPT_ATTRIBUTES: Record<FileCategory, string> = {
  document: '.pdf,.doc,.docx,.ppt,.pptx',
  image: '.png,.jpg',
  video: '.mp4,.avi',
};

export interface FileValidationResult {
  valid: boolean;
  category?: FileCategory;
  extension?: string;
  error?: string;
}

export function validateSelectedFile(file: File, existingNames: string[] = []): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file was provided.' };
  }

  // Check for duplicate in current message
  if (existingNames.includes(file.name)) {
    return {
      valid: false,
      error: `"${file.name}" has already been attached to this message.`,
    };
  }

  const filename = file.name.trim();
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return {
      valid: false,
      error: `"${filename}" has no file extension. Allowed formats: Documents (.pdf, .doc, .docx, .ppt, .pptx), Images (.png, .jpg), and Videos (.mp4, .avi).`,
    };
  }

  const ext = filename.substring(lastDotIndex).toLowerCase();

  // Strict check: if .jpeg, reject with informative message
  if (ext === '.jpeg') {
    return {
      valid: false,
      error: `Unsupported format ".jpeg". Permitted image formats are strictly ".png" and ".jpg".`,
    };
  }

  let matchedCategory: FileCategory | undefined;

  if (ALLOWED_EXTENSIONS_BY_CATEGORY.document.includes(ext)) {
    matchedCategory = 'document';
  } else if (ALLOWED_EXTENSIONS_BY_CATEGORY.image.includes(ext)) {
    matchedCategory = 'image';
  } else if (ALLOWED_EXTENSIONS_BY_CATEGORY.video.includes(ext)) {
    matchedCategory = 'video';
  }

  if (!matchedCategory) {
    return {
      valid: false,
      error: `Unsupported file type "${ext}". Permitted formats: Documents (.pdf, .doc, .docx, .ppt, .pptx), Images (.png, .jpg), and Videos (.mp4, .avi).`,
    };
  }

  return {
    valid: true,
    category: matchedCategory,
    extension: ext,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export const formatBytes = formatFileSize;
export const STRICT_ALLOWED_EXTENSIONS = ALLOWED_EXTENSIONS_BY_CATEGORY;

