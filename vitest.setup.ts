const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_INPUT_BYTES = 6 * 1024 * 1024;
const MAX_EDGE = 900;

export function validateProductImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) return "僅支援 JPG、PNG 或 WebP 圖片";
  if (file.size > MAX_INPUT_BYTES) return "圖片不可超過 6 MB";
  return null;
}

function readDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("無法讀取圖片"));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("圖片格式無法解析"));
    image.src = source;
  });
}

export async function readProductImage(file: File): Promise<string> {
  const validationError = validateProductImageFile(file);
  if (validationError) throw new Error(validationError);
  const source = await readDataUrl(file);
  const image = await loadImage(source);
  const ratio = Math.min(1, MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return source;
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/webp", 0.82);
}
