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


## API Guidelines
- Use RESTful conventions
- Use proper HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Use consistent naming for endpoints (`/api/v1/grades`, `/api/v1/exams`)
- Always return consistent response format:
  ```json
  {
    "success": true,
    "data": {},
    "message": "Success message",
    "error": null
  }
  ```
- Use proper status codes (200, 201, 400, 401, 404, 500)
- Implement proper error handling and logging

## Development Workflow
- Use feature branches and pull requests
- Write clear commit messages (Conventional Commits)
- Run tests before committing
- Use semantic versioning
- Keep dependencies up to date
- Document breaking changes in CHANGELOG.md

## Mobile-Specific Guidelines
- Design for various screen sizes (phones, tablets)
- Optimize for touch interactions (minimum 44px touch targets)
- Handle offline scenarios gracefully
- Use platform-specific UI patterns when appropriate
- Optimize performance for mobile devices
- Handle device orientation changes


## Performance Guidelines
- Optimize images and assets
- Use lazy loading for screens/components
- Implement proper caching strategies
- Use React.memo for expensive components
- Optimize MongoDB queries with proper indexes
- Use pagination for large data sets

## UI/UX Guidelines
- Support both light and dark mode themes
- Use consistent spacing and typography
- Follow mobile-first responsive design
- Implement proper loading states and error handling
- Use accessibility best practices (semantic HTML, ARIA labels)
- Consistent color scheme and component library
- Smooth animations and transitions (keep under 300ms)