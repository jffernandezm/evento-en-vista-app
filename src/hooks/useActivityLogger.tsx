
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getConsent } from '@/hooks/useConsent';
import { nearestComuna } from '@/lib/comunas';

type ActivityType = 'app_open' | 'event_view' | 'logout' | 'login' | 'favorite_add' | 'favorite_remove';

export const useActivityLogger = () => {
  const { user } = useAuth();

  const getDeviceInfo = () => {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  };

  // Solo guarda la comuna (nunca coordenadas exactas).
  const getLocationInfo = (): Promise<{ comuna: string | null; source: string }> => {
    const chosen = localStorage.getItem('panoramas_comuna');
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) return resolve({ comuna: chosen, source: chosen ? 'selected' : 'none' });
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ comuna: nearestComuna(p.coords.latitude, p.coords.longitude), source: 'device' }),
        () => resolve({ comuna: chosen, source: chosen ? 'selected' : 'none' }),
        { timeout: 8000, maximumAge: 600000 }
      );
    });
  };

  const logActivity = useCallback(async (
    activityType: ActivityType, 
    eventId?: string,
    additionalData?: any
  ) => {
    // Only log activities for authenticated users
    if (!user) return;
    // Sin consentimiento no se guarda nada.
    if (getConsent() !== 'accepted') return;
    
    try {
      const deviceInfo = getDeviceInfo();
      const locationInfo = await getLocationInfo();
      const sessionId = sessionStorage.getItem('session_id') || 
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      const logData = {
        user_id: user.id,
        session_id: sessionId,
        activity_type: activityType,
        event_id: eventId || null,
        device_info: { ...deviceInfo, ...additionalData },
        location_info: locationInfo,
        user_agent: navigator.userAgent
      };

      const { error } = await supabase
        .from('user_activity_logs')
        .insert([logData]);

      if (error) {
        console.error('Error logging activity:', error);
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
    }
  }, [user]);

  return { logActivity };
};
