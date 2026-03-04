# Feature: AI-Based Article Generation

## Description

The system generates a complete news article from selected (grouped) news items using the standard pattern defined by the organization. The generated article includes: a title (max 36 characters), an intro text (max 175 characters), a detailed narrative summary in HTML, and a formatted HTML sources list sorted by publication date. The generation uses an AI model with a configurable prompt. The system also searches for additional articles on the same topic published in the past month to enrich the sources.

## INVEST Analysis

| Criterion       | Assessment                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Independent** | ⚠️ Depends on Topic Grouping (US-4) for grouped items and Paywall Resolution (US-5) for article content access.  |
| **Negotiable**  | ✅ The prompt, output format, max lengths, and additional search behavior are all negotiable and configurable.   |
| **Valuable**    | ✅ Highest-value feature — this is the core automation that transforms raw news items into publishable articles. |
| **Estimable**   | ⚠️ AI output quality may require iterative prompt refinement, but the integration scope is clear.                |
| **Small**       | ⚠️ This is the most complex feature. May need to be split into sub-features (generation vs. search enrichment).  |
| **Testable**    | ✅ Output structure can be validated. Content quality requires human review but format is testable.              |

## User Stories

### US-8.1: Generate article from grouped news items

**As a** user,
**I want** the system to generate a complete news article from a topic group,
**so that** I get a draft article ready for review.

**Acceptance Criteria:**

- [ ] The system reads the content of all articles in the topic group.
- [ ] The system generates a title summarizing the main topic (max 36 characters).
- [ ] The system generates an intro text (max 175 characters).
- [ ] The system generates a detailed narrative summary in HTML format.
- [ ] The generated summary is a fluent, cohesive narrative (not a list of article summaries).
- [ ] Generation completes within ~30 seconds.

### US-8.2: Generate formatted sources list

**As a** user,
**I want** the generated article to include a properly formatted sources list,
**so that** readers can access the original articles.

**Acceptance Criteria:**

- [ ] The sources list begins with `<p><strong>Bronnen</strong></p>`.
- [ ] The list is an HTML unordered list (`<ul>`).
- [ ] Each line shows: source name — em dash (—) — article title.
- [ ] Each line is a clickable HTML link (`<a href="..." target="_blank">`).
- [ ] The list is sorted by publication date, most recent first.
- [ ] Items with unknown publication dates are placed at the bottom.
- [ ] For paywalled articles, both the original and archive links are included.

### US-8.3: Search for additional related articles

**As a** user,
**I want** the system to search for additional articles on the same topic from the past month,
**so that** the generated article has a comprehensive sources list.

**Acceptance Criteria:**

- [ ] The system performs a web search based on the topic of the grouped items.
- [ ] The search scope is limited to articles published in the past month.
- [ ] Found additional articles are added to the sources list.
- [ ] The user can see which sources were found automatically vs. provided by the original group.
- [ ] The user can remove automatically found sources before final generation.

### US-8.4: Configurable generation prompt

**As a** user,
**I want** to update the AI prompt used for article generation via a settings screen,
**so that** I can refine the output quality without developer intervention.

**Acceptance Criteria:**

- [ ] A settings screen displays the current prompt text.
- [ ] The user can edit and save the prompt.
- [ ] The updated prompt is used for all subsequent article generations.
- [ ] A "reset to default" option restores the original prompt.
- [ ] The prompt supports placeholder variables for dynamic content (e.g., `{sources}`, `{articles}`).
