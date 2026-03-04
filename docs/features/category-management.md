# Feature: Category Management

## Description

The system provides a maintenance screen for managing article categories. Categories determine the structure of the newsletter and the layout of the website. The default categories are: Government, Politics, Science, Education, Short News, Opinion, Smoke Screen, Association, and Press Releases. An administrator can add, edit, and delete categories without developer intervention.

## INVEST Analysis

| Criterion       | Assessment                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| **Independent** | ✅ Fully independent. Can be built and delivered without any other feature being complete.                    |
| **Negotiable**  | ✅ Additional fields per category (description, sort order, icon) and UI layout are negotiable.               |
| **Valuable**    | ✅ Enables proper categorization of articles, which directly impacts newsletter structure and website layout. |
| **Estimable**   | ✅ Simple CRUD screen with a single entity. Very straightforward to estimate.                                 |
| **Small**       | ✅ Minimal scope — one entity, standard CRUD operations.                                                      |
| **Testable**    | ✅ Clear acceptance criteria for all CRUD operations and edge cases.                                          |

## User Stories

### US-6.1: View all categories

**As a** user,
**I want to** see an overview of all configured categories,
**so that** I know which categories are available for article classification.

**Acceptance Criteria:**

- [ ] The category management screen lists all categories.
- [ ] Each category displays its name.
- [ ] Categories are sorted alphabetically or by a configurable sort order.
- [ ] Default categories are pre-seeded in the database on first deployment.

### US-6.2: Add a new category

**As a** user,
**I want to** add a new category,
**so that** new types of articles can be properly classified.

**Acceptance Criteria:**

- [ ] The user can enter a category name.
- [ ] The system validates that the category name is not empty.
- [ ] The system validates that the category name is not a duplicate.
- [ ] Upon saving, the category is stored and appears in the list.

### US-6.3: Edit a category

**As a** user,
**I want to** edit an existing category's name,
**so that** I can correct mistakes or update terminology.

**Acceptance Criteria:**

- [ ] The user can select a category and edit its name.
- [ ] The same validation rules apply as when adding.
- [ ] Existing articles assigned to this category retain their association after the rename.

### US-6.4: Delete a category

**As a** user,
**I want to** delete a category that is no longer needed,
**so that** the category list stays clean and relevant.

**Acceptance Criteria:**

- [ ] The user can select a category and choose to delete it.
- [ ] The system warns if articles are currently assigned to this category.
- [ ] Upon confirmation, the category is removed.
- [ ] Articles previously assigned to the deleted category have their category set to empty/unassigned.
