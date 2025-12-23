# 🗄️ إعداد قاعدة البيانات في Railway

## 📋 الخطوات:

### 1️⃣ إنشاء الجداول (Schema)

#### الطريقة أ: من Railway Dashboard (الأسهل) ⭐

1. في صفحة PostgreSQL
2. اضغط تبويب **"Data"**
3. اضغط **"Connect"** (أعلى اليمين)
4. سيفتح Query Editor
5. افتح ملف `RAILWAY_SCHEMA.sql`
6. **انسخ كل المحتوى**
7. **الصقه** في Query Editor
8. اضغط **"Run"** أو `Ctrl+Enter`
9. يجب أن ترى: ✅ Success

#### الطريقة ب: Railway CLI

```bash
# من جهازك
railway login
railway link  # اختر مشروعك

# تشغيل Schema
railway run psql $DATABASE_URL < RAILWAY_SCHEMA.sql
```

---

### 2️⃣ إنشاء Admin

#### الطريقة أ: Railway CLI (الأفضل)

```bash
railway run node scripts/create-admin.js admin Tanfeethi@2024
```

#### الطريقة ب: يدوياً (أصعب)

1. اذهب إلى: https://bcrypt-generator.com
2. أدخل: `Tanfeethi@2024`
3. Rounds: `10`
4. انسخ الـ Hash الناتج
5. في Railway Query:

```sql
INSERT INTO admins (username, password_hash, full_name) 
VALUES ('admin', '<paste_hash_here>', 'مدير النظام');
```

---

### 3️⃣ التحقق من النجاح

في Railway PostgreSQL → Data:

يجب أن ترى الجداول:
- ✅ employees
- ✅ shared_photos
- ✅ photo_likes
- ✅ questions
- ✅ answers
- ✅ activity_status
- ✅ notifications
- ✅ admins
- ✅ settings

---

### 4️⃣ Redeploy التطبيق

بعد إعداد قاعدة البيانات:

1. ارجع لمشروع `t-event`
2. اضغط **"Redeploy"**
3. راقب الـ Logs

يجب أن ترى:
```
✅ Server ready on http://0.0.0.0:8080
✅ Next.js production mode
✅ Database connected: 2025-12-23...
```

---

## 🧪 اختبار التطبيق:

### 1. افتح الرابط:
```
https://your-app.railway.app
```

### 2. جرّب التسجيل:
- أدخل اسم وظيفة
- اضغط تأكيد
- يجب أن يعطيك رقم ✅

### 3. لوحة التحكم:
```
https://your-app.railway.app/admin/login
Username: admin
Password: Tanfeethi@2024
```

---

## 🎯 ملخص الخطوات:

```
1. ✅ PostgreSQL يعمل (تم)
2. ✅ DATABASE_URL موجود (تم)
3. 📋 Schema → نسخ ولصق RAILWAY_SCHEMA.sql
4. 👤 Admin → railway run node scripts/create-admin.js
5. 🔄 Redeploy
6. 🎉 جاهز!
```

---

## 🐛 استكشاف الأخطاء:

### "relation does not exist"
**الحل:** لم يتم تشغيل schema.sql - أعد الخطوة 1

### "password authentication failed"
**الحل:** Admin غير موجود - أعد الخطوة 2

### "Database connection failed"
**الحل:** DATABASE_URL غير صحيح - راجع المتغيرات

---

**الآن نفذ الخطوة 1: انسخ RAILWAY_SCHEMA.sql! 🚀**
