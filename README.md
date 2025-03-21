# NetGrade

## TODO

- [ ] Implement appInstanceId
- [ ] Improve FormField implementation
- [ ] Implement android release pipeline

## Overview

**NetGrade** is a Progressive Web App (PWA) designed to deliver a native-like experience on web and mobile platforms.

### Technologies Used

| **Technology**  | **Purpose**                                             |
|-----------------|---------------------------------------------------------|
| React 18        | Building user interfaces                                |
| Ionic Framework | UI components for mobile and desktop apps               |
| Capacitor       | Native runtime for web apps on mobile platforms devices |
| Vite            | Fast build tool and development server                  |
| Cypress         | End-to-end testing                                      |
| Jest            | Unit testing framework                                  |
| Prettier        | Code formatting                                         |
| ESLint          | Linting and code quality checks                         |
| TypeORM         | ORM                                                     |
| SQLite          | SQL DB                                                  |
| React-Query     | State Management                                        |

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** (comes with Node.js)
- **Ionic CLI**:

  ```bash
  npm install -g @ionic/cli native-run
  ```

Further please read [Env setup](https://capacitorjs.com/docs/getting-started/environment-setup).

### Installation

1. **Clone the Repository**

2. **Install Dependencies**:

   ```bash
   npm install
   ```

### Running the Application

#### Running in the Browser

To start the application with hot reload in your default browser:

```bash
npm run dev
```

> This command starts a development server with live reloading enabled.

#### Running on a Device or Emulator

**Note**: Before running on a device or emulator, ensure you have the necessary SDKs installed (Xcode for iOS, Android
SDK for Android).

##### Building and Running

For iOS:

```bash
ionic capacitor run ios -l --external
```

For Android:

```bash
ionic capacitor run android -l --external
```

- The `-l` flag enables live reload.
- The `--external` flag allows other devices on your network to access the dev server.

##### Shutting Down iOS Simulators

If you need to stop all running iOS simulators, you can use the following command:

```bash
xcrun simctl shutdown all
```

### ESLint

ESLint helps in identifying and reporting on patterns found in the code. The configuration is in `eslint.config.mjs`.

- **Linting Code**:

  ```bash
  npm run lint
  ```

## Testing

### Unit Tests

Unit tests are written using **Jest**.

- **Running Unit Tests**:

  ```bash
  npm run test
  ```

Test files are typically located alongside the components they test, following the naming convention
`ComponentName.test.tsx`.

### End-to-End Tests

End-to-end tests are conducted using **Cypress**.

- **Running E2E Tests**:

  ```bash
  npm run e2e
  ```

Cypress tests are located in the `cypress/` directory.

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment. The workflow is defined in `.github/workflows/release.yml`.

### Required Secrets

The following secrets need to be configured in the GitHub repository settings:

- **APPLE_DIST_CERT_P12**: Base64-encoded Apple Distribution Certificate (.p12 file)
- **APPLE_DIST_CERT_PASS**: Password for the Apple Distribution Certificate
- **IOS_PROVISION_PROFILE**: Base64-encoded iOS Provisioning Profile
- **APP_STORE_CONNECT_API_KEY_ID**: The key ID from your App Store Connect API key
- **APP_STORE_CONNECT_ISSUER_ID**: The issuer ID from your App Store Connect API key
- **APP_STORE_CONNECT_API_KEY_CONTENT**: The private key content from your App Store Connect API key

## Useful Links

- **Ionic Framework Documentation**: [Ionic Docs](https://ionicframework.com/docs)
- **Capacitor Documentation**:
  - [iOS Platform Guide](https://capacitorjs.com/docs/ios)
  - [Android Platform Guide](https://capacitorjs.com/docs/android)
- **Fastlane Documentation**: [Fastlane Docs](https://docs.fastlane.tools/)
