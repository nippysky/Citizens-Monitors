import { apiRequest } from "@/lib/api/http";

export type AcademyArticleSummary = {
  slug: string;
  title: string;
  category: string;
  readMinutes: number;
  summary: string;
};

export type AcademyListResponse = {
  title: string;
  subtitle: string;
  articles: AcademyArticleSummary[];
};

export type AcademyArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type AcademyArticleDetail = AcademyArticleSummary & {
  sections: AcademyArticleSection[];
};

export async function getAcademyArticles(): Promise<AcademyListResponse> {
  return apiRequest<AcademyListResponse>("/academy", {
    method: "GET",
    auth: false,
  });
}

export async function getAcademyArticle(
  slug: string
): Promise<AcademyArticleDetail> {
  return apiRequest<AcademyArticleDetail>(
    `/academy/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      auth: false,
    }
  );
}