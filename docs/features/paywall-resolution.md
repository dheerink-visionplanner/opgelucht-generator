# Feature: Paywall Resolution

## Description

When a news item is behind a paywall, the system attempts to retrieve the article content via archive services (archive.ph, 1ft.io, 12ft.io, web.archive.org). If a non-paywalled version is found, both the original paywalled link and the accessible archive link are stored with the news item. This ensures that article content can be read for summarization and that sources in the generated article include accessible links.

## INVEST Analysis

| Criterion       | Assessment                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Independent** | ✅ Can be built as a standalone service/module and integrated into the fetching or article generation pipeline.                                    |
| **Negotiable**  | ✅ The order of archive services to try, timeout behavior, and when to trigger resolution (fetch time vs. article generation time) are negotiable. |
| **Valuable**    | ✅ Important for content quality — paywalled articles can't be summarized without this, and readers need accessible links.                         |
| **Estimable**   | ⚠️ Some uncertainty around reliability of archive services, but the scope is clear.                                                                |
| **Small**       | ✅ Focused on URL resolution and link storage. No UI complexity.                                                                                   |
| **Testable**    | ✅ Can be tested with known paywalled URLs and expected archive service responses.                                                                 |

## User Stories

### US-5.1: Detect paywalled articles

**As a** user,
**I want** the system to detect when a news article is behind a paywall,
**so that** an alternative source can be sought automatically.

**Acceptance Criteria:**

- [ ] The system attempts to access the article URL during content retrieval.
- [ ] If the content is inaccessible (paywall detected via HTTP status, content patterns, or known paywall domains), the item is flagged as paywalled.
- [ ] The paywall status is visible in the news item list.

### US-5.2: Resolve paywall via archive services

**As a** user,
**I want** the system to attempt to find a non-paywalled version of the article via archive services,
**so that** the article content can be read and summarized.

**Acceptance Criteria:**

- [ ] The system tries the following services in order: archive.ph, 1ft.io, 12ft.io, web.archive.org.
- [ ] The system stops at the first service that returns accessible content.
- [ ] If no service can resolve the paywall, the item is marked as "paywall unresolved."
- [ ] Each resolution attempt has a configurable timeout (default: 10 seconds per service).

### US-5.3: Store both paywalled and accessible links

**As a** user,
**I want** the system to store both the original paywalled link and the archive link,
**so that** both can be included in the generated article's sources list.

**Acceptance Criteria:**

- [ ] The original article URL is always preserved.
- [ ] The resolved archive URL is stored alongside the original URL.
- [ ] When generating the article sources list, both links are included for paywalled articles.
- [ ] The user can see both links in the news item detail view.
