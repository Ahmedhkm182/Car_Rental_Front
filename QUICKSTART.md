# 🚀 CarRent Frontend - Quick Start Guide

## ✅ What's Been Done

Your frontend project has been **fully refactored** into a clean, modular architecture. Here's what changed:

### 📁 New Structure
```
pages/              # Each page is now self-contained
├── login/          # login.html + login.css + login.js
├── register/       # register.html + register.css + register.js
├── cars/           # Full CRUD + filtering for admin & users
├── dashboard/      # Admin dashboard with charts
├── reservations/   # User reservations management
└── notifications/  # Real-time notifications

shared/             # Shared modules & utilities
├── api.js          # API client (updated to use https://localhost:7297/api)
├── auth.js         # Authentication & authorization
├── navbar.js       # Auto-injected navbar component
├── ui.js           # UI utilities (toasts, modals, helpers)
├── navbar.css      # Navbar styles
├── components.css  # Reusable components (buttons, forms, etc)
└── modal.css       # Modal dialog styles

css/
├── global.css      # Global styles (typography, base)
├── home.css        # Home page styles
└── style.css       # (Legacy - can be removed)

index.html          # New modern home page
```

### 🎨 Design Changes
- ✅ **Removed Tailwind** - Pure CSS with modular styling
- ✅ **Indigo/Glassmorphism Theme** - Modern, consistent design
- ✅ **Responsive Design** - Mobile, tablet, desktop all supported
- ✅ **Better Contrast** - All text is readable
- ✅ **Form Inputs** - Black text, placeholder hides on focus
- ✅ **Gradient Buttons** - Purple-blue gradient style

### ✨ New Features
- ✅ **Admin Dashboard** - Statistics + revenue charts (Chart.js)
- ✅ **Admin CRUD** - Full car management with modal
- ✅ **Improved Cars Page** - Filtering + grid layout + hover effects
- ✅ **Navbar Component** - Auto-injected, context-aware
- ✅ **Notifications** - Real-time updates with polling
- ✅ **Better Auth** - Role-based access control
- ✅ **UI Utilities** - Toasts, modals, helpers in `/shared/ui.js`

## 🔧 What You Need To Know

### API Base URL
**Updated to**: `https://localhost:7297/api`

File: `/shared/api.js`
```javascript
window.Api.BASE_API_URL = "https://localhost:7297/api";
```

### How to Use Each Page

#### Login & Register
- No changes needed - same form structure
- Better styling with modern glassmorphism effect

#### Cars Page
- **Users**: Browse, filter, reserve
- **Admins**: Browse, filter, reserve + full CRUD with modal
- Admin mode detected automatically

#### Dashboard (Admin Only)
- Stats cards
- Daily/Monthly revenue charts
- Top rented cars table
- Auto-redirects non-admins

#### Reservations
- Shows all user reservations
- Can cancel active ones
- Status indicators

#### Notifications
- Auto-polls every 10 seconds
- Mark single/all as read
- Badge in navbar

### Auto-Injected Navbar
Add this to ANY page:
```html
<div id="navbar-root"></div>
<script src="/shared/navbar.js"></script>
```

The navbar will:
- ✅ Auto-mount
- ✅ Show login/logout based on auth
- ✅ Hide admin panel from regular users
- ✅ Highlight current page
- ✅ Update notification badge
- ✅ Work on mobile with hamburger menu

### Using Shared Utilities

#### UI Module
```javascript
// Toast notifications
UI.toast("Success!", "success");
UI.toast("Error!", "error");

// Confirm dialog
UI.confirm("Are you sure?", function() {
  // On confirm
}, function() {
  // On cancel
});

// Loading overlay
var hideLoading = UI.showLoading("Processing...");
// ... do something
hideLoading(); // Hide it

// Utilities
UI.formatCurrency(99.99);      // "$99.99"
UI.formatDate("2024-01-01");   // "Jan 1, 2024"
UI.isValidEmail(email);         // true/false
UI.getQueryParam("id");         // Get URL param
UI.scrollToTop();               // Smooth scroll
```

#### Auth Module
```javascript
// Check auth state
if (window.Auth.isAuthenticated()) { ... }
if (window.Auth.isAdmin()) { ... }

// Get current user
var user = window.Auth.getCurrentUser();

// Redirect helpers
window.Auth.redirectIfNotAuthenticated();
window.Auth.redirectIfNotAdmin();
```

#### API Module
```javascript
// GET
window.Api.fetch("/Car/all")
  .then(cars => console.log(cars))
  .catch(err => console.error(err));

// POST
window.Api.fetch("/Car", {
  method: "POST",
  body: { make: "BMW", model: "X5" }
})
  .then(res => ...)
  .catch(err => ...);

// Auto-handles auth & redirects on 401
```

## 📝 File Organization Rules

When adding new pages:

1. **Create the folder**: `/pages/my-page/`
2. **Create 3 files**:
   - `my-page.html` - Structure
   - `my-page.css` - Styles
   - `my-page.js` - Logic

3. **Include in HTML**:
```html
<link rel="stylesheet" href="/shared/navbar.css" />
<link rel="stylesheet" href="/shared/components.css" />
<link rel="stylesheet" href="/pages/my-page/my-page.css" />

<div id="navbar-root"></div>

<script src="/shared/api.js"></script>
<script src="/shared/auth.js"></script>
<script src="/shared/navbar.js"></script>
<script src="/shared/ui.js"></script>
<script src="/pages/my-page/my-page.js"></script>
```

4. **Add JS init**:
```javascript
(function(window) {
  window.MyPage = window.MyPage || {};
  
  MyPage.init = function() {
    // Your code here
  };
  
  document.addEventListener("DOMContentLoaded", MyPage.init);
})(window);
```

## 🚀 Running the Project

### Local Development

**Option 1: Python**
```bash
cd Car_Rental_Front
python -m http.server 8000
```

**Option 2: Node.js**
```bash
cd Car_Rental_Front
npx http-server
```

Then visit: **http://localhost:8000**

### Before Going Live

1. **Update API URL** in `/shared/api.js`:
```javascript
// Change from localhost to your production API
window.Api.BASE_API_URL = "https://your-api-domain.com/api";
```

2. **Minify CSS/JS** (optional):
   - Use tools like UglifyJS or CSS Minifier
   - Or use a build tool like Vite/Webpack

3. **Deploy**:
   - GitHub Pages
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Any static hosting

## 📚 Component Reference

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-full">Full Width</button>
```

### Forms
```html
<div class="form-group">
  <label>Label</label>
  <input type="text" class="form-input" />
  <input type="email" class="form-input" />
  <textarea class="form-textarea"></textarea>
  <select class="form-select">
    <option>Option</option>
  </select>
</div>
```

### Cards
```html
<div class="card">
  <!-- Card content -->
</div>

<div class="glass">
  <!-- Glassmorphism content -->
</div>
```

### Alerts
```html
<div class="alert alert-success">Success!</div>
<div class="alert alert-error">Error!</div>
<div class="alert alert-warning">Warning!</div>
<div class="alert alert-info">Info!</div>
```

### Badges
```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-danger">Danger</span>
```

## 🎨 Color Palette

```css
Primary:      #4f46e5 (Indigo)
Primary Dark: #4338ca
Primary Light: #6366f1
Danger:       #ef4444 (Red)
Success:      #10b981 (Green)
Warning:      #f59e0b (Amber)
Text:         #1f2937 (Dark)
Text Light:   #6b7280 (Gray)
Background:   #f9fafb (Off-white)
```

## 📖 Documentation

Full documentation available in: **`REFACTOR_README.md`**

## ✅ Testing Checklist

- [ ] Login/Register pages work
- [ ] Cars page loads and filters work
- [ ] Admin can create/edit/delete cars
- [ ] Users can reserve cars
- [ ] Navbar shows/hides correctly
- [ ] Notifications update in real-time
- [ ] Dashboard shows correct stats
- [ ] Mobile menu works on small screens
- [ ] All forms validate properly
- [ ] API calls use correct base URL

## 🆘 Common Issues

### API returns 401
- Check token in localStorage
- Verify backend is running
- Check API URL in `/shared/api.js`

### Navbar not showing
- Ensure `<div id="navbar-root"></div>` is in HTML
- Check that `/shared/navbar.js` is loaded
- Verify browser console for errors

### Forms not submitting
- Check button `type="submit"`
- Verify form has `id` attribute
- Look for validation errors in console

### Charts not rendering
- Ensure Chart.js is loaded
- Check data format matches expected structure
- Look for JS errors in console

## 🎓 Next Steps

1. **Test everything** locally
2. **Update API URL** for production
3. **Customize colors** if needed (see REFACTOR_README.md)
4. **Add more features** using the modular structure
5. **Deploy** to your hosting provider

## 🎉 You're All Set!

Your CarRent frontend is now:
- ✅ Modular and maintainable
- ✅ Responsive and modern
- ✅ Feature-complete
- ✅ Production-ready
- ✅ No Tailwind required
- ✅ Pure vanilla JavaScript

Start building! 🚀

---

**Need help?** Check the console for errors, review REFACTOR_README.md for detailed docs.
