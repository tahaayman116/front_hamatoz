# ⚡ Quick Reference - Hamatoz Frontend API

## 🚀 Quick Start

### 1. Start Dev Server
```bash
cd front_hamatoz
npm install
npm start
# Opens on http://localhost:5004
```

### 2. Build for Production
```bash
npm run build
# Output: dist/HAMATOZ
```

---

## 🔐 Quick Auth

### Register
```typescript
// Method: POST /api/auth/register
authService.register({
  fullName: "أحمد",
  phone: "+201001234567",
  email: "ahmed@example.com",
  password: "Pass123",
  nationalId: "12345678901234",  // EXACTLY 14 digits
  role: "Customer"  // or "Agency"
});
```

### Login
```typescript
// Method: POST /api/auth/login
authService.login("+201001234567", "Pass123");
// Token stored automatically in localStorage
```

---

## 📱 Quick APIs

### Get All Listings
```typescript
listingsService.getPublicListings(page, limit);
```

### Create Listing (Agency)
```typescript
agencyService.createListing({
  type: "car",
  title: "تويوتا 2024",
  description: "...",
  brand: "Toyota",
  modelOrPartName: "Corolla",
  condition: "excellent",
  city: "القاهرة",
  area: "المقطم",
  year: 2024,
  kmsDriven: 5000,
  fuel: "petrol",
  transmission: "automatic",
  assembly: "japanese",
  price: 450000
});
```

### Search
```typescript
// Text search
listingsService.semanticSearch("سيارة تويوتا رخيصة", 10);

// Image search
listingsService.visualSearch(imageFile, "car", 5);
```

### Chat
```typescript
// Get conversations
chatService.getConversations();

// Send message
chatService.sendMessage(conversationId, "مرحبا");
```

### Admin Review
```typescript
// Review agency
adminService.reviewAgency(agencyId, {
  approved: true,
  reason: "المستندات صحيحة"
});

// Review listing
adminService.reviewListing(listingId, {
  approved: true,
  reason: "الإعلان يتبع القواعس"
});

// Review request
adminService.reviewRequest(requestId, {
  approved: true,
  reason: "الطلب صحيح"
});
```

---

## 🗂️ File Structure

```
src/
├── app/
│   ├── core/
│   │   ├── api/
│   │   │   ├── api.config.ts          📋 Endpoints
│   │   │   ├── api.service.ts         🔗 HTTP wrapper
│   │   │   └── auth.interceptor.ts    🔐 Auth header
│   │   ├── models/
│   │   │   └── api.dtos.ts            📦 Type definitions
│   │   ├── guards/
│   │   │   └── admin.guard.ts         🛡️ Admin protection
│   │   └── services/
│   │       ├── auth.service.ts        🔑 Auth
│   │       ├── user.service.ts        👤 User
│   │       ├── listings.service.ts    📱 Listings
│   │       ├── agency.service.ts      🏢 Agency
│   │       ├── chat.service.ts        💬 Chat
│   │       ├── requests.service.ts    📨 Requests
│   │       ├── admin.service.ts       👨‍💼 Admin
│   │       ├── notifications.service.ts 🔔 Notifications
│   │       └── storage.service.ts     💾 LocalStorage
│   ├── sign-in/                       🔓 Login page
│   ├── sign-up/                       ✍️ Register page
│   ├── user/profile/                  👤 User profile
│   ├── admin/                         👨‍💼 Admin pages
│   ├── app.ts                         🎯 Main component
│   └── app.routes.ts                  🛣️ Routes
└── styles.css                         🎨 Global styles
```

---

## 🔑 Key Services

| Service | Purpose | Main Methods |
|---------|---------|--------------|
| **AuthService** | Login/Register/Auth | login, register, getCurrentUser |
| **UserService** | User profile | getProfile, updateProfile |
| **ListingsService** | Car/Part listings | getPublicListings, createListing, updateListing |
| **AgencyService** | Agency operations | getProfile, createListing, getListings |
| **ChatService** | Messaging | getConversations, getMessages, sendMessage |
| **RequestsService** | Customer requests | createRequest, getMyRequests |
| **AdminService** | Admin workflows | reviewAgency, reviewListing, reviewRequest |
| **NotificationsService** | Alerts | getNotifications, markAsRead |

---

## 🎯 Common Tasks

### Create Agency Listing
```typescript
// 1. Login as agency
await authService.login(agencyPhone, agencyPassword);

// 2. Create listing
await agencyService.createListing({
  type: "car",
  title: "...",
  // ... all required fields
});
```

### Review Agency (Admin)
```typescript
// 1. Login as admin
await authService.login(adminPhone, adminPassword);

// 2. Get pending
const pending = await adminService.getPendingAgencies();

// 3. Review
await adminService.reviewAgency(agencyId, {
  approved: true,
  reason: "سبب القبول"
});
```

### Send Message
```typescript
// 1. Get conversations
const convs = await chatService.getConversations();

// 2. Send message
await chatService.sendMessage(conversationId, "النص");
```

---

## 🐛 Debugging

### Check Auth Token
```typescript
const token = localStorage.getItem("hamatoz_auth_token");
console.log(token);
```

### Clear Storage
```typescript
localStorage.clear();
```

### Check API Config
```typescript
import { API_CONFIG } from './src/app/core/api/api.config';
console.log(API_CONFIG.baseUrl);
console.log(API_CONFIG.endpoints);
```

### Enable Request Logging
Add in api.service.ts:
```typescript
console.log('Request:', method, url, params);
```

---

## ⚙️ Configuration

### API Base URL
```typescript
// api.config.ts
baseUrl: 'https://ref3y-hamatoz-api.hf.space'
```

### JWT Token Key
```typescript
// storage.service.ts
localStorage key: 'hamatoz_auth_token'
```

### Timeout
```typescript
timeout: 30000,  // 30 seconds
retryAttempts: 3
```

---

## 📊 API Endpoints Reference

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

### Users
- GET `/api/users/me`
- PUT `/api/users/me`

### Listings
- GET `/api/listings`
- GET `/api/listings/{id}`
- POST `/api/listings`
- PUT `/api/listings/{id}`
- DELETE `/api/listings/{id}`
- GET `/api/listings/{id}/similar`
- POST `/api/listings/search/visual`
- GET `/api/listings/semantic-search`

### Agency
- GET `/api/agency/profile`
- POST `/api/agency/profile`
- GET `/api/agency/listings/mine`
- POST `/api/agency/listings`
- PUT `/api/agency/listings/{id}`

### Chat
- GET `/api/chat/conversations`
- GET `/api/chat/conversations/{id}/messages`
- POST `/api/chat/conversations/{id}/messages`

### Requests
- POST `/api/requests`
- GET `/api/requests/mine`

### Notifications
- GET `/api/notifications`
- POST `/api/notifications/{id}/read`

### Admin
- GET `/api/admin/agencies/pending`
- POST `/api/admin/agencies/{id}/review`
- GET `/api/admin/listings/pending`
- POST `/api/admin/listings/{id}/review`
- GET `/api/admin/requests/pending`
- POST `/api/admin/requests/{id}/review`

---

## 💾 DTO Validation Rules

| DTO | Key Rules |
|-----|-----------|
| **RegisterRequestDto** | nationalId = exactly 14 digits, password ≥ 6 chars |
| **LoginRequestDto** | phone in E.164 format |
| **CreateListingDto** | All fields required, year 1900-2026, kmsDriven ≤ 99999999 |
| **CreateOrUpdateAgencyProfileDto** | 6 fields required: name, address, city, area, commercial reg, tax card |

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Build Check
```bash
npm run build
# Success = Bundle generated in dist/HAMATOZ
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| ENDPOINTS_STATUS.md | High-level endpoints overview |
| ENDPOINTS_VERIFICATION.md | Detailed verification matrix |
| IMPLEMENTATION_GUIDE.md | Implementation details |
| API_TESTING_GUIDE.md | Complete API test examples |
| This file | Quick reference |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Error | Check token in localStorage, login again |
| Phone login fails | Ensure phone in E.164 format: +2XXXXXXXXXX |
| Listing creation fails | Check all required fields present |
| Build fails | Run `npm install` then `npm run build` |
| API not responding | Check base URL, verify internet connection |

---

## 🎯 Development Workflow

1. **Create/update component**
   ```bash
   # Edit .ts and .html files
   ```

2. **Use services**
   ```typescript
   // Inject service in component
   constructor(private service: MyService) {}
   
   // Call methods
   this.service.method().subscribe(data => {});
   ```

3. **Test locally**
   ```bash
   npm start  # http://localhost:5004
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 📞 Support

- **API Documentation:** /swagger/index.html on API server
- **Swagger JSON:** /swagger/v1/swagger.json
- **Base URL:** https://ref3y-hamatoz-api.hf.space

---

*Last Updated: 2026-05-16*
