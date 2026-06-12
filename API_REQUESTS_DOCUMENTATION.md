# 📡 Hamatoz API Requests Guide

## كيفية مشاهدة الـ Requests الفعلية في الـ Browser

### الخطوة 1: فتح DevTools
1. اضغط **F12** أو **Ctrl+Shift+I** (Windows) أو **Cmd+Option+I** (Mac)
2. اذهب لـ **Network** tab
3. اعيد تحميل الصفحة أو ملأ النموذج
4. ستشوف كل الـ requests الـ اتبعتت للـ API

---

## 📤 الـ Requests الـ يتم إرسالها

### 1️⃣ **Sign Up Request**
```
METHOD: POST
URL: https://ref3y-hamatoz-api.hf.space/api/auth/register

HEADERS:
- Content-Type: application/json
- Authorization: Bearer {token} (if available)

REQUEST BODY (JSON):
{
  "fullName": "Ahmed Mohamed",
  "phone": "+201001234567",
  "email": "ahmed@example.com",
  "password": "password123",
  "nationalId": "12345678901234",
  "role": "Customer"  // أو "Agency"
}

EXPECTED RESPONSE (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 123,
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "phone": "+201001234567",
    "role": "Customer",
    "isVerified": false
  },
  "success": true
}

ERROR RESPONSE (400 Bad Request):
{
  "message": "Invalid role. Allowed roles are Customer or Agency."
}
```

---

### 2️⃣ **Sign In Request**
```
METHOD: POST
URL: https://ref3y-hamatoz-api.hf.space/api/auth/login

REQUEST BODY (JSON):
{
  "phone": "+201001234567",
  "password": "password123"
}

EXPECTED RESPONSE (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": 123,
    "name": "Ahmed Mohamed",
    "email": "ahmed@example.com",
    "phone": "+201001234567",
    "role": "Customer",
    "isVerified": true
  }
}

ERROR RESPONSE (401 Unauthorized):
{
  "message": "Invalid credentials"
}
```

---

### 3️⃣ **Get Current User**
```
METHOD: GET
URL: https://ref3y-hamatoz-api.hf.space/api/auth/me

HEADERS:
- Authorization: Bearer {token}

EXPECTED RESPONSE (200 OK):
{
  "userId": 123,
  "name": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "phone": "+201001234567",
  "role": "Customer",
  "isVerified": true
}
```

---

### 4️⃣ **Create Listing**
```
METHOD: POST
URL: https://ref3y-hamatoz-api.hf.space/api/listings

HEADERS:
- Authorization: Bearer {token}
- Content-Type: application/json

REQUEST BODY (JSON):
{
  "type": "car",
  "title": "سيارة تويوتا كامري 2020",
  "description": "سيارة نظيفة جداً...",
  "brand": "Toyota",
  "modelOrPartName": "Camry",
  "condition": "excellent",
  "city": "Cairo",
  "area": "Nasr City",
  "year": 2020,
  "kmsDriven": 45000,
  "fuel": "petrol",
  "transmission": "automatic",
  "assembly": "local",
  "price": 350000
}

EXPECTED RESPONSE (201 Created):
{
  "id": 1,
  "ownerUserId": 123,
  "type": "car",
  "title": "سيارة تويوتا كامري 2020",
  "status": "pending",
  "price": 350000,
  ...
}
```

---

### 5️⃣ **Get Listings**
```
METHOD: GET
URL: https://ref3y-hamatoz-api.hf.space/api/listings?page=1&limit=20

HEADERS:
- Authorization: Bearer {token}

EXPECTED RESPONSE (200 OK):
{
  "data": [
    {
      "id": 1,
      "type": "car",
      "title": "سيارة تويوتا كامري 2020",
      "price": 350000,
      "status": "approved",
      ...
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

---

### 6️⃣ **Update User Profile**
```
METHOD: PUT
URL: https://ref3y-hamatoz-api.hf.space/api/users/me

HEADERS:
- Authorization: Bearer {token}
- Content-Type: application/json

REQUEST BODY (JSON):
{
  "name": "Ahmed Mohamed",
  "phone": "+201001234567",
  "email": "ahmed@example.com"
}

EXPECTED RESPONSE (200 OK):
{
  "id": 123,
  "name": "Ahmed Mohamed",
  "phone": "+201001234567",
  "email": "ahmed@example.com",
  "role": "Customer"
}
```

---

### 7️⃣ **Create Agency Profile**
```
METHOD: POST
URL: https://ref3y-hamatoz-api.hf.space/api/agency/profile

HEADERS:
- Authorization: Bearer {token}
- Content-Type: application/json

REQUEST BODY (JSON):
{
  "agencyName": "وكالة النور للسيارات",
  "branchAddress": "شارع الضباط 123",
  "city": "Cairo",
  "area": "Nasr City",
  "commercialRegistrationNumber": "123456789",
  "taxCardNumber": "987654321",
  "description": "أفضل وكالة سيارات"
}

EXPECTED RESPONSE (201 Created):
{
  "id": 1,
  "agencyName": "وكالة النور للسيارات",
  "status": "pending",
  "verificationStatus": "pending",
  ...
}
```

---

## 🔐 HTTP Interceptor

جميع الـ requests تمر عبر **auth.interceptor.ts** الذي:

1. ✅ يضيف **Authorization** header مع الـ token
   ```
   Authorization: Bearer {token}
   ```

2. ✅ يحاول الـ request 3 مرات إذا فشلت
   ```
   Retry Attempts: 3
   Retry Delay: 1 second
   ```

3. ✅ يعطي timeout بعد 30 ثانية
   ```
   Timeout: 30 seconds
   ```

4. ✅ إذا كانت Response 401، يحذف الـ token ويروح لـ sign-in
   ```
   if (response.status === 401) {
     // Logout and redirect to sign-in
   }
   ```

---

## 📊 Request Flow Diagram

```
┌─────────────────┐
│   User Component│
└────────┬────────┘
         │ FormData
         ▼
┌──────────────────────┐
│   AuthService.login()│
└────────┬─────────────┘
         │ LoginRequestDto
         ▼
┌──────────────────┐
│   ApiService.post()
└────────┬─────────┘
         │ HTTP POST
         ▼
┌──────────────────────────────────┐
│   auth.interceptor.ts            │
│   - Add Authorization header     │
│   - Add timeout (30s)            │
│   - Retry logic (3x)             │
└────────┬─────────────────────────┘
         │ HTTP Request with Header
         ▼
┌──────────────────────────────────┐
│   Backend API                    │
│   POST /api/auth/login           │
└────────┬─────────────────────────┘
         │ Response
         ▼
┌──────────────────────────────────┐
│   Auth Interceptor handles error │
│   - Check status code            │
│   - Handle 401 errors            │
│   - Throw error to component     │
└────────┬─────────────────────────┘
         │ Observable with Response
         ▼
┌──────────────────────┐
│   Component received │
│   - Store token      │
│   - Store user data  │
│   - Navigate page    │
└──────────────────────┘
```

---

## ✅ API Endpoints المتاحة

### Authentication
- `POST /api/auth/register` - التسجيل
- `POST /api/auth/login` - الدخول
- `GET /api/auth/me` - الـ current user

### Users
- `GET /api/users/me` - ملف المستخدم
- `PUT /api/users/me` - تعديل الملف

### Listings
- `GET /api/listings` - الإعلانات
- `GET /api/listings/{id}` - تفاصيل إعلان
- `POST /api/listings` - إنشاء إعلان
- `PUT /api/listings/{id}` - تعديل إعلان
- `DELETE /api/listings/{id}` - حذف إعلان

### Agency
- `GET /api/agency/profile` - ملف الوكالة
- `POST /api/agency/profile` - إنشاء/تعديل الملف
- `GET /api/agency/listings` - إعلانات الوكالة

### Chat
- `GET /api/chat/conversations` - المحادثات
- `GET /api/chat/conversations/{id}/messages` - الرسائل
- `POST /api/chat/conversations/{id}/messages` - إرسال رسالة

---

## 🛠️ كيفية عمل Error Handling

```typescript
// إذا حصل error:

1. HttpClient throws error
   ▼
2. Auth Interceptor catches it
   ▼
3. Check status code:
   - 401: Logout + Redirect to sign-in
   - 400: Show validation error message
   - 500: Show server error message
   ▼
4. ApiService re-throws error
   ▼
5. Component catches and shows message to user
```

---

## 💾 Local Storage

الـ Token والـ User data بتحفظ في localStorage:

```javascript
localStorage.setItem('auth_token', 'eyJhbGciOi...')
localStorage.setItem('current_user', { userId: 123, name: '...' })
localStorage.setItem('last_login', '2026-05-14')
```

---

## 🔍 لاختبار الـ Requests:

### في الـ DevTools:
1. فتح **F12**
2. اذهب **Network** tab
3. ملأ النموذج واضغط submit
4. شوف الـ request الـ بتطلعت

### في الـ Console:
```javascript
// اطبع الـ token الحالي
localStorage.getItem('auth_token')

// اطبع بيانات الـ user الحالي
JSON.parse(localStorage.getItem('current_user'))
```

---

الآن أنت عارف كل شي عن الـ requests الـ بتتبعت! 🚀
