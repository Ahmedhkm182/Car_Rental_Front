# API Integration Guide - Car Image Upload & Reservations

## Overview
This document outlines the updates made to support the backend APIs for car image uploads and reservation management with admin privileges.

---

## 1. Backend API Endpoints

### Cars Management

#### POST /api/Car/add
**Purpose:** Add a new car with image upload

**Request:** `multipart/form-data`
```
Make (string) - Required
Model (string) - Required
Year (int) - Required
PricePerDay (double) - Required
Image (binary) - Optional car image file
```

**Example Frontend Usage:**
```javascript
var formData = new FormData();
formData.append("Make", "BMW");
formData.append("Model", "X5");
formData.append("Year", 2024);
formData.append("PricePerDay", 150.00);
formData.append("Image", fileInput.files[0]); // File object

window.CarsPage.addCar(formData);
```

#### PUT /api/Car/update
**Purpose:** Update existing car (with optional image replacement)

**Request:** `multipart/form-data`
```
Id (int) - Required, car ID
Make (string) - Required
Model (string) - Required
Year (int) - Required
Status (string) - Required (Available, Rented, Maintenance)
PricePerDay (double) - Required
Image (binary) - Optional, only include if updating image
OldImageUrl (string) - Optional, previous image URL for cleanup
```

**Example Frontend Usage:**
```javascript
var formData = new FormData();
formData.append("Id", 5);
formData.append("Make", "BMW");
formData.append("Model", "X5");
formData.append("Year", 2024);
formData.append("Status", "Available");
formData.append("PricePerDay", 150.00);
formData.append("OldImageUrl", "https://example.com/old-image.jpg");

// Only append Image if user selected a new file
if (fileInput.files[0]) {
  formData.append("Image", fileInput.files[0]);
}

window.CarsPage.updateCar(carId, formData);
```

### Reservations Management

#### GET /api/Reservation/my
**Purpose:** Get current user's reservations only

**Request:** GET (no body)

**Response:** Array of reservation objects
```json
[
  {
    "id": "...",
    "startDate": "2024-12-20T00:00:00",
    "endDate": "2024-12-25T00:00:00",
    "totalPrice": 750.00,
    "status": "Active",
    "pickupLocation": "Downtown",
    "car": {
      "id": 1,
      "make": "BMW",
      "model": "X5",
      "imageUrl": "https://..."
    }
  }
]
```

#### GET /api/Reservation/all
**Purpose:** Get ALL reservations (Admin only)

**Request:** GET (no body)

**Authentication:** Admin user with valid JWT token

**Response:** Array of all reservation objects

---

## 2. Frontend Files Modified

### A. `/pages/cars/cars.html`
**Changes:**
- Replaced image URL input with file input for direct image upload
- Added image preview section in modal
- Added file input hint text for optional uploads

**Key Elements:**
```html
<input id="modal-image-file" name="imageFile" type="file" accept="image/*" class="form-input file-input" />
<small class="form-hint">Optional. For editing, leave empty to keep current image.</small>

<div id="image-preview" class="image-preview hidden">
  <img id="preview-img" src="" alt="Preview" />
  <button type="button" class="btn-remove-image" onclick="window.CarsPage.clearImagePreview()">✕ Remove</button>
</div>
```

### B. `/pages/cars/cars.js`
**Changes:**
- Updated `addCar()` to use `Api.sendFormData()` with FormData objects
- Updated `updateCar()` to use `Api.sendFormData()` with FormData objects
- Modified `saveCar()` to build FormData with proper field names:
  - `Make`, `Model`, `Year`, `Status`, `PricePerDay`, `Image`
  - For updates: includes `Id`, `OldImageUrl`
- Added `clearImagePreview()` function to reset image selection
- Updated `openEditModal()` to display current car image in preview
- Added event listener for image file input to show preview on selection

**FormData Field Names (EXACT):**
```javascript
formData.append("Make", make);
formData.append("Model", model);
formData.append("Year", parseInt(year, 10));
formData.append("Status", status);
formData.append("PricePerDay", parseFloat(pricePerDay));
formData.append("Image", fileInput.files[0]); // Only if file selected

// For updates only:
formData.append("Id", currentCarId);
formData.append("OldImageUrl", currentCar.imageUrl);
```

### C. `/pages/cars/cars.css`
**New Styles Added:**
- `.file-input` - File input styling with indigo color scheme
- `.file-input::file-selector-button` - "Choose File" button styling
- `.form-hint` - Small text helper under inputs
- `.image-preview` - Preview container for selected images
- `.btn-remove-image` - Red delete button for preview

**Preview Section Styling:**
```css
.image-preview {
  max-width: 120px;
  max-height: 120px;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
}
```

### D. `/pages/reservations/reservations.js`
**Changes:**
- Added `getAllReservations()` function to fetch all reservations (admin)
- Updated `loadReservations()` to check user role:
  - If admin → call `getAllReservations()`
  - If normal user → call `getMyReservations()`
- Updated `init()` to set page title dynamically:
  - "All Reservations" for admin
  - "My Reservations" for users

**Admin Detection:**
```javascript
var isAdmin = window.Auth.isAdmin && window.Auth.isAdmin();
if (isAdmin) {
  // Load all reservations
} else {
  // Load only user's reservations
}
```

### E. `/pages/reservations/reservations.html`
**Changes:**
- Added `id="page-title"` to h1 element for dynamic title updates

### F. `/shared/api.js`
**New Function Added:**

```javascript
window.Api.sendFormData = function (path, method, formData) {
  // Sends FormData with proper multipart/form-data handling
  // Automatically includes Authorization header
  // Returns parsed JSON response
}
```

**Usage:**
```javascript
window.Api.sendFormData("/Car/add", "POST", formData);
window.Api.sendFormData("/Car/update", "PUT", formData);
```

### G. `/shared/auth.js`
**Changes:**
- Updated `isAdmin()` to use `getCurrentUser()` for consistency
- Now properly extracts role from JWT payload

**Role Detection:**
```javascript
window.Auth.isAdmin() // Returns true if user role is "Admin"
```

---

## 3. Key Implementation Details

### Image Upload Flow

#### Add Car Flow:
1. Admin fills form (Make, Model, Year, Price)
2. Admin selects image file via file input
3. Preview displays before saving
4. Click "Save Car"
5. FormData created with exact field names
6. POST to `/Car/add` with multipart data
7. Backend returns car object with generated image URL

#### Edit Car Flow:
1. Admin clicks "Edit" on existing car
2. Form populates with current values
3. Current image shown in preview (if exists)
4. Admin can optionally select new image
5. If no image selected → Image field NOT appended to FormData
6. Click "Save Car"
7. PUT to `/Car/update` with:
   - Current fields (Id, Make, Model, etc.)
   - OldImageUrl (for cleanup)
   - Image field (only if new file selected)

### Admin vs User Reservations

#### Admin View:
- Calls `GET /api/Reservation/all`
- Sees all reservations from all users
- Page title: "All Reservations"
- Full admin management capabilities

#### User View:
- Calls `GET /api/Reservation/my`
- Sees only their own reservations
- Page title: "My Reservations"
- Limited management (cancel/pay only)

### Authentication & Authorization

All API calls include JWT token in Authorization header:
```
Authorization: Bearer {token}
```

Backend should validate:
1. Token is valid
2. For `/Reservation/all` → User must be Admin role
3. For `/Reservation/my` → Any authenticated user

---

## 4. Error Handling

### Image Upload Errors:
- File size validation (implement on backend)
- Image format validation (frontend: `accept="image/*"`)
- Network errors display: "Failed to save car"

### Reservation Loading Errors:
- Display: "Failed to load reservations"
- Automatically shows error message if API call fails

### HTTP Status Codes:
- `401` - Unauthorized, redirects to login
- `400` - Bad request, displays error message
- `500` - Server error, displays error message

---

## 5. Testing Checklist

### Add Car Test:
- ✅ Fill form with all required fields
- ✅ Select image file
- ✅ Image preview displays
- ✅ Click "Save Car"
- ✅ Request sent to `POST /api/Car/add`
- ✅ FormData contains: Make, Model, Year, PricePerDay, Image
- ✅ Car appears in list with image displayed

### Edit Car Test:
- ✅ Click "Edit" on existing car
- ✅ Form populates with current values
- ✅ Current image shows in preview
- ✅ Select new image (optional)
- ✅ Click "Save Car"
- ✅ Request sent to `PUT /api/Car/update`
- ✅ FormData contains: Id, Make, Model, Year, Status, PricePerDay, OldImageUrl
- ✅ FormData includes Image only if new file selected

### Edit Without Image Test:
- ✅ Click "Edit" on existing car
- ✅ Don't select new image
- ✅ Click "Save Car"
- ✅ Request should NOT include Image field
- ✅ Backend keeps existing image

### Admin Reservations Test:
- ✅ Login as admin user
- ✅ Go to Reservations page
- ✅ Page title shows "All Reservations"
- ✅ API call to `GET /api/Reservation/all`
- ✅ All users' reservations displayed

### User Reservations Test:
- ✅ Login as normal user
- ✅ Go to Reservations page
- ✅ Page title shows "My Reservations"
- ✅ API call to `GET /api/Reservation/my`
- ✅ Only user's reservations displayed

---

## 6. Base API URL Configuration

**Current Configuration:**
```javascript
window.Api.BASE_API_URL = "https://localhost:44385/api"
```

**To Change Base URL:**
Edit `/shared/api.js` line 4:
```javascript
window.Api.BASE_API_URL = "YOUR_NEW_BASE_URL";
```

---

## 7. Frontend Architecture

### Module Pattern Used:
All pages use the window namespace pattern for encapsulation:
```javascript
window.CarsPage = window.CarsPage || {};
window.ReservationsPage = window.ReservationsPage || {};
window.Api = window.Api || {};
window.Auth = window.Auth || {};
```

### Function Organization:
- API functions (fetch data from backend)
- Render functions (display data in DOM)
- Event handlers (user interactions)
- Init function (page setup on load)

---

## 8. Required Backend Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | /Car/add | Add car with image | Admin |
| PUT | /Car/update | Update car with optional image | Admin |
| DELETE | /Car/{id} | Delete car | Admin |
| GET | /Car/all | Get all cars | Authenticated |
| GET | /Car/{id} | Get car by ID | Authenticated |
| POST | /Car/filter | Filter cars | Authenticated |
| GET | /Reservation/my | Get user's reservations | Authenticated |
| GET | /Reservation/all | Get all reservations | Admin |
| DELETE | /Reservation/{id} | Cancel reservation | User |

---

## 9. Notes for Backend Team

1. **Image Upload:**
   - Accept multipart/form-data requests
   - Validate image file format and size
   - Store images in accessible location
   - Return image URL in response

2. **Car Update:**
   - If Image field present → replace old image
   - If Image field absent → keep existing image
   - Use OldImageUrl to delete/cleanup old file

3. **Reservations:**
   - `/Reservation/all` must check Admin role
   - `/Reservation/my` returns only authenticated user's reservations

4. **Field Name Matching:**
   - FormData field names must match backend model property names exactly
   - Current names: Make, Model, Year, Status, PricePerDay, Image, OldImageUrl

---

## 10. Complete Code Reference

### FormData Example (Complete):
```javascript
// Adding new car
var formData = new FormData();
formData.append("Make", "Tesla");
formData.append("Model", "Model 3");
formData.append("Year", 2024);
formData.append("PricePerDay", 120.00);
formData.append("Image", fileInput.files[0]);
window.Api.sendFormData("/Car/add", "POST", formData);

// Updating existing car (new image)
var formData = new FormData();
formData.append("Id", 5);
formData.append("Make", "Tesla");
formData.append("Model", "Model 3");
formData.append("Year", 2024);
formData.append("Status", "Available");
formData.append("PricePerDay", 120.00);
formData.append("Image", newFileInput.files[0]);
formData.append("OldImageUrl", "https://example.com/old.jpg");
window.Api.sendFormData("/Car/update", "PUT", formData);

// Updating existing car (NO new image)
var formData = new FormData();
formData.append("Id", 5);
formData.append("Make", "Tesla");
formData.append("Model", "Model 3");
formData.append("Year", 2024);
formData.append("Status", "Available");
formData.append("PricePerDay", 120.00);
formData.append("OldImageUrl", "https://example.com/old.jpg");
// NO Image field appended
window.Api.sendFormData("/Car/update", "PUT", formData);
```

---

## Summary

All updates are complete and ready for backend integration. The frontend now:
- ✅ Supports image file uploads for cars
- ✅ Shows image previews before saving
- ✅ Handles optional image updates without replacing existing images
- ✅ Distinguishes between admin (all reservations) and user (my reservations) views
- ✅ Maintains consistent styling with login/register theme
- ✅ Uses proper multipart/form-data for file uploads
- ✅ Includes proper error handling and user feedback

