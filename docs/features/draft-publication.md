# Feature: Draft Publication to Joomla CMS

## Description

The system publishes the reviewed article as a draft to the Joomla CMS via its REST API. The draft includes the article content (title, intro, body, sources), category, and classification. The automation stops at draft creation — further editing, adding images, and final publication happen within Joomla. This is the final step in the automated workflow.

## INVEST Analysis

| Criterion       | Assessment                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Independent** | ⚠️ Depends on Article Preview & Editing (US-9) for finalized article content. Requires Joomla API access.     |
| **Negotiable**  | ✅ The Joomla field mapping, draft status behavior, and error handling are negotiable.                        |
| **Valuable**    | ✅ Completes the automated pipeline — without this, the user would need to manually copy content into Joomla. |
| **Estimable**   | ✅ Joomla REST API is well-documented. Integration scope is clear.                                            |
| **Small**       | ✅ Focused on a single API call to create a draft article in Joomla.                                          |
| **Testable**    | ✅ Can be tested against a Joomla test instance or with mocked API responses.                                 |

## User Stories

### US-10.1: Publish article as draft to Joomla

**As a** user,
**I want to** publish the finalized article as a draft in Joomla,
**so that** I can continue with image selection and final publication in the CMS.

**Acceptance Criteria:**

- [ ] A "Publish as Draft" button is available on the article preview screen.
- [ ] The system sends the article to Joomla via its REST API with status "unpublished" (draft).
- [ ] The article content includes: title, intro text, body (narrative + sources list).
- [ ] The article is assigned to the correct Joomla category based on the selected category.
- [ ] The UI confirms successful publication with a link to the draft in Joomla.
- [ ] If publication fails, the error is displayed to the user and the article is not lost.

### US-10.2: Map categories to Joomla

**As a** user,
**I want** the system to map application categories to Joomla categories,
**so that** articles are placed in the correct section of the website.

**Acceptance Criteria:**

- [ ] Each application category can be mapped to a Joomla category ID.
- [ ] The mapping is configurable in a settings screen.
- [ ] If no mapping exists for a category, the user is warned before publishing.
- [ ] The Domestic/International classification is also mapped to the appropriate Joomla field or category structure.

### US-10.3: Configure Joomla connection

**As a** user,
**I want to** configure the Joomla API connection settings,
**so that** the system can connect to our Joomla instance.

**Acceptance Criteria:**

- [ ] A settings screen allows configuration of: Joomla base URL, API key/token.
- [ ] The API key is stored securely (as an environment variable or encrypted in the database).
- [ ] A "Test Connection" button verifies the Joomla API is reachable and authentication works.
- [ ] Connection errors display a meaningful error message.

### US-10.4: Track publication status

**As a** user,
**I want** the system to track which articles have been published to Joomla,
**so that** I know which items have been processed.

**Acceptance Criteria:**

- [ ] After successful publication, the article's status is updated to "published to Joomla."
- [ ] Published articles are no longer shown in the active workflow.
- [ ] A history/archive view shows all published articles with their publication date and Joomla link.
- [ ] The user can see how many articles are in each stage of the workflow (selected, generated, published).
