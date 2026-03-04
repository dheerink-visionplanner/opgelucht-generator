# Non-Functional Requirements

## Performance

- RSS feed fetching and parsing should complete within a few seconds.
- AI-based article generation may take up to ~30 seconds.
- The UI should feel responsive during normal user interactions (selecting, categorizing, navigating).

## Availability

- The application is used during business hours by a single user.
- High availability (HA) is not required. Simple restart capability is sufficient.
- No SLA required; standard uptime is sufficient.

## Security

- API keys (OpenAI, Joomla) are stored as environment variables, never in source code.
- The application has basic authentication (login) since it has write access to Joomla.
- No personal data is processed; all content is news-related.

## Scalability

- The application processes ~10-15 RSS items per day and ~4-5 articles per week.
- A single server is sufficient. Horizontal scalability is not needed.

## Maintainability

- Clear separation of concerns in the codebase (feed ingestion, categorization, article generation, publishing).
- Administrators can independently manage RSS feeds, categories, and prompts via admin screens without developer intervention.
- Code should be readable and well-structured for future maintenance.

## Usability

- The user interface is in **Dutch**.
- The workflow is linear and intuitive: fetch → select → categorize → generate → publish as draft.
- No complex role or permission system needed (single user).
- Support for modern browsers (Chrome, Firefox, Edge — last 2 versions).

## Deployment

- The application is delivered as Docker container(s) for easy deployment.
- Configuration via environment variables.
- The client provides the hosting environment.

## Data Retention

- Processed news items and generated articles are stored in the database without automatic cleanup.
- No specific retention requirements; data remains available as long as the database is active.
