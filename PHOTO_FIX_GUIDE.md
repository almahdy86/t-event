# دليل إصلاح مشكلة عدم ظهور الصور

## المشكلة
الصور يتم رفعها بنجاح ولكن لا تظهر في لوحة التحكم أو للموظفين.

## الأسباب المحتملة والحلول

### 1. مجلد uploads غير موجود في Railway
**الحل:**
```bash
# التأكد من أن المجلد يتم إنشاؤه عند بدء التطبيق
# الكود موجود في server.js line 61-64
```

### 2. الصور تُحذف عند إعادة تشغيل Railway (Ephemeral Storage)
**المشكلة:** Railway لا يحفظ الملفات المرفوعة بشكل دائم

**الحل الأفضل:** استخدام Cloudinary أو S3 لتخزين الصور

#### تثبيت Cloudinary (الحل الموصى به)
```bash
npm install cloudinary multer-storage-cloudinary
```

### 3. التحقق من قاعدة البيانات
افتح Railway Query وقم بتشغيل:

```sql
-- التحقق من وجود الصور في قاعدة البيانات
SELECT * FROM shared_photos ORDER BY created_at DESC LIMIT 10;

-- التحقق من عدد الصور المعلقة
SELECT COUNT(*) FROM shared_photos WHERE is_approved = false;

-- التحقق من عدد الصور المعتمدة
SELECT COUNT(*) FROM shared_photos WHERE is_approved = true;
```

### 4. التحقق من جدول photo_likes
```sql
-- تشغيل هذا في Railway Query
CREATE TABLE IF NOT EXISTS photo_likes (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER REFERENCES shared_photos(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(photo_id, employee_id)
);

CREATE INDEX IF NOT EXISTS idx_photo_likes_photo ON photo_likes(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_likes_employee ON photo_likes(employee_id);
```

## خطوات التشخيص

1. **افتح لوحة التحكم:** https://t-event-production.up.railway.app/admin/photos
2. **افتح Console في المتصفح** (F12)
3. **تحقق من الأخطاء:**
   - هل هناك أخطاء 404 للصور؟
   - هل API يعمل بشكل صحيح؟

4. **تحقق من Logs في Railway:**
   - افتح Railway Dashboard
   - اذهب إلى Deployments → Logs
   - ابحث عن رسائل خطأ

## الحل السريع (Temporary Fix)

إذا كانت الصور موجودة في قاعدة البيانات ولكن الملفات محذوفة:

```sql
-- حذف جميع الصور من قاعدة البيانات وإعادة البدء
TRUNCATE TABLE photo_likes CASCADE;
TRUNCATE TABLE shared_photos CASCADE;
```

## الحل الدائم: استخدام Cloudinary

سأقوم بإضافة دعم Cloudinary في التحديث التالي إذا أردت ذلك.

### مميزات Cloudinary:
- ✅ تخزين دائم للصور
- ✅ تحسين تلقائي للصور
- ✅ CDN سريع
- ✅ خطة مجانية سخية (25 GB)
