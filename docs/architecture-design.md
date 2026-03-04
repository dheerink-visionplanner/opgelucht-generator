# Smoke-free Generation NL Content Pipeline - Architecture design

This is a 2-tier application in a single NextJS application. The first tier is a SQLite database, the second tier is the NextJS application itself.

## NextJS application

The NextJS application serves as both the frontend and backend for the content pipeline. It handles user interactions, processes RSS feeds, generates articles using AI, and manages the publication process to the Joomla CMS.

NextJS is chosen for its simplicity, performance, and built-in support for server-side rendering, which enhances the user experience. It also is widely used and has a large community, making it easy to find resources and support. This also integrates well with modern AI tools and libraries, facilitating the implementation of AI-driven features in the application.

## SQLite database

We use SQLite as a lightweight database to store RSS feed configurations, news items, user selections, and generated articles. SQLite is easy to set up and requires minimal configuration, making it ideal for this project.

## Drizzle ORM

The database layer is responsible for all interactions with the SQLite database. It handles CRUD operations for RSS feed configurations, news items, user selections, and generated articles. This layer abstracts the database operations from the rest of the application, providing a clean interface for data access.

We've chosen Drizzle ORM for database interactions due to its type safety, ease of use, and compatibility with SQLite. Drizzle ORM allows us to define our database schema using TypeScript, ensuring that our database operations are type-safe and reducing the likelihood of runtime errors.

## Tailwind CSS

Tailwind CSS is used for styling the frontend of the application. It provides a utility-first approach to CSS, allowing for rapid UI development and consistent design across the application. Tailwind's responsive design capabilities ensure that the application looks good on various devices.

## React Hook Form

React Hook Form is used for managing form state and validation in the frontend. It simplifies form handling by providing a simple API for registering form fields, managing form state, and handling validation. This library helps keep the codebase clean and maintainable while ensuring a smooth user experience when interacting with forms.

## Zod validation

Zod is the marriage of TypeScript and runtime validation. It is used to define schemas for data validation both on the frontend and backend. Zod ensures that the data being processed and stored in the database adheres to the expected structure, reducing the risk of errors and inconsistencies. It also integrates well with React Hook Form, allowing for seamless form validation.

## Vitest testing

Vitest is used for unit and integration testing of the application. It provides a fast and efficient testing framework that integrates well with the NextJS ecosystem. Vitest allows us to write tests for our components, database interactions, and business logic, ensuring that the application behaves as expected and reducing the likelihood of bugs.