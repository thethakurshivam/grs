import { useCallback, useEffect, useState } from 'react';

export interface BprndCreditBreakdown {
  [key: string]: number;
}

interface UseBPRNDCreditBreakdownResult {
  data: BprndCreditBreakdown | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBPRNDCreditBreakdown(studentId: string): UseBPRNDCreditBreakdownResult {
  const [data, setData] = useState<BprndCreditBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCreditBreakdown = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    try {
      // Fetch stored credits from the credits/breakdown endpoint
      console.log('🔍 Fetching stored credits from /api/student/${studentId}/credits/breakdown endpoint...');
      const storedCreditsResponse = await fetch(
        `/api/student/${studentId}/credits/breakdown`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        }
      );

      if (storedCreditsResponse.ok) {
        const storedCreditsData = await storedCreditsResponse.json();
        if (storedCreditsData.success && storedCreditsData.data) {
          console.log('✅ Found stored credits:', storedCreditsData.data);
          
          // Use only stored credits (available credits) for display
          const creditBreakdown: BprndCreditBreakdown = {};
          Object.keys(storedCreditsData.data).forEach(key => {
            if (key !== 'Total_Credits' && key !== 'totalCredits') {
              // Round credits to whole numbers for better display
              creditBreakdown[key] = Math.round(Number(storedCreditsData.data[key] || 0));
            }
          });
          
          console.log('📊 Stored credits (available credits):', creditBreakdown);
          setData(creditBreakdown);
          return;
        }
      }
      
      console.log('⚠️ No stored credits found, setting to empty');
      setData({});
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error fetching credit breakdown';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  }, [studentId]);

  useEffect(() => {
    fetchCreditBreakdown();
  }, [fetchCreditBreakdown]);

  return { data, isLoading, error, refetch: fetchCreditBreakdown };
}

export default useBPRNDCreditBreakdown;


