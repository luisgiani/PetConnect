import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { MAX_PHOTO_SIZE_BYTES } from "@/features/animals/photo.constants";

const uploadMaxDimension = 1600;

export async function prepareAnimalPhoto(
  uri: string,
  width: number,
  height: number,
): Promise<ArrayBuffer> {
  const firstPass = await compressPhoto(uri, width, height, uploadMaxDimension, 0.8);
  const firstPassBytes = await readUri(firstPass.uri);
  if (firstPassBytes.byteLength <= MAX_PHOTO_SIZE_BYTES) return firstPassBytes;

  const secondPass = await compressPhoto(uri, width, height, 1200, 0.6);
  const secondPassBytes = await readUri(secondPass.uri);
  if (secondPassBytes.byteLength > MAX_PHOTO_SIZE_BYTES) {
    throw new Error("Não foi possível reduzir uma das fotos para menos de 5 MB.");
  }
  return secondPassBytes;
}

async function compressPhoto(
  uri: string,
  width: number,
  height: number,
  maxDimension: number,
  quality: number,
) {
  const largestDimension = Math.max(width, height);
  const scale = largestDimension > 0 ? Math.min(1, maxDimension / largestDimension) : 1;
  const actions = scale < 1
    ? [{ resize: { width: Math.round(width * scale), height: Math.round(height * scale) } }]
    : [];

  return manipulateAsync(uri, actions, {
    compress: quality,
    format: SaveFormat.JPEG,
  });
}

async function readUri(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Não foi possível ler uma foto selecionada.");
  return response.arrayBuffer();
}
