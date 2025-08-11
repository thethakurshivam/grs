import { useState, useEffect } from 'react';

interface Umbrella {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface UmbrellasResponse {
  success: boolean;
  message: string;
  data: Umbrella[];
  count: number;
}

const useBPRNDUmbrellas = () => {
  const [umbrellas, setUmbrellas] = useState<Umbrella[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUmbrellas = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:3003/api/bprnd/umbrellas', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: UmbrellasResponse = await response.json();
        
        if (data.success) {
          setUmbrellas(data.data);
        } else {
          setError(data.message || 'Failed to fetch umbrellas');
        }
      } catch (err) {
        console.error('Error fetching umbrellas:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch umbrellas');
      } finally {
        setLoading(false);
      }
    };

    fetchUmbrellas();
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // Trigger useEffect to refetch
    setUmbrellas([]);
  };

  return {
    umbrellas,
    loading,
    error,
    refetch,
  };
};

export default useBPRNDUmbrellas;
