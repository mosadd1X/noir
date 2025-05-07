/**
 * Noir New Tab - Main functionality
 *
 * Core functionality for the new tab page including clock, date, search,
 * quotes, bookmarks sidebar, and integration with settings and smart features.
 * This file handles the initialization and interaction of all main UI components.
 *
 * @file newtab.js
 * @author mosadd1X
 */

// DOM Elements
const clockElement = document.getElementById("clock");
const dateElement = document.getElementById("date");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const searchEngineIndicator = document.getElementById(
  "search-engine-indicator"
);
const searchEnginesDropdown = document.getElementById("search-engines");
const quickLinksContainer = document.getElementById("quick-links");
const quoteElement = document.getElementById("quote");
const bookmarksSidebar = document.getElementById("bookmarks-sidebar");
const sidebarTrigger = document.getElementById("sidebar-trigger");
const bookmarksList = document.getElementById("bookmarks-list");
const topVisitedList = document.getElementById("topvisited-list");
const bookmarkTabs = document.querySelectorAll(".bookmark-tab");
const sidebarClose = document.getElementById("sidebar-close");

// Constants
const SEARCH_ENGINES = {
  google: {
    name: "Google",
    url: "https://www.google.com/search",
    param: "q",
    icon: "icons/google.svg",
  },
  bing: {
    name: "Bing",
    url: "https://www.bing.com/search",
    param: "q",
    icon: "icons/bing.svg",
  },
  duckduckgo: {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/",
    param: "q",
    icon: "icons/duckduckgo.svg",
  },
  yahoo: {
    name: "Yahoo",
    url: "https://search.yahoo.com/search",
    param: "p",
    icon: "icons/yahoo.svg",
  },
};

const QUOTES = [
  // Original quotes
  {
    text: "The best way to predict the future is to create it.",
    author: "Alan Kay",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
  },
  {
    text: "Make it simple, but significant.",
    author: "Don Draper",
  },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs",
  },
  {
    text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    text: "The details are not the details. They make the design.",
    author: "Charles Eames",
  },
  {
    text: "Good design is obvious. Great design is transparent.",
    author: "Joe Sparano",
  },
  {
    text: "Less is more.",
    author: "Ludwig Mies van der Rohe",
  },
  {
    text: "The ability to simplify means to eliminate the unnecessary so that the necessary may speak.",
    author: "Hans Hofmann",
  },
  {
    text: "Design is intelligence made visible.",
    author: "Alina Wheeler",
  },

  // New minimal aesthetic quotes
  {
    text: "Silence is the most powerful scream.",
    author: "Anonymous",
  },
  {
    text: "Emptiness is form, form is emptiness.",
    author: "Buddhist Philosophy",
  },
  {
    text: "In the midst of chaos, there is also opportunity.",
    author: "Sun Tzu",
  },
  {
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass",
  },
  {
    text: "Simplicity is about subtracting the obvious and adding the meaningful.",
    author: "John Maeda",
  },
  {
    text: "The most valuable real estate is the space between your ears.",
    author: "Anonymous",
  },
  {
    text: "The essence of minimalism is clarity.",
    author: "Fumio Sasaki",
  },
  {
    text: "Minimalism is not a lack of something. It's simply the perfect amount of something.",
    author: "Nicholas Burroughs",
  },
  {
    text: "The secret of happiness, you see, is not found in seeking more, but in developing the capacity to enjoy less.",
    author: "Socrates",
  },
  {
    text: "Elegance is refusal.",
    author: "Coco Chanel",
  },
  {
    text: "Perfection is attained not when there is nothing more to add, but when there is nothing more to remove.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    text: "The greatest wealth is a poverty of desires.",
    author: "Seneca",
  },
  {
    text: "Simplicity is the keynote of all true elegance.",
    author: "Coco Chanel",
  },
  {
    text: "The most important things in life aren't things.",
    author: "Anthony J. D'Angelo",
  },
  {
    text: "Minimalism is asking why before you buy.",
    author: "Francine Jay",
  },
  {
    text: "The first step in crafting the life you want is to get rid of everything you don't.",
    author: "Joshua Becker",
  },
  {
    text: "Collect moments, not things.",
    author: "Anonymous",
  },
  {
    text: "The space between the notes is as important as the notes themselves.",
    author: "Claude Debussy",
  },
  {
    text: "Simplicity is the glory of expression.",
    author: "Walt Whitman",
  },
  {
    text: "The art of knowing is knowing what to ignore.",
    author: "Rumi",
  },
];

/**
 * Initialize the new tab page when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", async () => {
  // Ensure layout is preserved before content is loaded
  // This prevents the search bar from jumping
  const searchModule = document.querySelector(".search-module");
  const greetingElement = document.getElementById("greeting");

  // Calculate and set the greeting's height to prevent layout shifts
  if (greetingElement && searchModule) {
    // Ensure the greeting has proper height before content is loaded
    greetingElement.style.minHeight = "1.4em";
    greetingElement.style.visibility = "visible";
  }

  // Check if loadSettings is defined (from settings.js)
  if (typeof loadSettings === "undefined") {
    // Define a fallback settings object if loadSettings is not available
    window.settings = {
      theme: "classic",
      customTheme: null,
      accentColor: "#5C6BC0",
      showQuote: true,
      clockFormat: "24h",
      showSeconds: false,
      defaultSearchEngine: "google",
      clockAnimation: "fade",
    };
    console.log("Using default settings (loadSettings not found)");
  } else {
    // Load settings from storage
    await loadSettings();
  }

  // Ensure the container is visible
  const container = document.querySelector(".container");
  if (container) {
    container.style.opacity = "1";
  }

  // Force apply theme to ensure everything is visible - do this immediately
  if (typeof applySettings === "function") {
    applySettings();

    // Make background and overlay visible immediately without delay
    const bgGradient = document.querySelector(".background-gradient");
    const noiseOverlay = document.querySelector(".noise-overlay");

    if (bgGradient && bgGradient.style.display !== "block") {
      bgGradient.style.display = "block";
      bgGradient.style.opacity = "0.9";
    }

    if (noiseOverlay && noiseOverlay.style.display !== "block") {
      noiseOverlay.style.display = "block";
      noiseOverlay.style.opacity = "0.35";
    }

    // Keep the loading overlay visible until all content is loaded
    // We'll remove it after all initialization is complete
  }

  // Initialize all components before removing the loading overlay

  // Initialize clock and date
  updateClock();
  setInterval(updateClock, 1000);

  // Initialize search
  initSearch();

  // Initialize bookmarks
  initBookmarks();

  // Initialize sidebar
  initSidebar();

  // Initialize quote
  initQuote();

  // Initialize smart features if available
  if (
    typeof initSmartFeatures === "function" &&
    settings.smartFeaturesEnabled
  ) {
    initSmartFeatures();

    // Apply smart background pattern if enabled
    if (settings.smartBackgroundPatterns) {
      document.dispatchEvent(new CustomEvent("applySmartPattern"));
    }
  }

  // Listen for smart pattern application events
  document.addEventListener("applySmartPattern", () => {
    if (
      typeof determineActivityPattern === "function" &&
      settings.smartFeaturesEnabled &&
      settings.smartBackgroundPatterns
    ) {
      const patternToUse = determineActivityPattern();

      // Only change if different from current pattern
      if (patternToUse && patternToUse !== settings.backgroundPattern) {
        // Apply the pattern
        const patternOverlay = document.querySelector(".pattern-overlay");
        if (patternOverlay) {
          // Remove existing pattern classes
          patternOverlay.className = "pattern-overlay";

          // If pattern is 'none', just hide the overlay
          if (patternToUse === "none") {
            patternOverlay.style.display = "none";
            return;
          }

          // Show the overlay
          patternOverlay.style.display = "block";

          // Apply the new pattern
          patternOverlay.classList.add(`pattern-${patternToUse}`);

          // Apply current settings for opacity, size, etc.
          patternOverlay.style.opacity = settings.patternOpacity;

          // Apply rotation if set
          if (settings.patternRotation !== 0) {
            patternOverlay.style.transform = `rotate(${settings.patternRotation}deg)`;
          } else {
            patternOverlay.style.transform = "";
          }

          // Apply animation if enabled
          if (settings.patternAnimation) {
            patternOverlay.classList.add(
              `animate-${settings.patternAnimationType}`
            );
          }
        }
      }
    }
  });

  // Initialize settings panel
  if (typeof initSettingsPanel === "function") {
    initSettingsPanel();
  }

  // Listen for data aging events
  document.addEventListener("applyDataAging", () => {
    if (typeof performDataAging === "function") {
      performDataAging();

      // Refresh greeting after data aging
      const greetingElement = document.getElementById("greeting");
      if (greetingElement) {
        const now = new Date();
        if (typeof updateGreeting === "function") {
          updateGreeting(now.getHours(), greetingElement);
        }
      }
    }
  });

  // Focus search input
  searchInput.focus();

  /**
   * Remove the loading overlay immediately
   */
  const removeLoadingOverlay = () => {
    const loadingOverlay = document.getElementById("loading-overlay");
    if (loadingOverlay) {
      // Force remove the overlay
      loadingOverlay.classList.add("fade-out");

      // Remove from DOM quickly
      setTimeout(() => {
        loadingOverlay.style.display = "none";
      }, 100);
    }
  };

  // Remove the overlay after a very short delay
  setTimeout(removeLoadingOverlay, 100);
});

/**
 * Update clock and date display with digit animations
 */
function updateClock() {
  const now = new Date();
  const clockContainer = document.getElementById("clock-container");
  const clockElement = document.getElementById("clock");
  const secondsElement = document.getElementById("seconds");
  const periodElement = document.getElementById("period");
  const greetingElement = document.getElementById("greeting");
  const dateElement = document.getElementById("date");

  // Format time
  let hours = now.getHours();
  let minutes = now.getMinutes().toString().padStart(2, "0");
  let seconds = now.getSeconds().toString().padStart(2, "0");
  let period = "";

  if (settings.clockFormat === "12h") {
    period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    hours = hours.toString(); // Don't pad single-digit hours in 12h format
    if (hours.length === 1) {
      hours = " " + hours; // Add space for alignment if single digit
    }
  } else {
    hours = hours.toString().padStart(2, "0");
  }

  // Update greeting based on time of day (only on page load)
  if (!window.greetingInitialized) {
    updateGreeting(now.getHours(), greetingElement);
    window.greetingInitialized = true;

    // Show greeting with a slight delay to ensure content is set
    setTimeout(() => {
      greetingElement.style.opacity = "0.75";
    }, 50);
  }

  // Get previous time for comparison
  const prevTimeObj = window.prevTimeObj || {
    hours: "",
    minutes: "",
    seconds: "",
  };

  // Update the clock with animated digits
  updateClockDigits(clockContainer, hours, minutes, prevTimeObj);

  // Make clock visible if not already
  if (!clockElement.classList.contains("loaded")) {
    clockElement.classList.add("loaded");
  }

  // Update period element
  periodElement.textContent = period;

  // Handle seconds display
  if (settings.showSeconds) {
    secondsElement.textContent = `:${seconds}`;
    secondsElement.classList.add("show");

    // Don't animate seconds to avoid flickering
    // Just update the content silently
  } else {
    secondsElement.textContent = "";
    secondsElement.classList.remove("show");
  }

  // Store current time for next comparison
  window.prevTimeObj = { hours, minutes, seconds };

  // Update date
  const options = { weekday: "long", month: "long", day: "numeric" };
  dateElement.textContent = now.toLocaleDateString(undefined, options);

  // Make date visible on hover
  dateElement.style.visibility = "visible";
}

/**
 * Update clock digits with animations
 * @param {HTMLElement} container - The container element for the clock digits
 * @param {string} hours - Hours string
 * @param {string} minutes - Minutes string
 * @param {Object} prevTimeObj - Previous time object for comparison
 */
function updateClockDigits(container, hours, minutes, prevTimeObj) {
  const timeString = `${hours}:${minutes}`;
  const prevTimeString = `${prevTimeObj.hours}:${prevTimeObj.minutes}`;

  // If no animation is set or it's the first render, just update the text
  if (!settings.clockAnimation || settings.clockAnimation === "none") {
    container.innerHTML = "";
    // Create each character as a separate span for consistent spacing
    for (let i = 0; i < timeString.length; i++) {
      const char = timeString[i];
      const digitSpan = document.createElement("span");
      digitSpan.className = "clock-digit";
      digitSpan.textContent = char;
      digitSpan.setAttribute("data-position", i);
      // Add specific class for colon to style it differently
      if (char === ":") {
        digitSpan.classList.add("clock-colon");
      }
      container.appendChild(digitSpan);
    }
    return;
  }

  // Clear container if this is the first render
  if (container.children.length === 0 || prevTimeString === ":") {
    container.innerHTML = "";

    // Create initial digits without animation
    for (let i = 0; i < timeString.length; i++) {
      const char = timeString[i];
      const digitSpan = document.createElement("span");
      digitSpan.className = "clock-digit";
      digitSpan.textContent = char;
      digitSpan.setAttribute("data-position", i);
      // Add specific class for colon to style it differently
      if (char === ":") {
        digitSpan.classList.add("clock-colon");
      }
      container.appendChild(digitSpan);
    }
    return;
  }

  // Update digits with animation when they change
  for (let i = 0; i < Math.max(timeString.length, prevTimeString.length); i++) {
    const newChar = i < timeString.length ? timeString[i] : "";
    const prevChar = i < prevTimeString.length ? prevTimeString[i] : "";

    // Find existing digit at this position
    let digitSpan = container.querySelector(`[data-position="${i}"]`);

    // If digit doesn't exist, create it
    if (!digitSpan) {
      digitSpan = document.createElement("span");
      digitSpan.className = "clock-digit";
      digitSpan.setAttribute("data-position", i);

      // Find the right position to insert
      if (i >= container.children.length) {
        container.appendChild(digitSpan);
      } else {
        container.insertBefore(digitSpan, container.children[i]);
      }
    }

    // If the digit has changed, animate it
    if (newChar !== prevChar) {
      // Apply the animation class based on settings
      digitSpan.className = "clock-digit"; // Reset classes

      // Add specific class for colon
      if (newChar === ":") {
        digitSpan.classList.add("clock-colon");
      }

      digitSpan.textContent = newChar;

      // Only animate numbers, not colons
      if (newChar !== ":" && (newChar === " " || !isNaN(parseInt(newChar)))) {
        void digitSpan.offsetWidth; // Force reflow
        digitSpan.classList.add(`animate-${settings.clockAnimation}`);
      }
    } else {
      // No change, just ensure the text is correct
      digitSpan.textContent = newChar;

      // Make sure colon has the right class
      if (newChar === ":" && !digitSpan.classList.contains("clock-colon")) {
        digitSpan.classList.add("clock-colon");
      }
    }
  }

  // Remove any extra spans that might be left over
  while (container.children.length > timeString.length) {
    container.removeChild(container.lastChild);
  }
}

/**
 * Update greeting based on time of day and user context
 * @param {number} hour - Current hour (0-23)
 * @param {HTMLElement} greetingElement - The greeting element to update
 */
function updateGreeting(hour, greetingElement) {
  // Remove any existing animation classes
  greetingElement.classList.remove(
    "greeting-animation-fade",
    "greeting-animation-slide",
    "greeting-animation-bounce"
  );

  // Clear the greeting element
  greetingElement.innerHTML = "";

  // Force a reflow to ensure animations restart
  void greetingElement.offsetWidth;

  // Get the greeting text
  let firstLine = "";
  let secondLine = "";

  // Check if smart features are available and enabled
  if (
    typeof getContextAwareGreeting === "function" &&
    settings.smartFeaturesEnabled &&
    settings.contextAwareGreetings
  ) {
    // Use context-aware greeting
    const greeting = getContextAwareGreeting();

    // Check if the greeting is already in the two-line format
    if (typeof greeting === "object" && greeting.first && greeting.second) {
      firstLine = greeting.first;
      secondLine = greeting.second;
    } else {
      // Handle legacy string format for backward compatibility
      // Split the greeting into two lines if it's long
      const greetingText = greeting.toString();
      if (greetingText.length > 30 && greetingText.includes(",")) {
        const commaIndex = greetingText.indexOf(",");
        firstLine = greetingText.substring(0, commaIndex + 1);
        secondLine = greetingText.substring(commaIndex + 1).trim();
      } else {
        firstLine = greetingText;
      }
    }
  } else {
    // Fallback to time-based greeting
    // Multiple greeting options for each time period to avoid monotony
    const morningGreetings = [
      "Good morning",
      "Rise and shine",
      "Hello, sunshine",
      "Morning has broken",
      "Welcome to a new day",
    ];

    const afternoonGreetings = [
      "Good afternoon",
      "Having a good day?",
      "Afternoon delight",
      "Keep going strong",
      "Halfway there",
    ];

    const eveningGreetings = [
      "Good evening",
      "Winding down?",
      "Evening has come",
      "Time to relax",
      "The day is done",
    ];

    const nightGreetings = [
      "Good night",
      "Burning the midnight oil?",
      "The stars are out",
      "Sweet dreams ahead",
      "Night owl, aren't you?",
    ];

    let greetings;
    if (hour >= 5 && hour < 12) {
      greetings = morningGreetings;
    } else if (hour >= 12 && hour < 17) {
      greetings = afternoonGreetings;
    } else if (hour >= 17 && hour < 22) {
      greetings = eveningGreetings;
    } else {
      greetings = nightGreetings;
    }

    // Get a random greeting from the appropriate array
    const randomIndex = Math.floor(Math.random() * greetings.length);
    const baseGreeting = greetings[randomIndex];

    // Add user name to greeting if available
    if (settings.userName && settings.userName.trim() !== "") {
      firstLine = `${baseGreeting}, ${settings.userName}`;

      // Add a second line based on time of day
      if (hour >= 5 && hour < 12) {
        secondLine = "Have a productive morning!";
      } else if (hour >= 12 && hour < 17) {
        secondLine = "Hope your day is going well.";
      } else if (hour >= 17 && hour < 22) {
        secondLine = "Time to unwind and relax.";
      } else {
        secondLine = "Don't stay up too late!";
      }
    } else {
      firstLine = baseGreeting;
    }
  }

  // Create the two-line structure
  const firstLineElement = document.createElement("div");
  firstLineElement.className = "greeting-first-line";
  firstLineElement.textContent = firstLine;
  greetingElement.appendChild(firstLineElement);

  // Add second line if it exists
  if (secondLine) {
    const secondLineElement = document.createElement("div");
    secondLineElement.className = "greeting-second-line";
    secondLineElement.textContent = secondLine;
    greetingElement.appendChild(secondLineElement);
  }

  // Apply animation based on settings
  if (settings.greetingAnimation && settings.greetingAnimation !== "none") {
    // Add the animation class
    greetingElement.classList.add(
      `greeting-animation-${settings.greetingAnimation}`
    );
  }
}

/**
 * Initialize search functionality
 */
function initSearch() {
  // Set initial search engine
  updateSearchEngine(settings.defaultSearchEngine);

  // Toggle search engines dropdown
  searchEngineIndicator.addEventListener("click", () => {
    searchEnginesDropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !searchEngineIndicator.contains(e.target) &&
      !searchEnginesDropdown.contains(e.target)
    ) {
      searchEnginesDropdown.classList.remove("active");
    }
  });

  // Handle search engine selection
  const engineOptions = document.querySelectorAll(".search-engine-option");
  engineOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const engine = option.dataset.engine;
      updateSearchEngine(engine);
      searchEnginesDropdown.classList.remove("active");
      searchInput.focus();
    });
  });

  // Handle search form submission
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (query) {
      const engine = settings.defaultSearchEngine;
      const url = `${SEARCH_ENGINES[engine].url}?${
        SEARCH_ENGINES[engine].param
      }=${encodeURIComponent(query)}`;
      window.location.href = url;
    }
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Focus search with / key when not already focused on an input
    if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      searchInput.focus();
    }

    // Toggle search engines dropdown with Alt+S
    if (e.key === "s" && e.altKey) {
      e.preventDefault();
      searchEnginesDropdown.classList.toggle("active");
      if (searchEnginesDropdown.classList.contains("active")) {
        // Focus the first engine option when opening dropdown
        const firstOption = searchEnginesDropdown.querySelector(
          ".search-engine-option"
        );
        if (firstOption) firstOption.focus();
      }
    }

    // Escape key to close dropdowns and blur search
    if (e.key === "Escape") {
      searchEnginesDropdown.classList.remove("active");
      if (document.activeElement === searchInput) {
        searchInput.blur();
      }
    }
  });

  // Add keyboard navigation for search engine options
  engineOptions.forEach((option) => {
    option.setAttribute("tabindex", "0"); // Make focusable

    // Handle keyboard selection
    option.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        option.click();
      }
    });
  });
}

/**
 * Update the active search engine
 * @param {string} engine - Engine key
 */
function updateSearchEngine(engine) {
  // Update form action
  searchForm.action = SEARCH_ENGINES[engine].url;
  searchInput.name = SEARCH_ENGINES[engine].param;

  // Update indicator with a minimal search icon instead of engine logo
  searchEngineIndicator.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  // Add a title attribute for accessibility with keyboard shortcut hint
  searchEngineIndicator.setAttribute(
    "title",
    `Search with ${SEARCH_ENGINES[engine].name} (Alt+S to change)`
  );

  // Update active state in dropdown
  const engineOptions = document.querySelectorAll(".search-engine-option");
  engineOptions.forEach((option) => {
    if (option.dataset.engine === engine) {
      option.classList.add("active");
    } else {
      option.classList.remove("active");
    }
  });
}

// Quick links functionality removed as requested

/**
 * Initialize quote display
 */
function initQuote() {
  if (settings.showQuote) {
    const quoteModule = document.getElementById("quote-module");
    const quoteElement = document.getElementById("quote");

    // Display a random quote
    displayRandomQuote(quoteModule, quoteElement);

    // Add refresh button if it doesn't exist
    let refreshButton = document.getElementById("quote-refresh");
    if (!refreshButton) {
      refreshButton = document.createElement("button");
      refreshButton.id = "quote-refresh";
      refreshButton.className = "quote-refresh";
      refreshButton.setAttribute("aria-label", "Refresh quote");
      refreshButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
        </svg>
      `;
      quoteModule.appendChild(refreshButton);

      // Add click event to refresh button
      refreshButton.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent event bubbling
        e.preventDefault(); // Prevent default button behavior

        // Don't allow multiple refreshes at once
        if (quoteModule.classList.contains("refreshing")) {
          return;
        }

        // Add animation class
        quoteModule.classList.add("refreshing");

        // Prepare the new quote before showing it
        const newQuote = getRandomQuote(quoteElement.textContent);

        // First fade out the current quote
        quoteElement.style.opacity = "0";
        const authorElement = document.getElementById("quote-author");
        if (authorElement) {
          authorElement.style.opacity = "0";
        }

        // After fade out, update the content and fade in
        setTimeout(() => {
          // Update the quote content while it's invisible
          updateQuoteContent(quoteModule, quoteElement, newQuote);

          // Fade in the new quote
          setTimeout(() => {
            quoteElement.style.opacity = "1";
            if (authorElement) {
              authorElement.style.opacity = "1";
            }

            // Remove animation class after everything is complete
            setTimeout(() => {
              quoteModule.classList.remove("refreshing");
            }, 300);
          }, 50);
        }, 300); // Half the transition time for a smoother effect
      });
    }

    // Show quote with a slight delay to ensure content is set
    setTimeout(() => {
      quoteModule.classList.add("loaded");
    }, 100);
  }
}

/**
 * Get a random quote that's different from the current one
 * @param {string} currentQuoteText - The current quote text
 * @returns {Object} The selected quote object
 */
function getRandomQuote(currentQuoteText) {
  let randomIndex;
  let selectedQuote;

  do {
    randomIndex = Math.floor(Math.random() * QUOTES.length);
    selectedQuote = QUOTES[randomIndex];
  } while (selectedQuote.text === currentQuoteText && QUOTES.length > 1);

  return selectedQuote;
}

/**
 * Display a random quote
 * @param {HTMLElement} quoteModule - The quote module container
 * @param {HTMLElement} quoteElement - The quote text element
 */
function displayRandomQuote(quoteModule, quoteElement) {
  // Get a random quote
  const selectedQuote = getRandomQuote(quoteElement.textContent);

  // Update the quote content with smooth transition
  updateQuoteContent(quoteModule, quoteElement, selectedQuote);
}

/**
 * Update the quote content with smooth height transition
 * @param {HTMLElement} quoteModule - The quote module container
 * @param {HTMLElement} quoteElement - The quote text element
 * @param {Object} selectedQuote - The quote object to display
 */
function updateQuoteContent(quoteModule, quoteElement, selectedQuote) {
  // Create a temporary container to measure the new content height
  // without affecting the current display
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.visibility = "hidden";
  tempContainer.style.width = `${quoteModule.clientWidth}px`;
  tempContainer.style.padding = getComputedStyle(quoteModule).padding;
  tempContainer.style.boxSizing = "border-box";
  tempContainer.style.display = "flex";
  tempContainer.style.flexDirection = "column";
  tempContainer.style.justifyContent = "flex-end";
  document.body.appendChild(tempContainer);

  // Clone the quote element and author element for measurement
  const tempQuote = document.createElement("p");
  tempQuote.className = quoteElement.className;
  tempQuote.style.width = "100%";
  tempQuote.style.margin = "0";
  tempQuote.style.padding = getComputedStyle(quoteElement).padding;
  tempQuote.style.boxSizing = "border-box";
  tempQuote.textContent = selectedQuote.text;
  tempContainer.appendChild(tempQuote);

  // Add author element to temp container
  const tempAuthor = document.createElement("div");
  tempAuthor.className = "quote-author";
  tempAuthor.style.margin = "var(--spacing-sm) 0 0 0";
  tempAuthor.style.paddingRight = "32px";
  tempAuthor.style.boxSizing = "border-box";
  tempAuthor.textContent = `— ${selectedQuote.author}`;
  tempContainer.appendChild(tempAuthor);

  // Measure the height of the temp container
  const newContentHeight = tempContainer.offsetHeight;

  // Clean up the temp container
  document.body.removeChild(tempContainer);

  // Calculate current height to enable smooth transition
  const currentHeight = quoteModule.offsetHeight;

  // Calculate the final height - no need to add extra space since we accounted for it in the temp container
  const newHeight = newContentHeight;

  // Lock the height before changing content to prevent jumping
  quoteModule.style.height = `${currentHeight}px`;

  // Force a reflow
  void quoteModule.offsetHeight;

  // Now update the actual content
  quoteElement.textContent = selectedQuote.text;

  // Add author element if it doesn't exist
  let authorElement = document.getElementById("quote-author");
  if (!authorElement) {
    authorElement = document.createElement("div");
    authorElement.id = "quote-author";
    authorElement.className = "quote-author";
    quoteModule.appendChild(authorElement);
  }

  // Update author text
  authorElement.textContent = `— ${selectedQuote.author}`;

  // Set the new height to enable smooth transition
  requestAnimationFrame(() => {
    quoteModule.style.height = `${newHeight}px`;

    // Remove explicit height after transition to allow natural sizing
    setTimeout(() => {
      quoteModule.style.height = "";
    }, 500); // Match the longer transition duration
  });
}

/**
 * Initialize bookmarks
 */
function initBookmarks() {
  // In a real extension, we would use chrome.bookmarks API
  // For now, we'll use placeholder data
  if (chrome.bookmarks) {
    // Get bookmark tree
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      renderBookmarkFolders(bookmarkTreeNodes[0].children);
    });
  } else {
    // Placeholder data for development
    const placeholderBookmarkTree = [
      {
        id: "1",
        title: "Bookmarks Bar",
        children: [
          { id: "10", title: "GitHub", url: "https://github.com" },
          {
            id: "11",
            title: "Stack Overflow",
            url: "https://stackoverflow.com",
          },
          {
            id: "12",
            title: "MDN Web Docs",
            url: "https://developer.mozilla.org",
          },
          { id: "13", title: "CSS Tricks", url: "https://css-tricks.com" },
        ],
      },
      {
        id: "2",
        title: "Other Bookmarks",
        children: [
          {
            id: "20",
            title: "Smashing Magazine",
            url: "https://www.smashingmagazine.com",
          },
          { id: "21", title: "Dev.to", url: "https://dev.to" },
        ],
      },
      {
        id: "3",
        title: "Mobile Bookmarks",
        children: [
          { id: "30", title: "CodePen", url: "https://codepen.io" },
          {
            id: "31",
            title: "Frontend Masters",
            url: "https://frontendmasters.com",
          },
        ],
      },
    ];
    renderBookmarkFolders(placeholderBookmarkTree);
  }
}

/**
 * Render bookmark folders in the sidebar
 * @param {Array} folders - Array of bookmark folder objects
 */
function renderBookmarkFolders(folders) {
  bookmarksList.innerHTML = "";

  folders.forEach((folder, index) => {
    if (folder.children) {
      const folderElement = document.createElement("div");
      folderElement.className = "bookmark-folder";
      folderElement.dataset.folderTitle = folder.title; // Add data attribute for debugging

      // Only collapse "Other Bookmarks" and "Mobile Bookmarks" by default
      if (index !== 0) {
        folderElement.classList.add("collapsed");
      }

      const folderHeader = document.createElement("div");
      folderHeader.className = "bookmark-folder-header";

      const folderIcon = document.createElement("div");
      folderIcon.className = "bookmark-folder-icon";

      // Create two SVG icons - one for closed folder and one for open folder
      const closedFolderSVG = `<svg class="folder-icon-closed" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>`;
      const openFolderSVG = `<svg class="folder-icon-open" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></svg>`;

      // Add both icons to the container
      folderIcon.innerHTML = closedFolderSVG + openFolderSVG;

      const folderTitle = document.createElement("div");
      folderTitle.className = "bookmark-folder-title";
      folderTitle.textContent = folder.title;

      const folderToggle = document.createElement("div");
      folderToggle.className = "bookmark-folder-toggle";

      folderHeader.appendChild(folderIcon);
      folderHeader.appendChild(folderTitle);
      folderHeader.appendChild(folderToggle);

      const folderItems = document.createElement("div");
      folderItems.className = "bookmark-folder-items";

      // Add bookmarks to folder
      if (folder.children) {
        folder.children.forEach((bookmark, index) => {
          if (bookmark.url) {
            // It's a bookmark, not a folder
            const bookmarkItem = createBookmarkItem(bookmark, index);
            folderItems.appendChild(bookmarkItem);
          }
        });
      }

      // Toggle folder open/closed
      folderHeader.addEventListener("click", (e) => {
        // Prevent event bubbling
        e.stopPropagation();

        // Toggle the collapsed class
        folderElement.classList.toggle("collapsed");

        // Log for debugging
        console.log(
          "Folder clicked:",
          folder.title,
          folderElement.classList.contains("collapsed")
            ? "collapsed"
            : "expanded"
        );
      });

      folderElement.appendChild(folderHeader);
      folderElement.appendChild(folderItems);
      bookmarksList.appendChild(folderElement);
    }
  });
}

/**
 * Create a bookmark item element
 * @param {Object} bookmark - Bookmark object
 * @param {number} index - Optional index for animation delay
 * @returns {HTMLElement} Bookmark item element
 */
function createBookmarkItem(bookmark, index = 0) {
  const bookmarkItem = document.createElement("a");
  bookmarkItem.href = bookmark.url;
  bookmarkItem.className = "bookmark-item";
  bookmarkItem.style.setProperty("--item-index", index); // For staggered animation

  const iconContainer = document.createElement("div");
  iconContainer.className = "bookmark-icon";

  // STANDARDIZED APPROACH: Use logos for all bookmarks
  // We'll use favicons for all bookmarks with enhanced visibility

  // Get the favicon URL with larger size
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=64`;

  // Check if this is a site that might have a dark icon
  const darkIconSites = [
    "github.com",
    "github",
    "gitlab",
    "bitbucket",
    "stackoverflow",
    "dev.to",
    "medium.com",
    "twitter.com",
    "x.com",
  ];
  const isDarkIcon = darkIconSites.some((darkSite) =>
    bookmark.url.includes(darkSite)
  );

  // Add class for dark icons that need special treatment
  const imgClass = isDarkIcon ? "dark-icon" : "";

  // Set the favicon image directly
  iconContainer.innerHTML = `<img src="${faviconUrl}" alt="${bookmark.title}" class="${imgClass}">`;

  // No need for fallback handling as our CSS already handles this well
  // The enhanced filters in our CSS will make all icons more visible

  const title = document.createElement("span");
  title.className = "bookmark-title";
  title.textContent = bookmark.title;

  bookmarkItem.appendChild(iconContainer);
  bookmarkItem.appendChild(title);

  return bookmarkItem;
}

/**
 * Initialize sidebar functionality
 */
function initSidebar() {
  // The CSS handles showing the sidebar on hover of the trigger
  // But we'll add some additional functionality for better UX

  // Keep sidebar open when hovering between trigger and sidebar
  sidebarTrigger.addEventListener("mouseenter", () => {
    bookmarksSidebar.classList.add("active");
  });

  // Hide sidebar when mouse leaves both elements
  bookmarksSidebar.addEventListener("mouseleave", (e) => {
    // Only hide if we're not moving to the trigger
    if (!e.relatedTarget || !e.relatedTarget.matches("#sidebar-trigger")) {
      bookmarksSidebar.classList.remove("active");
    }
  });

  // Also allow clicking on the trigger to toggle (for mobile)
  sidebarTrigger.addEventListener("click", () => {
    bookmarksSidebar.classList.toggle("active");
  });

  // Close sidebar when clicking the close button
  if (sidebarClose) {
    sidebarClose.addEventListener("click", () => {
      bookmarksSidebar.classList.remove("active");
    });
  }

  // Add scroll event listener to handle header visibility
  const bookmarksHeader = document.querySelector(".bookmarks-header");
  const bookmarksContent = document.querySelector(".bookmarks-content");

  if (bookmarksContent && bookmarksHeader) {
    bookmarksContent.addEventListener("scroll", () => {
      // Add shadow to header when scrolling
      if (bookmarksContent.scrollTop > 0) {
        bookmarksHeader.style.boxShadow = "var(--shadow-md)";
      } else {
        bookmarksHeader.style.boxShadow = "none";
      }
    });
  }

  // Initialize tab system with improved transitions
  bookmarkTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // If this tab is already active, do nothing
      if (tab.classList.contains("active")) {
        return;
      }

      // Get the current active tab content
      const currentActiveContent = document.querySelector(
        ".bookmark-tab-content.active"
      );

      // Remove active class from all tabs
      bookmarkTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      // Get the target tab content
      const tabId = tab.dataset.tab;
      const targetContent = document.getElementById(`${tabId}-tab`);

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

  // Initialize top visited tab content
  initTopVisited();
}

/**
 * Initialize top visited sites tab content
 */
function initTopVisited() {
  // In a real extension, we would use chrome.topSites API
  // For now, we'll use placeholder data
  if (chrome.topSites) {
    chrome.topSites.get((sites) => {
      renderTopVisited(sites.slice(0, 8)); // Show more sites in the sidebar
    });
  } else {
    // Placeholder data for development
    const placeholderTopSites = [
      { title: "GitHub", url: "https://github.com" },
      { title: "YouTube", url: "https://youtube.com" },
      { title: "Gmail", url: "https://mail.google.com" },
      { title: "Twitter", url: "https://twitter.com" },
      { title: "Reddit", url: "https://reddit.com" },
      { title: "Netflix", url: "https://netflix.com" },
      { title: "Amazon", url: "https://amazon.com" },
      { title: "Wikipedia", url: "https://wikipedia.org" },
    ];
    renderTopVisited(placeholderTopSites);
  }
}

/**
 * Render top visited sites in the sidebar
 * @param {Array} sites - Array of site objects with title and url
 */
function renderTopVisited(sites) {
  topVisitedList.innerHTML = "";

  sites.forEach((site, index) => {
    const bookmarkItem = createBookmarkItem(site, index);
    topVisitedList.appendChild(bookmarkItem);
  });
}
