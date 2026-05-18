import type { PressCoverageApiItem } from "@/lib/api/pressCoverage.api";

export type PressCoverageItem = {
  id: string;
  slug: string;
  title: string;
  date: string;
  imageUrl: string;
  heroImageUrl?: string;
  excerpt: string;
  content: string[];
  contentHtml: string;
  likes: number;
  comments: number;
  isLikedByCurrentUser: boolean;
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

export function htmlToParagraphs(html?: string | null): string[] {
  if (!html?.trim()) return [];

  const normalized = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/div>\s*<div[^>]*>/gi, "\n\n")
    .replace(/<\/h[1-6]>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .trim();

  return decodeHtmlEntities(normalized)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function formatPressCoverageDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function mapPressCoverageApiItem(
  item: PressCoverageApiItem
): PressCoverageItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    date: formatPressCoverageDate(item.publishedAt),
    imageUrl: item.thumbnailURL || item.heroImageURL || "",
    heroImageUrl: item.heroImageURL || item.thumbnailURL || undefined,
    excerpt: item.excerpt,
    content: htmlToParagraphs(item.content),
    contentHtml: item.content,
    likes: item.likesCount,
    comments: item.commentsCount,
    isLikedByCurrentUser: item.isLikedByCurrentUser,
  };
}

export function getPressCoverageFallbackImage(item: PressCoverageItem): string {
  return item.heroImageUrl || item.imageUrl;
}