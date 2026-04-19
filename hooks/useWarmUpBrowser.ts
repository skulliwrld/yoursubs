import { useEffect } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";

export function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    let didWarmUp = false;

    try {
      void WebBrowser.warmUpAsync()
        .then(() => {
          didWarmUp = true;
        })
        .catch(() => {
          // Some Android devices/browsers can't resolve a preferred Custom Tabs package.
          // Warm-up is only a performance optimization, so we safely continue without it.
        });
    } catch {
      // Native modules may throw synchronously on unsupported browser setups.
    }

    return () => {
      if (!didWarmUp) {
        return;
      }

      try {
        void WebBrowser.coolDownAsync().catch(() => {
          // Ignore cleanup failures for the same reason as warm-up.
        });
      } catch {
        // Native modules may throw synchronously on unsupported browser setups.
      }
    };
  }, []);
}
