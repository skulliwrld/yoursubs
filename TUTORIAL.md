# Allsub - Subscription Management App Tutorial

## Overview

This tutorial document provides a comprehensive explanation of all features implemented in the Allsub Expo application, which is a subscription management app with authentication powered by Clerk. Each major section contains detailed explanations, including why certain decisions were made, how the features work under the hood, and what considerations to keep in mind for production use.

The application allows users to track their subscriptions, view spending insights, and manage their accounts through a clean and intuitive interface. Authentication is handled securely through Clerk, supporting OAuth with Google and Apple, while subscriptions are displayed with placeholder icons showing company initials.

---

## Table of Contents

1. Project Setup
2. Clerk Authentication
3. OAuth Implementation
4. Profile & Settings Pages
5. Home Page with Subscriptions
6. Date Handling with Day.js
7. Company Placeholder Icons
8. GitHub Deployment
9. Key Takeaways and Recommendations

---

## 1. Project Setup

### 1.1 Why These Packages Are Required

Building an Expo app with authentication requires several key packages that serve different purposes in the application architecture. Understanding why each package is needed helps in maintaining and debugging the application later.

The first and most important package is **@clerk/expo**, which is the official Clerk SDK specifically designed for Expo applications. Clerk provides a complete authentication solution that handles user management, session handling, and OAuth flows. The "expo" variant of the SDK is optimized for the Expo environment and works seamlessly with expo-router for navigation.

The second essential package is **expo-auth-session**, which provides the underlying authentication session management that Clerk's OAuth flow depends on. This package handles the complex process of managing OAuth tokens, refresh tokens, and session state across the application. Without this package, OAuth flows would fail because there would be no mechanism to maintain the user's logged-in state.

The third critical package is **expo-web-browser**, which is required for completing OAuth flows in a secure manner. When users authenticate with Google or Apple, they are redirected to external web pages where they enter their credentials. This package manages the return flow back to the application after authentication is complete, ensuring a smooth user experience.

The fourth package is **expo-secure-store**, which Clerk recommends for storing sensitive token data. This package encrypts data before storing it on the device, making it secure against tampering or reading by other applications. While Clerk can store tokens in memory by default, using SecureStore is the recommended approach for production applications as it provides enterprise-grade security.

Finally, **dayjs** was added for date formatting because handling dates in JavaScript can be inconsistent and error-prone. Day.js provides a lightweight and reliable way to format dates consistently across the entire application.

### 1.2 Environment Variables Setup

Environment variables in Expo apps use the prefix "EXPO_PUBLIC_" to make variables accessible to the app at runtime. The Clerk publishable key is stored in the .env file and loaded into the application through this mechanism.

The publishable key is different from the secret key and is designed to be exposed in the client-side code. It identifies your Clerk application and is used to initialize the ClerkProvider. When you create an application in the Clerk dashboard, you receive both a publishable key and a secret key, with only the publishable key needed for frontend implementation.

---

## 2. Clerk Authentication

### 2.1 Understanding ClerkProvider

The ClerkProvider is the foundation of authentication in the application. It wraps the entire app and provides authentication context to all child components. This means any component within the app can access authentication state and methods through the useAuth and useUser hooks.

When wrapping the app with ClerkProvider, you pass the publishable key as a prop. This connects your app to your Clerk instance where user data and authentication configurations are managed. The provider handles all the complexity of maintaining authentication state, including checking if a user is signed in, managing session tokens, and handling token refresh.

### 2.2 Token Cache Implementation

The token cache is a critical security feature that determines how authentication tokens are stored and retrieved. Clerk provides a default in-memory token cache that works for development, but for production applications, using SecureStore is strongly recommended.

The token cache object requires three methods: getToken, saveToken, and removeToken. The getToken method retrieves an existing token from storage and is called whenever Clerk needs to verify the user's session. The saveToken method stores new tokens after successful authentication, and the removeToken method clears tokens when the user signs out.

By implementing the token cache with SecureStore, tokens are encrypted before being written to the device's storage. This means even if someone gains physical access to the device or extracts the storage, they cannot read the authentication tokens. This level of security is essential for production applications that handle user data.

### 2.3 Auth Protection in Tab Navigation

The tabs layout uses a Redirect component from expo-router to protect authenticated routes. When a user tries to access the tabs section without being signed in, they are automatically redirected to the sign-in page. This happens on every navigation to the tabs, ensuring that the protection is always enforced.

The useAuth hook provides the isSignedIn boolean that indicates whether a user currently has an active session. This value is checked immediately when the tabs layout renders, and if false, the Redirect component sends the user to the authentication screen. This approach is more secure than only checking authentication on individual screens because it prevents unauthorized access at the navigation level.

---

## 3. OAuth Implementation

### 3.1 How OAuth Works in Mobile Apps

OAuth in mobile applications follows a different flow than OAuth on the web. In a mobile context, the authentication happens through an embedded browser view or external browser app, depending on the OAuth provider's implementation. The flow begins when the user initiates sign-in with a provider like Google or Apple.

The useOAuth hook from Clerk manages this entire flow. When startOAuthFlow is called, it opens an authentication window where the user enters their credentials. After successful authentication, the provider returns an authorization code that is exchanged for a session token. This token is then stored using the token cache, and the session is activated using the setActive function.

### 3.2 Why Only Google and Apple Are Supported

Clerk's Expo SDK supports a specific set of OAuth providers, with Google and Apple being the primary ones available for mobile applications. Microsoft, LinkedIn, and Twitter are not supported because their OAuth implementations don't work well in the mobile context or require additional configuration that Clerk hasn't abstracted for Expo.

When attempting to use an unsupported provider like Microsoft, the OAuth flow fails with an error indicating the strategy doesn't match allowed values. This is a limitation of the Clerk SDK rather than a configuration issue, and it cannot be worked around without implementing a custom OAuth solution outside of Clerk.

The reason for this limitation is that each OAuth provider requires different configurations and handling, and Clerk has focused on supporting the providers that work most reliably across different mobile platforms. Google and Apple are the most commonly used providers in mobile apps, making them the most important to support.

### 3.3 Session Activation Clarification

A common mistake when implementing OAuth is trying to activate the session using the setActive function returned from the OAuth flow itself. However, this doesn't work reliably. Instead, you should use the setActive function from the useAuth hook, which is available at the app level and properly handles session activation.

The correct approach is to call useAuth to get the setActive function, then call it with the sessionId returned from the OAuth flow. This ensures the session is registered at the application level and persists across navigation. The session returned from the OAuth flow might exist but won't be active at the app level unless setActive is called properly.

---

## 4. Profile & Settings Pages

### 4.1 How User Data Flows from Clerk

When a user signs in through OAuth, Clerk retrieves their profile information from the identity provider and makes it available through the useUser hook. This data includes the full name, email addresses, profile images, and other information the identity provider shares.

The useUser hook returns a user object that contains all this information. For the user's name, the app first checks for fullName, then falls back to firstName, and finally defaults to "User" if neither exists. This fallback ensures the app always displays something meaningful even if the identity provider doesn't share certain information.

The email address is accessed through the primaryEmailAddress property, which returns the user's primary email from their Clerk account. This is the email they signed up with, and it's used throughout the app for display purposes.

### 4.2 Sign Out Implementation

The sign out functionality is straightforward but important to implement correctly. The useAuth hook provides a signOut function that clears the current session and removes tokens from storage. This function should be called when the user taps the sign out button in settings.

After signOut is called, the user is automatically redirected because the tabs layout checks authentication state on every render. The redirect happens immediately because isSignedIn becomes false once the session is cleared. There is no need to manually navigate after signing out because the auth guard in the tabs layout handles the redirect automatically.

### 4.3 Profile Page Route Protection

The profile page is a standalone route outside of the tabs navigation. It needs its own auth protection because users could potentially navigate directly to /profile from a deep link. The protection is implemented by checking isSignedIn and returning a Redirect to the sign-in page if the user isn't authenticated.

This approach ensures that even if someone tries to access the profile page directly without being logged in, they are automatically sent to the authentication screen. The profile page still works correctly when the user is signed in, displaying their information from Clerk.

---

## 5. Home Page with Subscriptions

### 5.1 Mixing Authenticated and Mock Data

The home page demonstrates an important pattern: combining authenticated user data with static or mock subscription data. The user's name comes from Clerk through the useUser hook, while the subscription data comes from constants stored in the data file.

This approach is common in development and early production stages because backend integration for subscription management requires additional infrastructure. The mock data provides a realistic UI while the authentication is fully functional. Eventually, the mock data would be replaced with API calls to fetch actual subscription data from a database.

### 5.2 Navigation Patterns

The home page implements several navigation patterns that are important to understand. The subscription cards use the router.push method to navigate to detail pages, passing the subscription ID as a parameter. This parameter is then used in the detail page to find the specific subscription from the data.

The "See All" link in the All Subscriptions section uses router.push to navigate to the subscriptions tab, which displays the complete list. The add button in the header navigates to the add-subscription page where users would eventually create new subscriptions. These navigation patterns form the core user flow through the application.

### 5.3 User Name Display Logic

The user name display uses a fallback chain to ensure something is always shown. It first tries user.fullName, which contains the full name from the identity provider. If that's not available, it tries user.firstName. If neither exists, it defaults to "User" as a generic fallback.

This chain is necessary because different identity providers share different amounts of information. Some providers share the full name, some share only the first name, and some might share neither. The fallback chain ensures the app handles all these cases gracefully.

---

## 6. Date Handling with Day.js

### 6.1 Why Day.js Over Native Date

JavaScript's native Date object has inconsistent behavior across different platforms and browsers. The toLocaleDateString method in particular produces different output formats depending on the user's device settings, which can cause UI inconsistencies in applications.

Day.js provides a unified API for date formatting that produces consistent results regardless of the user's device settings. The format method takes a pattern string where "MMM" represents the abbreviated month name, "D" represents the day, and "YYYY" represents the four-digit year. This gives precise control over the output format.

### 6.2 Format Pattern Explanation

The format "MMM D, YYYY" produces output like "Mar 18, 2026" where "Mar" is the three-letter month abbreviation, "18" is the day without leading zeros, and "2026" is the full year. This format is commonly used in English-language applications and strikes a good balance between readability and information density.

Other common formats include "MMMM D, YYYY" for the full month name, "MM/DD/YYYY" for numerical formats, and "DD/MM/YYYY" for European date ordering. Day.js supports all these formats and more through its flexible pattern system.

### 6.3 Files Updated with Day.js

All files that display dates were updated to use Day.js consistently. This includes the home page balance card showing the next renewal date, the subscriptions list showing upcoming payment dates, the insights page showing the next renewal, and the subscription detail page showing various date fields.

Having consistent date formatting across the entire app improves the user experience by making dates easily recognizable and comparable. It also makes the app look more professional and well-designed.

---

## 7. Company Placeholder Icons

### 7.1 Why Remote Logos Don't Work

Using remote logo services like Clearbit seemed like a good idea initially because they provide logos for thousands of companies automatically through their API. However, several issues make this approach unreliable in practice.

First, many logo URLs return 404 errors because company logos change or are removed from the service. Second, even when logos load, they might be slow, causing a poor user experience with images popping in late. Third, some networks or firewall configurations block external image requests, making logos fail to load entirely. Finally, these services might require API keys or have rate limits that cause failures in production.

### 7.2 How Placeholder Icons Work

The placeholder approach uses a simple helper function that extracts the first letter from either the subscription name or its ID. For example, "Spotify" becomes "S", "Adobe Creative Cloud" becomes "A", and "github-pro" becomes "G" after splitting on the hyphen.

Each subscription in the data file has a color property that provides the background color for its placeholder. This color matches the company's brand identity, making the placeholder visually appealing and recognizable even without the actual logo. The combination of the initial letter and brand color creates a consistent and professional-looking icon.

### 7.3 Extending the Placeholder System

The system can be extended later by adding actual logo images to the assets folder. When images are available, the getCompanyInitial function can be modified to return an image source instead, or a new function can be added that checks for local images before falling back to the placeholder.

For now, the placeholder approach is reliable, performs well, and looks good with the brand colors from the data. This is a common pattern in mobile apps where consistent, fast-loading icons are preferred over potentially slow-loading external images.

---

## 8. GitHub Deployment

### 8.1 Staging Files Properly

When pushing code to GitHub, it's important to only stage the files that are part of the feature or fix being committed. Staging the entire repository including generated files like node_modules would create an unnecessarily large commit and could cause issues.

The files staged for this commit included the app code in the various directories, the constants folder containing data and icons, and the package files. Files like .env were intentionally not staged because they contain sensitive information that should never be committed to a repository.

### 8.2 Commit Message Best Practices

The commit message "Add Clerk authentication with OAuth and subscription features" follows the convention of starting with a verb in the imperative tense and describing what the commit does. This makes it easy to understand what changed by reading the message.

Good commit messages make it easier to review code history, understand when changes were made, and find specific commits when debugging. Future commits should follow the same pattern, describing the specific changes being made.

---

## 9. Key Takeaways and Recommendations

### 9.1 What Works Well

Several aspects of this implementation work particularly well and should be maintained in future development. Clerk provides a robust and well-documented authentication solution that integrates smoothly with Expo. The OAuth flow with Google and Apple works reliably, and the user data syncs automatically after authentication.

The placeholder icon system is fast and reliable, avoiding the common problem of missing or slow-loading images. Day.js provides consistent date formatting throughout the app. The routing structure properly protects authenticated routes and handles navigation flows smoothly.

### 9.2 Common Issues Encountered

During development, several issues were encountered and resolved. The OAuth strategy error occurred when trying to use unsupported providers like Microsoft and LinkedIn; this was resolved by limiting to Google and Apple only. The session activation error occurred when trying to use setActive from the OAuth result; this was resolved by using setActive from useAuth instead.

Image loading issues occurred when trying to use remote URLs; this was resolved by switching to the placeholder icon system. These are common issues in Expo apps with Clerk, and the solutions provided here should help avoid similar problems in future development.

### 9.3 Production Recommendations

When moving toward production, several improvements should be considered. First, replace the mock subscription data with a real backend API that can create, read, update, and delete subscriptions. Second, add push notifications using Expo Notifications to remind users about upcoming payments. Third, implement proper loading states during authentication and data fetching. Fourth, consider adding email and password authentication as an alternative to OAuth. Fifth, store subscription data in a proper database like Firebase, Supabase, or a custom backend.

These improvements would turn the application from a demonstration into a production-ready subscription management app that users could actually use to track their real subscriptions.

---

## Conclusion

This tutorial has covered all the major features implemented in the Allsub application, including the reasoning behind each decision, how the features work internally, and what considerations are important for future development. The application now has a solid foundation of authentication and UI components that can be extended with production features.

The key takeaway is that Clerk provides an excellent authentication solution for Expo apps, with the OAuth flow working reliably for Google and Apple. The placeholder icon system and Day.js for dates are practical solutions that improve reliability and user experience. With these foundations in place, adding production features like database integration and notifications would be straightforward.