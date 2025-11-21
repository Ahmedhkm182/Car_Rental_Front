# CarRent Frontend - Refactored Modular Architecture

## 📁 Project Structure

```
Car_Rental_Front/
├── index.html                    # Home page (redesigned)
├── assets/                       # Images, icons, SVGs
├── css/
│   ├── global.css               # Global styles (base, typography, utilities)
│   ├── home.css                 # Home page styles
│   └── style.css                # (Legacy - can be removed)
├── js/
│   └── home.js                  # Home page functionality
├── pages/                       # Page modules (each page is self-contained)
│   ├── login/
│   │   ├── login.html
│   │   ├── login.css
│   │   └── login.js
│   ├── register/
│   │   ├── register.html
│   │   ├── register.css
│   │   └── register.js
│   ├── cars/
│   │   ├── cars.html            # Full CRUD for admins, reservations for users
│   │   ├── cars.css
│   │   └── cars.js
│   ├── dashboard/
│   │   ├── dashboard.html       # Admin-only dashboard
│   │   ├── dashboard.css
│   │   └── dashboard.js
│   ├── reservations/
│   │   ├── reservations.html
│   │   ├── reservations.css
│   │   └── reservations.js
│   └── notifications/
│       ├── notifications.html
│       ├── notifications.css
│       └── notifications.js
└── shared/                      # Shared utilities and components
    ├── api.js                   # API client with authentication
    ├── auth.js                  # Authentication & authorization
    ├── navbar.js                # Navbar component logic
    ├── navbar.css               # Navbar styles
    ├── components.css           # Reusable component styles (buttons, forms, etc.)
    └── modal.css                # Modal dialog styles
```

## 🎨 Design System

### Colors
- **Primary**: `#4f46e5` (Indigo)
- **Primary Dark**: `#4338ca`
- **Primary Light**: `#6366f1`
- **Danger**: `#ef4444` (Red)
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Amber)
- **Text**: `#1f2937` (Dark Gray)
- **Text Light**: `#6b7280` (Light Gray)
- **Background**: `#f9fafb` (Off-white)

### Typography
- **Font Family**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI'
- **Font Weights**: 500 (regular), 600 (semibold), 700 (bold), 800 (extra-bold)

### Components
- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-success`
- **Form Inputs**: `.form-input`, `.form-textarea`, `.form-select`
- **Cards**: `.card` (white with shadow), `.glass` (glassmorphism effect)
- **Modals**: `.modal-overlay`, `.modal-content`
- **Badges**: `.badge`, `.badge-primary`, `.badge-success`, `.badge-danger`

## 🔧 Backend API Configuration

**Base URL**: `https://localhost:7297/api`

The API base URL is configured in `/shared/api.js`:

```javascript
window.Api.BASE_API_URL = "https://localhost:7297/api";
```

All API calls automatically include the JWT token in the `Authorization` header.

## 🔐 Authentication & Authorization

### Auth Module (`/shared/auth.js`)

```javascript
// Check if user is logged in
window.Auth.isAuthenticated()  // Returns boolean

// Check if user is admin
window.Auth.isAdmin()          // Returns boolean

// Get current user data
window.Auth.getCurrentUser()   // Returns decoded JWT payload

// Login/Register
window.Auth.login(email, password)
window.Auth.register(fullName, email, password)

// Logout
window.Auth.clearToken()
```

### Auto-Redirects
- **Login Page**: Allows anyone
- **Register Page**: Allows anyone
- **Cars Page**: Requires authentication
- **Reservations Page**: Requires authentication
- **Notifications Page**: Requires authentication
- **Dashboard Page**: Requires admin role

## 📱 Navbar System

The navbar is auto-injected into every page via `/shared/navbar.js`.

### Features
- ✅ Auto-mounts on `DOMContentLoaded`
- ✅ Shows/hides menu items based on authentication status
- ✅ Admin panel only visible to admins
- ✅ Highlights current page
- ✅ Mobile-responsive with hamburger menu
- ✅ Notification badge (updates automatically)

### Usage
Simply add this to every page:
```html
<div id="navbar-root"></div>
<script src="/shared/navbar.js"></script>
```

The navbar will auto-mount and auto-update based on auth state.

## 🚗 Cars Page Features

### For Regular Users
- Browse all available cars
- Filter by make, model, year, price range, status
- Quick reserve button redirects to reservations page

### For Admins
- Full CRUD operations via modal
- Add new cars
- Edit existing cars
- Delete cars
- Same filtering and browsing as users

### Car Modal
- Fields: Make, Model, Year, Status, Price Per Day, Image URL
- Validates all required fields
- Shows delete button only when editing

## 📊 Dashboard Features (Admin Only)

- **Stats Cards**: Total Revenue, Active Reservations, Total Cars, Total Users
- **Daily Revenue Chart**: Last 7 days (bar chart with Chart.js)
- **Monthly Revenue Chart**: Last 12 months (line chart with Chart.js)
- **Top Cars Table**: Most rented cars with rental count and revenue
- **Auto-checks**: Redirects non-admins to home page

## 🔔 Notifications

- **Real-time Updates**: Polls API every 10 seconds
- **Mark as Read**: Individual notification marking
- **Mark All as Read**: Bulk action
- **Badge Counter**: Shows unread count in navbar
- **Auto-cleanup**: Stops polling when navigating away

## 📋 Reservations Page

- Shows all user reservations
- Status indicators: Active, Completed, Cancelled
- Cancel button for active reservations
- Displays pickup/return dates, location, total price
- Empty state with link to browse cars

## 🔐 Form Validation

### Login Form
- Email format validation
- Required field validation

### Register Form
- Full name (min 2 characters)
- Email format validation
- Password (min 6 characters)

### Forms Styling
- Black text inside inputs
- Placeholder hides on focus
- Gradient button styling
- Error messages with red background
- Focus states with indigo border

## 🎯 API Endpoints Used

### Authentication
- `POST /Auth/login` - Login user
- `POST /Auth/register` - Register new user

### Cars
- `GET /Car/all` - Get all cars
- `POST /Car/filter` - Filter cars
- `GET /Car/{id}` - Get single car
- `POST /Car` - Create car (admin)
- `PUT /Car/{id}` - Update car (admin)
- `DELETE /Car/{id}` - Delete car (admin)

### Reservations
- `GET /Reservation/my` - Get user reservations
- `DELETE /Reservation/{id}` - Cancel reservation

### Notifications
- `GET /Notification/my` - Get user notifications
- `PUT /Notification/mark-read/{id}` - Mark single as read
- `PUT /Notification/mark-all-read` - Mark all as read

### Reports (Admin)
- `GET /Report/general-stats` - General statistics
- `GET /Report/top-cars?take=5` - Top rented cars
- `GET /Report/daily-revenue?days=7` - Daily revenue
- `GET /Report/monthly-revenue?months=12` - Monthly revenue

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Backend API running at `https://localhost:7297/api`
- Node.js (optional, for local server)

### Running Locally

1. **Using a simple HTTP server:**
```bash
cd Car_Rental_Front
python -m http.server 8000
# or
npx http-server
```

2. **Visit**: `http://localhost:8000`

### Building for Production

1. Replace API URL in `/shared/api.js`:
```javascript
window.Api.BASE_API_URL = "https://your-production-api.com/api";
```

2. Minify CSS and JS files (optional)

3. Deploy to static hosting (GitHub Pages, Netlify, Vercel, AWS S3, etc.)

## 📝 Development Guidelines

### Adding a New Page

1. Create folder: `pages/my-page/`
2. Create three files:
   - `my-page.html` - Structure
   - `my-page.css` - Styles
   - `my-page.js` - Logic

3. Import shared utilities:
```html
<script src="/shared/api.js"></script>
<script src="/shared/auth.js"></script>
<script src="/shared/navbar.js"></script>
<script src="/pages/my-page/my-page.js"></script>
```

4. Always include:
```html
<div id="navbar-root"></div>
<link rel="stylesheet" href="/shared/navbar.css" />
<link rel="stylesheet" href="/shared/components.css" />
```

### Using the API

```javascript
// GET request
window.Api.fetch("/endpoint", { method: "GET" })
  .then(data => console.log(data))
  .catch(err => console.error(err));

// POST request
window.Api.fetch("/endpoint", {
  method: "POST",
  body: { key: "value" }
})
```

### Form Handling

```javascript
var form = document.getElementById("my-form");
form.addEventListener("submit", function(e) {
  e.preventDefault();
  var email = form.querySelector('input[name="email"]').value;
  // ... handle submission
});
```

### Error Handling

```javascript
window.Api.fetch(...)
  .then(data => {
    // Success
  })
  .catch(err => {
    if (err.status === 401) {
      // Redirect to login (auto-handled by API)
    } else {
      // Show error message
      console.error(err.message);
    }
  });
```

## 🎨 Customization

### Changing Colors
Update CSS variables in component stylesheets or `/shared/components.css`:
```css
:root {
  --color-primary: #4f46e5;
  --color-danger: #ef4444;
  /* etc */
}
```

### Changing Fonts
Update in `/css/global.css`:
```css
body {
  font-family: 'Your Font', sans-serif;
}
```

### Responsive Breakpoints
- Desktop: `>1024px`
- Tablet: `768px - 1024px`
- Mobile: `<768px`
- Small Mobile: `<480px`

## ✨ Features Implemented

✅ **Modular Page Architecture** - Each page is self-contained with its own HTML, CSS, JS
✅ **Responsive Design** - Works on mobile, tablet, and desktop
✅ **Indigo/Glassmorphism Theme** - Modern, consistent design system
✅ **Authentication** - JWT-based with role-based access control
✅ **Admin Dashboard** - Statistics and revenue charts
✅ **Cars CRUD** - Full admin management with modal
✅ **Filtering** - Advanced car filtering by multiple criteria
✅ **Reservations** - User booking and cancellation
✅ **Notifications** - Real-time notifications with polling
✅ **Navbar Component** - Auto-injected, context-aware
✅ **Form Validation** - Client-side validation for all forms
✅ **Error Handling** - Graceful error messages and redirects
✅ **Mobile Menu** - Hamburger menu for small screens
✅ **Loading States** - Spinners and disabled buttons
✅ **No Tailwind** - Pure CSS with modular styling
✅ **Chart.js Integration** - Revenue charts with fallback

## 📦 Dependencies

- **Chart.js** (optional, for dashboard charts): `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`

No build tools, bundlers, or complex dependencies required. Pure vanilla JavaScript!

## 🤝 Contributing

When making changes:
1. Keep pages modular and self-contained
2. Follow the existing color and typography scheme
3. Update this README if adding new features
4. Test on multiple screen sizes
5. Ensure all forms validate properly
6. Check that auth-protected pages redirect correctly

## 📄 License

All rights reserved. CarRent © 2024

---

**Last Updated**: November 2024
**Architecture**: Modular Vanilla JavaScript
**Styling**: Pure CSS (no Tailwind)
**API Version**: REST API with JWT Authentication
