/**
 * Loader script for smooth page transitions
 *
 * This script runs before the main newtab.js to ensure a smooth loading experience.
 * It handles initial theme application to prevent flash of unstyled content (FOUC)
 * and prepares background elements for a seamless transition.
 */

// Execute immediately when the script loads
(function () {
  // Try to get the current theme from storage
  let initialTheme = "#121212"; // Default dark color
  let initialGradientStart = "#121212";
  let initialGradientEnd = "#1a1a1a";
  let initialTextColor = "rgba(255, 255, 255, 0.97)";

  // Try to read from localStorage to get theme info
  try {
    const savedSettings = localStorage.getItem("noirSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      const themeKey = settings.theme || "classic";

      // Define all theme colors in one place for consistency
      const themeColors = {
        classic: {
          bgColor: "#121212",
          bgGradientStart: "#121212",
          bgGradientEnd: "#1a1a1a",
          textColor: "rgba(255, 255, 255, 0.97)",
          accentColor: "#5C6BC0",
          noiseColor: "rgba(92, 107, 192, 0.08)",
          noiseOpacity: "0.35",
          noiseBlendMode: "soft-light",
        },
        dynamic: {
          bgColor: "#121212", // Will be calculated based on time
          bgGradientStart: "#121212",
          bgGradientEnd: "#1a1a1a",
          textColor: "rgba(255, 255, 255, 0.97)",
          accentColor: "#5C6BC0",
          noiseColor: "rgba(92, 107, 192, 0.08)",
          noiseOpacity: "0.35",
          noiseBlendMode: "soft-light",
        },
        dynamicDark: {
          bgColor: "#121212", // Will be calculated based on time
          bgGradientStart: "#121212",
          bgGradientEnd: "#1a1a1a",
          textColor: "rgba(255, 255, 255, 0.97)",
          accentColor: "#5C6BC0",
          noiseColor: "rgba(92, 107, 192, 0.08)",
          noiseOpacity: "0.35",
          noiseBlendMode: "soft-light",
        },
        midnight: {
          bgColor: "#0f172a",
          bgGradientStart: "#0f172a",
          bgGradientEnd: "#1e293b",
          textColor: "rgba(255, 255, 255, 0.97)",
          accentColor: "#38bdf8",
          noiseColor: "rgba(56, 189, 248, 0.07)",
          noiseOpacity: "0.3",
          noiseBlendMode: "soft-light",
        },
        forest: {
          bgColor: "#0f1922",
          bgGradientStart: "#0f1922",
          bgGradientEnd: "#1a2e32",
          textColor: "rgba(255, 255, 255, 0.97)",
          accentColor: "#10b981",
          noiseColor: "rgba(16, 185, 129, 0.06)",
          noiseOpacity: "0.3",
          noiseBlendMode: "soft-light",
        },
        nord: {
          bgColor: "#2e3440",
          bgGradientStart: "#2e3440",
          bgGradientEnd: "#3b4252",
          textColor: "rgba(236, 239, 244, 0.97)",
          accentColor: "#88c0d0",
          noiseColor: "rgba(136, 192, 208, 0.06)",
          noiseOpacity: "0.3",
          noiseBlendMode: "soft-light",
        },
      };

      // Handle dynamic themes
      if (themeKey.startsWith("dynamic")) {
        // All dynamic themes now use dark theme
        const themeToUse = "classic";

        // Get the base theme
        const baseTheme = themeColors[themeToUse];

        // Create a dynamic theme based on the time
        const dynamicTheme = {
          ...baseTheme,
          // Store that this is a dynamic theme
          isDynamic: true,
          baseTheme: themeToUse,
        };

        // Apply the dynamic theme
        initialTheme = dynamicTheme.bgColor;
        initialGradientStart = dynamicTheme.bgGradientStart;
        initialGradientEnd = dynamicTheme.bgGradientEnd;
        initialTextColor = dynamicTheme.textColor;

        // Store additional theme properties for later use
        window.initialThemeData = dynamicTheme;
      } else {
        // Apply the selected static theme or fallback to classic
        const selectedTheme = themeColors[themeKey] || themeColors.classic;

        initialTheme = selectedTheme.bgColor;
        initialGradientStart = selectedTheme.bgGradientStart;
        initialGradientEnd = selectedTheme.bgGradientEnd;
        initialTextColor = selectedTheme.textColor;

        // Store additional theme properties for later use
        window.initialThemeData = selectedTheme;
      }
    }
  } catch (e) {
    console.log("Error reading theme from storage, using default");
  }

  // CRITICAL: Apply theme immediately to prevent flash
  document.documentElement.style.setProperty("--bg-color", initialTheme);
  document.documentElement.style.setProperty(
    "--bg-gradient-start",
    initialGradientStart
  );
  document.documentElement.style.setProperty(
    "--bg-gradient-end",
    initialGradientEnd
  );
  document.documentElement.style.setProperty(
    "--text-primary",
    initialTextColor
  );

  // Also set these for completeness
  document.documentElement.style.setProperty(
    "--text-secondary",
    initialTextColor.replace("0.97", "0.78").replace("0.95", "0.75")
  );
  document.documentElement.style.setProperty(
    "--text-tertiary",
    initialTextColor.replace("0.97", "0.5").replace("0.95", "0.5")
  );
  document.documentElement.style.setProperty("--accent-color", "#5C6BC0");

  // CRITICAL: Ensure body is visible with the right theme
  document.body.style.backgroundColor = initialTheme;
  document.body.style.color = initialTextColor;

  // Always use dark theme
  document.body.classList.remove("light-theme");
  document.body.classList.add("dark-theme");

  // Also apply to the loading overlay directly
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.backgroundColor = initialTheme;

    // Add a subtle gradient to the loading overlay to match the theme
    if (window.initialThemeData) {
      loadingOverlay.style.background = `linear-gradient(135deg, ${initialGradientStart}, ${initialGradientEnd})`;
    }

    // Ensure the loading overlay transitions properly but quickly
    loadingOverlay.style.transition =
      "background-color 0.1s ease-out, opacity 0.1s ease-out, background 0.1s ease-out";
  }

  // Pre-initialize background elements
  const bgGradient = document.querySelector(".background-gradient");
  const noiseOverlay = document.querySelector(".noise-overlay");
  const container = document.querySelector(".container");

  if (bgGradient) {
    // Create gradient based on the theme
    bgGradient.style.background = `radial-gradient(ellipse at top right, ${initialGradientEnd}, transparent 70%),
       radial-gradient(ellipse at bottom left, ${initialGradientStart}, transparent 70%),
       linear-gradient(135deg, ${initialGradientStart}, ${initialGradientEnd})`;
    bgGradient.style.opacity = "0.9";
  }

  if (noiseOverlay) {
    noiseOverlay.style.backgroundImage =
      'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=")';
    noiseOverlay.style.transition =
      "background-color 0.1s ease-out, opacity 0.1s ease-out, mix-blend-mode 0.1s ease-out";
    noiseOverlay.style.display = "block";

    // Apply theme-specific noise overlay settings if available
    if (window.initialThemeData) {
      noiseOverlay.style.backgroundColor = window.initialThemeData.noiseColor;
      noiseOverlay.style.opacity = window.initialThemeData.noiseOpacity;
      noiseOverlay.style.mixBlendMode = window.initialThemeData.noiseBlendMode;
    } else {
      // Fallback to dark theme settings
      noiseOverlay.style.backgroundColor = "rgba(92, 107, 192, 0.08)";
      noiseOverlay.style.opacity = "0.35";
      noiseOverlay.style.mixBlendMode = "soft-light";
    }
  }

  if (container) {
    container.style.opacity = "1";
  }

  // Add event listener for when DOM is fully loaded - make this faster
  document.addEventListener("DOMContentLoaded", function () {
    // Remove preload class immediately without delay
    document.body.classList.remove("preload");

    // Make sure everything is visible immediately
    if (bgGradient) bgGradient.style.opacity = "0.9";
    if (noiseOverlay) noiseOverlay.style.opacity = "0.35";
    if (container) container.style.opacity = "1";
  });

  // Add event listener for when everything is fully loaded - optimize for speed
  window.addEventListener("load", function () {
    // Remove preload class to enable animations
    document.body.classList.remove("preload");

    // Force a repaint to ensure smooth transitions
    document.body.offsetHeight;

    // Apply final theme settings in one go for better performance
    if (bgGradient && window.initialThemeData) {
      bgGradient.style.opacity = "0.9";
      bgGradient.style.background = `radial-gradient(ellipse at top right, ${initialGradientEnd}, transparent 70%),
        radial-gradient(ellipse at bottom left, ${initialGradientStart}, transparent 70%),
        linear-gradient(135deg, ${initialGradientStart}, ${initialGradientEnd})`;
    }

    if (noiseOverlay && window.initialThemeData) {
      noiseOverlay.style.backgroundColor = window.initialThemeData.noiseColor;
      noiseOverlay.style.opacity = window.initialThemeData.noiseOpacity;
      noiseOverlay.style.mixBlendMode = window.initialThemeData.noiseBlendMode;
    }

    if (container) {
      container.style.opacity = "1";
    }

    // Don't remove loading overlay here - we'll let newtab.js handle it
    // when all content is fully loaded
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      // Make sure the loading overlay matches the theme
      if (window.initialThemeData) {
        loadingOverlay.style.backgroundColor = initialTheme;
        loadingOverlay.style.background = `linear-gradient(135deg, ${initialGradientStart}, ${initialGradientEnd})`;
      }

      // Set a transition for fade
      loadingOverlay.style.transition = "opacity 0.4s ease-out";

      // Ensure the overlay is visible but can be removed
      loadingOverlay.style.opacity = "1";
    }
  });
})();
