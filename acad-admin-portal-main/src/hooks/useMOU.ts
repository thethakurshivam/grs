import { useState, useEffect } from 'react';

interface MOU {
  _id: string;
  ID: string;
  school:
    | {
        _id: string;
        name: string;
      }
    | string;
  nameOfPartnerInstitution: string;
  strategicAreas: string;
  dateOfSigning: string;
  validity: string;
  affiliationDate: string;
  createdAt: string;
  updatedAt: string;
}

interface MOUResponse {
  success?: boolean;
  count?: number;
  data?: MOU[];
  error?: string;
  // Allow unknown shapes from admin API
  [key: string]: unknown;
}

interface SingleMOUResponse {
  success?: boolean;
  data?: MOU;
  error?: string;
  // Allow unknown shapes from admin API
  [key: string]: unknown;
}

export const useMOU = () => {
  const [mous, setMous] = useState<MOU[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resolveContext = () => {
    const pocToken = localStorage.getItem('pocToken');
    const pocId = localStorage.getItem('pocUserId');
    const adminToken = localStorage.getItem('authToken');

    // Prioritize admin context if admin token exists
    if (adminToken) {
      return {
        mode: 'admin' as const,
        token: adminToken,
        pocId: null,
        listUrl: `http://localhost:3000/api/mous`,
        byIdUrl: (mouId: string) => `http://localhost:3000/api/mous/${mouId}`,
      };
    }

    if (pocToken && pocId) {
      return {
        mode: 'poc' as const,
        token: pocToken,
        pocId,
        listUrl: `http://localhost:3002/api/poc/${pocId}/mous`,
        byIdUrl: (mouId: string) => `http://localhost:3002/api/poc/${pocId}/mous/${mouId}`,
      };
    }

    return null;
  };

  const parseListResponse = (raw: unknown): { items: MOU[]; total: number } => {
    const resp = raw as MOUResponse | MOU[];

    // If admin API returns an array directly
    if (Array.isArray(resp)) {
      return { items: resp as MOU[], total: (resp as MOU[]).length };
    }

    // If wrapped with success/data/count
    const maybe = resp as MOUResponse;
    if (maybe && Array.isArray(maybe.data)) {
      return { items: maybe.data as MOU[], total: (maybe.count as number) ?? (maybe.data as MOU[]).length };
    }

    // Fallback: try to find an array field
    for (const key of Object.keys(resp as object)) {
      const val = (resp as any)[key];
      if (Array.isArray(val)) {
        return { items: val as MOU[], total: val.length };
      }
    }

    return { items: [], total: 0 };
  };

  const parseSingleResponse = (raw: unknown): MOU | null => {
    const resp = raw as SingleMOUResponse | MOU;
    if (!resp) return null;

    // If admin API returns the object directly
    if ((resp as MOU)._id) return resp as MOU;

    // If wrapped in { success, data }
    if ((resp as SingleMOUResponse).data) return (resp as SingleMOUResponse).data as MOU;

    // Fallback: try to find first object-like value
    for (const key of Object.keys(resp as object)) {
      const val = (resp as any)[key];
      if (val && typeof val === 'object' && val._id) return val as MOU;
    }

    return null;
  };

  const fetchMOU = async () => {
    try {
      setLoading(true);
      setError(null);

      const ctx = resolveContext();
      if (!ctx) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(ctx.listUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const { items, total } = parseListResponse(data);
      setMous(items);
      setCount(total);
    } catch (err) {
      console.error('Error in fetchMOU:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setMous([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchMOUById = async (mouId: string): Promise<MOU | null> => {
    try {
      const ctx = resolveContext();
      if (!ctx) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(ctx.byIdUrl(mouId), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return parseSingleResponse(data);
    } catch (err) {
      console.error('Error in fetchMOUById:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchMOU();
  }, []);

  return {
    mous,
    count,
    loading,
    error,
    refetch: fetchMOU,
    fetchMOUById,
  };
};
