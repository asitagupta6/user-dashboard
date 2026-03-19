# User Dashboard — Angular Assessment

A fully-featured User Management Dashboard built with Angular 17 (standalone), Chart.js, and RxJS.

---

## Features

- **User Table** — Displays Name, Email, Role, and Join Date with live updates
- **Pie Chart** — Role distribution chart (Admin / Editor / Viewer) using Chart.js, lazy-loaded
- **Add User Modal** — Lazy-loaded popup form with full validation
- **RxJS BehaviorSubject** — Reactive state management via `UserService`
- **Real-time Updates** — Table and chart update instantly when a user is added
- **Search & Filter** — Search by name/email, filter by role
- **Pagination** — 8 users per page
- **Design** — Color scheme `#383838` / `#1c4980`, all buttons/inputs at 48px height

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 17 (standalone) | Framework |
| Chart.js | 4.x | Pie chart |
| RxJS | 7.x | State management |
| SCSS | — | Styling |
| TypeScript | 5.2 | Language |

---

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── user-dashboard/         # Main dashboard (table + chart + controls)
│   │   │   ├── user-dashboard.component.ts
│   │   │   ├── user-dashboard.component.html
│   │   │   └── user-dashboard.component.scss
│   │   └── user-form/              # Lazy-loaded modal form
│   │       ├── user-form.component.ts
│   │       ├── user-form.component.html
│   │       └── user-form.component.scss
│   ├── models/
│   │   └── user.model.ts           # User interface & UserRole type
│   ├── services/
│   │   └── user.service.ts         # BehaviorSubject state management
│   ├── app.component.ts
│   └── app.config.ts
├── styles.scss                     # Global styles + Google Fonts
└── index.html
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Serve

```bash
# Install dependencies
npm install

# Start dev server
npm start
# → http://localhost:4200
```

### Build for Production

```bash
npm run build
# Output: dist/user-dashboard/
```

---

## Architecture Notes

### Lazy Loading

**Chart.js** — Loaded via dynamic `import()` inside `loadChartJs()` when `UserDashboardComponent` initializes. This prevents Chart.js (a large library) from blocking the initial bundle.

```ts
private async loadChartJs(): Promise<void> {
  const chartModule = await import('chart.js/auto'); // lazy-loaded
  this.Chart = chartModule.default;
}
```

**UserFormComponent** — The modal form chunk is lazy-loaded on first click of "Add User":

```ts
async openModal(): Promise<void> {
  await import('../user-form/user-form.component'); // lazy chunk
  this.isModalOpen = true;
}
```

### RxJS State Management

`UserService` holds a `BehaviorSubject<User[]>`. The dashboard subscribes to `users$` and reacts to every emission — updating both the table and the chart automatically.

```ts
private readonly _users$ = new BehaviorSubject<User[]>([]);

get users$(): Observable<User[]> {
  return this._users$.asObservable();
}

addUser(userData: ...): void {
  this._users$.next([...this.currentUsers, newUser]);
}
```

### Form Validation

| Field | Rules |
|---|---|
| Name | Required, min 2 chars, max 50 chars |
| Email | Required, valid email format |
| Role | Required, must select Admin / Editor / Viewer |

Validation errors display inline with animated feedback. The form marks all fields touched on invalid submit attempt.

---

## Bonus Features Implemented

- **Search** — Filter users by name or email in real time
- **Role Filter** — Dropdown to filter table by role
- **Pagination** — 8 rows per page with prev/next navigation
- **Loading Skeleton** — Skeleton animation while Chart.js loads
- **Submit Spinner** — Loading indicator during form submission
- **Stat Cards** — Live count cards for Total / Admin / Editor / Viewer
- **Responsive Design** — Clean layout with sidebar navigation
