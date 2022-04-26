// This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
// If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

// The ApplicationProvider implements providers
// This replaces some functions delegated to _app.tsx. ApplicationProvider is opt-in by page

// Types
import { ReactElement } from "react";

// Suspense and performance
import dynamic from "next/dynamic";
import { useLocalStorage, writeStorage } from "@rehooks/local-storage";

// Chakra UI, icons, and other design imports
import { ChakraProvider } from "@chakra-ui/react";
import UITheme from "providers/UIThemeProvider";

// First party components
import { ErrorFallbackApplication } from "components/ErrorFallback";
import BrowserNotPermitted from "components/BrowserNotPermitted";
const UpdateProvider = dynamic(() => import("providers/UpdateProvider"), {
  suspense: true,
});
const BatteryMonitoringProvider = dynamic(
  () => import("providers/BatteryMonitoringProvider"),
  {
    suspense: true,
  }
);

// Keybinding libraries
import {
  KeybindingProvider,
  KeybindingManager,
} from "providers/KeybindingProvider";
const manager = new KeybindingManager();

import { useEffect } from "react";
import {
  isWindows,
  isIE,
  isLegacyEdge,
  isYandex,
  isChrome,
} from "react-device-detect";

// This function dumps deployment environment variables to the browser console
function DumpDeploymentDetails() {
  console.debug("Vercel Environment", process.env.NEXT_PUBLIC_VERCEL_ENV);
  console.debug("Vercel Automatic URL", process.env.NEXT_PUBLIC_VERCEL_URL);
  console.debug("Branch", process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF);
  console.debug("Commit", process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA);
  console.debug(
    "Commit Message",
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE
  );
  console.debug(
    "Commit Author",
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN
  );
}

// Begin wrapping component
export default function ApplicationProvider({
  children,
}: {
  children: ReactElement;
}) {
  const [runtimeLevel] = useLocalStorage("P3RuntimeLevel");

  // Global troubleshooting keybindings
  useEffect(() => {
    {
      isWindows
        ? manager.registerHotkey({
            key: "~",
            ctrl: false,
            shift: true,
            alt: true,
            callback: () => DumpDeploymentDetails(),
          })
        : manager.registerHotkey({
            key: "~",
            ctrl: true,
            shift: true,
            alt: false,
            callback: () => DumpDeploymentDetails(),
          }),
        [manager, DumpDeploymentDetails];
    }
  });

  // Test PWA API support
  // This is only supported by Chromium-based browsers
  if (isChrome) {
    useEffect(() => {
      // getInstalledRelatedApps() is not typed yet
      // @ts-ignore
      const isPWA = navigator.getInstalledRelatedApps();
      // This will be replaced with a LocalStorage entry ("P3PWARuntime")
      if (isPWA) {
        console.debug(
          "This is a test API response indicating that the PWA is installed"
        );
      }
    });
  }

  useEffect(() => {
    if (isIE) {
      writeStorage("P3RuntimeLevel", 0);
    } else {
      if (isLegacyEdge) {
        writeStorage("P3RuntimeLevel", 0);
      } else {
        if (isYandex) {
          writeStorage("P3RuntimeLevel", 0);
        } else {
          writeStorage("P3RuntimeLevel", 4);
        }
      }
    }
  });

  return (
    <ChakraProvider theme={UITheme}>
      <ErrorFallbackApplication>
        <KeybindingProvider manager={manager}>
          <>
            {/* Excluding UpdateProvider will break PWA functionality */}
            <UpdateProvider />
            <BatteryMonitoringProvider />
            {/* If runtimeLevel = 0 render BrowserNotPermitted instead of children  */}
            {runtimeLevel === "0" ? (
              <BrowserNotPermitted browser="Unknown Browser" />
            ) : (
              children
            )}
          </>
        </KeybindingProvider>
      </ErrorFallbackApplication>
    </ChakraProvider>
  );
}
