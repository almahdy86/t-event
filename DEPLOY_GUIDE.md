# 🚀 دليل النشر على Railway

## ✅ الإصلاحات التي تمت

### 1. إصلاح API الأنشطة
- ✅ تم إصلاح مشكلة `t.activities.forEach is not a function`
- ✅ الآن يرجع array بدلاً من object

### 2. معالجة أخطاء Socket.io
- ✅ إضافة try-catch لجميع socket handlers
- ✅ التحقق من البيانات قبل المعالجة
- ✅ رسائل خطأ واضحة

---

## 📋 خطوات النشر على Railway

### الخطوة 1️⃣: إعداد قاعدة البيانات

1. **في Railway Dashboard:**
   - اذهب إلى مشروعك
   - افتح PostgreSQL Database
   - اذهب إلى **Query**

2. **نفذ Schema:**
   ```sql
   -- انسخ محتوى ملف RAILWAY_SCHEMA.sql والصقه هنا
   ```

3. **تفعيل جميع الأنشطة:**
   ```sql
   UPDATE activity_status SET is_active = true;
   SELECT * FROM activity_status;
   ```

---

### الخطوة 2️⃣: إعداد متغيرات البيئة

في Railway → Variables، أضف:

```bash
# يتم إضافتها تلقائياً من PostgreSQL
DATABASE_URL=postgresql://...

# يجب إضافتها يدوياً
JWT_SECRET=your_very_strong_secret_key_at_least_32_characters_long
NODE_ENV=production
```

**⚠️ مهم:** لا تستخدم `tanfeethi_secret_key_2024` في الإنتاج!

---

### الخطوة 3️⃣: إعداد Build Settings

في Railway → Settings:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** (اتركه فارغاً إذا كان المشروع في الجذر)

---

### الخطوة 4️⃣: إنشاء حساب Admin

بعد نشر التطبيق، نفذ هذا الأمر في Railway Shell:

```bash
npm run create-admin admin YourStrongPassword123
```

أو استخدم SQL مباشرة:

```sql
-- في Railway Query
INSERT INTO admins (username, password_hash, full_name)
VALUES (
  'admin',
  '$2a$10$...',  -- استخدم bcrypt hash
  'المشرف الرئيسي'
);
```

---

### الخطوة 5️⃣: تفعيل الأنشطة

**الطريقة الأولى - عبر Railway Shell:**
```bash
npm run activate
```

**الطريقة الثانية - عبر SQL:**
```sql
UPDATE activity_status SET is_active = true;
```

---

## 🔧 الأوامر المتاحة

### محلياً:
```bash
# تشغيل التطبيق في وضع التطوير
npm run dev

# بناء التطبيق
npm run build

# تشغيل التطبيق في وضع الإنتاج
npm start

# تفعيل جميع الأنشطة
npm run activate

# إنشاء حساب admin
npm run create-admin [username] [password]
```

### في Railway Shell:
```bash
# تفعيل الأنشطة
npm run activate

# إنشاء admin
npm run create-admin admin MyPassword123
```

---

## ⚠️ مشاكل محتملة وحلولها

### المشكلة 1: الصور لا تظهر بعد إعادة التشغيل

**السبب:** Railway يستخدم نظام ملفات مؤقت

**الحل المؤقت:**
- الصور ستعمل خلال الجلسة الحالية
- عند إعادة التشغيل ستختفي

**الحل الدائم:**
- استخدام Cloudinary لتخزين الصور
- أو استخدام Railway Volumes

### المشكلة 2: DATABASE_URL not found

**الحل:**
1. تأكد من إضافة PostgreSQL Database في Railway
2. تأكد من ربطها بالمشروع
3. أعد نشر التطبيق

### المشكلة 3: JWT errors

**الحل:**
- تأكد من إضافة `JWT_SECRET` في Variables
- يجب أن يكون على الأقل 32 حرف

### المشكلة 4: الأنشطة معطلة

**الحل:**
```bash
npm run activate
```

---

## 🧪 اختبار التطبيق

### 1. اختبار الصفحة الرئيسية
```
https://your-app.up.railway.app
```

### 2. اختبار API الأنشطة
```
https://your-app.up.railway.app/api/activities/status
```

يجب أن يعود:
```json
{
  "success": true,
  "activities": [
    {
      "id": 1,
      "activity_name": "identity_mirrors",
      "is_active": true,
      "updated_at": "..."
    },
    ...
  ]
}
```

### 3. اختبار تسجيل الدخول للـ Admin
```
https://your-app.up.railway.app/admin/login
```

---

## 📊 مراقبة التطبيق

### في Railway:
1. اذهب إلى **Deployments**
2. اضغط على آخر Deployment
3. راجع **Logs** للتأكد من:
   - ✅ Database connected
   - ✅ Server ready on...
   - ✅ Next.js production mode

### Logs مهمة:
```
✅ Database connected: 2024-...
✅ Server ready on http://0.0.0.0:3000
✅ Next.js production mode
```

---

## 🎯 Checklist قبل الإطلاق

- [ ] تم تنفيذ RAILWAY_SCHEMA.sql
- [ ] تم إضافة DATABASE_URL (تلقائياً)
- [ ] تم إضافة JWT_SECRET
- [ ] تم إضافة NODE_ENV=production
- [ ] تم إنشاء حساب Admin
- [ ] تم تفعيل جميع الأنشطة
- [ ] تم اختبار تسجيل الدخول
- [ ] تم اختبار API الأنشطة
- [ ] تم اختبار التسجيل كموظف

---

## 🆘 الدعم

إذا واجهت أي مشاكل:

1. **راجع Logs في Railway**
2. **تحقق من Variables**
3. **تأكد من تنفيذ Schema**
4. **جرب إعادة النشر (Redeploy)**

---

## 🔐 ملاحظات أمنية

### في Production:
- ✅ استخدم JWT_SECRET قوي (32+ حرف عشوائي)
- ✅ لا تشارك معلومات Database
- ⚠️ قم بتغيير CORS origins من "*" إلى domain محدد
- ⚠️ أضف rate limiting للـ APIs

### بعد الإطلاق:
```javascript
// في server.js - غير CORS
cors: {
  origin: "https://your-domain.com",
  methods: ["GET", "POST"]
}
```

---

**نشر موفق! 🎉**