import { useState, useEffect } from 'react';

interface Participant {
  _id: string;
  sr_no: number;
  batch_no: string;
  rank: string;
  serial_number: string;
  enrollment_number: string;
  full_name: string;
  gender: string;
  dob: Date | string;
  birth_place: string;
  birth_state: string;
  country: string;
  aadhar_no: string;
  mobile_no: string;
  alternate_number?: string;
  email: string;
  password?: string;
  address: string;
  mou_id?: string;
  course_id?: string[];
  credits?: number;
  available_credit?: number;
  used_credit?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminParticipantsResponse {
  success?: boolean;
  count?: number;
  data?: Participant[];
  error?: string;
  [key: string]: unknown;
}

interface PocParticipantsResponse {
  success?: boolean;
  data?: {
    students?: Participant[];
    poc?: unknown;
  };
  error?: string;
  [key: string]: unknown;
}

export const useParticipants = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
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
        url: `http://localhost:3002/api/participants`,
      };
    }

    if (pocToken && pocId) {
      return {
        mode: 'poc' as const,
        token: pocToken,
        url: `http://localhost:3002/api/poc/${pocId}/students`,
      };
    }

    return null;
  };

  const parseResponse = (raw: string) => {
    try {
      const json = JSON.parse(raw) as AdminParticipantsResponse | PocParticipantsResponse | Participant[];

      // If admin returns array directly
      if (Array.isArray(json)) {
        return { items: json as Participant[], total: (json as Participant[]).length };
      }

      const maybe = json as AdminParticipantsResponse & PocParticipantsResponse;
      if (maybe.success && Array.isArray((maybe as AdminParticipantsResponse).data)) {
        const items = (maybe as AdminParticipantsResponse).data as Participant[];
        return { items, total: (maybe as AdminParticipantsResponse).count ?? items.length };
      }

      if (maybe.success && (maybe as PocParticipantsResponse).data && Array.isArray((maybe as PocParticipantsResponse).data!.students)) {
        const items = (maybe as PocParticipantsResponse).data!.students as Participant[];
        return { items, total: items.length };
      }

      // Fallback: try to find first array in object
      for (const key of Object.keys(json as object)) {
        const val = (json as any)[key];
        if (Array.isArray(val)) {
          return { items: val as Participant[], total: val.length };
        }
      }
    } catch (_) {
      // Ignore JSON parse errors; handled by caller
    }
    return { items: [] as Participant[], total: 0 };
  };

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      setError(null);

      const ctx = resolveContext();
      if (!ctx) {
        throw new Error('Authentication required. Please log in again.');
      }

      const response = await fetch(ctx.url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
      });

      const responseText = await response.text();
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${responseText}`);
      }

      const { items, total } = parseResponse(responseText);
      setParticipants(items);
      setCount(total);
    } catch (err) {
      console.error('Error in fetchParticipants:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setParticipants([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  return {
    participants,
    count,
    loading,
    error,
    refetch: fetchParticipants,
  };
};
