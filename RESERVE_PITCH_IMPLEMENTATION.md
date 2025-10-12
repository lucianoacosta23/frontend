# 🏟️ Reserve a Pitch - Complete Implementation

## ✅ Implementation Summary

The "Reserve a Pitch" page has been fully implemented with all required features and API integrations.

---

## 📋 What Was Implemented

### 1. **View All Pitches**
- ✅ Fetches pitches from `GET /api/pitchs/getAll`
- ✅ No authentication required for viewing pitches
- ✅ Displays all pitch information with proper formatting
- ✅ Handles loading and error states

### 2. **Client-Side Filters**
- ✅ **Roof**: "Cubierta" (true) / "Descubierta" (false)
- ✅ **Size**: "pequeño", "mediano", "grande"
- ✅ **Ground Type**: "césped natural", "césped sintético", "cemento", "arcilla"
- ✅ **Price Range**: Min/Max price filters
- ✅ **Search**: Filter by business name or ground type

### 3. **Pitch Card Display**
Each pitch card shows:
- ✅ Image from `imageUrl` (with fallback placeholder)
- ✅ Ground type (`groundType`)
- ✅ Size (`size`)
- ✅ Roof status (Cubierta/Descubierta)
- ✅ Price formatted as Argentine Peso (ARS)
- ✅ Rating displayed with stars (⭐)
- ✅ "Reservar" button

### 4. **Reservation Modal**
- ✅ Opens when user clicks "Reservar"
- ✅ Date picker (minimum: today)
- ✅ Time picker (08:00 - 23:00)
- ✅ Pitch summary with image and details
- ✅ Confirm and Cancel buttons

### 5. **Submit Reservation**
- ✅ Sends POST request to `/api/reservations/add`
- ✅ Includes JWT Bearer token in Authorization header
- ✅ Extracts user ID from JWT token payload
- ✅ Formats request body correctly:
  ```json
  {
    "ReservationDate": "2024-12-25T00:00:00.000Z",
    "ReservationTime": "2024-12-25T18:00:00.000Z",
    "pitch": 1,
    "user": 123
  }
  ```
- ✅ Handles 401 (Unauthorized) - redirects to login
- ✅ Handles 403 (Forbidden) - shows permission error
- ✅ Handles 400/500 errors - displays user-friendly messages
- ✅ Validates date/time selection before submission

---

## 📁 Files Created/Modified

### Created Files:
- ✅ `/src/pages/ReservePitch.tsx` - Main page component
- ✅ `/src/components/filters/PitchFilters.tsx` - Filter component
- ✅ `/src/components/pitches/PitchCard.tsx` - Pitch card component
- ✅ `/src/components/reservations/ReservationModal.tsx` - Reservation modal

### Modified Files:
- ✅ `/src/types/reservePitchTypes.ts` - Updated TypeScript interfaces
- ✅ `/src/types/userData.ts` - Added `exp` field for JWT expiration
- ✅ `/src/pages/mainPage/App.tsx` - Already has route configured

---

## 🔧 TypeScript Interfaces

### Pitch Interface
```typescript
interface ReservePitch {
  id: number;
  rating: number;
  size: "pequeño" | "mediano" | "grande";
  groundType: "césped natural" | "césped sintético" | "cemento" | "arcilla";
  roof: boolean;
  price: number;
  imageUrl?: string;
  driveFileId?: string;
  createdAt: string;
  updatedAt: string;
  business: {
    id: number;
    name: string;
  };
}
```

### Reservation Request Interface
```typescript
interface ReservationRequest {
  ReservationDate: string | Date;
  ReservationTime: string | Date;
  pitch: number;
  user: number;
}
```

---

## 🔐 Authentication Flow

1. **Token Validation**:
   - Reads JWT token from `localStorage.getItem('user')`
   - Decodes token using `jwtDecode<UserData>()`
   - Checks token expiration (`exp` field)
   - Redirects to `/login` if invalid or expired

2. **User ID Extraction**:
   - Extracts `userData.id` from decoded JWT token
   - Used in reservation request body

3. **Authorization Header**:
   - All authenticated requests include: `Authorization: Bearer <JWT_TOKEN>`

---

## 🌐 API Integration

### GET /api/pitchs/getAll
```typescript
// No authentication required
fetch('http://localhost:3000/api/pitchs/getAll', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
```

**Response Format**:
```json
{
  "data": [
    {
      "id": 1,
      "rating": 4.5,
      "size": "pequeño",
      "groundType": "césped natural",
      "roof": true,
      "price": 5000.00,
      "imageUrl": "https://...",
      "driveFileId": "...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "business": {
        "id": 1,
        "name": "Fútbol Norte"
      }
    }
  ]
}
```

### POST /api/reservations/add
```typescript
// Requires JWT authentication
fetch('http://localhost:3000/api/reservations/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${jwtToken}`,
  },
  body: JSON.stringify({
    ReservationDate: "2024-12-25T00:00:00.000Z",
    ReservationTime: "2024-12-25T18:00:00.000Z",
    pitch: 1,
    user: 123
  })
})
```

---

## 🎨 Design Features

- ✅ **Responsive Design**: Mobile-first, works on all screen sizes
- ✅ **Loading States**: Spinner with loading text
- ✅ **Error Handling**: User-friendly error messages with retry button
- ✅ **Empty States**: "No results" message when filters return nothing
- ✅ **Modal Overlay**: Click outside to close
- ✅ **Smooth Animations**: Hover effects, transitions
- ✅ **Color Palette**: Blue gradients matching existing design system

---

## 🚀 How to Test

### Prerequisites
1. Backend running on `http://localhost:3000`
2. Frontend running (usually `http://localhost:5173`)
3. Valid user account to login

### Testing Steps

#### 1. **Test Pitch Listing**
```bash
# Navigate to the page
http://localhost:5173/reserve-pitch
```
- ✅ Should redirect to login if not authenticated
- ✅ After login, should display all pitches
- ✅ Loading spinner should appear while fetching
- ✅ Pitches should display with images, ratings, prices

#### 2. **Test Filters**
- ✅ Search by business name
- ✅ Filter by roof (Cubierta/Descubierta)
- ✅ Filter by size (pequeño/mediano/grande)
- ✅ Filter by ground type
- ✅ Adjust price range
- ✅ Clear all filters button

#### 3. **Test Reservation Flow**
1. Click "Reservar" on any pitch
2. Modal should open with pitch details
3. Select a date (must be today or future)
4. Select a time (08:00 - 23:00)
5. Click "Confirmar Reserva"
6. Should send POST request to backend
7. Success: Shows confirmation alert
8. Error: Shows error message with details

#### 4. **Test Error Handling**
- ✅ Stop backend → Should show error message with retry button
- ✅ Expired token → Should redirect to login
- ✅ Invalid date/time → Should show validation error
- ✅ 403 Forbidden → Should show permission error

---

## 🔍 Debugging Tips

### Check JWT Token
```javascript
// In browser console
const token = localStorage.getItem('user');
console.log('Token:', token);

// Decode token
import { jwtDecode } from 'jwt-decode';
const decoded = jwtDecode(token);
console.log('Decoded:', decoded);
```

### Check API Requests
```javascript
// Open browser DevTools → Network tab
// Filter by: XHR or Fetch
// Look for:
// - GET /api/pitchs/getAll
// - POST /api/reservations/add
```

### Common Issues

**Issue**: "Sesión no iniciada"
- **Solution**: Login first at `/login`

**Issue**: No pitches showing
- **Solution**: Check backend is running and has pitch data

**Issue**: Reservation fails with 401
- **Solution**: Token expired, login again

**Issue**: Reservation fails with 403
- **Solution**: User doesn't have permission (check user category)

**Issue**: Images not loading
- **Solution**: Check `imageUrl` in pitch data, fallback placeholder will show

---

## 📊 API Response Examples

### Successful Reservation
```json
{
  "success": true,
  "message": "Reserva creada exitosamente",
  "data": {
    "id": 123,
    "ReservationDate": "2024-12-25T00:00:00.000Z",
    "ReservationTime": "2024-12-25T18:00:00.000Z",
    "pitch": 1,
    "user": 456
  }
}
```

### Error Response (400)
```json
{
  "success": false,
  "message": "La cancha ya está reservada en ese horario"
}
```

### Error Response (401)
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

### Error Response (403)
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción"
}
```

---

## 🎯 Next Steps (Optional Enhancements)

1. **Add Pagination**: For large pitch lists
2. **Add Sorting**: Sort by price, rating, size
3. **Add Favorites**: Let users save favorite pitches
4. **Show Availability**: Display available time slots from backend
5. **Reservation History**: Show user's past reservations
6. **Pitch Details Page**: Detailed view with more information
7. **Reviews System**: Let users review pitches
8. **Map Integration**: Show pitch locations on a map

---

## ✅ Checklist

- [x] Fetches and displays all pitches
- [x] Filters pitches dynamically on the frontend
- [x] Opens a modal for reservation
- [x] Submits authenticated POST requests
- [x] Handles loading, errors, and success states
- [x] Follows the existing code style and design system
- [x] TypeScript interfaces properly defined
- [x] Authentication with JWT token
- [x] Error handling for 401, 403, 400, 500
- [x] Responsive design
- [x] User-friendly messages

---

## 📝 Notes

- **API Base URL**: `http://localhost:3000/api`
- **Route**: `/reserve-pitch`
- **Authentication**: Required (JWT in localStorage)
- **Allowed Categories**: `['admin', 'business_owner', 'user']`

---

**Status**: ✅ **COMPLETE AND READY FOR TESTING**

**Last Updated**: October 11, 2025
