# The Digital Archivist - AI Librarian Suite

The Digital Archivist is a comprehensive Kanban and Portfolio management tool designed for library and archival teams. It provides a public-facing dashboard for stakeholders to track active and launched projects, and a secure internal dashboard for the team to manage the project lifecycle from intake to completion.

## Features

- **Public Stakeholder Dashboard**: A read-only view of active and launched projects, providing transparency without exposing internal drafts.
- **Internal Kanban Board**: Drag-and-drop interface for managing projects across different stages (Intake, Active, Launched).
- **Priority & Portfolio Views**: High-level overviews of project priorities, risk factors, and preservation scores.
- **Detailed Project Records**: In-depth view of individual projects, including metadata, tags, and a comment thread for team collaboration.
- **Secure Authentication**: Google Workspace / Gmail authentication via Firebase to protect the internal dashboard.
- **Real-time Database**: Powered by Firebase Firestore for seamless, real-time updates across all clients.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React (Icons)
- **Routing**: React Router v6
- **Backend & Auth**: Firebase (Firestore, Authentication, Storage)
- **Deployment**: Google Cloud Run / Firebase Hosting

## Setup Instructions

To run this project locally or deploy it yourself, you will need to set up a Firebase project.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd digital-archivist
```

### 2. Set up Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and follow the prompts to create a new project.
3. Once the project is created, click the **Web** icon (`</>`) to add a web app to your project.
4. Register the app (you don't need to set up Firebase Hosting right now).
5. Copy the `firebaseConfig` object provided.

### 3. Configure Authentication

1. In the Firebase Console, go to **Authentication** (under Build).
2. Click **Get Started**.
3. Go to the **Sign-in method** tab.
4. Enable **Google** as a sign-in provider and save.

### 4. Configure Firestore Database

1. In the Firebase Console, go to **Firestore Database** (under Build).
2. Click **Create database**.
3. Choose a location and start in **Production mode**.
4. Go to the **Rules** tab and paste the contents of the `firestore.rules` file from this repository.
5. Click **Publish**.

### 5. Add Environment Variables

Create a file named `firebase-applet-config.json` in the root of the project and paste your Firebase configuration:

```json
{
  "projectId": "YOUR_PROJECT_ID",
  "appId": "YOUR_APP_ID",
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_AUTH_DOMAIN",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "YOUR_STORAGE_BUCKET",
  "messagingSenderId": "YOUR_MESSAGING_SENDER_ID",
  "measurementId": "YOUR_MEASUREMENT_ID"
}
```

*(Alternatively, you can use `.env` variables if you prefer to configure Vite to use them, but the codebase is currently set up to import from `firebase-applet-config.json`)*

### 6. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Customizing Branding

You can easily customize the software to match your organization's identity colors and naming.

### 1. Update Naming and Text
Open `src/config.ts` and modify the `APP_CONFIG` object to change the application name, organization name, portal name, and hero text:

```typescript
export const APP_CONFIG = {
  appName: "Your App Name",
  orgName: "Your Organization",
  portalName: "Your Portal Name",
  // ... other text fields
};
```

### 2. Update Brand Colors
Open `src/index.css` and modify the CSS variables under the `BRANDING CONFIGURATION` section to match your brand's primary colors:

```css
:root {
  --brand-primary: #002045; /* Main primary color */
  --brand-dark: #1A365D; /* Darker shade for hero backgrounds and dark text */
}
```

## Bootstrapping the First Admin

By default, the Firestore security rules restrict project creation and modification to **Admins**. 

To bootstrap your first admin account:
1. Open `firestore.rules`.
2. Locate the `isAdmin()` function.
3. Change the hardcoded email (`whuggins@law.stanford.edu`) to your Google account email.
4. Deploy the rules to Firestore.
5. Log in to the app using that Google account. You will now have admin privileges and can create projects.

## Project Structure

- `/src/components`: Reusable UI components (Sidebar, Topbar, Modals).
- `/src/views`: Main page views (Kanban, Portfolio, Public Dashboard, Login).
- `/src/lib`: Utility functions and Firebase initialization (`firebase.ts`, `api.ts`).
- `/src/types.ts`: TypeScript interfaces for the data models.
- `firebase-blueprint.json`: A schema definition of the Firestore database structure.
- `firestore.rules`: The security rules for the Firestore database.

## License

SPDX-License-Identifier: Apache-2.0
