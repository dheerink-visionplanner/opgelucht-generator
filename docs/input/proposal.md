# Proposal: Opgelucht Generator Application

## Overview

This proposal outlines the setup for a new application to automate the processing of Google Alerts for Smokeless Generation NL, based on the requirements in the assignment and the provided UI mockups. The goal is to streamline the workflow from ingesting news sources to generating draft articles for publication in Joomla.

---

## Solution Architecture

### 1. RSS Feed Ingestion

- Convert Google Alerts to RSS feeds.
- Provide a maintenance screen for managing RSS feed URLs.
- Periodically fetch and parse RSS feeds to extract news items (title, link, date, source).

### 2. News Item Processing

- Display all fetched news items in a review screen (see mockups 01.png, 02.png).
- Allow user selection of relevant news items for further processing.
- Attempt to resolve paywalled articles using archive services (archive.ph, 1ft.io, 12ft.io, web.archive.org). Store both original and archive links.

### 3. Categorization & Classification

- Automatically categorize selected news items (Domestic/International, plus subcategories: Government, Politics, Science, etc.).
- Provide a simple maintenance screen for category management (see mockup 03.png).
- Classification into Domestic/International is fixed and does not require user maintenance.

### 4. Article Generation

- Use a configurable prompt (see assignment) to generate articles from selected news items.
- Display generated article in a preview/edit screen (see mockup 04.png).
- Allow manual review and editing before publication.

### 5. Publishing Workflow

- Integrate with Joomla CMS to create draft articles.
- Stop automation at draft creation; manual edits and publication are handled in Joomla.

---

## Technology Stack

- **Backend:** Python (FastAPI or Django) or Node.js (Express)
- **Frontend:** React (with Material UI) or Vue.js
- **Database:** PostgreSQL or MySQL
- **RSS Parsing:** Feedparser (Python) or rss-parser (Node.js)
- **AI Integration:** OpenAI API for article generation
- **Joomla Integration:** REST API or direct database access

---

## Key Features (per Mockups)

- **01.png:** RSS feed management screen (add/edit/delete feeds)
- **02.png:** News item review and selection screen
- **03.png:** Category management screen
- **04.png:** Article generation and preview/edit screen
- **05.png:** Publishing status and history screen

---

## Development Phases

1. **Setup project structure and core services**
2. **Implement RSS feed ingestion and management UI**
3. **Build news item review and selection workflow**
4. **Integrate archive link resolution for paywalled articles**
5. **Develop categorization/classification logic and UI**
6. **Integrate AI-based article generation and prompt management**
7. **Connect to Joomla for draft article creation**
8. **Testing, documentation, and deployment**

---

## Hosting & Deployment

- Deploy on client-provided hosting environment (Linux/Windows server or cloud platform)
- Use Docker for containerization and easy deployment
- Secure access to Gmail/RSS feeds and Joomla

---

## Maintenance & Support

- Provide admin screens for feed and category management
- Allow prompt updates for article generation
- Offer ongoing support and maintenance as a separate proposal

---

## Next Steps

- Review and approve proposal
- Finalize technology choices
- Begin development with milestone-based delivery

---

_Prepared for Smokeless Generation NL_
