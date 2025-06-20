
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

  const getLocationInfo = (): Promise<any> => {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
          },
          () => {
            resolve({ error: 'Location access denied' });
          }
        );
      } else {
        resolve({ error: 'Geolocation not supported' });
      }
    });
  };

  const logActivity = useCallback(async (
    activityType: ActivityType, 
    eventId?: string,
    additionalData?: any
  ) => {
    // Only log activities for authenticated users
    if (!user) return;
    
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
