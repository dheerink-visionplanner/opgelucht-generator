# Functional Requirements

## Overview

The Opgelucht Generator automates the workflow of transforming Google Alerts RSS feeds into publishable news articles for the Opgelucht.nl Joomla website. The application follows a linear pipeline:

**Fetch → Review → Group → Classify → Generate → Edit → Publish as Draft**

This document provides an overview of all functional requirements. Each feature has a detailed specification in the `docs/features/` folder, including an INVEST analysis, user stories, and acceptance criteria.

## Workflow Diagram

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│  1. RSS Feed        │     │  2. RSS Feed        │     │  3. News Item       │
│     Management      │────▶│     Fetching        │────▶│     Review          │
│                     │     │                     │     │                     │
│  Configure feeds    │     │  Fetch & parse      │     │  Browse, filter,    │
│                     │     │  Deduplicate        │     │  select items       │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
                                                                  │
                            ┌─────────────────────┐               │
                            │  5. Paywall         │               ▼
                            │     Resolution      │     ┌─────────────────────┐
                            │                     │     │  4. Topic           │
                            │  Archive services   │◀───▶│     Grouping        │
                            │                     │     │                     │
                            └─────────────────────┘     │  Cluster related    │
                                                        │  items              │
┌─────────────────────┐                                 └─────────────────────┘
│  6. Category        │                                           │
│     Management      │                                           ▼
│                     │     ┌─────────────────────┐     ┌─────────────────────┐
│  Configure          │────▶│  7. Automatic       │     │  8. Article         │
│  categories         │     │     Classification  │────▶│     Generation      │
└─────────────────────┘     │                     │     │                     │
                            │  Domestic/Intl +    │     │  AI-based article   │
                            │  category           │     │  creation           │
                            └─────────────────────┘     └─────────────────────┘
                                                                  │
                                                                  ▼
                            ┌─────────────────────┐     ┌─────────────────────┐
                            │ 10. Draft           │     │  9. Article         │
                            │     Publication     │◀────│     Preview &       │
                            │                     │     │     Editing         │
                            │  Publish to Joomla  │     │                     │
                            │  as draft           │     │  Review & adjust    │
                            └─────────────────────┘     └─────────────────────┘
```

## Feature Summary

| #   | Feature                                   | Stories | Detail                                                              |
| --- | ----------------------------------------- | ------- | ------------------------------------------------------------------- |
| 1   | RSS Feed Management                       | 4       | [rss-feed-management.md](features/rss-feed-management.md)           |
| 2   | Automated RSS Feed Fetching & Parsing     | 4       | [rss-feed-fetching.md](features/rss-feed-fetching.md)               |
| 3   | News Item Review & Selection              | 5       | [news-item-review.md](features/news-item-review.md)                 |
| 4   | Topic Grouping                            | 4       | [topic-grouping.md](features/topic-grouping.md)                     |
| 5   | Paywall Resolution                        | 3       | [paywall-resolution.md](features/paywall-resolution.md)             |
| 6   | Category Management                       | 4       | [category-management.md](features/category-management.md)           |
| 7   | Automatic Classification & Categorization | 4       | [automatic-classification.md](features/automatic-classification.md) |
| 8   | AI-Based Article Generation               | 4       | [article-generation.md](features/article-generation.md)             |
| 9   | Article Preview & Editing                 | 6       | [article-preview-editing.md](features/article-preview-editing.md)   |
| 10  | Draft Publication to Joomla CMS           | 4       | [draft-publication.md](features/draft-publication.md)               |

**Total: 42 user stories**

## Feature Descriptions

### 1. RSS Feed Management

Maintenance screen for managing Google Alerts RSS feed URLs. Each feed corresponds to a search term (e.g., "roken", "vapen", "nicotine"). The user can add, edit, and delete feeds.

**User Stories:** US-1.1 Add feed · US-1.2 Edit feed · US-1.3 Delete feed · US-1.4 View all feeds

---

### 2. Automated RSS Feed Fetching & Parsing

Periodic and manual fetching of all configured RSS feeds. Extracts title, link, publication date, and source name. Deduplicates items across feeds.

**User Stories:** US-2.1 Automatic periodic fetch · US-2.2 Manual fetch · US-2.3 Parse items · US-2.4 Deduplicate

---

### 3. News Item Review & Selection

Review screen displaying all fetched news items. The user browses, filters, and selects the relevant 10–20% of items for further processing. Irrelevant items are dismissed.

**User Stories:** US-3.1 View unprocessed items · US-3.2 Select items · US-3.3 Dismiss items · US-3.4 Filter items · US-3.5 Preview original article

---

### 4. Topic Grouping

Automatically groups news items covering the same topic into clusters. The user can manually merge or split groups before generating articles.

**User Stories:** US-4.1 Automatic grouping · US-4.2 Merge groups · US-4.3 Split groups · US-4.4 View grouped items

---

### 5. Paywall Resolution

Detects paywalled articles and attempts to retrieve content via archive services (archive.ph, 1ft.io, 12ft.io, web.archive.org). Stores both original and accessible links.

**User Stories:** US-5.1 Detect paywall · US-5.2 Resolve via archive services · US-5.3 Store both links

---

### 6. Category Management

Maintenance screen for managing article categories (Government, Politics, Science, Education, Short News, Opinion, Smoke Screen, Association, Press Releases).

**User Stories:** US-6.1 View categories · US-6.2 Add category · US-6.3 Edit category · US-6.4 Delete category

---

### 7. Automatic Classification & Categorization

AI-based classification of news items as Domestic (Binnenland) or International (Buitenland) and automatic category assignment. The user can override all suggestions.

**User Stories:** US-7.1 Domestic/international classification · US-7.2 Category assignment · US-7.3 Override · US-7.4 Batch classification

---

### 8. AI-Based Article Generation

Generates a complete article from a topic group: title (max 36 chars), intro (max 175 chars), narrative body in HTML, and formatted sources list. Searches for additional related articles to enrich sources.

**User Stories:** US-8.1 Generate article · US-8.2 Generate sources list · US-8.3 Search additional articles · US-8.4 Configurable prompt

---

### 9. Article Preview & Editing

Preview and edit screen for reviewing AI-generated articles. The user can adjust title, intro, body, sources, category, and classification before publishing. Includes a regenerate option.

**User Stories:** US-9.1 Preview article · US-9.2 Edit title · US-9.3 Edit intro · US-9.4 Edit body · US-9.5 Edit sources · US-9.6 Regenerate

---

### 10. Draft Publication to Joomla CMS

Publishes the finalized article as a draft to Joomla via its REST API. Includes category mapping and connection configuration. Tracks publication status.

**User Stories:** US-10.1 Publish draft · US-10.2 Map categories · US-10.3 Configure connection · US-10.4 Track status

## Dependencies

```
Feature 1 (RSS Feed Management)
  └──▶ Feature 2 (RSS Feed Fetching)
         └──▶ Feature 3 (News Item Review)
                └──▶ Feature 4 (Topic Grouping)
                       ├──▶ Feature 5 (Paywall Resolution)
                       └──▶ Feature 7 (Automatic Classification) ◀── Feature 6 (Category Management)
                              └──▶ Feature 8 (Article Generation)
                                     └──▶ Feature 9 (Article Preview & Editing)
                                            └──▶ Feature 10 (Draft Publication)
```

Features **1** (RSS Feed Management) and **6** (Category Management) are fully independent and can be developed first. Feature **5** (Paywall Resolution) is a standalone service that can be developed in parallel and integrated later.
