/**
 * Settings management for Noir New Tab
 *
 * Handles all user settings including themes, appearance options, clock preferences,
 * search engine selection, and smart feature configuration. Provides functions for
 * loading, saving, and applying settings throughout the extension.
 *
 * @file settings.js
 * @author mosadd1X
 */

// Define preset themes
const PRESET_THEMES = {
  classic: {
    name: "Classic Dark",
    type: "dark",
    bgColor: "#121212",
    bgGradientStart: "#121212",
    bgGradientEnd: "#1a1a1a",
    textPrimary: "rgba(255, 255, 255, 0.97)",
    textSecondary: "rgba(255, 255, 255, 0.78)",
    textTertiary: "rgba(255, 255, 255, 0.5)",
    accentColor: "#5C6BC0",
    surfaceColor: "rgba(255, 255, 255, 0.05)",
    surfaceColorHover: "rgba(255, 255, 255, 0.09)",
    surfaceColorActive: "rgba(255, 255, 255, 0.13)",
  },
  dynamic: {
    name: "Dynamic",
    type: "dynamic",
    mode: "dark", // Only dark themes
    bgColor: "#121212", // Default, will be overridden
    bgGradientStart: "#121212", // Default, will be overridden
    bgGradientEnd: "#1a1a1a", // Default, will be overridden
    textPrimary: "rgba(255, 255, 255, 0.97)", // Default, will be overridden
    textSecondary: "rgba(255, 255, 255, 0.78)", // Default, will be overridden
    textTertiary: "rgba(255, 255, 255, 0.5)", // Default, will be overridden
    accentColor: "#8B5CF6", // Default purple accent
    surfaceColor: "rgba(255, 255, 255, 0.05)", // Default, will be overridden
    surfaceColorHover: "rgba(255, 255, 255, 0.09)", // Default, will be overridden
    surfaceColorActive: "rgba(255, 255, 255, 0.13)", // Default, will be overridden
  },
  midnight: {
    name: "Midnight Blue",
    type: "dark",
    bgColor: "#0f172a",
    bgGradientStart: "#0f172a",
    bgGradientEnd: "#1e293b",
    textPrimary: "rgba(255, 255, 255, 0.97)",
    textSecondary: "rgba(255, 255, 255, 0.78)",
    textTertiary: "rgba(255, 255, 255, 0.5)",
    accentColor: "#38bdf8",
    surfaceColor: "rgba(255, 255, 255, 0.05)",
    surfaceColorHover: "rgba(255, 255, 255, 0.09)",
    surfaceColorActive: "rgba(255, 255, 255, 0.13)",
  },
  forest: {
    name: "Forest",
    type: "dark",
    bgColor: "#0f1922",
    bgGradientStart: "#0f1922",
    bgGradientEnd: "#1a2e32",
    textPrimary: "rgba(255, 255, 255, 0.97)",
    textSecondary: "rgba(255, 255, 255, 0.78)",
    textTertiary: "rgba(255, 255, 255, 0.5)",
    accentColor: "#10b981",
    surfaceColor: "rgba(255, 255, 255, 0.05)",
    surfaceColorHover: "rgba(255, 255, 255, 0.09)",
    surfaceColorActive: "rgba(255, 255, 255, 0.13)",
  },
  claude: {
    name: "Claude",
    type: "dark",
    bgColor: "#262624",
    bgGradientStart: "#262624",
    bgGradientEnd: "#1F1E1D",
    textPrimary: "rgba(255, 255, 255, 0.97)",
    textSecondary: "rgba(255, 255, 255, 0.78)",
    textTertiary: "rgba(255, 255, 255, 0.5)",
    accentColor: "#E97451",
    surfaceColor: "rgba(255, 255, 255, 0.05)",
    surfaceColorHover: "rgba(255, 255, 255, 0.09)",
    surfaceColorActive: "rgba(255, 255, 255, 0.13)",
  },
  obsidian: {
    name: "Obsidian",
    type: "dark",
    bgColor: "#0a0a0c",
    bgGradientStart: "#0a0a0c",
    bgGradientEnd: "#13131a",
    textPrimary: "rgba(255, 255, 255, 0.97)",
    textSecondary: "rgba(255, 255, 255, 0.78)",
    textTertiary: "rgba(255, 255, 255, 0.5)",
    accentColor: "#a78bfa",
    surfaceColor: "rgba(255, 255, 255, 0.05)",
    surfaceColorHover: "rgba(255, 255, 255, 0.09)",
    surfaceColorActive: "rgba(255, 255, 255, 0.13)",
  },
  nord: {
    name: "Nord",
    type: "dark",
    bgColor: "#2e3440",
    bgGradientStart: "#2e3440",
    bgGradientEnd: "#3b4252",
    textPrimary: "rgba(236, 239, 244, 0.97)",
    textSecondary: "rgba(236, 239, 244, 0.78)",
    textTertiary: "rgba(236, 239, 244, 0.5)",
    accentColor: "#88c0d0",
    surfaceColor: "rgba(255, 255, 255, 0.05)",
    surfaceColorHover: "rgba(255, 255, 255, 0.09)",
    surfaceColorActive: "rgba(255, 255, 255, 0.13)",
  },
};

// Define recommended accent colors for each theme
const THEME_ACCENT_COLORS = {
  classic: ["#5C6BC0", "#26A69A", "#EC407A", "#7E57C2", "#42A5F5"],
  dynamic: ["#8B5CF6", "#EC4899", "#F97316", "#3B82F6", "#10B981"],
  claude: ["#E97451", "#F08080", "#FF7F50", "#FFA07A", "#FA8072"],
  obsidian: ["#a78bfa", "#c084fc", "#8b5cf6", "#d8b4fe", "#7c3aed"],
  midnight: ["#38bdf8", "#818cf8", "#60a5fa", "#2dd4bf", "#f472b6"],
  forest: ["#10b981", "#059669", "#34d399", "#6ee7b7", "#047857"],
  nord: ["#88c0d0", "#81a1c1", "#5e81ac", "#b48ead", "#a3be8c"],
};

// Define available background patterns
const BACKGROUND_PATTERNS = {
  // Basic patterns
  none: { name: "None", file: null, category: "basic" },
  dots: { name: "Dots", file: "patterns/dots.svg", category: "basic" },
  grid: { name: "Grid", file: "patterns/grid.svg", category: "basic" },
  waves: { name: "Waves", file: "patterns/waves.svg", category: "basic" },
  diagonal: {
    name: "Diagonal",
    file: "patterns/diagonal.svg",
    category: "basic",
  },
  triangles: {
    name: "Triangles",
    file: "patterns/triangles.svg",
    category: "basic",
  },

  // Geometric patterns
  honeycomb: {
    name: "Honeycomb",
    file: "patterns/honeycomb.svg",
    category: "geometric",
  },
  chevron: {
    name: "Chevron",
    file: "patterns/chevron.svg",
    category: "geometric",
  },
  polkadots: {
    name: "Polka Dots",
    file: "patterns/polkadots.svg",
    category: "geometric",
  },

  // Technical patterns
  circuit: {
    name: "Circuit",
    file: "patterns/circuit.svg",
    category: "technical",
  },
  topographic: {
    name: "Topographic",
    file: "patterns/topographic.svg",
    category: "technical",
  },
};

// Default settings
const DEFAULT_SETTINGS = {
  theme: "classic", // Default theme key
  accentColor: "#5C6BC0", // Default accent color
  showQuote: true,
  clockFormat: "24h",
  showSeconds: false,
  defaultSearchEngine: "google",
  clockAnimation: "fade", // Options: 'none', 'fade', 'slide', 'flip', 'bounce'
  // Background settings
  timeBasedBackground: true, // Enable time-based background variations
  backgroundPattern: "none", // Default background pattern
  patternOpacity: 0.5, // Default pattern opacity (0-1)
  patternSize: 1.0, // Default pattern size scale (0.01-2.0)
  patternRotation: 0, // Default pattern rotation in degrees
  patternDensity: 1.0, // Default pattern density (0.1-5.0)
  patternAnimation: false, // Enable pattern animation
  patternAnimationType: "pulse", // Animation type: pulse, rotate, float
  timeBasedPattern: false, // Enable time-based pattern changes
  // Smart features
  smartFeaturesEnabled: true, // Enable smart features
  contextAwareGreetings: true, // Enable context-aware greetings
  userName: "", // User's name for personalized greetings
  greetingAnimation: "fade", // Animation style for greeting changes
  smartBackgroundPatterns: true, // Enable smart background patterns
  greetingTone: "friendly", // Greeting tone preference (friendly, professional, motivational, casual)

  // Privacy settings
  privacyControls: {
    trackVisits: true, // Track visit times and frequency
    trackSearches: true, // Track search queries and categories
    trackBookmarks: true, // Track bookmark usage
    trackProductivity: true, // Track productivity patterns
    dataRetentionDays: 30, // Number of days to keep user data
  },
  // Removed: patternPosition, patternFade, patternFadeAmount
};

// Current settings
let settings = { ...DEFAULT_SETTINGS };

/**
 * Load settings from Chrome storage
 * @returns {Promise} Promise that resolves when settings are loaded
 */
function loadSettings() {
  return new Promise((resolve) => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get("noirSettings", (data) => {
        if (data.noirSettings) {
          settings = { ...DEFAULT_SETTINGS, ...data.noirSettings };

          // Ensure accent color is preserved
          if (!settings.accentColor) {
            settings.accentColor = DEFAULT_SETTINGS.accentColor;
          }
        }
        applySettings();
        resolve(settings);
      });
    } else {
      // Fallback to localStorage for development
      const savedSettings = localStorage.getItem("noirSettings");
      if (savedSettings) {
        try {
          settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };

          // Ensure accent color is preserved
          if (!settings.accentColor) {
            settings.accentColor = DEFAULT_SETTINGS.accentColor;
          }
        } catch (e) {
          console.error("Error parsing settings:", e);
        }
      }
      applySettings();
      resolve(settings);
    }
  });
}

/**
 * Save settings to Chrome storage
 * @param {string} changedSetting - Optional name of the setting that was changed
 * @param {any} oldValue - Optional previous value of the setting
 * @param {any} newValue - Optional new value of the setting
 */
function saveSettings(changedSetting, oldValue, newValue) {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ noirSettings: settings });
  } else {
    // Fallback to localStorage for development
    localStorage.setItem("noirSettings", JSON.stringify(settings));
  }

  // Track settings changes if smart features are enabled and we have change info
  if (
    settings.smartFeaturesEnabled &&
    typeof trackSettingsChange === "function" &&
    changedSetting
  ) {
    trackSettingsChange(changedSetting, oldValue, newValue);
  }

  applySettings();
}

/**
 * Calculate dynamic theme colors based on time of day
 * @param {string} themeKey - The theme key (dynamic, dynamicDark, or dynamicLight)
 * @returns {Object} Theme object with calculated colors
 */
function getDynamicThemeColors(themeKey) {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  // Calculate time progress within the current period (0-1)
  // This allows for smooth transitions between time periods
  let timeProgress = 0;

  // Create a copy of the specified dynamic theme to modify
  const dynamicTheme = { ...PRESET_THEMES[themeKey] };

  // Define dark theme template
  const darkTheme = {
    type: "dark",
    textPrimary: "rgba(255, 255, 255, 0.97)",
    textSecondary: "rgba(255, 255, 255, 0.78)",
    textTertiary: "rgba(255, 255, 255, 0.5)",
    surfaceColor: "rgba(255, 255, 255, 0.05)",
    surfaceColorHover: "rgba(255, 255, 255, 0.09)",
    surfaceColorActive: "rgba(255, 255, 255, 0.13)",
  };

  // Define time periods with their theme colors
  const timePeriods = [
    // Late night (0-4): Deep night colors
    {
      startHour: 0,
      endHour: 4,
      colors: {
        bgColor: "#0f1729",
        bgGradientStart: "#0f1729",
        bgGradientEnd: "#1a1f35",
        accentColor: "#6366f1", // Indigo
      },
    },
    // Early morning (5-7): Dawn colors
    {
      startHour: 5,
      endHour: 7,
      colors: {
        bgColor: "#1f2937",
        bgGradientStart: "#1f2937",
        bgGradientEnd: "#374151",
        accentColor: "#818cf8", // Soft purple
      },
    },
    // Morning (8-11): Soft morning light
    {
      startHour: 8,
      endHour: 11,
      colors: {
        bgColor: "#1e293b",
        bgGradientStart: "#1e293b",
        bgGradientEnd: "#334155",
        accentColor: "#3b82f6", // Blue
      },
    },
    // Midday (12-15): Bright day
    {
      startHour: 12,
      endHour: 15,
      colors: {
        bgColor: "#0f172a",
        bgGradientStart: "#0f172a",
        bgGradientEnd: "#1e293b",
        accentColor: "#38bdf8", // Sky blue
      },
    },
    // Afternoon (16-18): Golden hour
    {
      startHour: 16,
      endHour: 18,
      colors: {
        bgColor: "#1e1b4b",
        bgGradientStart: "#1e1b4b",
        bgGradientEnd: "#312e81",
        accentColor: "#8b5cf6", // Purple
      },
    },
    // Evening (19-21): Sunset colors
    {
      startHour: 19,
      endHour: 21,
      colors: {
        bgColor: "#18181b",
        bgGradientStart: "#18181b",
        bgGradientEnd: "#27272a",
        accentColor: "#ec4899", // Pink
      },
    },
    // Night (22-23): Night colors
    {
      startHour: 22,
      endHour: 23,
      colors: {
        bgColor: "#0c0a20",
        bgGradientStart: "#0c0a20",
        bgGradientEnd: "#171738",
        accentColor: "#7c3aed", // Violet
      },
    },
  ];

  // Find current time period
  let currentPeriod = null;
  let nextPeriod = null;

  for (let i = 0; i < timePeriods.length; i++) {
    const period = timePeriods[i];
    if (hour >= period.startHour && hour <= period.endHour) {
      currentPeriod = period;
      nextPeriod = timePeriods[(i + 1) % timePeriods.length];

      // Calculate progress within this period
      const periodDuration = (period.endHour - period.startHour + 1) * 60; // in minutes
      const minutesIntoCurrentPeriod = (hour - period.startHour) * 60 + minute;
      timeProgress = minutesIntoCurrentPeriod / periodDuration;

      break;
    }
  }

  // If no period found, use late night as default
  if (!currentPeriod) {
    currentPeriod = timePeriods[0];
    nextPeriod = timePeriods[1];
    timeProgress = 0;
  }

  // Apply base theme
  Object.assign(dynamicTheme, darkTheme);

  // Apply current period colors
  Object.assign(dynamicTheme, currentPeriod.colors);

  // If we're in the last 20% of the current period, start blending with next period
  if (timeProgress > 0.8) {
    // Normalize progress for transition (0-1 range for the last 20% of the period)
    const transitionProgress = (timeProgress - 0.8) * 5;

    // Blend colors between current and next period
    dynamicTheme.bgColor = blendColors(
      currentPeriod.colors.bgColor,
      nextPeriod.colors.bgColor,
      transitionProgress
    );

    dynamicTheme.bgGradientStart = blendColors(
      currentPeriod.colors.bgGradientStart,
      nextPeriod.colors.bgGradientStart,
      transitionProgress
    );

    dynamicTheme.bgGradientEnd = blendColors(
      currentPeriod.colors.bgGradientEnd,
      nextPeriod.colors.bgGradientEnd,
      transitionProgress
    );

    // Don't blend accent color to avoid weird intermediate colors
    // We'll switch accent color at the period boundary
  }

  return dynamicTheme;
}

/**
 * Blend two hex colors
 * @param {string} color1 - First hex color
 * @param {string} color2 - Second hex color
 * @param {number} ratio - Blend ratio (0-1)
 * @returns {string} Blended hex color
 */
function blendColors(color1, color2, ratio) {
  // Convert hex to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  // Blend colors
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);

  // Convert back to hex
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Apply settings to the UI
 */
function applySettings() {
  // Make sure userName is initialized
  if (settings.userName === undefined) {
    settings.userName = "";
  }

  // Get the current theme
  let themeToApply;

  if (PRESET_THEMES[settings.theme]) {
    // Check if it's one of the dynamic themes and time-based background is enabled
    if (
      settings.timeBasedBackground &&
      (settings.theme === "dynamic" ||
        settings.theme === "dynamicDark" ||
        settings.theme === "dynamicLight")
    ) {
      // Calculate dynamic theme colors based on time of day and theme mode
      themeToApply = getDynamicThemeColors(settings.theme);

      // Schedule next update at the next hour change
      scheduleNextThemeUpdate();
    } else {
      // Use preset theme
      themeToApply = PRESET_THEMES[settings.theme];
    }
  } else {
    // Fallback to classic theme
    themeToApply = PRESET_THEMES.classic;
  }

  // Apply theme colors
  document.documentElement.style.setProperty(
    "--bg-color",
    themeToApply.bgColor
  );
  document.documentElement.style.setProperty(
    "--bg-gradient-start",
    themeToApply.bgGradientStart
  );
  document.documentElement.style.setProperty(
    "--bg-gradient-end",
    themeToApply.bgGradientEnd
  );

  // Update body background color directly for better compatibility
  document.body.style.backgroundColor = themeToApply.bgColor;

  // Update background gradient directly
  const bgGradient = document.querySelector(".background-gradient");
  if (bgGradient) {
    bgGradient.style.background = `radial-gradient(ellipse at top right, ${themeToApply.bgGradientEnd}, transparent 70%),
      radial-gradient(ellipse at bottom left, ${themeToApply.bgGradientStart}, transparent 70%),
      linear-gradient(135deg, ${themeToApply.bgGradientStart}, ${themeToApply.bgGradientEnd})`;
  }
  document.documentElement.style.setProperty(
    "--text-primary",
    themeToApply.textPrimary
  );
  document.documentElement.style.setProperty(
    "--text-secondary",
    themeToApply.textSecondary
  );
  document.documentElement.style.setProperty(
    "--text-tertiary",
    themeToApply.textTertiary
  );
  document.documentElement.style.setProperty(
    "--surface-color",
    themeToApply.surfaceColor
  );
  document.documentElement.style.setProperty(
    "--surface-color-hover",
    themeToApply.surfaceColorHover
  );
  document.documentElement.style.setProperty(
    "--surface-color-active",
    themeToApply.surfaceColorActive
  );

  // Apply accent color from settings
  const accentColor = settings.accentColor;
  document.documentElement.style.setProperty("--accent-color", accentColor);

  // Calculate hover color (slightly lighter)
  const hoverColor = lightenColor(accentColor, 15);
  document.documentElement.style.setProperty(
    "--accent-color-hover",
    hoverColor
  );

  // Set RGB values for accent color for advanced effects
  const rgbValues = hexToRgb(accentColor);
  if (rgbValues) {
    document.documentElement.style.setProperty(
      "--accent-color-rgb",
      `${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}`
    );
  }

  // Always apply dark theme class to body
  document.body.classList.add("dark-theme");
  document.body.classList.remove("light-theme");

  // Update the loading overlay to match the theme, but don't remove it
  // The loading overlay will be removed by newtab.js when all content is loaded
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    // Update the loading overlay background to match the theme
    loadingOverlay.style.backgroundColor = themeToApply.bgColor;
    loadingOverlay.style.background = `linear-gradient(135deg, ${themeToApply.bgGradientStart}, ${themeToApply.bgGradientEnd})`;

    // Set a transition for fade
    loadingOverlay.style.transition = "opacity 0.4s ease-out";

    // Don't interfere with the overlay removal process
  }

  // Adapt noise overlay to the theme colors
  const noiseOverlay = document.querySelector(".noise-overlay");
  if (noiseOverlay) {
    // We'll use the accent color for the noise overlay

    // Create a color that complements the theme
    let overlayColor;
    let overlayOpacity;
    let blendMode;

    // Special handling for specific themes
    if (settings.theme === "claude") {
      // Claude theme gets a subtle coral-tinted noise
      overlayColor = `rgba(233, 116, 81, 0.05)`; // Using the theme's accent color
      overlayOpacity = "0.25";
      blendMode = "soft-light";
    } else if (settings.theme === "midnight") {
      // Midnight theme gets a special blue-tinted noise
      overlayColor = `rgba(56, 189, 248, 0.07)`; // Using the theme's accent color
      overlayOpacity = "0.3";
      blendMode = "soft-light";
    } else if (settings.theme === "forest") {
      // Forest theme gets a green-tinted noise
      overlayColor = `rgba(16, 185, 129, 0.06)`; // Using the theme's accent color
      overlayOpacity = "0.3";
      blendMode = "soft-light";
    } else if (settings.theme === "nord") {
      // Nord theme gets a special cool blue-gray noise
      overlayColor = `rgba(136, 192, 208, 0.06)`; // Using the theme's accent color
      overlayOpacity = "0.3";
      blendMode = "soft-light";
    }
    // Special handling for dynamic themes
    else if (settings.theme.startsWith("dynamic")) {
      // For dynamic themes, use a more pronounced accent color influence
      overlayOpacity = "0.4";
      blendMode = "soft-light";
      const colorIntensity = "0.12";

      overlayColor = `rgba(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}, ${colorIntensity})`;
    }
    // For all other dark themes, use a lighter version of the background
    else {
      // Use a mix of the accent color and background
      overlayColor = `rgba(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}, 0.08)`;
      overlayOpacity = "0.35";
      blendMode = "soft-light";
    }

    // Apply the calculated color with proper transitions
    noiseOverlay.style.transition =
      "background-color 0.5s ease-out, opacity 0.5s ease-out, mix-blend-mode 0.5s ease-out";
    noiseOverlay.style.backgroundColor = overlayColor;
    noiseOverlay.style.opacity = overlayOpacity;
    noiseOverlay.style.mixBlendMode = blendMode;

    // Ensure the overlay is visible
    if (
      parseFloat(overlayOpacity) > 0 &&
      noiseOverlay.style.display === "none"
    ) {
      noiseOverlay.style.display = "block";
    }
  }

  // Initialize background pattern select
  const backgroundPatternSelect = document.getElementById("background-pattern");
  if (backgroundPatternSelect) {
    backgroundPatternSelect.value = settings.backgroundPattern || "none";
  }

  // Initialize pattern opacity slider
  const patternOpacitySlider = document.getElementById("pattern-opacity");
  const patternOpacityValue = document.getElementById("pattern-opacity-value");
  if (patternOpacitySlider && patternOpacityValue) {
    patternOpacitySlider.value = settings.patternOpacity || 0.5;
    patternOpacityValue.textContent = `${Math.round(
      (settings.patternOpacity || 0.5) * 100
    )}%`;
  }

  // Initialize pattern size slider
  const patternSizeSlider = document.getElementById("pattern-size");
  const patternSizeValue = document.getElementById("pattern-size-value");
  if (patternSizeSlider && patternSizeValue) {
    patternSizeSlider.value = settings.patternSize || 1.0;
    patternSizeValue.textContent = `${Math.round(
      (settings.patternSize || 1.0) * 100
    )}%`;
  }

  // Initialize pattern rotation slider
  const patternRotationSlider = document.getElementById("pattern-rotation");
  const patternRotationValue = document.getElementById(
    "pattern-rotation-value"
  );
  if (patternRotationSlider && patternRotationValue) {
    patternRotationSlider.value = settings.patternRotation || 0;
    patternRotationValue.textContent = `${settings.patternRotation || 0}°`;
  }

  // Initialize pattern density slider
  const patternDensitySlider = document.getElementById("pattern-density");
  const patternDensityValue = document.getElementById("pattern-density-value");
  if (patternDensitySlider && patternDensityValue) {
    patternDensitySlider.value = settings.patternDensity || 1.0;
    patternDensityValue.textContent = `${Math.round(
      (settings.patternDensity || 1.0) * 100
    )}%`;
  }

  // Initialize pattern animation toggle
  const patternAnimationToggle = document.getElementById("pattern-animation");
  if (patternAnimationToggle) {
    patternAnimationToggle.checked = settings.patternAnimation || false;

    // Show/hide animation type selector based on toggle state
    const animationTypeContainers = document.querySelectorAll(
      ".pattern-animation-type-container"
    );
    animationTypeContainers.forEach((container) => {
      container.style.display = settings.patternAnimation ? "flex" : "none";
    });
  }

  // Initialize time-based pattern toggle
  const timeBasedPatternToggle = document.getElementById("time-based-pattern");
  if (timeBasedPatternToggle) {
    timeBasedPatternToggle.checked = settings.timeBasedPattern || false;
  }

  // Initialize pattern animation type dropdown
  const patternAnimationTypeSelect = document.getElementById(
    "pattern-animation-type"
  );
  if (patternAnimationTypeSelect) {
    patternAnimationTypeSelect.value = settings.patternAnimationType || "pulse";
  }

  // Pattern position, fade toggle, and fade amount controls have been removed

  // Check if time-based pattern is enabled
  if (settings.timeBasedPattern) {
    // Update the pattern based on time
    settings.backgroundPattern = getTimeBasedPattern();

    // Update the pattern dropdown to reflect the time-based pattern
    if (backgroundPatternSelect) {
      backgroundPatternSelect.value = settings.backgroundPattern;
    }

    // Schedule next pattern update
    scheduleNextPatternUpdate();
  }

  // Apply background pattern if selected
  applyBackgroundPattern();

  // Update accent color UI
  updateAccentColorUI();

  if (document.getElementById("show-quote")) {
    document.getElementById("show-quote").checked = settings.showQuote;
  }

  if (document.getElementById("clock-format")) {
    document.getElementById("clock-format").value = settings.clockFormat;
  }

  if (document.getElementById("show-seconds")) {
    document.getElementById("show-seconds").checked = settings.showSeconds;
  }

  if (document.getElementById("default-search-engine")) {
    document.getElementById("default-search-engine").value =
      settings.defaultSearchEngine;
  }

  if (document.getElementById("clock-animation")) {
    document.getElementById("clock-animation").value = settings.clockAnimation;
  }

  if (document.getElementById("time-based-background")) {
    document.getElementById("time-based-background").checked =
      settings.timeBasedBackground;
  }

  // Show/hide quote
  const quoteModule = document.getElementById("quote-module");
  if (quoteModule) {
    quoteModule.style.display = settings.showQuote ? "block" : "none";
  }

  // Weather settings
  if (document.getElementById("show-weather")) {
    document.getElementById("show-weather").checked = settings.weatherEnabled;
  }

  if (document.getElementById("weather-unit")) {
    document.getElementById("weather-unit").value = settings.weatherUnit;
  }

  if (document.getElementById("weather-location")) {
    document.getElementById("weather-location").value =
      settings.weatherLocation;
  }

  if (document.getElementById("weather-update-interval")) {
    document.getElementById("weather-update-interval").value =
      settings.weatherUpdateInterval.toString();
  }

  // Apply clock animation class
  const clockElement = document.getElementById("clock");
  if (clockElement) {
    // Remove all animation classes first
    clockElement.classList.remove(
      "clock-animation-none",
      "clock-animation-fade",
      "clock-animation-slide",
      "clock-animation-flip",
      "clock-animation-bounce"
    );

    // Add the selected animation class
    clockElement.classList.add(`clock-animation-${settings.clockAnimation}`);
  }

  // Initialize smart features settings
  if (document.getElementById("smart-features-enabled")) {
    document.getElementById("smart-features-enabled").checked =
      settings.smartFeaturesEnabled;
  }

  if (document.getElementById("user-name")) {
    document.getElementById("user-name").value = settings.userName || "";
  }

  if (document.getElementById("context-aware-greetings")) {
    document.getElementById("context-aware-greetings").checked =
      settings.contextAwareGreetings;
    document.getElementById("context-aware-greetings").disabled =
      !settings.smartFeaturesEnabled;
  }

  if (document.getElementById("greeting-animation")) {
    document.getElementById("greeting-animation").value =
      settings.greetingAnimation || "fade";
  }

  if (document.getElementById("smart-background-patterns")) {
    document.getElementById("smart-background-patterns").checked =
      settings.smartBackgroundPatterns;
  }

  if (document.getElementById("greeting-tone")) {
    document.getElementById("greeting-tone").value =
      settings.greetingTone || "friendly";
  }

  // Initialize privacy controls
  if (document.getElementById("track-visits")) {
    document.getElementById("track-visits").checked =
      settings.privacyControls.trackVisits;
  }

  if (document.getElementById("track-searches")) {
    document.getElementById("track-searches").checked =
      settings.privacyControls.trackSearches;
  }

  if (document.getElementById("track-bookmarks")) {
    document.getElementById("track-bookmarks").checked =
      settings.privacyControls.trackBookmarks;
  }

  if (document.getElementById("track-productivity")) {
    document.getElementById("track-productivity").checked =
      settings.privacyControls.trackProductivity;
  }

  if (document.getElementById("data-retention")) {
    document.getElementById("data-retention").value =
      settings.privacyControls.dataRetentionDays;
    document.getElementById("data-retention-value").textContent =
      settings.privacyControls.dataRetentionDays;
  }
}

/**
 * Initialize settings panel event listeners
 */
function initSettingsPanel() {
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings-panel");
  const closeSettings = document.getElementById("close-settings");

  // Toggle settings panel
  settingsToggle.addEventListener("click", () => {
    settingsPanel.classList.toggle("active");
  });

  // Close settings panel
  closeSettings.addEventListener("click", () => {
    settingsPanel.classList.remove("active");
  });

  // Close settings when clicking outside
  document.addEventListener("click", (e) => {
    // Check if settings panel is active
    if (!settingsPanel.classList.contains("active")) {
      return;
    }

    // Check if click is outside the settings panel and not on the toggle
    if (
      !settingsPanel.contains(e.target) &&
      e.target !== settingsToggle &&
      !settingsToggle.contains(e.target)
    ) {
      // Check if click is not on any color option or color picker
      const isColorOption = e.target.classList.contains("accent-color-option");
      const isColorPicker = e.target.closest(".custom-color-wrapper");

      if (!isColorOption && !isColorPicker) {
        settingsPanel.classList.remove("active");
      }
    }
  });

  // Initialize settings tabs
  initSettingsTabs();

  // Initialize settings controls
  initSettingsControls();

  // Convert standard selects to custom dropdowns
  initCustomDropdowns();
}

/**
 * Initialize settings tabs functionality with improved transitions
 */
function initSettingsTabs() {
  const settingsTabs = document.querySelectorAll(".settings-tab");

  settingsTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // If this tab is already active, do nothing
      if (tab.classList.contains("active")) {
        return;
      }

      // Get the current active tab content
      const currentActiveContent = document.querySelector(
        ".settings-tab-content.active"
      );

      // Get the target tab content
      const tabId = tab.dataset.tab;
      const targetContent = document.getElementById(`${tabId}-tab`);

      // Remove active class from all tabs
      settingsTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      if (targetContent && currentActiveContent) {
        // Immediate switch without animation for smoother experience
        currentActiveContent.classList.remove("active");

        // Force a reflow before adding the active class to the new content
        void targetContent.offsetWidth;

        // Show the new content
        targetContent.classList.add("active");
      } else if (targetContent) {
        // If there's no current active content, just show the target
        targetContent.classList.add("active");
      }
    });
  });
}

/**
 * Initialize settings controls
 */
function initSettingsControls() {
  const accentColorInput = document.getElementById("accent-color");
  // Accent color options are now generated dynamically
  const showQuoteToggle = document.getElementById("show-quote");
  const showSecondsToggle = document.getElementById("show-seconds");
  const themeOptions = document.querySelectorAll(".theme-option");

  // Smart features settings
  const smartFeaturesEnabledToggle = document.getElementById(
    "smart-features-enabled"
  );
  const contextAwareGreetingsToggle = document.getElementById(
    "context-aware-greetings"
  );
  const resetUserDataButton = document.getElementById("reset-user-data");

  // Initialize theme options
  updateActiveTheme();

  // Initialize accent color options
  updateAccentColorUI();

  // Handle theme selection
  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const themeKey = option.dataset.theme;
      const oldTheme = settings.theme;
      const oldAccentColor = settings.accentColor;

      // Update theme setting
      settings.theme = themeKey;

      // Reset accent color to theme default
      if (PRESET_THEMES[themeKey]) {
        settings.accentColor = PRESET_THEMES[themeKey].accentColor;
      }

      // Update UI
      updateActiveTheme();

      // Update accent color UI
      updateAccentColorUI();

      // Save settings
      saveSettings("theme", oldTheme, themeKey);

      // If accent color changed, track that too
      if (oldAccentColor !== settings.accentColor) {
        saveSettings("accentColor", oldAccentColor, settings.accentColor);
      }
    });
  });

  // Accent color options are now handled dynamically in updateAccentColorUI

  // Update settings when custom color input changes
  accentColorInput.addEventListener("change", (e) => {
    // Prevent event from bubbling up to document
    e.stopPropagation();

    const oldColor = settings.accentColor;
    const color = accentColorInput.value;
    settings.accentColor = color;

    // Update UI
    updateAccentColorUI();

    // Apply settings
    applySettings();

    // Save settings
    saveSettings("accentColor", oldColor, color);
  });

  // Add click handler for the custom color button
  const customColorButton = document.querySelector(".custom-color-button");
  customColorButton.addEventListener("click", (e) => {
    // Prevent event from bubbling up to document
    e.stopPropagation();

    // Programmatically click the hidden color input
    accentColorInput.click();
  });

  // Theme export/import functionality has been removed

  // Toggle quote display
  if (showQuoteToggle) {
    showQuoteToggle.addEventListener("change", () => {
      const oldValue = settings.showQuote;
      settings.showQuote = showQuoteToggle.checked;
      saveSettings("showQuote", oldValue, showQuoteToggle.checked);
    });
  }

  // Toggle seconds display
  if (showSecondsToggle) {
    showSecondsToggle.addEventListener("change", () => {
      const oldValue = settings.showSeconds;
      settings.showSeconds = showSecondsToggle.checked;
      saveSettings("showSeconds", oldValue, showSecondsToggle.checked);
    });
  }

  // Toggle time-based background
  const timeBasedBackgroundToggle = document.getElementById(
    "time-based-background"
  );
  if (timeBasedBackgroundToggle) {
    timeBasedBackgroundToggle.addEventListener("change", () => {
      const oldValue = settings.timeBasedBackground;
      settings.timeBasedBackground = timeBasedBackgroundToggle.checked;
      saveSettings(
        "timeBasedBackground",
        oldValue,
        timeBasedBackgroundToggle.checked
      );

      // If dynamic theme is active, update it immediately
      if (settings.theme === "dynamic") {
        applySettings();

        // Schedule next update if enabled
        if (settings.timeBasedBackground) {
          scheduleNextThemeUpdate();
        }
      }
    });
  }

  // Background pattern select
  const backgroundPatternSelect = document.getElementById("background-pattern");

  if (backgroundPatternSelect) {
    backgroundPatternSelect.value = settings.backgroundPattern || "none";

    backgroundPatternSelect.addEventListener("change", () => {
      settings.backgroundPattern = backgroundPatternSelect.value;
      saveSettings();
      applyBackgroundPattern();
    });
  }

  // Pattern opacity slider
  const patternOpacitySlider = document.getElementById("pattern-opacity");
  const patternOpacityValue = document.getElementById("pattern-opacity-value");
  if (patternOpacitySlider && patternOpacityValue) {
    patternOpacitySlider.value = settings.patternOpacity || 0.5;
    patternOpacityValue.textContent = `${Math.round(
      (settings.patternOpacity || 0.5) * 100
    )}%`;

    patternOpacitySlider.addEventListener("input", () => {
      const opacity = parseFloat(patternOpacitySlider.value);
      settings.patternOpacity = opacity;
      patternOpacityValue.textContent = `${Math.round(opacity * 100)}%`;
      applyBackgroundPattern();
    });

    patternOpacitySlider.addEventListener("change", () => {
      saveSettings();
    });
  }

  // Pattern size slider
  const patternSizeSlider = document.getElementById("pattern-size");
  const patternSizeValue = document.getElementById("pattern-size-value");
  if (patternSizeSlider && patternSizeValue) {
    patternSizeSlider.value = settings.patternSize || 1.0;
    patternSizeValue.textContent = `${Math.round(
      (settings.patternSize || 1.0) * 100
    )}%`;

    patternSizeSlider.addEventListener("input", () => {
      const size = parseFloat(patternSizeSlider.value);
      settings.patternSize = size;
      patternSizeValue.textContent = `${Math.round(size * 100)}%`;
      applyBackgroundPattern();
    });

    patternSizeSlider.addEventListener("change", () => {
      saveSettings();
    });
  }

  // Pattern rotation slider
  const patternRotationSlider = document.getElementById("pattern-rotation");
  const patternRotationValue = document.getElementById(
    "pattern-rotation-value"
  );
  if (patternRotationSlider && patternRotationValue) {
    patternRotationSlider.value = settings.patternRotation || 0;
    patternRotationValue.textContent = `${settings.patternRotation || 0}°`;

    patternRotationSlider.addEventListener("input", () => {
      const rotation = parseInt(patternRotationSlider.value);
      settings.patternRotation = rotation;
      patternRotationValue.textContent = `${rotation}°`;
      applyBackgroundPattern();
    });

    patternRotationSlider.addEventListener("change", () => {
      saveSettings();
    });
  }

  // Pattern density slider
  const patternDensitySlider = document.getElementById("pattern-density");
  const patternDensityValue = document.getElementById("pattern-density-value");
  if (patternDensitySlider && patternDensityValue) {
    patternDensitySlider.value = settings.patternDensity || 1.0;
    patternDensityValue.textContent = `${Math.round(
      (settings.patternDensity || 1.0) * 100
    )}%`;

    patternDensitySlider.addEventListener("input", () => {
      const density = parseFloat(patternDensitySlider.value);
      settings.patternDensity = density;
      patternDensityValue.textContent = `${Math.round(density * 100)}%`;
      applyBackgroundPattern();
    });

    patternDensitySlider.addEventListener("change", () => {
      saveSettings();
    });
  }

  // Pattern animation toggle
  const patternAnimationToggle = document.getElementById("pattern-animation");
  if (patternAnimationToggle) {
    patternAnimationToggle.checked = settings.patternAnimation || false;

    patternAnimationToggle.addEventListener("change", () => {
      const oldValue = settings.patternAnimation;
      settings.patternAnimation = patternAnimationToggle.checked;

      // Show/hide animation type selector based on toggle state
      const animationTypeContainers = document.querySelectorAll(
        ".pattern-animation-type-container"
      );
      animationTypeContainers.forEach((container) => {
        container.style.display = settings.patternAnimation ? "flex" : "none";
      });

      saveSettings(
        "patternAnimation",
        oldValue,
        patternAnimationToggle.checked
      );
      applyBackgroundPattern();
    });
  }

  // Pattern animation type dropdown
  const patternAnimationTypeSelect = document.getElementById(
    "pattern-animation-type"
  );
  if (patternAnimationTypeSelect) {
    patternAnimationTypeSelect.value = settings.patternAnimationType || "pulse";

    patternAnimationTypeSelect.addEventListener("change", () => {
      const oldValue = settings.patternAnimationType;
      settings.patternAnimationType = patternAnimationTypeSelect.value;
      saveSettings(
        "patternAnimationType",
        oldValue,
        patternAnimationTypeSelect.value
      );
      applyBackgroundPattern();
    });
  }

  // Time-based pattern toggle
  const timeBasedPatternToggle = document.getElementById("time-based-pattern");
  if (timeBasedPatternToggle) {
    timeBasedPatternToggle.checked = settings.timeBasedPattern || false;

    timeBasedPatternToggle.addEventListener("change", () => {
      const oldValue = settings.timeBasedPattern;
      settings.timeBasedPattern = timeBasedPatternToggle.checked;

      // If time-based pattern is enabled, update the pattern based on time
      if (settings.timeBasedPattern) {
        const oldPattern = settings.backgroundPattern;
        settings.backgroundPattern = getTimeBasedPattern();

        // Update the pattern dropdown to reflect the time-based pattern
        if (backgroundPatternSelect) {
          backgroundPatternSelect.value = settings.backgroundPattern;
        }

        // Track pattern change
        saveSettings(
          "backgroundPattern",
          oldPattern,
          settings.backgroundPattern
        );
      }

      saveSettings(
        "timeBasedPattern",
        oldValue,
        timeBasedPatternToggle.checked
      );
      applyBackgroundPattern();

      // Schedule next update at the next hour change if time-based pattern is enabled
      if (settings.timeBasedPattern) {
        scheduleNextPatternUpdate();
      }
    });
  }

  // Pattern position, fade toggle, and fade amount event listeners have been removed

  // Smart features enabled toggle
  if (smartFeaturesEnabledToggle) {
    smartFeaturesEnabledToggle.checked = settings.smartFeaturesEnabled;
    smartFeaturesEnabledToggle.addEventListener("change", () => {
      const oldValue = settings.smartFeaturesEnabled;
      settings.smartFeaturesEnabled = smartFeaturesEnabledToggle.checked;
      saveSettings(
        "smartFeaturesEnabled",
        oldValue,
        smartFeaturesEnabledToggle.checked
      );

      // Update dependent toggles
      if (contextAwareGreetingsToggle) {
        contextAwareGreetingsToggle.disabled = !settings.smartFeaturesEnabled;
      }

      const smartBackgroundPatternsToggle = document.getElementById(
        "smart-background-patterns"
      );
      if (smartBackgroundPatternsToggle) {
        smartBackgroundPatternsToggle.disabled = !settings.smartFeaturesEnabled;
      }

      // Refresh greeting if smart features are toggled
      const greetingElement = document.getElementById("greeting");
      if (greetingElement) {
        const now = new Date();
        if (typeof updateGreeting === "function") {
          updateGreeting(now.getHours(), greetingElement);
        }
      }

      // Apply or revert smart background pattern
      if (settings.smartFeaturesEnabled && settings.smartBackgroundPatterns) {
        // We'll handle this in the main script
        document.dispatchEvent(new CustomEvent("applySmartPattern"));
      } else {
        // Revert to user-selected pattern
        if (typeof applyBackgroundPattern === "function") {
          applyBackgroundPattern();
        }
      }
    });
  }

  // User name input
  const userNameInput = document.getElementById("user-name");
  if (userNameInput) {
    userNameInput.value = settings.userName || "";

    // Update settings when user name changes
    userNameInput.addEventListener("input", () => {
      settings.userName = userNameInput.value.trim();
    });

    // Save settings when user finishes typing
    userNameInput.addEventListener("change", () => {
      const oldValue = settings.userName;
      settings.userName = userNameInput.value.trim();
      saveSettings("userName", oldValue, settings.userName);

      // Refresh greeting immediately
      const greetingElement = document.getElementById("greeting");
      if (greetingElement) {
        const now = new Date();
        if (typeof updateGreeting === "function") {
          updateGreeting(now.getHours(), greetingElement);
        }
      }
    });
  }

  // Context-aware greetings toggle
  if (contextAwareGreetingsToggle) {
    contextAwareGreetingsToggle.checked = settings.contextAwareGreetings;
    contextAwareGreetingsToggle.disabled = !settings.smartFeaturesEnabled;
    contextAwareGreetingsToggle.addEventListener("change", () => {
      const oldValue = settings.contextAwareGreetings;
      settings.contextAwareGreetings = contextAwareGreetingsToggle.checked;
      saveSettings(
        "contextAwareGreetings",
        oldValue,
        contextAwareGreetingsToggle.checked
      );

      // Refresh greeting immediately
      const greetingElement = document.getElementById("greeting");
      if (greetingElement) {
        const now = new Date();
        if (typeof updateGreeting === "function") {
          updateGreeting(now.getHours(), greetingElement);
        }
      }
    });
  }

  // Greeting animation dropdown
  const greetingAnimationSelect = document.getElementById("greeting-animation");
  if (greetingAnimationSelect) {
    greetingAnimationSelect.value = settings.greetingAnimation || "fade";

    greetingAnimationSelect.addEventListener("change", () => {
      const oldValue = settings.greetingAnimation;
      settings.greetingAnimation = greetingAnimationSelect.value;
      saveSettings(
        "greetingAnimation",
        oldValue,
        greetingAnimationSelect.value
      );

      // Refresh greeting immediately to apply new animation
      const greetingElement = document.getElementById("greeting");
      if (greetingElement) {
        const now = new Date();
        if (typeof updateGreeting === "function") {
          updateGreeting(now.getHours(), greetingElement);
        }
      }
    });
  }

  // Greeting tone dropdown
  const greetingToneSelect = document.getElementById("greeting-tone");
  if (greetingToneSelect) {
    greetingToneSelect.value = settings.greetingTone || "friendly";

    greetingToneSelect.addEventListener("change", () => {
      const oldValue = settings.greetingTone;
      settings.greetingTone = greetingToneSelect.value;
      saveSettings("greetingTone", oldValue, greetingToneSelect.value);

      // Refresh greeting immediately
      const greetingElement = document.getElementById("greeting");
      if (greetingElement) {
        const now = new Date();
        if (typeof updateGreeting === "function") {
          updateGreeting(now.getHours(), greetingElement);
        }
      }
    });
  }

  // Smart background patterns toggle
  const smartBackgroundPatternsToggle = document.getElementById(
    "smart-background-patterns"
  );
  if (smartBackgroundPatternsToggle) {
    smartBackgroundPatternsToggle.checked = settings.smartBackgroundPatterns;
    smartBackgroundPatternsToggle.disabled = !settings.smartFeaturesEnabled;

    smartBackgroundPatternsToggle.addEventListener("change", () => {
      const oldValue = settings.smartBackgroundPatterns;
      settings.smartBackgroundPatterns = smartBackgroundPatternsToggle.checked;
      saveSettings(
        "smartBackgroundPatterns",
        oldValue,
        smartBackgroundPatternsToggle.checked
      );

      // Apply smart background pattern immediately if enabled
      if (settings.smartBackgroundPatterns && settings.smartFeaturesEnabled) {
        // We'll handle this in the main script
        document.dispatchEvent(new CustomEvent("applySmartPattern"));
      } else {
        // Revert to user-selected pattern
        if (typeof applyBackgroundPattern === "function") {
          applyBackgroundPattern();
        }
      }
    });
  }

  // Privacy controls event listeners
  const trackVisitsToggle = document.getElementById("track-visits");
  if (trackVisitsToggle) {
    // Initialize toggle state
    trackVisitsToggle.checked = settings.privacyControls.trackVisits;

    trackVisitsToggle.addEventListener("change", () => {
      const oldValue = settings.privacyControls.trackVisits;
      settings.privacyControls.trackVisits = trackVisitsToggle.checked;
      saveSettings(
        "privacyControls.trackVisits",
        oldValue,
        trackVisitsToggle.checked
      );
    });
  }

  const trackSearchesToggle = document.getElementById("track-searches");
  if (trackSearchesToggle) {
    // Initialize toggle state
    trackSearchesToggle.checked = settings.privacyControls.trackSearches;

    trackSearchesToggle.addEventListener("change", () => {
      const oldValue = settings.privacyControls.trackSearches;
      settings.privacyControls.trackSearches = trackSearchesToggle.checked;
      saveSettings(
        "privacyControls.trackSearches",
        oldValue,
        trackSearchesToggle.checked
      );
    });
  }

  const trackBookmarksToggle = document.getElementById("track-bookmarks");
  if (trackBookmarksToggle) {
    // Initialize toggle state
    trackBookmarksToggle.checked = settings.privacyControls.trackBookmarks;

    trackBookmarksToggle.addEventListener("change", () => {
      const oldValue = settings.privacyControls.trackBookmarks;
      settings.privacyControls.trackBookmarks = trackBookmarksToggle.checked;
      saveSettings(
        "privacyControls.trackBookmarks",
        oldValue,
        trackBookmarksToggle.checked
      );
    });
  }

  const trackProductivityToggle = document.getElementById("track-productivity");
  if (trackProductivityToggle) {
    // Initialize toggle state
    trackProductivityToggle.checked =
      settings.privacyControls.trackProductivity;

    trackProductivityToggle.addEventListener("change", () => {
      const oldValue = settings.privacyControls.trackProductivity;
      settings.privacyControls.trackProductivity =
        trackProductivityToggle.checked;
      saveSettings(
        "privacyControls.trackProductivity",
        oldValue,
        trackProductivityToggle.checked
      );
    });
  }

  const dataRetentionSlider = document.getElementById("data-retention");
  const dataRetentionValue = document.getElementById("data-retention-value");
  if (dataRetentionSlider && dataRetentionValue) {
    // Initialize slider value
    dataRetentionSlider.value =
      settings.privacyControls.dataRetentionDays || 30;
    dataRetentionValue.textContent =
      settings.privacyControls.dataRetentionDays || 30;

    dataRetentionSlider.addEventListener("input", () => {
      const value = dataRetentionSlider.value;
      dataRetentionValue.textContent = value;
      settings.privacyControls.dataRetentionDays = parseInt(value, 10);
    });

    dataRetentionSlider.addEventListener("change", () => {
      const oldValue = settings.privacyControls.dataRetentionDays;
      saveSettings(
        "privacyControls.dataRetentionDays",
        oldValue,
        settings.privacyControls.dataRetentionDays
      );

      // Apply new retention period immediately
      if (typeof performDataAging === "function") {
        document.dispatchEvent(new CustomEvent("applyDataAging"));
      }
    });
  }

  // Reset user data button
  if (resetUserDataButton) {
    resetUserDataButton.addEventListener("click", () => {
      // Check if the reset function exists
      if (typeof resetUserData === "function") {
        resetUserData();

        // Show confirmation message
        const confirmationMessage = document.createElement("div");
        confirmationMessage.className =
          "setting-description confirmation-message";
        confirmationMessage.textContent =
          "User data has been reset successfully.";
        confirmationMessage.style.color = "var(--accent-color)";
        confirmationMessage.style.fontWeight = "500";
        confirmationMessage.style.marginTop = "8px";

        // Insert after the button
        resetUserDataButton.parentNode.insertAdjacentElement(
          "afterend",
          confirmationMessage
        );

        // Remove the message after 3 seconds
        setTimeout(() => {
          confirmationMessage.remove();
        }, 3000);

        // Refresh greeting
        const greetingElement = document.getElementById("greeting");
        if (greetingElement) {
          const now = new Date();
          if (typeof updateGreeting === "function") {
            updateGreeting(now.getHours(), greetingElement);
          }
        }
      }
    });
  }
}

/**
 * Placeholder function to maintain compatibility
 * This function intentionally does nothing and exists to prevent errors
 * from removed functionality
 */
function updatePatternPreview() {
  // Intentionally empty
}

/**
 * Apply the selected background pattern
 */
function applyBackgroundPattern() {
  // Get or create the pattern overlay element
  let patternOverlay = document.querySelector(".pattern-overlay");

  if (!patternOverlay) {
    patternOverlay = document.createElement("div");
    patternOverlay.className = "pattern-overlay";
    document.body.appendChild(patternOverlay);
  }

  // Get the selected pattern
  const patternKey = settings.backgroundPattern || "none";
  const pattern = BACKGROUND_PATTERNS[patternKey];

  // If no pattern is selected or pattern is "none", hide the overlay
  if (!pattern || patternKey === "none") {
    patternOverlay.style.display = "none";
    return;
  }

  // Set up the pattern overlay
  patternOverlay.style.display = "block";
  patternOverlay.style.opacity = settings.patternOpacity || 0.5;

  // Apply the pattern as a background image
  if (pattern.file) {
    patternOverlay.style.backgroundImage = `url(${pattern.file})`;

    // Apply pattern size and density
    const patternSize = settings.patternSize || 1.0;
    const patternDensity = settings.patternDensity || 1.0;

    // Fix for very small pattern sizes - ensure minimum size is 3%
    const minSize = 3;

    // Combine size and density: size scales the pattern, density affects spacing
    // Ensure the background size is at least minSize%
    const calculatedSize = (patternSize / patternDensity) * 100;
    const backgroundSize = Math.max(minSize, Math.round(calculatedSize));

    patternOverlay.style.backgroundSize = `${backgroundSize}%`;

    // Apply pattern rotation - simplified without position transforms
    const patternRotation = settings.patternRotation || 0;
    patternOverlay.style.transform = `rotate(${patternRotation}deg)`;

    // Set the background color to match the current theme's accent color
    const accentColor = settings.accentColor;
    const rgbValues = hexToRgb(accentColor);

    if (rgbValues) {
      patternOverlay.style.color = `rgba(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b}, 1)`;
    } else {
      patternOverlay.style.color = accentColor;
    }

    // Apply pattern animation if enabled
    // First, remove any existing animation classes
    patternOverlay.classList.remove(
      "animate-pulse",
      "animate-rotate",
      "animate-float"
    );

    if (settings.patternAnimation) {
      const animationType = settings.patternAnimationType || "pulse";
      patternOverlay.classList.add(`animate-${animationType}`);

      // For rotate animation, we need to reset the transform property
      // since it's controlled by the animation
      if (animationType === "rotate") {
        patternOverlay.style.transform = "rotate(0deg)";
      }
    }

    // Pattern position classes and fade functionality have been removed

    // Make sure any mask is removed
    patternOverlay.style.webkitMaskImage = "";
    patternOverlay.style.maskImage = "";
  }
}

/**
 * Update the active theme in the UI
 */
function updateActiveTheme() {
  const themeOptions = document.querySelectorAll(".theme-option");

  // Remove active class from all theme options
  themeOptions.forEach((option) => {
    option.classList.remove("active");
  });

  // Add active class to the current theme
  const activeTheme = document.querySelector(
    `.theme-option[data-theme="${settings.theme}"]`
  );
  if (activeTheme) {
    activeTheme.classList.add("active");
  }
}

/**
 * Get pattern based on time of day
 * @returns {string} - The pattern key to use
 */
function getTimeBasedPattern() {
  const hour = new Date().getHours();

  // Early morning (5-8): Dots
  if (hour >= 5 && hour < 8) {
    return "dots";
  }
  // Morning (8-11): Waves
  else if (hour >= 8 && hour < 11) {
    return "waves";
  }
  // Midday (11-15): Grid
  else if (hour >= 11 && hour < 15) {
    return "grid";
  }
  // Afternoon (15-18): Diagonal
  else if (hour >= 15 && hour < 18) {
    return "diagonal";
  }
  // Evening (18-21): Triangles
  else if (hour >= 18 && hour < 21) {
    return "triangles";
  }
  // Night (21-5): Honeycomb
  else {
    return "honeycomb";
  }
}

/**
 * Schedule the next pattern update at the next hour change
 * This ensures the time-based pattern updates at each hour boundary
 */
function scheduleNextPatternUpdate() {
  // Clear any existing pattern update timer
  if (window.patternUpdateTimer) {
    clearTimeout(window.patternUpdateTimer);
  }

  // Calculate time until next hour
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1);
  nextHour.setMinutes(0);
  nextHour.setSeconds(10); // Add 10 seconds buffer

  const timeUntilNextHour = nextHour - now;

  // Schedule update
  window.patternUpdateTimer = setTimeout(() => {
    // Only update if time-based pattern is still enabled
    if (settings.timeBasedPattern) {
      // Update the pattern based on the new hour
      settings.backgroundPattern = getTimeBasedPattern();

      // Update the UI
      const backgroundPatternSelect =
        document.getElementById("background-pattern");
      if (backgroundPatternSelect) {
        backgroundPatternSelect.value = settings.backgroundPattern;
      }

      // Apply the new pattern
      applyBackgroundPattern();

      // Schedule the next update
      scheduleNextPatternUpdate();
    }
  }, timeUntilNextHour);
}

/**
 * Schedule the next theme update at the next hour change
 * This ensures the dynamic theme updates at each hour boundary
 */
function scheduleNextThemeUpdate() {
  // Clear any existing update timer
  if (window.themeUpdateTimer) {
    clearTimeout(window.themeUpdateTimer);
  }

  // Calculate time until next hour
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1);
  nextHour.setMinutes(0);
  nextHour.setSeconds(5); // Add 5 seconds buffer

  const timeUntilNextHour = nextHour - now;

  // Schedule update
  window.themeUpdateTimer = setTimeout(() => {
    // Only update if dynamic theme is still selected
    if (settings.theme === "dynamic") {
      applySettings();
    }
  }, timeUntilNextHour);
}

/**
 * Update the accent color UI to match the current accent color
 * and populate theme-specific accent color options
 */
function updateAccentColorUI() {
  const accentColorInput = document.getElementById("accent-color");
  const accentColorsGrid = document.getElementById("theme-accent-colors");
  const customWrapper = document.querySelector(".custom-color-wrapper");

  // Update the color input value
  if (accentColorInput) {
    accentColorInput.value = settings.accentColor;
  }

  // Get the current theme
  const currentTheme = settings.theme;

  // Get recommended accent colors for the current theme
  const recommendedColors =
    THEME_ACCENT_COLORS[currentTheme] || THEME_ACCENT_COLORS.classic;

  // Remove existing accent color options except the custom wrapper
  const existingOptions = accentColorsGrid.querySelectorAll(
    ".accent-color-option"
  );
  existingOptions.forEach((option) => option.remove());

  // Add recommended accent colors for the current theme (limit to 5 for 3x2 grid)
  recommendedColors.slice(0, 5).forEach((color) => {
    const colorOption = document.createElement("button");
    colorOption.className = "accent-color-option";
    colorOption.dataset.color = color;
    colorOption.style.backgroundColor = color;

    // Add active class if this is the current accent color
    if (color === settings.accentColor) {
      colorOption.classList.add("active");
      customWrapper.classList.remove("active");
    }

    // Add click event listener
    colorOption.addEventListener("click", (e) => {
      // Prevent event from bubbling up to document
      e.stopPropagation();

      const oldColor = settings.accentColor;
      settings.accentColor = color;
      updateAccentColorUI();
      applySettings();
      saveSettings("accentColor", oldColor, color);
    });

    // Insert before the custom wrapper
    accentColorsGrid.insertBefore(colorOption, customWrapper);
  });

  // Check if the current accent color matches any of the recommended colors
  let foundMatch = false;
  accentColorsGrid
    .querySelectorAll(".accent-color-option")
    .forEach((option) => {
      if (option.dataset.color === settings.accentColor) {
        foundMatch = true;
      }
    });

  // If no preset matches the current color, mark the custom option as active
  if (customWrapper) {
    customWrapper.classList.remove("active");
    if (!foundMatch) {
      customWrapper.classList.add("active");
    }
  }
}

/**
 * Show a notification to the user
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (default, error)
 */
function showNotification(message, type = "default") {
  // Check if notification container exists, create if not
  let notificationContainer = document.getElementById("notification-container");

  if (!notificationContainer) {
    notificationContainer = document.createElement("div");
    notificationContainer.id = "notification-container";
    document.body.appendChild(notificationContainer);
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to container
  notificationContainer.appendChild(notification);

  // Remove after delay
  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Initialize custom dropdown selects
 */
function initCustomDropdowns() {
  // Find all select elements to convert
  const selects = document.querySelectorAll("select");

  selects.forEach((select) => {
    const id = select.id;
    const options = Array.from(select.options);
    const selectedOption = options.find((option) => option.selected);

    // Create custom select container
    const customSelect = document.createElement("div");
    customSelect.className = "custom-select";
    customSelect.dataset.for = id;

    // Create trigger element
    const trigger = document.createElement("div");
    trigger.className = "custom-select-trigger";
    trigger.textContent = selectedOption
      ? selectedOption.textContent
      : "Select...";

    // Create options container
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "custom-select-options";

    // Add options
    options.forEach((option) => {
      const customOption = document.createElement("div");
      customOption.className = "custom-select-option";
      if (option.selected) {
        customOption.classList.add("selected");
      }
      customOption.textContent = option.textContent;
      customOption.dataset.value = option.value;

      customOption.addEventListener("click", () => {
        // Update original select
        select.value = option.value;

        // Update custom select
        trigger.textContent = option.textContent;

        // Update selected class
        optionsContainer
          .querySelectorAll(".custom-select-option")
          .forEach((opt) => {
            opt.classList.remove("selected");
          });
        customOption.classList.add("selected");

        // Close dropdown
        customSelect.classList.remove("open");

        // Trigger change event on original select
        const event = new Event("change", { bubbles: true });
        select.dispatchEvent(event);

        // Update settings
        if (id === "clock-format") {
          const oldValue = settings.clockFormat;
          settings.clockFormat = option.value;
          saveSettings("clockFormat", oldValue, option.value);
        } else if (id === "default-search-engine") {
          const oldValue = settings.defaultSearchEngine;
          settings.defaultSearchEngine = option.value;
          saveSettings("defaultSearchEngine", oldValue, option.value);
          // Check if updateSearchEngine is defined (from newtab.js)
          if (typeof updateSearchEngine === "function") {
            updateSearchEngine(settings.defaultSearchEngine);
          }
        } else if (id === "clock-animation") {
          const oldValue = settings.clockAnimation;
          settings.clockAnimation = option.value;
          saveSettings("clockAnimation", oldValue, option.value);
        } else if (id === "greeting-animation") {
          const oldValue = settings.greetingAnimation;
          settings.greetingAnimation = option.value;
          saveSettings("greetingAnimation", oldValue, option.value);

          // Refresh greeting to apply new animation
          const greetingElement = document.getElementById("greeting");
          if (greetingElement) {
            const now = new Date();
            if (typeof updateGreeting === "function") {
              updateGreeting(now.getHours(), greetingElement);
            }
          }
        } else if (id === "greeting-tone") {
          const oldValue = settings.greetingTone;
          settings.greetingTone = option.value;
          saveSettings("greetingTone", oldValue, option.value);

          // Refresh greeting to apply new tone
          const greetingElement = document.getElementById("greeting");
          if (greetingElement) {
            const now = new Date();
            if (typeof updateGreeting === "function") {
              updateGreeting(now.getHours(), greetingElement);
            }
          }
        } else if (id === "background-pattern") {
          const oldValue = settings.backgroundPattern;
          settings.backgroundPattern = option.value;
          saveSettings("backgroundPattern", oldValue, option.value);
          applyBackgroundPattern();

          // Track pattern selection for smart features
          if (
            typeof trackPatternSelection === "function" &&
            option.value !== "none"
          ) {
            trackPatternSelection(option.value);
          }
        }
      });

      optionsContainer.appendChild(customOption);
    });

    // Add event listeners
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();

      // Close all other open dropdowns
      document.querySelectorAll(".custom-select.open").forEach((dropdown) => {
        if (dropdown !== customSelect) {
          dropdown.classList.remove("open");
        }
      });

      // Toggle this dropdown
      customSelect.classList.toggle("open");
    });

    // Close when clicking outside
    document.addEventListener("click", () => {
      customSelect.classList.remove("open");
    });

    // Assemble custom select
    customSelect.appendChild(trigger);
    customSelect.appendChild(optionsContainer);

    // Insert custom select after original and hide original
    select.parentNode.insertBefore(customSelect, select.nextSibling);
    select.style.display = "none";
  });
}

/**
 * Utility function to lighten a color
 * @param {string} color - Hex color code
 * @param {number} percent - Percentage to lighten
 * @returns {string} Lightened hex color
 */
function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;

  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

/**
 * Utility function to convert hex color to RGB
 * @param {string} hex - Hex color code
 * @returns {Object|null} Object with r, g, b values or null if invalid
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  let bigint = parseInt(hex, 16);

  // Check if valid hex
  if (isNaN(bigint)) {
    return null;
  }

  // Extract RGB components
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}
