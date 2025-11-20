# Service Tests

This directory contains tests for the services in the application. The tests use Vitest as the test runner and SQL.js as
the database.

## Test Files

- `SchoolService.test.ts`: Tests for the SchoolService.
- `SubjectService.test.ts`: Tests for the SubjectService.
- `ExamService.test.ts`: Tests for the ExamService.
- `GradeService.test.ts`: Tests for the GradeService.

## Running the Tests

To run the tests, use the following command:

```bash
npm test
```

This will run all the tests in the project. To run a specific test file, use:

```bash
npm test -- src/tests/SchoolService.test.ts
```

## Test Database

The tests use SQL.js as the database, which is an in-memory SQL database. This allows the tests to run quickly and
without affecting any external databases.


1. Initialize the test database
2. Seed the database with test data
3. Clean up the database after tests

Each test file uses these helper functions to set up the database before running tests and clean up after tests.

## Test Data

The test data includes:

- A school
- A subject belonging to the school
- An exam belonging to the subject
- A grade for the exam


## Mocking

The tests mock the `getRepositories` function from `@/db/data-source` to use the test repositories instead of the real
ones. This allows the tests to run without affecting the real database.

## Test Structure

Each test file follows a similar structure:

1. Set up the test database and seed it with test data
2. Test each method of the service
3. Clean up the test database

The tests verify that each method of the service works correctly by checking the return values and verifying that the
database was updated correctly.
