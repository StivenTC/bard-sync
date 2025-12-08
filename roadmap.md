# BardSync Beta Roadmap & Scalability Analysis

## 1. Beta Features Roadmap

### A. Core Experience & Synchronization (Priority #1)
- **Robust Timestamp Sync:** Implement a flawless synchronization system where all players hear the music at the exact same second as the GM, regardless of when they join.
- **Thematic Immersion:** Rewrite app text to match a "Tavern/Fantasy" vibe (e.g., "Join Session" -> "Enter Tavern", "Loading" -> "Summoning Bard").
- **Internationalization (i18n):** Add support for multiple languages, prioritizing **Spanish (LATAM/ES)** for the initial user base.

### B. "Stream Deck" UI for GM Console
- **Modular Design:** Maintain the three distinct panels: **Visual Scene**, **Music**, and **Soundboard**.
- **Soundboard (SFX):** Grid of customizable buttons (Icon + Color) for instant sound effects (Sword, Magic, Scream).
- **Music Control:**
    - **List View:** A clean list of saved tracks with clear metadata (Title, Duration).
    - **Actions:** Each track has a "Play" button and a "Delete" button.
    - **Modal Configuration:** Add new tracks via a modal (Paste URL -> Fetch Title -> Save).

### C. Authentication & Room Management
- **GM Registration/Login:** GMs create accounts to save their campaigns, custom soundboards, and music lists.
- **Dynamic Rooms (Campaigns):**
    - GMs can manage multiple campaigns (e.g., "Curse of Strahd", "Homebrew World").
    - **Active/Inactive State:** Rooms have an `isActive` flag to optimize Firebase usage.
- **Player Access:** Simple access via unique links (e.g., `bardsync.com/play/dragon-campaign`). No player accounts required.

---

## 2. Scalability Analysis

### Current Architecture (Firebase Realtime Database)
- **Pros:** Extremely fast, real-time sync (milliseconds latency), easy to implement.
- **Cons:** Cost scales with simultaneous connections and data downloaded.

### Capacity Estimates
- **Free Tier (Spark):** 100 simultaneous connections. This is enough for ~20 active campaigns with 5 players each.
- **Blaze Plan (Pay as you go):**
    - **Connections:** 200k simultaneous connections per database.
    - **Cost:** You pay for GB stored and GB downloaded. Since we only sync small text strings (URLs, timestamps, status), the data usage is **very low**.
    - **Estimate:** You could easily support **thousands of concurrent users** for a few dollars a month.

### Optimization Strategies for Scale
1.  **Inactive Rooms:** Ensure players in inactive rooms automatically disconnect from Firebase.
2.  **Data Structure:** Keep the `session` node flat. Don't load the entire DB.
3.  **CDN:** Serve static assets (images, app code) via a CDN (Vercel does this automatically).

### Conclusion
For a Beta and even a production launch with thousands of users, **Firebase Realtime Database is an excellent choice**. It handles the hard part (sync) for you. You won't hit its limits anytime soon unless you go viral globally, at which point the cost will be your main concern, not the tech limit.
