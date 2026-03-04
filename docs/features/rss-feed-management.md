# Feature: RSS Feed Management

## Description

The system provides a maintenance screen where the user can manage Google Alerts RSS feed URLs. Each feed corresponds to a search term (e.g., "smoking", "vape", "nicotine"). The user can add new feeds by copying the RSS feed URL from Google Alerts, edit existing feeds, and delete feeds that are no longer needed. This replaces the previous workflow where Google Alerts were delivered as email digests to a Gmail inbox.

## INVEST Analysis

| Criterion       | Assessment                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Independent** | ✅ This feature can be built and delivered independently. It is a prerequisite for RSS Feed Fetching but has no upstream dependencies. |
| **Negotiable**  | ✅ The exact UI layout and fields per feed (e.g., label, URL, active/inactive toggle) can be negotiated with the client.               |
| **Valuable**    | ✅ Directly enables the core workflow by providing the input sources for all downstream processing. Without it, nothing else works.    |
| **Estimable**   | ✅ Standard CRUD screen with well-understood scope. Easy to estimate.                                                                  |
| **Small**       | ✅ Limited to CRUD operations on a single entity. Can be completed in one sprint.                                                      |
| **Testable**    | ✅ Clear acceptance criteria around adding, editing, deleting, and validating feed URLs.                                               |

## User Stories

### US-1.1: Add a new RSS feed

**As a** user,
**I want to** add a new RSS feed by entering a URL and a label,
**so that** the system can fetch news items from this Google Alerts feed.

**Acceptance Criteria:**

- [ ] The user can navigate to the RSS feed management screen.
- [ ] The user can enter a feed label (e.g., the search term name like "roken", "vapen").
- [ ] The user can enter a valid RSS feed URL.
- [ ] The system validates that the URL is a well-formed URL.
- [ ] The system validates that the URL is not a duplicate of an existing feed.
- [ ] Upon saving, the feed is stored in the database and appears in the feed list.
- [ ] The UI displays a success confirmation after adding.

### US-1.2: Edit an existing RSS feed

**As a** user,
**I want to** edit the label or URL of an existing RSS feed,
**so that** I can correct mistakes or update feeds when Google Alerts URLs change.

**Acceptance Criteria:**

- [ ] The user can select an existing feed from the list and open it for editing.
- [ ] The user can modify the label and/or URL.
- [ ] The same validation rules apply as when adding a new feed.
- [ ] Upon saving, the updated feed is persisted and the list reflects the changes.

### US-1.3: Delete an RSS feed

**As a** user,
**I want to** delete an RSS feed that is no longer needed,
**so that** the system stops fetching news items from that source.

**Acceptance Criteria:**

- [ ] The user can select an existing feed and choose to delete it.
- [ ] The system asks for confirmation before deleting.
- [ ] Upon confirmation, the feed is removed from the database and disappears from the list.
- [ ] Previously fetched news items from this feed remain in the database (no cascade delete on news items).

### US-1.4: View all RSS feeds

**As a** user,
**I want to** see an overview of all configured RSS feeds,
**so that** I can manage my Google Alerts sources at a glance.

**Acceptance Criteria:**

- [ ] The feed list displays each feed's label, URL, and last fetch timestamp.
- [ ] The list is sorted alphabetically by label.
- [ ] An empty state message is shown when no feeds are configured.
