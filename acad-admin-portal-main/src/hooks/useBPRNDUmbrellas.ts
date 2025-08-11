import { useState, useEffect } from 'react';

interface Umbrella {
  _id: string;
  name: string;
}

interface UseBPRNDUmbrellasReturn {
  umbrellas: Umbrella[];
  loading: boolean;
  error: string | null;
}

const useBPRNDUmbrellas = (): UseBPRNDUmbrellasReturn => {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUmbrellas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          'http://localhost:3003/api/bprnd/umbrellas',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch umbrellas: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setUmbrellas(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching umbrellas:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch umbrellas'
        );
        setUmbrellas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUmbrellas();
  }, []);

  return {
    umbrellas,
    loading,
    error,
  };
};

export default useBPRNDUmbrellas;
