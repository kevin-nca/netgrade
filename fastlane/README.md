# Fastlane Configuration

This directory contains the configuration files for [fastlane](https://fastlane.tools/), a tool for automating the build and release process for iOS and Android apps.

## Appfile

The `Appfile` contains sensitive information such as your Apple ID, app identifier, and team ID. To keep this information private, the `Appfile` has been configured to use environment variables and has been added to `.gitignore` to prevent it from being committed to the repository.

### Setting up the Appfile

1. Copy the `Appfile.example` file to `Appfile`:
   ```bash
   cp Appfile.example Appfile
   ```

2. For local development, you can modify the `Appfile` to use your actual values:
   ```ruby
   apple_id "your-apple-id@example.com"
   app_identifier "com.yourcompany.app"
   team_id "ABCDE12345"
   ```

3. For CI/CD, the values are set as GitHub secrets and accessed via environment variables in the GitHub Actions workflow.

## GitHub Secrets

The following secrets need to be set in your GitHub repository settings:

- `APPLE_ID`: Your Apple ID used for App Store submissions
- `APP_IDENTIFIER`: Your app's bundle identifier
- `TEAM_ID`: Your Apple Developer Team ID
- `APP_STORE_CONNECT_API_KEY_ID`: Your App Store Connect API Key ID
- `APP_STORE_CONNECT_ISSUER_ID`: Your App Store Connect Issuer ID
- `APP_STORE_CONNECT_API_KEY_CONTENT`: Your App Store Connect API Key Content
- `APPLE_DIST_CERT_P12`: Your Apple Distribution Certificate (base64 encoded)
- `APPLE_DIST_CERT_PASS`: The password for your Apple Distribution Certificate
- `IOS_PROVISION_PROFILE`: Your iOS Provisioning Profile (base64 encoded)

### Setting up GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click on "New repository secret"
4. Add each of the secrets listed above with their respective values

## Release Pipeline

The release pipeline is configured in the GitHub Actions workflow file at `.github/workflows/release.yml`. It is triggered when a new release is published in GitHub.

The workflow:
1. Checks out the code
2. Sets up Ruby
3. Installs dependencies
4. Extracts the version from the release tag
5. Imports the certificate and provisioning profile
6. Builds and uploads the app to TestFlight

For more information about fastlane, see the [fastlane documentation](https://docs.fastlane.tools/).
