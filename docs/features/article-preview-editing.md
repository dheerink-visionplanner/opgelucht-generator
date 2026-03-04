# Feature: Article Preview & Editing

## Description

The system displays the generated article in a preview/edit screen where the user can review and manually adjust all components before publishing. The user can edit the title, intro text, body text, sources list, category, and classification. This is the final quality gate before the article is sent to Joomla as a draft. The preview renders the article as it will appear on the website.

## INVEST Analysis

| Criterion       | Assessment                                                                                                             |
| --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Independent** | ⚠️ Depends on Article Generation (US-8) for generated content. Can be developed with mock article data.                |
| **Negotiable**  | ✅ The editing capabilities (rich text vs. raw HTML, inline vs. modal editing) are negotiable.                         |
| **Valuable**    | ✅ Essential for quality control — the user must be able to verify and correct AI-generated content before publishing. |
| **Estimable**   | ✅ Standard form/preview UI with HTML rendering. Well-understood complexity.                                           |
| **Small**       | ✅ Focused on display and editing. No generation or publishing logic.                                                  |
| **Testable**    | ✅ Clear criteria around rendering, editing, and data persistence.                                                     |

## User Stories

### US-9.1: Preview generated article

**As a** user,
**I want to** see a rendered preview of the generated article,
**so that** I can assess the quality and correctness before publishing.

**Acceptance Criteria:**

- [ ] The preview screen displays the article title, intro text, body (narrative), and sources list.
- [ ] The HTML content is rendered (not shown as raw HTML).
- [ ] The classification (Domestic/International) and category are displayed.
- [ ] The preview visually approximates the website layout.

### US-9.2: Edit article title

**As a** user,
**I want to** edit the generated title,
**so that** I can improve or correct it.

**Acceptance Criteria:**

- [ ] The title is displayed in an editable text field.
- [ ] A character counter shows the current length and maximum (36 characters).
- [ ] The user is warned (not blocked) if the title exceeds 36 characters.
- [ ] Changes are reflected in the preview in real time.

### US-9.3: Edit article intro text

**As a** user,
**I want to** edit the generated intro text,
**so that** I can refine the summary.

**Acceptance Criteria:**

- [ ] The intro text is displayed in an editable text area.
- [ ] A character counter shows the current length and maximum (175 characters).
- [ ] The user is warned (not blocked) if the intro exceeds 175 characters.
- [ ] Changes are reflected in the preview in real time.

### US-9.4: Edit article body

**As a** user,
**I want to** edit the generated narrative body,
**so that** I can correct factual errors, adjust tone, or add information.

**Acceptance Criteria:**

- [ ] The body is editable via a rich text editor (WYSIWYG) or raw HTML editor.
- [ ] The user can switch between visual and HTML editing modes.
- [ ] Changes are reflected in the preview.
- [ ] Standard formatting options are available (bold, italic, links, paragraphs).

### US-9.5: Edit sources list

**As a** user,
**I want to** edit the sources list (add, remove, reorder sources),
**so that** I can ensure the sources are accurate and complete.

**Acceptance Criteria:**

- [ ] The user can remove individual sources from the list.
- [ ] The user can add a new source by entering source name, title, URL, and publication date.
- [ ] The user can reorder sources.
- [ ] Changes to the sources list are reflected in the preview.

### US-9.6: Regenerate article

**As a** user,
**I want to** regenerate the article if the initial output is unsatisfactory,
**so that** I can get a fresh version without starting over from scratch.

**Acceptance Criteria:**

- [ ] A "Regenerate" button triggers a new AI generation for the same topic group.
- [ ] The user is warned that the current edits will be lost.
- [ ] The new generation replaces the current article in the preview.
- [ ] The sources list and classification are preserved unless the user chooses to reset them.
