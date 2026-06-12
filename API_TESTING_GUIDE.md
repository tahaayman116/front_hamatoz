# 🧪 Hamatoz API Testing Guide

## 📌 Base URL
```
https://ref3y-hamatoz-api.hf.space
```

## 🔐 Authentication

All endpoints (except `/api/auth/register` and `/api/auth/login`) require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🧑‍💼 Testing Workflows

### 1️⃣ **User Registration & Login Flow**

#### Step 1: Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "أحمد محمد",
  "phone": "+201001234567",
  "email": "ahmed@example.com",
  "password": "SecurePass123",
  "nationalId": "12345678901234",
  "role": "Customer"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-123",
    "fullName": "أحمد محمد",
    "phone": "+201001234567",
    "email": "ahmed@example.com",
    "role": "Customer",
    "createdAt": "2026-05-16T10:00:00Z"
  }
}
```

#### Step 2: Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+201001234567",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-123",
      "fullName": "أحمد محمد",
      "phone": "+201001234567",
      "email": "ahmed@example.com",
      "role": "Customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Store token in localStorage:**
```javascript
localStorage.setItem("hamatoz_auth_token", response.data.token);
```

#### Step 3: Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "id": "user-123",
    "fullName": "أحمد محمد",
    "phone": "+201001234567",
    "email": "ahmed@example.com",
    "role": "Customer"
  }
}
```

---

### 2️⃣ **Agency Registration & Setup**

#### Step 1: Register as Agency
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "وكالة الفرسان للسيارات",
  "phone": "+201001112222",
  "email": "agency@farsan.com",
  "password": "AgencyPass123",
  "nationalId": "98765432101234",
  "role": "Agency"
}
```

#### Step 2: Set Agency Profile
```bash
POST /api/agency/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "agencyName": "وكالة الفرسان",
  "branchAddress": "شارع النيل، الجيزة",
  "city": "الجيزة",
  "area": "الهرم",
  "commercialRegistrationNumber": "12345678",
  "taxCardNumber": "987654321"
}

Response (200/201):
{
  "success": true,
  "data": {
    "agencyProfileId": "agency-123",
    "agencyName": "وكالة الفرسان",
    "branchAddress": "شارع النيل، الجيزة",
    "city": "الجيزة",
    "area": "الهرم",
    "commercialRegistrationNumber": "12345678",
    "taxCardNumber": "987654321",
    "status": "pending_verification"
  }
}
```

---

### 3️⃣ **Create & Manage Listings**

#### Step 1: Create Listing (as Agency)
```bash
POST /api/agency/listings
Authorization: Bearer <AGENCY_TOKEN>
Content-Type: application/json

{
  "type": "car",
  "title": "تويوتا كورولا 2024",
  "description": "سيارة بحالة ممتازة",
  "brand": "Toyota",
  "modelOrPartName": "Corolla",
  "condition": "excellent",
  "city": "القاهرة",
  "area": "المقطم",
  "year": 2024,
  "kmsDriven": 5000,
  "fuel": "petrol",
  "transmission": "automatic",
  "assembly": "japanese",
  "price": 450000,
  "imagesUrlsText": "https://example.com/image1.jpg,https://example.com/image2.jpg"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "listing-123",
    "type": "car",
    "title": "تويوتا كورولا 2024",
    "agencyId": "agency-123",
    "status": "pending_verification",
    "createdAt": "2026-05-16T10:00:00Z"
  }
}
```

#### Step 2: Update Listing
```bash
PUT /api/agency/listings/listing-123
Authorization: Bearer <AGENCY_TOKEN>
Content-Type: application/json

{
  "title": "تويوتا كورولا 2024 - مُحدّث السعر",
  "price": 440000
}
```

#### Step 3: Get My Listings
```bash
GET /api/agency/listings/mine
Authorization: Bearer <AGENCY_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "listing-123",
      "title": "تويوتا كورولا 2024",
      "type": "car",
      "price": 440000,
      "status": "active"
    }
  ]
}
```

---

### 4️⃣ **Browse & Search Listings**

#### Step 1: Get All Public Listings
```bash
GET /api/listings?page=1&limit=20
Content-Type: application/json

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "listing-123",
      "title": "تويوتا كورولا 2024",
      "type": "car",
      "price": 440000,
      "city": "القاهرة",
      "area": "المقطم",
      "images": ["url1", "url2"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

#### Step 2: Get Listing Details
```bash
GET /api/listings/listing-123

Response (200):
{
  "success": true,
  "data": {
    "id": "listing-123",
    "title": "تويوتا كورولا 2024",
    "description": "سيارة بحالة ممتازة",
    "type": "car",
    "brand": "Toyota",
    "modelOrPartName": "Corolla",
    "condition": "excellent",
    "year": 2024,
    "kmsDriven": 5000,
    "fuel": "petrol",
    "transmission": "automatic",
    "assembly": "japanese",
    "price": 440000,
    "city": "القاهرة",
    "area": "المقطم",
    "agencyId": "agency-123",
    "agencyName": "وكالة الفرسان",
    "images": ["url1", "url2"],
    "createdAt": "2026-05-16T10:00:00Z"
  }
}
```

#### Step 3: Get Similar Listings
```bash
GET /api/listings/listing-123/similar?count=5

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "listing-456",
      "title": "هيونداي سوناتا 2024",
      "type": "car",
      "price": 420000
    }
  ]
}
```

#### Step 4: Semantic Search
```bash
GET /api/listings/semantic-search?query=سيارة تويوتا رخيصة&topK=10

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "listing-789",
      "title": "تويوتا يارس 2023",
      "type": "car",
      "price": 250000,
      "similarity": 0.95
    }
  ]
}
```

#### Step 5: Visual Search
```bash
POST /api/listings/search/visual
Authorization: Bearer <TOKEN>
Content-Type: multipart/form-data

Form Data:
- Image: <FILE>
- ListingType: car
- Count: 5

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "listing-123",
      "title": "تويوتا كورولا 2024",
      "matchScore": 0.92
    }
  ]
}
```

---

### 5️⃣ **Customer Requests**

#### Step 1: Create Request
```bash
POST /api/requests
Authorization: Bearer <CUSTOMER_TOKEN>
Content-Type: application/json

{
  "listingId": "listing-123",
  "message": "أنا مهتم بشراء هذه السيارة، هل يمكن التفاوض على السعر؟"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "request-123",
    "listingId": "listing-123",
    "customerId": "user-123",
    "agencyId": "agency-123",
    "status": "pending",
    "createdAt": "2026-05-16T10:00:00Z"
  }
}
```

#### Step 2: Get My Requests
```bash
GET /api/requests/mine
Authorization: Bearer <CUSTOMER_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "request-123",
      "listing": { /* listing details */ },
      "status": "pending",
      "createdAt": "2026-05-16T10:00:00Z"
    }
  ]
}
```

---

### 6️⃣ **Chat System**

#### Step 1: Get Conversations
```bash
GET /api/chat/conversations
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "conv-123",
      "participantId": "user-456",
      "participantName": "أحمد",
      "lastMessage": "ما رأيك في السعر؟",
      "lastMessageTime": "2026-05-16T10:00:00Z",
      "unreadCount": 2
    }
  ]
}
```

#### Step 2: Get Messages
```bash
GET /api/chat/conversations/conv-123/messages
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "msg-123",
      "conversationId": "conv-123",
      "senderId": "user-456",
      "senderName": "أحمد",
      "content": "السلام عليكم، هل السيارة متاحة؟",
      "timestamp": "2026-05-16T09:00:00Z",
      "read": true
    }
  ]
}
```

#### Step 3: Send Message
```bash
POST /api/chat/conversations/conv-123/messages
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "content": "نعم، السيارة متاحة. متى تريد رؤيتها؟"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "msg-456",
    "conversationId": "conv-123",
    "senderId": "user-123",
    "senderName": "محمد",
    "content": "نعم، السيارة متاحة. متى تريد رؤيتها؟",
    "timestamp": "2026-05-16T10:05:00Z"
  }
}
```

---

### 7️⃣ **Notifications**

#### Step 1: Get Notifications
```bash
GET /api/notifications
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "notif-123",
      "title": "رسالة جديدة",
      "message": "لديك رسالة جديدة من أحمد",
      "type": "message",
      "read": false,
      "actionUrl": "/chat/conv-123",
      "createdAt": "2026-05-16T10:00:00Z"
    }
  ]
}
```

#### Step 2: Mark as Read
```bash
POST /api/notifications/notif-123/read
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "id": "notif-123",
    "read": true
  }
}
```

---

### 8️⃣ **Admin Review Workflows**

#### Step 1: Review Pending Agencies
```bash
GET /api/admin/agencies/pending
Authorization: Bearer <ADMIN_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "agencyProfileId": "agency-123",
      "agencyName": "وكالة الفرسان",
      "status": "pending_verification",
      "createdAt": "2026-05-16T09:00:00Z"
    }
  ]
}
```

#### Step 2: Review Agency Decision
```bash
POST /api/admin/agencies/agency-123/review
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "approved": true,
  "reason": "المستندات صحيحة"
}

Response (200):
{
  "success": true,
  "message": "Agency verified successfully"
}
```

#### Step 3: Review Pending Listings
```bash
GET /api/admin/listings/pending
Authorization: Bearer <ADMIN_TOKEN>

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "listing-123",
      "title": "تويوتا كورولا 2024",
      "agencyName": "وكالة الفرسان",
      "status": "pending_verification"
    }
  ]
}
```

#### Step 4: Review Listing Decision
```bash
POST /api/admin/listings/listing-123/review
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "approved": true,
  "reason": "الإعلان يتبع القواعس"
}
```

#### Step 5: Review Pending Requests
```bash
GET /api/admin/requests/pending
Authorization: Bearer <ADMIN_TOKEN>
```

#### Step 6: Review Request Decision
```bash
POST /api/admin/requests/request-123/review
Authorization: Bearer <ADMIN_TOKEN>
Content-Type: application/json

{
  "approved": true,
  "reason": "الطلب صحيح"
}
```

---

### 9️⃣ **User Profile Management**

#### Step 1: Get User Profile
```bash
GET /api/users/me
Authorization: Bearer <TOKEN>

Response (200):
{
  "success": true,
  "data": {
    "id": "user-123",
    "fullName": "أحمد محمد",
    "phone": "+201001234567",
    "email": "ahmed@example.com",
    "role": "Customer"
  }
}
```

#### Step 2: Update User Profile
```bash
PUT /api/users/me
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "أحمد محمد علي",
  "phone": "+201001234567",
  "email": "newemail@example.com"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "user-123",
    "name": "أحمد محمد علي",
    "phone": "+201001234567",
    "email": "newemail@example.com"
  }
}
```

---

## 🛠️ Testing with cURL

### Example: Register User
```bash
curl -X POST https://ref3y-hamatoz-api.hf.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "أحمد محمد",
    "phone": "+201001234567",
    "email": "ahmed@example.com",
    "password": "SecurePass123",
    "nationalId": "12345678901234",
    "role": "Customer"
  }'
```

### Example: Login
```bash
curl -X POST https://ref3y-hamatoz-api.hf.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+201001234567",
    "password": "SecurePass123"
  }'
```

### Example: Get Listings with Auth
```bash
curl -X GET https://ref3y-hamatoz-api.hf.space/api/listings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⚠️ Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Missing required fields | Check all fields match spec |
| 401 Unauthorized | Invalid/missing token | Login again, ensure token is valid |
| 403 Forbidden | Insufficient permissions | Use correct role (Admin, Agency, Customer) |
| 404 Not Found | Resource doesn't exist | Check ID is correct |
| 500 Server Error | Backend issue | Try again, contact support |

---

## ✅ Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| `nationalId` | Exactly 14 digits | `12345678901234` |
| `phone` | E.164 format | `+201001234567` |
| `password` | Min 6 characters | `SecurePass123` |
| `role` | "Customer" or "Agency" | `"Customer"` (case-sensitive) |
| `year` | 1900-2026 | `2024` |
| `kmsDriven` | 0-99999999 | `5000` |

---

*Last Updated: 2026-05-16*
