/**
 * Smart Features for Noir New Tab
 *
 * Implements context-aware greetings, user behavior tracking, and adaptive features
 * that personalize the new tab experience based on usage patterns.
 *
 * Features include:
 * - Context-aware greetings based on time, season, and user behavior
 * - Smart background pattern selection
 * - User behavior tracking (visits, searches, bookmarks)
 * - Privacy controls with automatic data aging
 *
 * @file smart-features.js
 * @author mosadd1X
 */

// User behavior data structure
const DEFAULT_USER_DATA = {
  // Visit patterns
  visitCount: 0,
  firstVisitDate: null,
  lastVisitDate: null,
  visitTimes: [], // Last 10 visit timestamps

  // Search patterns
  searchCount: 0,
  recentSearches: [], // Last 5 searches
  searchCategories: {}, // Categorized searches

  // Productivity patterns
  productivitySites: [], // Sites categorized as productivity
  focusSessions: [], // Times when user was focused

  // Preferences
  preferredSites: {}, // Sites visited most frequently
  preferredTimeOfDay: null, // When user is most active

  // Greeting history
  lastGreetings: [], // Last 5 greetings shown

  // Enhanced tracking data
  timeOfDayActivity: {
    morning: 0, // 5-11
    afternoon: 0, // 12-16
    evening: 0, // 17-21
    night: 0, // 22-4
  },
  dayOfWeekActivity: {
    weekday: 0,
    weekend: 0,
  },
  searchPatterns: {
    avgSearchesPerVisit: 0,
    totalSearches: 0,
    searchTopics: {},
    searchTimes: [],
  },
  productivityScore: 50, // 0-100 scale
  userPreferences: {
    colorPreference: null, // Based on accent color choices
    patternPreference: null, // Based on pattern selections
    themeChanges: [], // Track theme changes
    settingsChanges: [], // Track settings changes
  },
  sessionData: {
    averageSessionLength: 0,
    totalSessionTime: 0,
    sessionCount: 0,
  },
  bookmarkUsage: {
    clicks: 0,
    categories: {},
  },
  // Pattern preferences for background changes
  patternPreferences: {
    morning: null,
    afternoon: null,
    evening: null,
    night: null,
    productive: null,
    relaxed: null,
  },
};

// Current user data
let userData = { ...DEFAULT_USER_DATA };

/**
 * Initialize smart features
 *
 * Loads user data, updates visit information, performs data aging,
 * and sets up event listeners for tracking user behavior.
 *
 * @returns {Promise<void>} Promise that resolves when initialization is complete
 */
async function initSmartFeatures() {
  // Load user data
  await loadUserData();

  // Update visit count and timestamps
  updateVisitData();

  // Perform automatic data aging
  performDataAging();

  // Save updated user data
  saveUserData();

  // Set up event listeners for tracking behavior
  setupBehaviorTracking();
}

/**
 * Perform automatic data aging to maintain privacy
 */
function performDataAging() {
  const now = new Date();
  let dataChanged = false;

  // Get retention period from settings (default to 30 days if not set)
  const retentionDays = settings.privacyControls.dataRetentionDays || 30;

  // Calculate cutoff date based on retention period
  const cutoffDate = new Date(
    now.getTime() - retentionDays * 24 * 60 * 60 * 1000
  );

  // Age visit times
  if (userData.visitTimes && userData.visitTimes.length > 0) {
    const oldLength = userData.visitTimes.length;
    userData.visitTimes = userData.visitTimes.filter((timestamp) => {
      const visitDate = new Date(timestamp);
      return visitDate >= cutoffDate;
    });

    if (oldLength !== userData.visitTimes.length) {
      dataChanged = true;
    }
  }

  // Age search history
  if (userData.recentSearches && userData.recentSearches.length > 0) {
    const oldLength = userData.recentSearches.length;
    userData.recentSearches = userData.recentSearches.filter((search) => {
      if (typeof search === "string") {
        return true; // Keep string searches (no timestamp)
      }
      return search.timestamp ? new Date(search.timestamp) >= cutoffDate : true;
    });

    if (oldLength !== userData.recentSearches.length) {
      dataChanged = true;
    }
  }

  // Age search pattern times
  if (
    userData.searchPatterns &&
    userData.searchPatterns.searchTimes &&
    userData.searchPatterns.searchTimes.length > 0
  ) {
    const oldLength = userData.searchPatterns.searchTimes.length;
    userData.searchPatterns.searchTimes =
      userData.searchPatterns.searchTimes.filter((search) => {
        return search.timestamp
          ? new Date(search.timestamp) >= cutoffDate
          : true;
      });

    if (oldLength !== userData.searchPatterns.searchTimes.length) {
      dataChanged = true;
    }
  }

  // Age focus sessions
  if (userData.focusSessions && userData.focusSessions.length > 0) {
    const oldLength = userData.focusSessions.length;
    userData.focusSessions = userData.focusSessions.filter((session) => {
      return session.endTime ? new Date(session.endTime) >= cutoffDate : true;
    });

    if (oldLength !== userData.focusSessions.length) {
      dataChanged = true;
    }
  }

  // Limit preferred sites to top 20
  if (
    userData.preferredSites &&
    Object.keys(userData.preferredSites).length > 0
  ) {
    const sites = Object.entries(userData.preferredSites);
    if (sites.length > 20) {
      // Sort by visit count (descending)
      sites.sort((a, b) => b[1] - a[1]);

      // Keep only top 20
      const topSites = sites.slice(0, 20);

      // Rebuild the object
      userData.preferredSites = {};
      topSites.forEach(([site, count]) => {
        userData.preferredSites[site] = count;
      });

      dataChanged = true;
    }
  }

  // Return whether data was changed
  return dataChanged;
}

/**
 * Load user data from storage
 */
async function loadUserData() {
  return new Promise((resolve) => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get("noirUserData", (data) => {
        if (data.noirUserData) {
          userData = { ...DEFAULT_USER_DATA, ...data.noirUserData };
        } else {
          // First time use - initialize with defaults
          userData = { ...DEFAULT_USER_DATA };
          userData.firstVisitDate = new Date().toISOString();
        }
        resolve(userData);
      });
    } else {
      // Fallback to localStorage for development
      const savedData = localStorage.getItem("noirUserData");
      if (savedData) {
        try {
          userData = { ...DEFAULT_USER_DATA, ...JSON.parse(savedData) };
        } catch (e) {
          console.error("Error parsing user data:", e);
          userData = { ...DEFAULT_USER_DATA };
          userData.firstVisitDate = new Date().toISOString();
        }
      } else {
        // First time use
        userData = { ...DEFAULT_USER_DATA };
        userData.firstVisitDate = new Date().toISOString();
      }
      resolve(userData);
    }
  });
}

/**
 * Save user data to storage
 */
function saveUserData() {
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ noirUserData: userData });
  } else {
    // Fallback to localStorage for development
    localStorage.setItem("noirUserData", JSON.stringify(userData));
  }
}

/**
 * Update visit data
 */
function updateVisitData() {
  const now = new Date();

  // Update visit count
  userData.visitCount++;

  // Update last visit date
  userData.lastVisitDate = now.toISOString();

  // Only track detailed visit data if privacy setting allows
  if (settings.privacyControls.trackVisits) {
    // Add to visit times (keep last 10)
    userData.visitTimes.unshift(now.toISOString());
    if (userData.visitTimes.length > 10) {
      userData.visitTimes.pop();
    }

    // Update time of day activity
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) {
      userData.timeOfDayActivity.morning++;
    } else if (hour >= 12 && hour < 17) {
      userData.timeOfDayActivity.afternoon++;
    } else if (hour >= 17 && hour < 22) {
      userData.timeOfDayActivity.evening++;
    } else {
      userData.timeOfDayActivity.night++;
    }

    // Update day of week activity
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    if (day === 0 || day === 6) {
      userData.dayOfWeekActivity.weekend++;
    } else {
      userData.dayOfWeekActivity.weekday++;
    }

    // Start a new session
    startSession();

    // Analyze visit patterns to determine preferred time of day
    analyzeVisitPatterns();
  }
}

/**
 * Start a new session
 */
function startSession() {
  // Record session start time
  const sessionStart = new Date();

  // Store session start time in localStorage for tracking across page refreshes
  localStorage.setItem("sessionStartTime", sessionStart.toISOString());

  // Set up visibility change listener to track session duration
  document.addEventListener("visibilitychange", handleVisibilityChange);

  // Set up beforeunload listener to track session end
  window.addEventListener("beforeunload", endSession);
}

/**
 * Handle visibility change to track active vs. inactive time
 */
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is hidden, user switched tabs or minimized
    const sessionStart = localStorage.getItem("sessionStartTime");
    if (sessionStart) {
      const start = new Date(sessionStart);
      const now = new Date();
      const duration = (now - start) / 1000; // Duration in seconds

      // Only count sessions longer than 5 seconds
      if (duration > 5) {
        // Store partial session data
        localStorage.setItem("partialSessionDuration", duration.toString());
      }
    }
  } else {
    // Page is visible again, user came back
    // We could restart the timer or adjust for away time
    const partialDuration = localStorage.getItem("partialSessionDuration");
    if (partialDuration) {
      // User returned after being away
      // We could analyze this pattern further
      localStorage.removeItem("partialSessionDuration");
      localStorage.setItem("sessionStartTime", new Date().toISOString());
    }
  }
}

/**
 * End the current session
 */
function endSession() {
  const sessionStart = localStorage.getItem("sessionStartTime");
  if (sessionStart) {
    const start = new Date(sessionStart);
    const now = new Date();
    const duration = (now - start) / 1000; // Duration in seconds

    // Only count sessions longer than 5 seconds
    if (duration > 5) {
      // Update session data
      userData.sessionData.sessionCount++;
      userData.sessionData.totalSessionTime += duration;
      userData.sessionData.averageSessionLength =
        userData.sessionData.totalSessionTime /
        userData.sessionData.sessionCount;

      // Clean up
      localStorage.removeItem("sessionStartTime");
      localStorage.removeItem("partialSessionDuration");

      // Save user data
      saveUserData();
    }
  }

  // Remove event listeners
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("beforeunload", endSession);
}

/**
 * Analyze visit patterns to determine user preferences
 */
function analyzeVisitPatterns() {
  // Count visits by hour of day
  const hourCounts = Array(24).fill(0);

  userData.visitTimes.forEach((timeStr) => {
    const date = new Date(timeStr);
    const hour = date.getHours();
    hourCounts[hour]++;
  });

  // Find the hour with the most visits
  let maxCount = 0;
  let preferredHour = null;

  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count;
      preferredHour = hour;
    }
  });

  // Only set preferred time if we have enough data
  if (userData.visitTimes.length >= 5 && preferredHour !== null) {
    userData.preferredTimeOfDay = preferredHour;
  }
}

/**
 * Set up event listeners for tracking user behavior
 */
function setupBehaviorTracking() {
  // Track searches
  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const searchInput = document.getElementById("search-input");
      if (searchInput && searchInput.value.trim()) {
        trackSearch(searchInput.value.trim());
      }
    });
  }

  // Track bookmark clicks
  document.addEventListener("click", (e) => {
    const bookmarkItem = e.target.closest(".bookmark-item");
    if (bookmarkItem && bookmarkItem.href) {
      trackBookmarkClick(
        bookmarkItem.href,
        bookmarkItem.querySelector(".bookmark-title")?.textContent
      );
    }
  });
}

/**
 * Track a search query
 * @param {string} query - The search query
 */
function trackSearch(query) {
  // Update basic search count regardless of privacy settings
  userData.searchCount++;

  // Only track detailed search data if privacy setting allows
  if (settings.privacyControls.trackSearches) {
    // Update enhanced search patterns
    userData.searchPatterns.totalSearches++;
    userData.searchPatterns.avgSearchesPerVisit =
      userData.searchPatterns.totalSearches / userData.visitCount;

    // Add search time
    const now = new Date();
    userData.searchPatterns.searchTimes.push({
      query: query,
      timestamp: now.toISOString(),
      hour: now.getHours(),
      day: now.getDay(),
    });

    // Keep only last 20 search times
    if (userData.searchPatterns.searchTimes.length > 20) {
      userData.searchPatterns.searchTimes.shift();
    }

    // Add to recent searches (keep last 5)
    userData.recentSearches.unshift(query);
    if (userData.recentSearches.length > 5) {
      userData.recentSearches.pop();
    }

    // Categorize search (enhanced)
    const category = categorizeSearch(query);

    // Update search topics
    if (category) {
      userData.searchPatterns.searchTopics[category] =
        (userData.searchPatterns.searchTopics[category] || 0) + 1;
    }

    // Calculate productivity score based on search patterns
    if (settings.privacyControls.trackProductivity) {
      updateProductivityScore();
    }
  }

  // Save updated user data
  saveUserData();
}

/**
 * Update productivity score based on user behavior
 */
function updateProductivityScore() {
  let score = 50; // Start with neutral score

  // Factor 1: Search categories (productive categories increase score)
  const productiveCategories = ["work", "learning", "tech"];
  const leisureCategories = ["entertainment", "social", "shopping"];

  let productiveSearches = 0;
  let leisureSearches = 0;

  // Count productive vs leisure searches
  for (const [category, count] of Object.entries(userData.searchCategories)) {
    if (productiveCategories.includes(category)) {
      productiveSearches += count;
    } else if (leisureCategories.includes(category)) {
      leisureSearches += count;
    }
  }

  const totalCategorizedSearches = productiveSearches + leisureSearches;
  if (totalCategorizedSearches > 0) {
    // Adjust score based on ratio (max ±20 points)
    const productiveRatio = productiveSearches / totalCategorizedSearches;
    score += Math.round((productiveRatio - 0.5) * 40);
  }

  // Factor 2: Session patterns (longer sessions might indicate focus)
  if (userData.sessionData.averageSessionLength > 120) {
    // 2+ minutes avg
    score += 10;
  } else if (userData.sessionData.averageSessionLength < 30) {
    // < 30 seconds avg
    score -= 10;
  }

  // Factor 3: Time of day (early morning/working hours are more productive)
  const morningRatio =
    userData.timeOfDayActivity.morning /
    (userData.timeOfDayActivity.morning +
      userData.timeOfDayActivity.afternoon +
      userData.timeOfDayActivity.evening +
      userData.timeOfDayActivity.night || 1);

  if (morningRatio > 0.5) {
    score += 10; // Early bird bonus
  }

  // Ensure score stays within 0-100 range
  userData.productivityScore = Math.max(0, Math.min(100, score));
}

/**
 * Categorize a search query
 * @param {string} query - The search query
 * @returns {string|null} The category of the search
 */
function categorizeSearch(query) {
  const lowerQuery = query.toLowerCase();

  // Enhanced categorization based on keywords
  const categories = {
    work: [
      "report",
      "meeting",
      "email",
      "project",
      "task",
      "deadline",
      "document",
      "presentation",
      "office",
      "business",
      "client",
      "manager",
      "team",
      "workflow",
      "productivity",
    ],
    learning: [
      "tutorial",
      "course",
      "learn",
      "how to",
      "documentation",
      "guide",
      "education",
      "study",
      "training",
      "lesson",
      "class",
      "lecture",
      "knowledge",
      "skill",
      "university",
      "college",
    ],
    entertainment: [
      "movie",
      "show",
      "music",
      "game",
      "play",
      "watch",
      "stream",
      "video",
      "fun",
      "entertainment",
      "youtube",
      "netflix",
      "spotify",
      "concert",
      "festival",
      "tv",
      "series",
      "film",
    ],
    social: [
      "facebook",
      "twitter",
      "instagram",
      "linkedin",
      "social",
      "friend",
      "message",
      "chat",
      "connect",
      "network",
      "community",
      "group",
      "share",
      "post",
      "profile",
    ],
    shopping: [
      "buy",
      "shop",
      "price",
      "amazon",
      "ebay",
      "product",
      "purchase",
      "order",
      "discount",
      "deal",
      "sale",
      "store",
      "retail",
      "shipping",
      "cart",
    ],
    travel: [
      "flight",
      "hotel",
      "vacation",
      "trip",
      "booking",
      "travel",
      "destination",
      "tourism",
      "holiday",
      "resort",
      "airbnb",
      "airline",
      "airport",
      "cruise",
      "tour",
    ],
    health: [
      "workout",
      "exercise",
      "diet",
      "health",
      "medical",
      "doctor",
      "fitness",
      "nutrition",
      "wellness",
      "gym",
      "yoga",
      "meditation",
      "mental health",
      "sleep",
      "therapy",
    ],
    tech: [
      "code",
      "programming",
      "developer",
      "software",
      "github",
      "stack overflow",
      "technology",
      "app",
      "website",
      "computer",
      "algorithm",
      "data",
      "api",
      "framework",
      "javascript",
      "python",
      "html",
      "css",
    ],
    news: [
      "news",
      "current events",
      "politics",
      "world",
      "headline",
      "article",
      "report",
      "breaking",
      "update",
      "media",
      "journalist",
      "press",
    ],
    finance: [
      "finance",
      "money",
      "invest",
      "stock",
      "market",
      "bank",
      "budget",
      "saving",
      "credit",
      "loan",
      "mortgage",
      "tax",
      "financial",
      "economy",
      "trading",
    ],
  };

  // Check which category the query falls into
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerQuery.includes(keyword))) {
      // Increment category count
      userData.searchCategories[category] =
        (userData.searchCategories[category] || 0) + 1;
      return category;
    }
  }

  // If no category matched, count as "other"
  userData.searchCategories.other = (userData.searchCategories.other || 0) + 1;
  return "other";
}

/**
 * Track a bookmark click
 * @param {string} url - The bookmark URL
 * @param {string} title - The bookmark title
 */
function trackBookmarkClick(url, title) {
  // Only track bookmark usage if privacy setting allows
  if (settings.privacyControls.trackBookmarks) {
    // Extract domain from URL
    let domain = "";
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      domain = url;
    }

    // Update preferred sites
    userData.preferredSites[domain] =
      (userData.preferredSites[domain] || 0) + 1;

    // Update bookmark usage
    userData.bookmarkUsage.clicks++;

    // Categorize the bookmark
    const category = categorizeBookmark(url, title);

    // Update bookmark categories
    if (category) {
      userData.bookmarkUsage.categories[category] =
        (userData.bookmarkUsage.categories[category] || 0) + 1;
    }

    // Update productivity score if enabled
    if (settings.privacyControls.trackProductivity) {
      updateProductivityScore();
    }

    // Save updated user data
    saveUserData();
  }
}

/**
 * Categorize a bookmark based on URL and title
 * @param {string} url - The bookmark URL
 * @param {string} title - The bookmark title
 * @returns {string|null} The category of the bookmark
 */
function categorizeBookmark(url, title) {
  // Extract domain and path
  let domain = "";
  let path = "";

  try {
    const urlObj = new URL(url);
    domain = urlObj.hostname;
    path = urlObj.pathname;
  } catch (e) {
    domain = url;
  }

  // Convert to lowercase for comparison
  domain = domain.toLowerCase();
  const lowerTitle = title ? title.toLowerCase() : "";

  // Domain-based categorization
  const domainCategories = {
    work: [
      "docs.google.com",
      "sheets.google.com",
      "slides.google.com",
      "office.com",
      "microsoft.com",
      "linkedin.com",
      "slack.com",
      "trello.com",
      "asana.com",
      "notion.so",
      "monday.com",
      "atlassian.com",
      "jira.com",
      "confluence.com",
      "zoom.us",
    ],
    learning: [
      "coursera.org",
      "udemy.com",
      "edx.org",
      "khanacademy.org",
      "udacity.com",
      "pluralsight.com",
      "skillshare.com",
      "codecademy.com",
      "freecodecamp.org",
      "w3schools.com",
      "mdn.com",
      "stackoverflow.com",
      "github.com",
      "medium.com",
      "dev.to",
    ],
    entertainment: [
      "youtube.com",
      "netflix.com",
      "hulu.com",
      "disneyplus.com",
      "spotify.com",
      "soundcloud.com",
      "twitch.tv",
      "reddit.com",
      "9gag.com",
      "imgur.com",
      "tiktok.com",
      "instagram.com",
      "facebook.com",
    ],
    social: [
      "facebook.com",
      "twitter.com",
      "instagram.com",
      "linkedin.com",
      "pinterest.com",
      "tumblr.com",
      "reddit.com",
      "whatsapp.com",
      "telegram.org",
      "discord.com",
      "messenger.com",
    ],
    shopping: [
      "amazon.com",
      "ebay.com",
      "walmart.com",
      "target.com",
      "bestbuy.com",
      "etsy.com",
      "aliexpress.com",
      "shopify.com",
      "wayfair.com",
      "newegg.com",
    ],
    news: [
      "cnn.com",
      "bbc.com",
      "nytimes.com",
      "washingtonpost.com",
      "theguardian.com",
      "reuters.com",
      "apnews.com",
      "bloomberg.com",
      "wsj.com",
      "economist.com",
    ],
  };

  // Check domain categories
  for (const [category, domains] of Object.entries(domainCategories)) {
    if (domains.some((d) => domain.includes(d))) {
      return category;
    }
  }

  // If no domain match, try to categorize by title
  if (lowerTitle) {
    // Use the same categorization logic as search
    return categorizeSearch(lowerTitle);
  }

  return null;
}

/**
 * Get context-aware greeting based on user behavior
 *
 * Analyzes user data, time of day, season, holidays, and user preferences
 * to generate a personalized greeting. Falls back to time-based greeting
 * if context-aware greetings are disabled.
 *
 * @returns {Object|string} The greeting message (string or object with first/second lines)
 */
function getContextAwareGreeting() {
  const now = new Date();
  const hour = now.getHours();

  // If context-aware greetings are disabled, fall back to time-based greeting
  if (!settings.contextAwareGreetings || !settings.smartFeaturesEnabled) {
    return getTimeBasedGreeting(hour);
  }

  // Get greeting based on context
  return determineContextGreeting(hour);
}

/**
 * Get time-based greeting (fallback)
 * @param {number} hour - Current hour (0-23)
 * @returns {string} The greeting message
 */
function getTimeBasedGreeting(hour) {
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
  return greetings[randomIndex];
}

/**
 * Determine greeting based on user context
 * @param {number} hour - Current hour (0-23)
 * @returns {string} The greeting message
 */
function determineContextGreeting(hour) {
  // Get the user's preferred tone
  const tone = settings.greetingTone || "friendly";

  // Context-specific greeting categories with tone variations
  const greetings = {
    // Regular time-based greetings
    morning: [
      "Good morning",
      "Rise and shine",
      "Hello, sunshine",
      "Morning has broken",
      "Welcome to a new day",
    ],
    afternoon: [
      "Good afternoon",
      "Having a good day?",
      "Afternoon delight",
      "Keep going strong",
      "Halfway there",
    ],
    evening: [
      "Good evening",
      "Winding down?",
      "Evening has come",
      "Time to relax",
      "The day is done",
    ],
    night: [
      "Good night",
      "Burning the midnight oil?",
      "The stars are out",
      "Sweet dreams ahead",
      "Night owl, aren't you?",
    ],

    // Frequency-based greetings
    frequent: [
      "Welcome back",
      "Nice to see you again",
      "Back so soon?",
      "Hello again",
      "You're becoming a regular!",
    ],
    returning: [
      "Welcome back",
      "Good to see you again",
      "Hello again",
      "Back for more?",
      "Glad you're back",
    ],

    // Activity-based greetings
    productive: [
      "Ready to be productive?",
      "Let's get things done",
      "Time to focus",
      "Ready to work?",
      "Let's be productive today",
    ],
    learning: [
      "Ready to learn something new?",
      "Curious minds welcome",
      "What will you discover today?",
      "Learning never exhausts the mind",
      "Knowledge awaits",
    ],
    relaxed: [
      "Take it easy today",
      "Time to unwind",
      "Relax and enjoy",
      "No rush today",
      "Take your time",
    ],

    // Special time greetings
    weekend: [
      "Happy weekend!",
      "Weekend vibes",
      "Time to recharge",
      "Weekend mode: activated",
      "Enjoy your weekend",
    ],
    earlyBird: [
      "Early bird catches the worm",
      "Up with the sun today",
      "Early start today?",
      "You're up early",
      "Making the most of the morning",
    ],
    nightOwl: [
      "Burning the midnight oil?",
      "Night owl mode",
      "The night is still young",
      "Quiet hours are productive hours",
      "The best ideas come at night",
    ],

    // Seasonal greetings - organized by time of day
    spring: {
      morning: [
        "Spring morning has arrived",
        "Fresh spring day ahead",
        "Morning bloom awaits",
        "Spring forward into your day",
        "Morning renewal and growth",
      ],
      afternoon: [
        "Spring afternoon sunshine",
        "Blooming afternoon ahead",
        "Spring is in the afternoon air",
        "Enjoy the spring day",
        "Afternoon growth and renewal",
      ],
      evening: [
        "Spring evening has arrived",
        "Blooming evening ahead",
        "Spring twilight is here",
        "Evening flowers are blooming",
        "Enjoy the spring evening",
      ],
      night: [
        "Spring stars are out",
        "Peaceful spring night",
        "Spring moonlight shines",
        "Night blooms in spring",
        "Spring dreams await",
      ],
    },
    summer: {
      morning: [
        "Summer morning has arrived",
        "Sunny day ahead",
        "Morning sunshine awaits",
        "Rise with the summer sun",
        "Fresh summer morning",
      ],
      afternoon: [
        "Summer heat is here",
        "Sunny afternoon vibes",
        "Keep cool this afternoon",
        "Summer day in full swing",
        "Bright summer afternoon",
      ],
      evening: [
        "Summer evening has arrived",
        "Warm evening ahead",
        "Summer sunset approaches",
        "Evening warmth surrounds you",
        "Summer twilight is here",
      ],
      night: [
        "Summer stars are out",
        "Warm summer night",
        "Summer moonlight shines",
        "Night breeze of summer",
        "Summer dreams await",
      ],
    },
    fall: {
      morning: [
        "Crisp fall morning",
        "Autumn day begins",
        "Morning leaves are falling",
        "Fall morning has arrived",
        "Autumn sunrise greets you",
      ],
      afternoon: [
        "Fall colors surround you",
        "Autumn afternoon warmth",
        "Falling leaves this afternoon",
        "Embrace the fall day",
        "Cozy autumn afternoon",
      ],
      evening: [
        "Fall evening has arrived",
        "Autumn sunset approaches",
        "Evening leaves are falling",
        "Cozy fall evening ahead",
        "Autumn twilight is here",
      ],
      night: [
        "Fall stars are out",
        "Crisp autumn night",
        "Fall moonlight shines",
        "Night winds of autumn",
        "Cozy fall dreams await",
      ],
    },
    winter: {
      morning: [
        "Frosty winter morning",
        "Winter day begins",
        "Morning snow sparkles",
        "Winter sunrise greets you",
        "Crisp winter dawn",
      ],
      afternoon: [
        "Winter afternoon light",
        "Snowy day continues",
        "Afternoon frost glimmers",
        "Winter day in full swing",
        "Bright winter afternoon",
      ],
      evening: [
        "Winter evening has arrived",
        "Cozy night ahead",
        "Evening snow is falling",
        "Winter twilight is here",
        "Frosty evening surrounds you",
      ],
      night: [
        "Winter stars are bright",
        "Silent winter night",
        "Winter moonlight on snow",
        "Night chill of winter",
        "Cozy winter dreams await",
      ],
    },

    // Holiday greetings - organized by time of day
    newYear: {
      morning: [
        "Happy New Year morning!",
        "New year morning, new possibilities",
        "Fresh start to the new year",
        "Morning of new beginnings",
        "New year sunrise greets you",
      ],
      afternoon: [
        "Happy New Year day!",
        "New year, new day ahead",
        "Afternoon of new beginnings",
        "First day possibilities",
        "New year adventures continue",
      ],
      evening: [
        "Happy New Year evening!",
        "New year twilight approaches",
        "Evening of new beginnings",
        "New year sunset vibes",
        "First evening of possibilities",
      ],
      night: [
        "Happy New Year night!",
        "New year under the stars",
        "Night of new beginnings",
        "Midnight possibilities await",
        "New year dreams tonight",
      ],
    },
    valentines: {
      morning: [
        "Valentine's morning has arrived!",
        "Morning love is in the air",
        "Heart day begins",
        "Valentine's sunrise greets you",
        "Morning of love and joy",
      ],
      afternoon: [
        "Happy Valentine's Day!",
        "Afternoon love is in the air",
        "Heart day continues",
        "Valentine's warmth surrounds you",
        "Afternoon of love and joy",
      ],
      evening: [
        "Valentine's evening has arrived!",
        "Evening love is in the air",
        "Heart day winds down",
        "Valentine's sunset approaches",
        "Evening of love and joy",
      ],
      night: [
        "Valentine's night has arrived!",
        "Night love is in the air",
        "Heart day under the stars",
        "Valentine's moonlight shines",
        "Night of love and joy",
      ],
    },
    halloween: {
      morning: [
        "Halloween morning has arrived!",
        "Spooky day begins",
        "Morning tricks and treats",
        "Halloween sunrise greets you",
        "Morning of spooky fun",
      ],
      afternoon: [
        "Happy Halloween day!",
        "Spooky afternoon ahead",
        "Afternoon tricks and treats",
        "Halloween fun continues",
        "Afternoon of spooky vibes",
      ],
      evening: [
        "Halloween evening has arrived!",
        "Spooky night approaches",
        "Evening tricks and treats",
        "Halloween twilight is here",
        "Evening of spooky fun",
      ],
      night: [
        "Happy Halloween night!",
        "Spooky night is here",
        "Night tricks and treats",
        "Halloween moonlight shines",
        "Night of spooky adventures",
      ],
    },
    thanksgiving: {
      morning: [
        "Thanksgiving morning has arrived!",
        "Grateful morning to you",
        "Morning of thanks begins",
        "Thanksgiving sunrise greets you",
        "Morning to count your blessings",
      ],
      afternoon: [
        "Happy Thanksgiving day!",
        "Grateful afternoon to you",
        "Day of thanks continues",
        "Thanksgiving warmth surrounds you",
        "Afternoon to count your blessings",
      ],
      evening: [
        "Thanksgiving evening has arrived!",
        "Grateful evening to you",
        "Evening of thanks winds down",
        "Thanksgiving sunset approaches",
        "Evening to count your blessings",
      ],
      night: [
        "Thanksgiving night has arrived!",
        "Grateful night to you",
        "Night of thanks under stars",
        "Thanksgiving moonlight shines",
        "Night to count your blessings",
      ],
    },
    christmas: {
      morning: [
        "Merry Christmas morning!",
        "Christmas day has begun",
        "Morning holiday cheer",
        "Christmas sunrise greets you",
        "Morning of joy and giving",
      ],
      afternoon: [
        "Merry Christmas day!",
        "Holiday cheer continues",
        "Afternoon festivities",
        "Christmas warmth surrounds you",
        "Afternoon of joy and giving",
      ],
      evening: [
        "Merry Christmas evening!",
        "Holiday twilight approaches",
        "Evening festivities continue",
        "Christmas sunset vibes",
        "Evening of joy and giving",
      ],
      night: [
        "Merry Christmas night!",
        "Silent night, holy night",
        "Christmas stars shine bright",
        "Holiday moonlight glows",
        "Night of peace and joy",
      ],
    },
  };

  // Determine which greeting category to use based on context
  let category = getTimeCategory(hour);

  // Check for holidays and seasons first (highest priority)
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const day = now.getDate();

  // Check for specific holidays
  const holidayCategory = getHolidayCategory(month, day);
  if (holidayCategory && Math.random() > 0.3) {
    // 70% chance to show holiday greeting
    category = holidayCategory;
  }
  // If no holiday, check for season
  else {
    const seasonCategory = getSeasonCategory(month);
    if (seasonCategory && Math.random() > 0.5) {
      // 50% chance to show seasonal greeting
      category = seasonCategory;
    }
  }

  // Check if it's a weekend
  const isWeekend = [0, 6].includes(now.getDay());
  if (isWeekend && Math.random() > 0.5 && !holidayCategory) {
    category = "weekend";
  }

  // Check if user is an early bird or night owl
  if (hour < 6 && category === "morning") {
    category = "earlyBird";
  } else if (hour >= 23 || hour < 3) {
    category = "nightOwl";
  }

  // Check visit frequency
  if (userData.visitCount > 20) {
    // Frequent user - mix in frequency-based greetings
    if (Math.random() > 0.7 && !holidayCategory) {
      category = "frequent";
    }
  } else if (userData.visitCount > 5) {
    // Returning user - occasionally use returning greetings
    if (Math.random() > 0.8 && !holidayCategory) {
      category = "returning";
    }
  }

  // Check if user has a dominant search category
  const dominantCategory = getDominantSearchCategory();
  if (dominantCategory) {
    // Map search categories to greeting categories
    const categoryMap = {
      work: "productive",
      learning: "learning",
      entertainment: "relaxed",
      tech: "productive",
    };

    if (
      categoryMap[dominantCategory] &&
      Math.random() > 0.7 &&
      !holidayCategory
    ) {
      category = categoryMap[dominantCategory];
    }
  }

  // Get the current time category (morning, afternoon, evening, night)
  const timeCategory = getTimeCategory(hour);

  // Get a greeting from the selected category with tone preference
  // For seasonal and holiday categories, use time-appropriate greetings
  let availableGreetings;

  // Define tone-specific greetings for each time category
  const toneGreetings = {
    friendly: {
      morning: [
        "Good morning",
        "Rise and shine",
        "Hello, sunshine",
        "Morning has broken",
        "Welcome to a new day",
      ],
      afternoon: [
        "Good afternoon",
        "Having a good day?",
        "Afternoon delight",
        "Keep going strong",
        "Halfway there",
      ],
      evening: [
        "Good evening",
        "Winding down?",
        "Evening has come",
        "Time to relax",
        "The day is done",
      ],
      night: [
        "Good night",
        "Burning the midnight oil?",
        "The stars are out",
        "Sweet dreams ahead",
        "Night owl, aren't you?",
      ],
    },
    professional: {
      morning: [
        "Good morning",
        "Welcome to your workspace",
        "Ready for productivity",
        "Morning briefing time",
        "A new day of achievement",
      ],
      afternoon: [
        "Good afternoon",
        "Productive day ahead",
        "Afternoon progress check",
        "Continuing with excellence",
        "Midday efficiency",
      ],
      evening: [
        "Good evening",
        "Wrapping up for today",
        "Evening review time",
        "Completing today's tasks",
        "End of day summary",
      ],
      night: [
        "Working late",
        "Night shift productivity",
        "After-hours focus",
        "Late night efficiency",
        "Midnight productivity",
      ],
    },
    motivational: {
      morning: [
        "Seize the day!",
        "Today is full of possibilities",
        "Make today amazing",
        "Your morning, your canvas",
        "Begin with purpose",
      ],
      afternoon: [
        "Keep the momentum going",
        "You're making great progress",
        "Stay focused, stay winning",
        "Halfway to victory",
        "Push through the afternoon",
      ],
      evening: [
        "Reflect on your wins today",
        "You've accomplished so much",
        "Evening of achievement",
        "Celebrate your progress",
        "Strong finish to the day",
      ],
      night: [
        "Dream big tonight",
        "Tomorrow's success starts now",
        "Night of possibilities ahead",
        "Prepare for tomorrow's wins",
        "Rest well for new challenges",
      ],
    },
    casual: {
      morning: [
        "Hey, morning!",
        "What's up, early bird?",
        "Morning, you!",
        "Rise & shine",
        "Hey there, it's morning",
      ],
      afternoon: [
        "Afternoon vibes",
        "Hey, how's it going?",
        "Cruising through the day",
        "Afternoon, friend",
        "Midday check-in",
      ],
      evening: [
        "Evening, you made it!",
        "Hey, evening's here",
        "Chilling in the evening",
        "Winding down time",
        "Evening hangout",
      ],
      night: [
        "Night owl mode",
        "Up late, huh?",
        "Midnight surfing",
        "Late night vibes",
        "Night's still young",
      ],
    },
  };

  // Check if the category is a seasonal or holiday category with time-specific greetings
  if (
    [
      "spring",
      "summer",
      "fall",
      "winter",
      "newYear",
      "valentines",
      "halloween",
      "thanksgiving",
      "christmas",
    ].includes(category) &&
    greetings[category][timeCategory]
  ) {
    // Use time-appropriate greetings for this season/holiday
    availableGreetings = [...greetings[category][timeCategory]];
  } else if (
    ["morning", "afternoon", "evening", "night"].includes(category) &&
    toneGreetings[tone]
  ) {
    // Use tone-specific greetings for time categories
    availableGreetings = [...toneGreetings[tone][category]];
  } else {
    // Use regular greetings for this category
    availableGreetings = [...greetings[category]];
  }

  // Avoid repeating the last greeting
  if (userData.lastGreetings.length > 0) {
    availableGreetings = availableGreetings.filter(
      (greeting) => !userData.lastGreetings.includes(greeting)
    );
  }

  // If we've filtered out all greetings, use the original list
  if (availableGreetings.length === 0) {
    if (
      [
        "spring",
        "summer",
        "fall",
        "winter",
        "newYear",
        "valentines",
        "halloween",
        "thanksgiving",
        "christmas",
      ].includes(category) &&
      greetings[category][timeCategory]
    ) {
      availableGreetings = [...greetings[category][timeCategory]];
    } else if (
      ["morning", "afternoon", "evening", "night"].includes(category) &&
      toneGreetings[tone]
    ) {
      // Use tone-specific greetings for time categories
      availableGreetings = [...toneGreetings[tone][category]];
    } else {
      availableGreetings = [...greetings[category]];
    }
  }

  // Select a random greeting
  const randomIndex = Math.floor(Math.random() * availableGreetings.length);
  const selectedGreeting = availableGreetings[randomIndex];

  // Update last greetings
  userData.lastGreetings.unshift(selectedGreeting);
  if (userData.lastGreetings.length > 5) {
    userData.lastGreetings.pop();
  }

  // Save updated user data
  saveUserData();

  // Get personalized greeting if user name is available
  if (settings.userName && settings.userName.trim() !== "") {
    return getPersonalizedGreeting(
      selectedGreeting,
      settings.userName,
      category,
      timeCategory,
      tone
    );
  }

  return selectedGreeting;
}

/**
 * Get time category based on hour
 * @param {number} hour - Current hour (0-23)
 * @returns {string} Time category
 */
function getTimeCategory(hour) {
  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "evening";
  } else {
    return "night";
  }
}

/**
 * Get the dominant search category
 * @returns {string|null} The dominant category or null if none
 */
function getDominantSearchCategory() {
  if (
    !userData.searchCategories ||
    Object.keys(userData.searchCategories).length === 0
  ) {
    return null;
  }

  let maxCount = 0;
  let dominantCategory = null;

  for (const [category, count] of Object.entries(userData.searchCategories)) {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = category;
    }
  }

  // Only return if the category has a significant count
  return maxCount >= 3 ? dominantCategory : null;
}

/**
 * Get the appropriate holiday category based on date
 * @param {number} month - Month (0-11)
 * @param {number} day - Day of month
 * @returns {string|null} Holiday category or null if not a holiday
 */
function getHolidayCategory(month, day) {
  // New Year's Day (January 1)
  if (month === 0 && day === 1) {
    return "newYear";
  }

  // New Year period (December 31 - January 3)
  if ((month === 11 && day >= 31) || (month === 0 && day <= 3)) {
    return "newYear";
  }

  // Valentine's Day (February 14)
  if (month === 1 && day === 14) {
    return "valentines";
  }

  // Valentine's period (February 13-15)
  if (month === 1 && day >= 13 && day <= 15) {
    return "valentines";
  }

  // Halloween (October 31)
  if (month === 9 && day === 31) {
    return "halloween";
  }

  // Halloween period (October 29-31)
  if (month === 9 && day >= 29) {
    return "halloween";
  }

  // Thanksgiving (US: 4th Thursday in November)
  if (month === 10) {
    const date = new Date();
    date.setMonth(10); // November
    date.setDate(1);

    // Find the first Thursday
    while (date.getDay() !== 4) {
      date.setDate(date.getDate() + 1);
    }

    // Fourth Thursday
    const fourthThursday = date.getDate() + 21;

    // Thanksgiving period (4th Thursday - Sunday)
    if (day >= fourthThursday && day <= fourthThursday + 3) {
      return "thanksgiving";
    }
  }

  // Christmas period (December 20-26)
  if (month === 11 && day >= 20 && day <= 26) {
    return "christmas";
  }

  return null;
}

/**
 * Get the appropriate season category based on month
 * @param {number} month - Month (0-11)
 * @returns {string} Season category
 */
function getSeasonCategory(month) {
  // Northern hemisphere seasons
  // Spring: March-May
  if (month >= 2 && month <= 4) {
    return "spring";
  }
  // Summer: June-August
  else if (month >= 5 && month <= 7) {
    return "summer";
  }
  // Fall: September-November
  else if (month >= 8 && month <= 10) {
    return "fall";
  }
  // Winter: December-February
  else {
    return "winter";
  }
}

/**
 * Determine the appropriate background pattern based on user activity
 *
 * Analyzes user productivity score, time of day, and pattern preferences
 * to select the most appropriate background pattern. Falls back to the
 * user's manually selected pattern if no smart pattern is determined.
 *
 * @returns {string} The pattern name to use
 */
function determineActivityPattern() {
  // Default pattern if no smart features or not enough data
  if (!settings.smartFeaturesEnabled || userData.visitCount < 3) {
    return settings.backgroundPattern;
  }

  const now = new Date();
  const hour = now.getHours();

  // Get time category
  let timeCategory = getTimeCategory(hour);

  // Check if user has a preferred pattern for this time
  if (userData.patternPreferences[timeCategory]) {
    return userData.patternPreferences[timeCategory];
  }

  // Check productivity score for activity-based patterns
  if (userData.productivityScore >= 70) {
    // High productivity - use a pattern that enhances focus
    if (userData.patternPreferences.productive) {
      return userData.patternPreferences.productive;
    }
    // Default productive patterns
    return ["dots", "grid", "lines"].includes(settings.backgroundPattern)
      ? settings.backgroundPattern
      : "dots";
  } else if (userData.productivityScore <= 30) {
    // Low productivity - use a more relaxed pattern
    if (userData.patternPreferences.relaxed) {
      return userData.patternPreferences.relaxed;
    }
    // Default relaxed patterns
    return ["waves", "circles", "triangles"].includes(
      settings.backgroundPattern
    )
      ? settings.backgroundPattern
      : "waves";
  }

  // Use the user's selected pattern as fallback
  return settings.backgroundPattern;
}

/**
 * Track pattern selection to learn user preferences
 * @param {string} pattern - The selected pattern
 */
function trackPatternSelection(pattern) {
  if (!pattern || pattern === "none") return;

  const now = new Date();
  const hour = now.getHours();

  // Get time category
  const timeCategory = getTimeCategory(hour);

  // Store this pattern as preferred for this time of day
  userData.patternPreferences[timeCategory] = pattern;

  // Also track as general pattern preference
  userData.userPreferences.patternPreference = pattern;

  // Save user data
  saveUserData();
}

/**
 * Apply smart background pattern based on user activity
 */
function applySmartBackgroundPattern() {
  // Only apply if smart features are enabled
  if (!settings.smartFeaturesEnabled) return;

  // Determine the appropriate pattern
  const patternToUse = determineActivityPattern();

  // Only change if different from current pattern
  if (patternToUse && patternToUse !== settings.backgroundPattern) {
    // Temporarily change the pattern without saving to settings
    applyBackgroundPatternByName(patternToUse);
  }
}

/**
 * Apply a specific background pattern by name
 * @param {string} patternName - The name of the pattern to apply
 */
function applyBackgroundPatternByName(patternName) {
  const patternOverlay = document.querySelector(".pattern-overlay");
  if (!patternOverlay) return;

  // Remove existing pattern classes
  patternOverlay.className = "pattern-overlay";

  // If pattern is 'none', just hide the overlay
  if (patternName === "none") {
    patternOverlay.style.display = "none";
    return;
  }

  // Show the overlay
  patternOverlay.style.display = "block";

  // Apply the new pattern
  patternOverlay.classList.add(`pattern-${patternName}`);

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
    patternOverlay.classList.add(`animate-${settings.patternAnimationType}`);
  }
}

/**
 * Track settings changes for user preference analysis
 * @param {string} settingName - Name of the setting that was changed
 * @param {any} oldValue - Previous value of the setting
 * @param {any} newValue - New value of the setting
 */
function trackSettingsChange(settingName, oldValue, newValue) {
  // Only track if privacy setting allows
  if (!settings.privacyControls.trackVisits) {
    return;
  }

  // Create a record of the change
  const changeRecord = {
    setting: settingName,
    oldValue: oldValue,
    newValue: newValue,
    timestamp: new Date().toISOString(),
  };

  // Add to settings changes history
  userData.userPreferences.settingsChanges.push(changeRecord);

  // Keep only the last 20 changes
  if (userData.userPreferences.settingsChanges.length > 20) {
    userData.userPreferences.settingsChanges.shift();
  }

  // Special handling for specific settings
  if (settingName === "theme" || settingName === "accentColor") {
    // Track theme changes
    userData.userPreferences.themeChanges.push({
      theme: settings.theme,
      accentColor: settings.accentColor,
      timestamp: new Date().toISOString(),
    });

    // Keep only the last 10 theme changes
    if (userData.userPreferences.themeChanges.length > 10) {
      userData.userPreferences.themeChanges.shift();
    }

    // Update color preference
    if (settingName === "accentColor") {
      userData.userPreferences.colorPreference = newValue;
    }
  } else if (settingName === "backgroundPattern") {
    // Track pattern selection
    trackPatternSelection(newValue);
  }

  // Save user data
  saveUserData();
}

/**
 * Reset user data to defaults
 */
function resetUserData() {
  // Reset to default values
  userData = { ...DEFAULT_USER_DATA };

  // Set first visit date to now
  userData.firstVisitDate = new Date().toISOString();

  // Save the reset data
  saveUserData();

  console.log("User data has been reset to defaults");

  return true;
}

/**
 * Get a personalized greeting that incorporates the user's name
 * @param {string} baseGreeting - The original greeting without name
 * @param {string} userName - The user's name
 * @param {string} category - The greeting category
 * @param {string} timeCategory - The time category (morning, afternoon, evening, night)
 * @param {string} tone - The greeting tone preference
 * @returns {Object} A personalized greeting with first and second lines
 */
function getPersonalizedGreeting(
  baseGreeting,
  userName,
  category,
  timeCategory,
  tone
) {
  // Two-line personalized greeting templates by tone
  const personalGreetings = {
    friendly: {
      morning: [
        {
          first: `Good morning, ${userName}!`,
          second: "Hope you slept well.",
        },
        {
          first: `Rise and shine, ${userName}!`,
          second: "It's a beautiful morning.",
        },
        {
          first: `Morning, ${userName}!`,
          second: "Ready to start the day?",
        },
        {
          first: `Hello, ${userName}!`,
          second: "The morning is looking bright.",
        },
        {
          first: `Welcome to a new day, ${userName}!`,
          second: "Make it count.",
        },
      ],
      afternoon: [
        {
          first: `Good afternoon, ${userName}!`,
          second: "How's your day going?",
        },
        {
          first: `Hey there, ${userName}!`,
          second: "Having a good day?",
        },
        {
          first: `Afternoon, ${userName}!`,
          second: "Hope you're having a productive day.",
        },
        {
          first: `Hello, ${userName}!`,
          second: "The day is still young.",
        },
        {
          first: `Keep going strong, ${userName}!`,
          second: "The day is yours.",
        },
      ],
      evening: [
        {
          first: `Good evening, ${userName}!`,
          second: "How was your day?",
        },
        {
          first: `Evening, ${userName}!`,
          second: "Time to wind down?",
        },
        {
          first: `Hello, ${userName}!`,
          second: "The evening is here.",
        },
        {
          first: `Winding down, ${userName}?`,
          second: "The evening is yours.",
        },
        {
          first: `Evening has arrived, ${userName}.`,
          second: "Time to relax.",
        },
      ],
      night: [
        {
          first: `Good night, ${userName}!`,
          second: "Don't stay up too late.",
        },
        {
          first: `Still up, ${userName}?`,
          second: "The night is peaceful.",
        },
        {
          first: `Night owl, ${userName}?`,
          second: "The stars are out.",
        },
        {
          first: `Sweet dreams ahead, ${userName},`,
          second: "whenever you're ready.",
        },
        {
          first: `The night is still young, ${userName}.`,
          second: "Enjoy the quiet hours.",
        },
      ],
    },
    professional: {
      morning: [
        {
          first: `Good morning, ${userName}.`,
          second: "Ready for a productive day?",
        },
        {
          first: `Morning, ${userName}.`,
          second: "Your workspace is ready.",
        },
        {
          first: `Welcome, ${userName}.`,
          second: "The day holds much potential.",
        },
        {
          first: `Good morning, ${userName}.`,
          second: "Your schedule awaits.",
        },
        {
          first: `Morning briefing time, ${userName}.`,
          second: "Let's review the agenda.",
        },
      ],
      afternoon: [
        {
          first: `Good afternoon, ${userName}.`,
          second: "Making progress?",
        },
        {
          first: `Afternoon, ${userName}.`,
          second: "Staying on schedule?",
        },
        {
          first: `Hello, ${userName}.`,
          second: "The afternoon agenda awaits.",
        },
        {
          first: `Good afternoon, ${userName}.`,
          second: "Time to review the day's progress.",
        },
        {
          first: `Productive afternoon, ${userName}.`,
          second: "Keep the momentum going.",
        },
      ],
      evening: [
        {
          first: `Good evening, ${userName}.`,
          second: "Wrapping up for the day?",
        },
        {
          first: `Evening, ${userName}.`,
          second: "Time to review today's accomplishments.",
        },
        {
          first: `Hello, ${userName}.`,
          second: "The workday is concluding.",
        },
        {
          first: `Evening check-in, ${userName}.`,
          second: "Goals met today?",
        },
        {
          first: `Evening, ${userName}.`,
          second: "Time to prepare for tomorrow.",
        },
      ],
      night: [
        {
          first: `Working late, ${userName}?`,
          second: "Remember to rest.",
        },
        {
          first: `Good night, ${userName}.`,
          second: "Tomorrow's agenda is set.",
        },
        {
          first: `Night work, ${userName}?`,
          second: "Efficiency peaks in quiet hours.",
        },
        {
          first: `Late session, ${userName}.`,
          second: "Don't forget to log your progress.",
        },
        {
          first: `Night productivity, ${userName}.`,
          second: "Remember work-life balance.",
        },
      ],
    },
    motivational: {
      morning: [
        {
          first: `Rise and conquer, ${userName}!`,
          second: "Today is yours to claim.",
        },
        {
          first: `Morning champion, ${userName}!`,
          second: "Ready to achieve greatness?",
        },
        {
          first: `New day, new victories, ${userName}!`,
          second: "Make it count.",
        },
        {
          first: `Good morning, ${userName}!`,
          second: "Your potential is limitless today.",
        },
        {
          first: `Morning, ${userName}!`,
          second: "Today's success starts now.",
        },
      ],
      afternoon: [
        {
          first: `Keep pushing, ${userName}!`,
          second: "You're doing amazing things.",
        },
        {
          first: `Afternoon momentum, ${userName}!`,
          second: "Don't slow down now.",
        },
        {
          first: `You're crushing it, ${userName}!`,
          second: "The afternoon is yours.",
        },
        {
          first: `Halfway mark, ${userName}!`,
          second: "Your persistence is inspiring.",
        },
        {
          first: `Stay focused, ${userName}!`,
          second: "Your goals are within reach.",
        },
      ],
      evening: [
        {
          first: `Evening reflection, ${userName}`,
          second: "Look how far you've come today!",
        },
        {
          first: `Another day of wins, ${userName}!`,
          second: "Celebrate your progress.",
        },
        {
          first: `Evening, ${userName}!`,
          second: "Take pride in today's achievements.",
        },
        {
          first: `You made it happen today, ${userName}!`,
          second: "Evening well-earned.",
        },
        {
          first: `Evening star, ${userName}!`,
          second: "Your efforts today will shine tomorrow.",
        },
      ],
      night: [
        {
          first: `Dream big tonight, ${userName}!`,
          second: "Tomorrow's another opportunity.",
        },
        {
          first: `Night visionary, ${userName}!`,
          second: "Rest and recharge for tomorrow's wins.",
        },
        {
          first: `Stars align for you, ${userName}!`,
          second: "Rest well for tomorrow's success.",
        },
        {
          first: `Night of possibilities, ${userName}.`,
          second: "Dream of your next achievement.",
        },
        {
          first: `Rest well, ${userName}!`,
          second: "Tomorrow's victories await you.",
        },
      ],
    },
    casual: {
      morning: [
        {
          first: `Hey ${userName}! Morning!`,
          second: "Ready to tackle the day?",
        },
        {
          first: `What's up, ${userName}?`,
          second: "Ready to rock this morning?",
        },
        {
          first: `Yo, ${userName}!`,
          second: "The day is young.",
        },
        {
          first: `Morning vibes, ${userName}!`,
          second: "Let's make it a good one.",
        },
        {
          first: `Hey there ${userName}!`,
          second: "Coffee time?",
        },
      ],
      afternoon: [
        {
          first: `Hey ${userName}!`,
          second: "Afternoon hangout?",
        },
        {
          first: `What's happening, ${userName}?`,
          second: "Day going cool?",
        },
        {
          first: `Yo, ${userName}!`,
          second: "Midday check-in.",
        },
        {
          first: `Cruising through the day, ${userName}?`,
          second: "Keep it up!",
        },
        {
          first: `Afternoon chill, ${userName}!`,
          second: "Taking a break?",
        },
      ],
      evening: [
        {
          first: `Hey ${userName}!`,
          second: "Evening's here!",
        },
        {
          first: `What's up, ${userName}?`,
          second: "Plans tonight?",
        },
        {
          first: `Yo, ${userName}!`,
          second: "Evening vibes.",
        },
        {
          first: `Chilling tonight, ${userName}?`,
          second: "You deserve it.",
        },
        {
          first: `Evening hangout, ${userName}!`,
          second: "Time to relax.",
        },
      ],
      night: [
        {
          first: `Still up, ${userName}?`,
          second: "Night owl mode!",
        },
        {
          first: `Late night surfing, ${userName}?`,
          second: "The internet never sleeps.",
        },
        {
          first: `Yo, ${userName}!`,
          second: "Midnight vibes.",
        },
        {
          first: `Night's still young, ${userName}!`,
          second: "But don't forget to rest.",
        },
        {
          first: `Late night crew, ${userName}!`,
          second: "We're in this together.",
        },
      ],
    },
  };

  // Special categories like holidays and seasons
  if (
    [
      "spring",
      "summer",
      "fall",
      "winter",
      "newYear",
      "valentines",
      "halloween",
      "thanksgiving",
      "christmas",
    ].includes(category)
  ) {
    // For special categories, create a two-line greeting
    return {
      first: `${baseGreeting}, ${userName}`,
      second: getSeasonalSecondLine(category),
    };
  }

  // For time-based categories, use the personalized greeting library
  if (
    ["morning", "afternoon", "evening", "night"].includes(category) &&
    personalGreetings[tone]
  ) {
    // Use timeCategory if the category is a special one but we want time-appropriate greetings
    const timeOfDay = ["morning", "afternoon", "evening", "night"].includes(
      category
    )
      ? category
      : timeCategory;
    const greetingOptions = personalGreetings[tone][timeOfDay];
    const randomIndex = Math.floor(Math.random() * greetingOptions.length);
    return greetingOptions[randomIndex];
  }

  // For other categories (weekend, frequent, etc.), create a two-line greeting
  return {
    first: `${baseGreeting}, ${userName}`,
    second: getCategorySecondLine(category, timeCategory),
  };
}

/**
 * Get a seasonal second line for greetings
 * @param {string} season - The season or holiday
 * @returns {string} A second line for the greeting
 */
function getSeasonalSecondLine(season) {
  const secondLines = {
    spring: "Enjoy the blooming season!",
    summer: "Stay cool in this summer heat.",
    fall: "The colors of autumn are beautiful.",
    winter: "Stay warm in this winter weather.",
    newYear: "Here's to a fantastic year ahead!",
    valentines: "Sending good vibes your way today.",
    halloween: "Spooky season is upon us!",
    thanksgiving: "There's much to be grateful for.",
    christmas: "Wishing you joy and peace.",
  };

  return secondLines[season] || "";
}

/**
 * Get a category-specific second line for greetings
 * @param {string} category - The greeting category
 * @param {string} timeCategory - The time category
 * @returns {string} A second line for the greeting
 */
function getCategorySecondLine(category, timeCategory) {
  const categoryLines = {
    weekend: "Time to enjoy your weekend!",
    frequent: "Always nice to see you here.",
    returning: "Welcome back to your dashboard.",
    earlyBird: "You're up early today!",
    nightOwl: "Burning the midnight oil?",
    productive: "Ready to be productive today?",
    learning: "What will you learn today?",
    relaxed: "Take some time to relax today.",
  };

  // If we have a specific line for this category, use it
  if (categoryLines[category]) {
    return categoryLines[category];
  }

  // Otherwise fall back to time-based second lines
  const timeLines = {
    morning: "Have a productive morning!",
    afternoon: "Hope your day is going well.",
    evening: "Time to unwind and relax.",
    night: "Don't stay up too late!",
  };

  return timeLines[timeCategory] || "";
}
