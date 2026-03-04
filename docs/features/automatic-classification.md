# Feature: Automatic Classification & Categorization

## Description

The system automatically classifies selected news items as **Domestic** (Binnenland) or **International** (Buitenland) and assigns a category from the managed category list. The classification uses AI to analyze the article content and metadata. The user can override both the classification and category before article generation. The Domestic/International classification is fixed and does not have a maintenance screen.

## INVEST Analysis

| Criterion       | Assessment                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------- |
| **Independent** | ⚠️ Depends on Category Management (US-6) for the category list and News Item Review (US-3) for selected items. |
| **Negotiable**  | ✅ The AI model, classification confidence threshold, and override UX are all negotiable.                      |
| **Valuable**    | ✅ Saves significant manual effort in categorizing articles and ensures consistent classification.             |
| **Estimable**   | ⚠️ AI classification accuracy may require prompt tuning, but the integration scope is estimable.               |
| **Small**       | ✅ Focused on two classification tasks (domestic/international + category). No article generation.             |
| **Testable**    | ✅ Can be tested with sample articles and expected classification outcomes.                                    |

## User Stories

### US-7.1: Automatic domestic/international classification

**As a** user,
**I want** the system to automatically classify a news item as Domestic or International,
**so that** I don't have to manually determine this for every article.

**Acceptance Criteria:**

- [ ] The system analyzes the article content, title, and source to determine if the article is about a domestic (Dutch) or international topic.
- [ ] The classification is stored with the news item.
- [ ] The classification is displayed in the UI alongside the news item.
- [ ] The system achieves a reasonable accuracy (>85%) on domestic/international classification.

### US-7.2: Automatic category assignment

**As a** user,
**I want** the system to automatically suggest a category for a news item,
**so that** I can quickly confirm or adjust the categorization.

**Acceptance Criteria:**

- [ ] The system analyzes the article content and suggests one category from the managed category list.
- [ ] The suggested category is displayed in the UI as a pre-selected value.
- [ ] If the system has low confidence, it may suggest "Uncategorized" or leave the field empty.
- [ ] The classification uses the current list of categories from the database.

### US-7.3: Override classification and category

**As a** user,
**I want to** manually override the automatic classification and category,
**so that** I can correct any misclassifications.

**Acceptance Criteria:**

- [ ] The user can change the Domestic/International classification via a toggle or dropdown.
- [ ] The user can change the category via a dropdown populated with all available categories.
- [ ] Changes are saved immediately or upon clicking a save button.
- [ ] The override is persisted and used in subsequent article generation.

### US-7.4: Batch classification

**As a** user,
**I want** the system to classify all selected news items at once,
**so that** I don't have to wait for each item to be classified individually.

**Acceptance Criteria:**

- [ ] When multiple items are selected for processing, all are classified in a single operation.
- [ ] The UI shows progress during batch classification.
- [ ] Individual overrides can still be made after batch classification.
