import { fetch } from "expo/fetch";
import { Directory, File, Paths } from "expo-file-system";

export type StagedMediaKind = "image" | "video";

export type StagedMedia = {
  uri: string;
  localUri: string;
  fileName: string;
  mimeType: string;
  kind: StagedMediaKind;
  size: number | null;
};

const REPORTING_MEDIA_DIR = new Directory(Paths.cache, "citizen-monitors", "reporting-media");

function ensureReportingMediaDir() {
  try {
    if (!REPORTING_MEDIA_DIR.exists) {
      REPORTING_MEDIA_DIR.create({ intermediates: true, idempotent: true });
    }
  } catch {
    // best effort
  }
}

function sanitizeExtensionFromMimeType(mimeType: string, fallback: string) {
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mov")) return "mov";
  if (mimeType.includes("quicktime")) return "mov";
  return fallback;
}

function buildMimeType(kind: StagedMediaKind, sourceMimeType?: string | null) {
  if (sourceMimeType && sourceMimeType.trim()) return sourceMimeType;
  return kind === "image" ? "image/jpeg" : "video/mp4";
}

function buildFileName(kind: StagedMediaKind, mimeType: string) {
  const ext = sanitizeExtensionFromMimeType(
    mimeType,
    kind === "image" ? "jpg" : "mp4"
  );

  return `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

export function inferMediaKindFromUri(uri: string): StagedMediaKind {
  const lower = uri.toLowerCase();

  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".mov") ||
    lower.endsWith(".m4v") ||
    lower.includes("video")
  ) {
    return "video";
  }

  return "image";
}

/**
 * Stages a picked file into app-controlled cache storage.
 * This is the right offline-first pattern:
 * - keep only local staged URIs in your queue/drafts
 * - do not store blobs/base64 in AsyncStorage
 */
export async function stageMediaFile(params: {
  sourceUri: string;
  kind?: StagedMediaKind;
  mimeType?: string | null;
}): Promise<StagedMedia> {
  ensureReportingMediaDir();

  const kind = params.kind ?? inferMediaKindFromUri(params.sourceUri);
  const mimeType = buildMimeType(kind, params.mimeType ?? null);
  const fileName = buildFileName(kind, mimeType);

  const sourceFile = new File(params.sourceUri);
  const destinationFile = new File(REPORTING_MEDIA_DIR, fileName);

  if (destinationFile.exists) {
    try {
      destinationFile.delete();
    } catch {
      // best effort
    }
  }

  // Prefer MOVE over COPY: both the camera/picker output and our staging dir
  // live in the app cache (same volume), so a move is a filesystem rename —
  // effectively instant even for large recorded videos. A byte-for-byte copy
  // here used to block the JS thread for many seconds after recording,
  // freezing the whole app on "Saving video...". Copy remains as a fallback
  // for exotic cross-volume sources.
  try {
    sourceFile.move(destinationFile);
  } catch {
    sourceFile.copy(destinationFile);
  }

  return {
    uri: params.sourceUri,
    localUri: destinationFile.uri,
    fileName,
    mimeType,
    kind,
    size: destinationFile.size ?? null,
  };
}

export async function stageManyMediaFiles(
  items: {
    sourceUri: string;
    kind?: StagedMediaKind;
    mimeType?: string | null;
  }[]
): Promise<StagedMedia[]> {
  const staged: StagedMedia[] = [];

  for (const item of items) {
    const next = await stageMediaFile(item);
    staged.push(next);
  }

  return staged;
}

export async function deleteStagedMedia(localUri?: string | null) {
  if (!localUri) return;

  try {
    const file = new File(localUri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // best effort
  }
}

export async function deleteManyStagedMedia(localUris: (string | null | undefined)[]) {
  for (const uri of localUris) {
    await deleteStagedMedia(uri);
  }
}

/**
 * Production-ready upload helper.
 * Replace endpoint + headers with your real backend values.
 */
export async function uploadStagedMedia(params: {
  localUri: string;
  endpoint: string;
  fieldName?: string;
  extraFields?: Record<string, string>;
  headers?: Record<string, string>;
}): Promise<Response> {
  const file = new File(params.localUri);
  const formData = new FormData();

  formData.append(params.fieldName ?? "file", file);

  if (params.extraFields) {
    for (const [key, value] of Object.entries(params.extraFields)) {
      formData.append(key, value);
    }
  }

  return fetch(params.endpoint, {
    method: "POST",
    headers: params.headers,
    body: formData,
  });
}