import { apiRequest } from "@/lib/api/http";

export type LocationOption = {
  name: string;
};

function encodePathSegment(value: string): string {
  return encodeURIComponent(value.trim());
}

function normalizeLocationName(value: string): string {
  return value.trim();
}

function normalizeOptions(items: LocationOption[]): string[] {
  const seen = new Set<string>();
  const options: string[] = [];

  // `items` is only a TS-level promise, not a runtime guarantee — apiRequest()
  // does a raw JSON.parse with no schema validation. If the backend ever
  // serializes this endpoint as an object instead of an array, `for...of`
  // throws "iterator method is not callable" in Hermes and crashes whatever
  // screen called this (states/LGA/ward/polling-unit pickers). Guard the
  // shape, not just nullishness.
  for (const item of Array.isArray(items) ? items : []) {
    const name = normalizeLocationName(item.name);

    if (!name || seen.has(name)) {
      continue;
    }

    seen.add(name);
    options.push(name);
  }

  return options.sort((a, b) => a.localeCompare(b));
}

export async function getStates(): Promise<string[]> {
  const response = await apiRequest<LocationOption[]>("/locations/states");

  return normalizeOptions(response);
}

export async function getLocalGovernments(state: string): Promise<string[]> {
  const response = await apiRequest<LocationOption[]>(
    `/locations/states/${encodePathSegment(state)}/local_governments`
  );

  return normalizeOptions(response);
}

export async function getWards(
  state: string,
  localGovernmentArea: string
): Promise<string[]> {
  const response = await apiRequest<LocationOption[]>(
    `/locations/states/${encodePathSegment(
      state
    )}/local_governments/${encodePathSegment(localGovernmentArea)}/wards`
  );

  return normalizeOptions(response);
}

export async function getPollingUnits(
  state: string,
  localGovernmentArea: string,
  ward: string
): Promise<string[]> {
  const response = await apiRequest<LocationOption[]>(
    `/locations/states/${encodePathSegment(
      state
    )}/local_governments/${encodePathSegment(
      localGovernmentArea
    )}/wards/${encodePathSegment(ward)}/polling_units`
  );

  return normalizeOptions(response);
}