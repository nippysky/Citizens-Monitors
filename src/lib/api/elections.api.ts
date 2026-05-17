import { apiRequest } from "@/lib/api/http";

export type ElectionApiStatus = "all" | "live" | "upcoming" | "concluded";

export type ActiveElectionApiItem = {
  id: string;
  electionName: string;
  electionType: string;
  electionLocation: string | null;
  startDate: string;
  endDate: string;
  mockElection: boolean;
  partiesCount: number;
  status: Exclude<ElectionApiStatus, "all">;
};

export type ActiveElectionsResponse = {
  status: ElectionApiStatus;
  scope: string;
  total: number;
  elections: ActiveElectionApiItem[];
};

export async function getActiveElections(
  status: ElectionApiStatus = "all"
): Promise<ActiveElectionsResponse> {
  return apiRequest<ActiveElectionsResponse>(
    `/elections/active?status=${encodeURIComponent(status)}`,
    {
      method: "GET",
    }
  );
}