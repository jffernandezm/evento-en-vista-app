
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RecurrenceType {
  id: string;
  name: string;
  description: string | null;
  value: string;
  days_interval: number | null;
  is_active: boolean;
}

export const useRecurrenceTypes = () => {
  const [recurrenceTypes, setRecurrenceTypes] = useState<RecurrenceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecurrenceTypes();
  }, []);

  const fetchRecurrenceTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('recurrence_types')
        .select('*')
        .eq('is_active', true)
        .order('days_interval', { ascending: true, nullsFirst: true });

      if (error) {
        console.error('Error fetching recurrence types:', error);
        return;
      }

      setRecurrenceTypes(data || []);
    } catch (error) {
      console.error('Error fetching recurrence types:', error);
    } finally {
      setLoading(false);
    }
  };

  return { recurrenceTypes, loading };
};
