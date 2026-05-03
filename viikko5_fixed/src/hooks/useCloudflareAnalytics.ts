import { useCallback } from "react";
import { hasAnalyticsConsent } from "../components/ConsentBanner";

export function useCloudflareAnalytics() {
  const trackEvent = useCallback(
    (eventName: string, data?: Record<string, unknown>) => {
      if (!hasAnalyticsConsent()) return;

      if (!window._cfq) {
        window._cfq = [];
      }

      window._cfq.push([
        "trackEvent",
        {
          name: eventName,
          ...data,
          timestamp: new Date().toISOString(),
        },
      ]);
    },
    []
  );

  return { trackEvent };
}