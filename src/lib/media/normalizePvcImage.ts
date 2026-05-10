import * as ImageManipulator from "expo-image-manipulator";

export type NormalizedPvcImage = {
  uri: string;
  name: string;
  type: "image/jpeg";
};

const MAX_PVC_WIDTH = 1800;
const JPEG_QUALITY = 0.82;

function buildPvcFileName(side: "front" | "back"): string {
  return `${side}-pvc-${Date.now()}.jpg`;
}

export async function normalizePvcImageForUpload(
  uri: string,
  side: "front" | "back"
): Promise<NormalizedPvcImage> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_PVC_WIDTH } }],
    {
      compress: JPEG_QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );

  return {
    uri: result.uri,
    name: buildPvcFileName(side),
    type: "image/jpeg",
  };
}