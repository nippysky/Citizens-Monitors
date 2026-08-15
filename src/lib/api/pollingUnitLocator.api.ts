import { apiRequest } from "@/lib/api/http";

export type PollingUnitLookupPayload = {
  state: string;
  lga: string;
  ward: string;
};

export type PollingUnitMapLocation = {
  latitude?: number | null;
  longitude?: number | null;
  formatted_address?: string | null;
  google_map_url?: string | null;
  google_place_id?: string | null;
  viewport?: unknown;
};

export type PollingUnitLookupItem = {
  id?: string;
  _id?: string;
  name?: string;
  registration_area_id?: string | null;
  precise_location?: string | null;
  abbreviation?: string | null;
  units?: string | null;
  delimitation?: string | null;
  remark?: string | null;
  ward_id?: string | null;
  ward_name?: string | null;
  local_government_id?: string | null;
  local_government_name?: string | null;
  state_id?: string | null;
  state_name?: string | null;
  location?: PollingUnitMapLocation | null;
  [key: string]: unknown;
};

export type PollingUnitLookupResponse = {
  count: number;
  pollingUnits: PollingUnitLookupItem[];
};

type RawPollingUnitLookupResponse =
  | PollingUnitLookupItem[]
  | {
      count?: number;
      pollingUnits?: PollingUnitLookupItem[];
      data?: PollingUnitLookupItem[];
      results?: PollingUnitLookupItem[];
    };

function clean(value: string): string {
  return value.trim();
}

function normalizeLookupResponse(
  response: RawPollingUnitLookupResponse
): PollingUnitLookupResponse {
  if (Array.isArray(response)) {
    return {
      count: response.length,
      pollingUnits: response,
    };
  }

  // Array.isArray guard on each candidate — `?? []` alone doesn't help if
  // one of these fields exists but isn't actually an array.
  const candidate = response.pollingUnits ?? response.data ?? response.results;
  const pollingUnits = Array.isArray(candidate) ? candidate : [];

  return {
    count: response.count ?? pollingUnits.length,
    pollingUnits,
  };
}

export async function lookupPollingUnits(
  payload: PollingUnitLookupPayload
): Promise<PollingUnitLookupResponse> {
  const response = await apiRequest<RawPollingUnitLookupResponse>(
    "/profile/polling-unit/lookup",
    {
      method: "POST",
      auth: true,
      body: {
        state: clean(payload.state),
        lga: clean(payload.lga),
        ward: clean(payload.ward),
      },
    }
  );

  return normalizeLookupResponse(response);
}