# 🏟️ Reserve Pitch Feature - Integration Guide

## ✅ What Was Created

### 📁 Component Structure

```
src/
├── components/
│   ├── filters/
│   │   └── PitchFilters.tsx          # Filter component (roof, size, ground type, price)
│   ├── pitches/
│   │   └── PitchCard.tsx              # Individual pitch card display
│   └── reservations/
│       └── ReservationModal.tsx       # Modal for date/time selection
├── pages/
│   └── ReservePitch.tsx               # Main page container
├── types/
│   └── reservePitchTypes.ts           # TypeScript interfaces
└── static/css/
    ├── ReservePitch.css               # Page styles
    └── components/
        ├── PitchFilters.css           # Filter styles
        ├── PitchCard.css              # Card styles
        └── ReservationModal.css       # Modal styles
```

---

## 🔗 Routing Integration

### Added Route
- **Path:** `/reserve-pitch`
- **Component:** `ReservePitchPage`
- **Location:** `src/pages/mainPage/App.tsx` (line 51)

### Navbar Link Updated
- **Link:** "Lista de Canchas" now points to `/reserve-pitch`
- **Location:** `src/pages/homepage/homePageNav.tsx` (line 80)

---

## 🔐 Authentication

The page requires JWT authentication:
- Reads token from `localStorage.getItem('user')`
- Validates token expiration
- Redirects to `/login` if not authenticated

---

## 🌐 API Integration

### Current Implementation

#### GET Pitches
```typescript
// Endpoint: GET http://localhost:3000/api/pitch/getAll
// Headers: Authorization: Bearer <JWT_TOKEN>
// Response format:
{
  "data": [
    {
      "id": 1,
      "rating": 4.5,
      "size": "7 players",
      "groundType": "synthetic",
      "roof": true,
      "price": 12000,
      "imageUrl": "https://example.com/image.jpg",
      "business": { "id": 3, "name": "Fútbol Norte" }
    }
  ]
}
```

**Location:** `src/pages/ReservePitch.tsx` (line 73)

---

### 🎯 TODO: POST Reservation (Not Yet Integrated)

The reservation modal is ready but needs API integration:

```typescript
// Endpoint: POST http://localhost:3000/api/reservations
// Headers: Authorization: Bearer <JWT_TOKEN>
// Body:
{
  "pitchId": 1,
  "date": "2025-10-15",
  "time": "18:00"
}
```

**To integrate:**
1. Uncomment lines 191-209 in `src/pages/ReservePitch.tsx`
2. Test with your backend
3. Add proper error handling and success messages

---

## 🎨 Features Implemented

### ✅ Filters
- **Search:** Filter by business name or ground type
- **Roof:** All / Covered / Uncovered
- **Size:** Dynamic dropdown from available sizes
- **Ground Type:** Dynamic dropdown (synthetic, grass, parquet, etc.)
- **Price Range:** Min/Max inputs with live display

### ✅ Pitch Cards
- Image with fallback placeholder
- Business name
- Rating (stars + numeric)
- Size, ground type, roof status
- Price per hour (formatted as ARS currency)
- "Reservar" button

### ✅ Reservation Modal
- Pitch summary with image
- Date picker (min: today)
- Time slot dropdown (08:00 - 23:00)
- Confirmation button
- Currently shows placeholder alert (ready for API integration)

---

## 🎨 Design

- **Responsive:** Mobile-first design with breakpoints
- **Color Palette:** Blue gradients (#3b82f6, #2563eb) matching existing design
- **Animations:** Smooth hover effects, modal transitions
- **Loading States:** Spinner with loading text
- **Error States:** Retry button with error message
- **Empty States:** "No results" message when filters return nothing

---

## 🚀 How to Test

1. **Start your backend:**
   ```bash
   # Make sure backend is running on http://localhost:3000
   ```

2. **Start the frontend:**
   ```bash
   npm run dev
   ```

3. **Navigate to the page:**
   - Click "Lista de Canchas" in the navbar
   - Or go directly to: `http://localhost:5173/reserve-pitch`

4. **Test features:**
   - ✅ Login required (redirects if not authenticated)
   - ✅ Fetches pitches from API
   - ✅ Apply filters (roof, size, ground type, price)
   - ✅ Click "Reservar" to open modal
   - ✅ Select date and time
   - ⏳ Confirm reservation (placeholder alert for now)

---

## 🔧 Next Steps

### Immediate
1. **Test API endpoint:** Verify `GET /api/pitch/getAll` returns correct data
2. **Integrate POST reservation:** Uncomment and test reservation creation

### Optional Enhancements
- Add pagination for large pitch lists
- Add "Favorites" feature
- Show available time slots from backend
- Add pitch detail page with more info
- Add user's reservation history

---

## 📝 Notes

- **TypeScript Lint Errors:** Pre-existing configuration issues (not related to new code)
- **Image Fallback:** Uses placeholder if `imageUrl` is missing or fails to load
- **Currency Format:** Uses `es-AR` locale for Argentine Peso formatting
- **Time Slots:** Currently hardcoded 08:00-23:00 (can be made dynamic)

---

## 🐛 Troubleshooting

### "Sesión no iniciada" alert
- Make sure you're logged in
- Check `localStorage.getItem('user')` contains valid JWT

### No pitches showing
- Verify backend is running on `http://localhost:3000`
- Check browser console for API errors
- Verify JWT token is valid and not expired

### Filters not working
- Clear filters and try again
- Check if pitch data matches filter criteria

---

**Created:** 2025-10-10  
**Author:** Cascade AI Assistant  
**Status:** ✅ Ready for testing and API integration
