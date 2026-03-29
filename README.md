# ProjectPulse

A sleek, open-source project management dashboard with two faces:

1. **Public Stakeholder Portal** — A polished, read-only view that tells the story of your work to leadership, clients, or the public.
2. **Internal Team Dashboard** — A full-featured Kanban board, priority matrix, and portfolio analytics view where your team manages projects behind the scenes.

Changes made internally are **automatically reflected** on the public portal — no extra publishing step needed.

---

## What You Get

| Feature | Description |
|---------|-------------|
| **Kanban Board** | Drag-and-drop cards across customizable workflow stages |
| **Priority Matrix** | See all projects organized by High / Medium / Low priority |
| **Portfolio Analytics** | Metrics dashboard with CSV export |
| **Project Records** | Detailed editing view with comments, tags, and progress tracking |
| **Public Portal** | Auto-generated stakeholder-facing dashboard |
| **Google Sign-In** | Secure team login with optional domain restriction |
| **Real-Time Sync** | Powered by Firebase — changes appear instantly for all users |
| **Search** | Filter projects across all views by title, owner, tag, or department |
| **Toast Notifications** | User-friendly success/error feedback for every action |

---

## Quick Start (Step by Step)

> **Prerequisites:** You need a Google account and a computer with [Node.js](https://nodejs.org/) installed (version 18 or higher). To check, open a terminal and type `node -v`. If you see a version number, you're good.

### Step 1: Download the Code

```bash
git clone https://github.com/whuggins-rcll/project-archives.git
cd project-archives
```

### Step 2: Create a Firebase Project (Free)

Firebase is the free cloud service that stores your data and handles login.

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) and sign in with your Google account.
2. Click **"Create a project"** (or "Add project").
3. Give it a name (e.g., "My ProjectPulse") and click through the prompts (you can disable Google Analytics if you want — it's optional).
4. Once the project is created, you'll land on the project dashboard.

### Step 3: Add a Web App to Firebase

1. On your Firebase project dashboard, click the **web icon** (`</>`) to add a web app.
2. Give it a nickname (e.g., "ProjectPulse Web") and click **"Register app"**.
3. Firebase will show you a block of configuration values. **Keep this page open** — you'll need these values in a moment.

### Step 4: Turn On Google Sign-In

1. In the left sidebar of the Firebase Console, click **Authentication** → **Get started**.
2. Go to the **"Sign-in method"** tab.
3. Click **Google**, flip the **Enable** switch, and click **Save**.

### Step 5: Create the Database

1. In the left sidebar, click **Firestore Database** → **Create database**.
2. Pick a region close to you and select **"Start in production mode"**.
3. Once created, go to the **Rules** tab.
4. Delete the existing rules and paste in the contents of the `firestore.rules` file from this project.
5. Click **Publish**.

### Step 6: Configure Environment Variables

1. In the project folder, copy the example file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` in any text editor and fill in the Firebase values from Step 3:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...your-key...
   VITE_FIREBASE_AUTH_DOMAIN=my-projectpulse.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=my-projectpulse
   VITE_FIREBASE_STORAGE_BUCKET=my-projectpulse.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```
3. **Optional — Restrict login to your organization:**
   If you only want people with a specific email domain (e.g., `@yourcompany.com`) to access the internal dashboard, add:
   ```env
   VITE_ALLOWED_DOMAIN=yourcompany.com
   ```

### Step 7: Bootstrap Your First Admin

By default, only **admins** can create, edit, and delete projects. To make yourself an admin:

1. Run the app (next step) and log in with Google.
2. Go to your Firebase Console → **Firestore Database**.
3. You'll see a `users` collection doesn't exist yet. Click **"Start collection"** and name it `users`.
4. Create a new document:
   - **Document ID**: paste your Firebase User UID (find it under Authentication → Users in the Firebase Console)
   - **Fields**:
     - `email` (string): your email address
     - `role` (string): `admin`
     - `createdAt` (timestamp): click the clock icon to set the current time
5. Refresh the app — you now have full admin access.

### Step 8: Install and Run

```bash
npm install
npm run dev
```

Open your browser to **http://localhost:5173** (Vite will show the exact URL in the terminal).

- Visit `/` to see the **public stakeholder portal**
- Click **"Team Login"** to access the internal dashboard

---

## Customizing for Your Organization

### Change the Name, Text, and Labels

Open `src/config.ts` and edit the `APP_CONFIG` object:

```typescript
export const APP_CONFIG = {
  appName: 'ProjectPulse',        // App name shown everywhere
  orgName: 'Your Organization',   // Shown in the sidebar
  portalName: 'ProjectPulse',     // Public portal title
  heroTitle: '...',               // Big headline on the public page
  heroSubtitle: '...',            // Subtext under the headline
  projectCodePrefix: 'PP',        // Auto-generated codes like PP-342
  ownerLabel: 'Lead',             // Label for the project owner
  departmentLabel: 'Department',  // Label for the department field
  healthScoreLabel: 'Health Score', // Label for the health metric
  // ...more options in the file
};
```

### Change the Brand Colors

Open `src/index.css` and update the two CSS variables at the top:

```css
:root {
  --brand-primary: #002045;  /* Your primary brand color */
  --brand-dark: #1A365D;     /* Darker shade for hero sections */
}
```

### Customize the Workflow Stages

Open `src/config.ts` and modify the `WORKFLOW_STAGES` array. The Kanban board columns, status dropdowns, and all views will update automatically:

```typescript
export const WORKFLOW_STAGES = [
  { key: 'backlog',  label: 'Backlog',        color: '...', border: '...' },
  { key: 'todo',     label: 'To Do',          color: '...', border: '...' },
  { key: 'doing',    label: 'In Progress',    color: '...', border: '...' },
  { key: 'review',   label: 'In Review',      color: '...', border: '...' },
  { key: 'done',     label: 'Done',           color: '...', border: '...' },
];
```

---

## Deploying to the Web (Vercel — Free)

[Vercel](https://vercel.com) is the easiest way to put this on the internet for free.

1. Push your code to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), sign in with GitHub, and click **"Add New Project"**.
3. Import your repository. Vercel will auto-detect it as a Vite project.
4. Under **Environment Variables**, add the same `VITE_*` values from your `.env` file.
5. Click **Deploy**.

**After deployment:** Copy your live URL (e.g., `https://my-app.vercel.app`) and add it to your Firebase Console under **Authentication → Settings → Authorized domains**. Without this step, Google Sign-In won't work on the live site.

---

## Project Structure

```
src/
├── config.ts          # All branding, labels, and workflow configuration
├── types.ts           # TypeScript interfaces (auto-derived from config)
├── App.tsx            # Root component, routing, and auth
├── components/
│   ├── Sidebar.tsx    # Navigation sidebar
│   ├── Topbar.tsx     # Header bar with search and user profile
│   └── Toast.tsx      # Toast notification system
├── views/
│   ├── PublicView.tsx  # Stakeholder portal (no login required)
│   ├── LoginView.tsx   # Google Sign-In page
│   ├── KanbanView.tsx  # Drag-and-drop project board
│   ├── PriorityView.tsx # Priority matrix view
│   ├── PortfolioView.tsx # Analytics dashboard with CSV export
│   └── RecordView.tsx  # Detailed project editor with comments
└── lib/
    ├── firebase.ts    # Firebase initialization
    └── api.ts         # Database operations (Firestore CRUD)
```

---

## Tech Stack

- **React 19** + **TypeScript** + **Vite** (frontend)
- **Tailwind CSS 4** (styling)
- **Firebase** (database, auth, storage)
- **Lucide React** (icons)

---

## License

Apache-2.0
