---
applyTo: "**/*.{js,jsx,ts,tsx,json,md}"
---

# Project Overview

This project is a mobile application that allows users to manage their grades and upcoming exams. It is built using React and Node.js, and uses MongoDB for data storage.

## Folder Structure

- `/src`: Contains the source code for the frontend.
  - `/components`: Reusable React components.
  - `/pages`: Page-level React components.
  - `/styles`: Tailwind and custom CSS files.
  - `/assets`: Images, icons, and other static assets.
  - `/utils`: Utility functions and helpers.
  - `/hooks`: Custom React hooks.
  - `/context`: React context providers.
  - `/App.js`: Main application entry point.
  - `/index.js`: React DOM entry point.

- `/server`: Contains the source code for the Node.js backend.
  - `/models`: Mongoose models for MongoDB.
  - `/routes`: Express route handlers.
  - `/controllers`: Business logic for API endpoints.
  - `/middleware`: Express middleware functions.
  - `/config`: Configuration files (e.g., database, environment).
  - `/utils`: Backend utility functions.
  - `/app.js`: Express app entry point.
  - `/server.js`: Server startup script.

- `/docs`: Contains documentation for the project, including API specifications and user guides.
  - `/api`: API documentation.
  - `/user-guides`: End-user guides and onboarding.
  - `/architecture`: System architecture and design docs.
  - `/README.md`: Project overview and setup instructions.

- `/public`: Static files served by the frontend (e.g., index.html, favicon).

- `/tests`: Unit and integration tests for frontend and backend.

- `/config`: Shared configuration files (e.g., environment variables).

- `/scripts`: Utility scripts for development and deployment.

- `/node_modules`: Project dependencies (auto-generated).

- `.env`: Environment variable definitions.

- `.gitignore`: Git ignore rules.

- `package.json`: Project metadata and dependencies (frontend and backend).

- `README.md`: Main project overview and instructions.

## Libraries and Frameworks

- React and Tailwind CSS for the frontend.
- Node.js and Express for the backend.
- MongoDB for data storage.

## Coding Standards

- Use semicolons at the end of each statement.
- Use single quotes for strings.
- Use function based components in React.
- Use arrow functions for callbacks.

## UI guidelines

- A toggle is provided to switch between light and dark mode.
- Application should have a modern and clean design.