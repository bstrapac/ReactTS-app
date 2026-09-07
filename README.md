# Productive Time Tracker

A React and TypeScript time-tracking client for Productive.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```env
REACT_APP_API_URL=/api/v2
REACT_APP_API_TOKEN=your-productive-api-token
REACT_APP_ORGANIZATION_ID=your-organization-id
```

`.env.local` is ignored by Git. Do not commit API tokens or other credentials.

During development, the Create React App proxy forwards `/api/v2` requests to `https://api.productive.io`. Restart the development server after changing environment variables.

## Available Services

Service modules are in `src/services`.

### `userService`

- `getOrganizationMemberProfile(client, membership)` resolves the user and matching person.
- `userDisplayName(user)` returns the user's first and last name, with email as a fallback.
- `personDisplayName(person)` returns the person's first and last name, with email or ID as a fallback.

### `timeEntryService`

- `listTimeEntries(client, personId)` loads all time entries for one person.
- `createTimeEntry(client, body)` creates a time entry.
- `updateTimeEntry(client, id, body)` updates a time entry.
- `deleteTimeEntry(client, id)` permanently deletes a time entry.

### `resourceService`

- `listPeople(client)` loads all people.
- `listServices(client)` loads all services.
- `toResourceOption(resource)` converts an API resource into a dropdown option with an ID and display name.

The people list remains unfiltered so a time entry can be assigned to another person. Existing time entries are filtered by the logged-in person's ID.

## API Client

The low-level client is in `src/api/client.ts`. It handles request URLs, authentication headers, JSON:API parsing, errors, and pagination.

### Organization and user methods

- `getOrganization(id)`
- `getOrganizationMemberships(organizationId)`
- `getOrganizationMembership(id)`
- `getUser(id)`
- `getPerson(id)`
- `getUsers()`
- `getPeople()`

### Time-entry methods

- `listTimeEntries(filters)` supports `personId`, `after`, `before`, `pageNumber`, and `pageSize`.
- `listAllTimeEntries(filters)` loads every time-entry page.
- `createTimeEntry(body)` sends `POST /time_entries`.
- `updateTimeEntry(id, body)` sends `PATCH /time_entries/{id}`.
- `deleteTimeEntry(id)` sends `DELETE /time_entries/{id}` and expects `204 No Content`.

### Generic methods

- `request(path, options)` performs an authenticated request.
- `get(path, options)` performs a `GET` request.
- `getAll(resource, options)` performs a collection request helper.
- `listAll(resource, options)` retrieves every page of a generic resource.
- `post(path, body, options)` performs a `POST` request.
- `patch(path, body, options)` performs a `PATCH` request.
- `delete(path, options)` performs a `DELETE` request.

## Project Structure

```text
src/
  api/          Low-level Productive API client
  components/   Login, dashboard, forms, and lists
  context/      Session state and authenticated client
  services/     Login, user, time-entry, and resource workflows
  styles/       Shared, login, and dashboard CSS
  tests/        Application and API tests
  types/        Domain and UI TypeScript types
  utils/        Time-entry mapping and date/time helpers
```

## Commands

Start the development server:

```bash
npm start
```

Run all tests:

```bash
npm test -- --watchAll=false --runInBand
```

Run the API client tests only:

```bash
npm test -- --watchAll=false --runInBand src/tests/client.test.ts
```

Create a production build:

```bash
npm run build
```
