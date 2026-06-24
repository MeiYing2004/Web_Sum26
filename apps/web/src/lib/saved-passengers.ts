import { gql } from '@/lib/graphql';

export type SavedPassenger = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  idNumber?: string | null;
};

export const SAVED_PASSENGER_FIELDS = `
  id fullName phone email idNumber
`;

export async function fetchSavedPassengers(token?: string): Promise<SavedPassenger[]> {
  const data = await gql<{ savedPassengers: SavedPassenger[] }>(
    `query { savedPassengers { ${SAVED_PASSENGER_FIELDS} } }`,
    undefined,
    token ? { token } : undefined
  );
  return data.savedPassengers ?? [];
}
