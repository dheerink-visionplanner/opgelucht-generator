# Feature: Automated RSS Feed Fetching & Parsing

## Description

The system periodically fetches and parses all configured RSS feeds, extracting news items with their title, link, publication date, and source name. This automates the manual process of reviewing ~10–15 daily Google Alerts emails. The user can also trigger a manual fetch. Duplicate news items (same URL) are detected and skipped.

## INVEST Analysis

| Criterion       | Assessment                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Independent** | ⚠️ Depends on RSS Feed Management (US-1) for feed URLs to exist. Can be developed in parallel with mock data. |
| **Negotiable**  | ✅ Fetch frequency, deduplication strategy, and error handling behavior can be discussed.                     |
| **Valuable**    | ✅ Core automation value — eliminates the daily manual work of processing Google Alerts emails.               |
| **Estimable**   | ✅ RSS parsing is well-understood. Scheduling and deduplication are standard patterns.                        |
| **Small**       | ✅ Focused on fetching and storing. No classification or article generation involved.                         |
| **Testable**    | ✅ Can be tested with sample RSS feeds and verified against expected parsed output.                           |

## User Stories

### US-2.1: Automatic periodic feed fetching

**As a** user,
**I want** the system to automatically fetch all RSS feeds periodically,
**so that** new news items are available without manual intervention.

**Acceptance Criteria:**

- [ ] The system fetches all active RSS feeds on a configurable schedule (default: every hour).
- [ ] Each feed is fetched independently; a failure on one feed does not block others.
- [ ] Errors during fetching are logged with the feed label and error details.
- [ ] The last fetch timestamp is updated per feed after each successful fetch.

### US-2.2: Manual feed fetch

**As a** user,
**I want to** manually trigger a fetch of all RSS feeds,
**so that** I can get the latest news items immediately without waiting for the schedule.

**Acceptance Criteria:**

- [ ] The user can click a button to trigger an immediate fetch of all feeds.
- [ ] The UI shows a loading indicator during the fetch.
- [ ] After completion, newly fetched items are visible in the news item list.
- [ ] The UI displays the number of new items found.

### US-2.3: Parse RSS feed items

**As a** user,
**I want** the system to extract title, link, publication date, and source name from each RSS item,
**so that** I have structured data to work with.

**Acceptance Criteria:**

- [ ] The title is extracted from the RSS item.
- [ ] The original article URL is extracted from the RSS item link.
- [ ] The publication date is extracted and stored in a normalized format.
- [ ] The source name (e.g., "NRC", "RTL Nieuws") is extracted from the feed item metadata.
- [ ] Items are stored in the database with a reference to the feed they originated from.

### US-2.4: Deduplicate news items

**As a** user,
**I want** the system to skip duplicate news items,
**so that** I don't see the same article multiple times.

**Acceptance Criteria:**

- [ ] A news item with the same URL as an existing item is not stored again.
- [ ] Deduplication applies across all feeds (the same article found via different search terms is stored once).
- [ ] The system logs when a duplicate is skipped.
