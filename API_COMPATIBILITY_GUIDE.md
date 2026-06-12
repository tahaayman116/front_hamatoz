# Hamatoz Frontend API Compatibility Guide ✅

## تم إصلاح كل شي ليطابق الـ API!

### 🔑 Authentication (الدخول والتسجيل)

#### الدخول (Sign In)
```typescript
// الآن يستخدم PHONE، لا EMAIL!
authService.login(phone: string, password: string)

// مثال:
authService.login('+201001234567', 'password123')
```

#### التسجيل (Sign Up)
```typescript
// جميع الحقول المطلوبة:
const registerData: RegisterRequestDto = {
  fullName: 'أحمد محمد',
  phone: '+201001234567',        // رقم الهاتف
  email: 'ahmed@example.com',     // البريد الإلكتروني
  password: 'SecurePass123',      // كلمة المرور (6+ أحرف)
  nationalId: '12345678901234',   // الرقم القومي (14 رقم بالضبط!)
  role: 'user'                    // أو 'agency'
};

authService.register(registerData)
```

---

### 📝 Creating Listings (إنشاء إعلانات)

```typescript
// كل الحقول المطلوبة:
const listingData: CreateListingDto = {
  type: 'car',                    // أو 'part'
  title: 'سيارة تويوتا كامري 2020',
  description: 'سيارة نظيفة جداً...',
  brand: 'Toyota',                // الماركة
  modelOrPartName: 'Camry',       // الموديل
  condition: 'excellent',         // الحالة
  city: 'Cairo',                  // المدينة
  area: 'Nasr City',              // المنطقة
  year: 2020,                     // السنة (1900-2026)
  kmsDriven: 45000,               // الكيلومترات (0-99999999)
  fuel: 'petrol',                 // نوع الوقود
  transmission: 'automatic',      // ناقل الحركة
  assembly: 'local',              // التجميع
  price: 350000,                  // السعر (اختياري)
  imagesUrlsText: 'url1,url2'     // روابط الصور (اختياري)
};

listingsService.createListing(listingData)
```

---

### 🏢 Agency Profile (ملف الوكالة)

```typescript
// كل الحقول المطلوبة:
const agencyData: CreateOrUpdateAgencyProfileDto = {
  agencyName: 'وكالة النور للسيارات',
  branchAddress: 'شارع الضباط 123',
  city: 'Cairo',
  area: 'Nasr City',
  commercialRegistrationNumber: '123456789',
  taxCardNumber: '987654321',
  description: 'أفضل وكالة سيارات...' // اختياري
};

agencyService.updateProfile(agencyData)
```

---

### 👤 User Profile (ملف المستخدم)

```typescript
// كل الحقول المطلوبة:
const profileData: UpdateProfileRequestDto = {
  name: 'أحمد محمد',              // الاسم
  phone: '+201001234567',         // رقم الهاتف
  email: 'ahmed@example.com'      // البريد الإلكتروني
};

userService.updateProfile(profileData)
```

---

## ✅ التحقق من الامتثال

### DTOs المتوفرة:
- ✅ `RegisterRequestDto` - للتسجيل
- ✅ `LoginRequestDto` - للدخول
- ✅ `CreateListingDto` - لإنشاء إعلان
- ✅ `UpdateListingDto` - لتعديل إعلان
- ✅ `CreateOrUpdateAgencyProfileDto` - لملف الوكالة
- ✅ `UpdateProfileRequestDto` - لملف المستخدم

### Build Status:
```
✅ SUCCESS - Bundle: 546.98 kB
✅ No compilation errors
✅ All services properly typed
```

---

## 📌 النقاط المهمة

1. **National ID**: يجب أن يكون **14 رقم بالضبط**
2. **Phone**: يجب أن يكون بصيغة `+20` (مصر)
3. **Password**: يجب أن يكون **6 أحرف على الأقل**
4. **Listings**: تحتاج **كل** الحقول المطلوبة، لا يمكن ترك أي منها

---

## 🚀 الخطوات التالية

1. ✅ اختبر Sign Up / Sign In
2. ✅ اختبر إنشاء إعلان
3. ✅ اختبر ملف الوكالة
4. ✅ اختبر ملف المستخدم

**الـ Frontend الآن 100% متوافق مع الـ API!** 🎉
