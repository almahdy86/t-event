-- 🔍 سكريبت تشخيص مشكلة الصور
-- نفذ هذا في Railway Query لفحص حالة الصور

-- 1️⃣ التحقق من وجود الصور في قاعدة البيانات
SELECT
    sp.id,
    sp.employee_number,
    e.full_name,
    sp.image_url,
    sp.is_approved,
    sp.likes_count,
    sp.created_at
FROM shared_photos sp
LEFT JOIN employees e ON sp.employee_id = e.id
ORDER BY sp.created_at DESC
LIMIT 20;

-- 2️⃣ إحصائيات الصور
SELECT
    COUNT(*) as total_photos,
    SUM(CASE WHEN is_approved = true THEN 1 ELSE 0 END) as approved_photos,
    SUM(CASE WHEN is_approved = false THEN 1 ELSE 0 END) as pending_photos
FROM shared_photos;

-- 3️⃣ التحقق من جدول الإعجابات
SELECT
    pl.photo_id,
    COUNT(*) as total_likes,
    array_agg(e.employee_number) as liked_by_employees
FROM photo_likes pl
LEFT JOIN employees e ON pl.employee_id = e.id
GROUP BY pl.photo_id
ORDER BY total_likes DESC;

-- 4️⃣ التحقق من تطابق العدادات
SELECT
    sp.id,
    sp.image_url,
    sp.likes_count as stored_count,
    COUNT(pl.id) as actual_count,
    CASE
        WHEN sp.likes_count = COUNT(pl.id) THEN '✅ متطابق'
        ELSE '❌ غير متطابق'
    END as status
FROM shared_photos sp
LEFT JOIN photo_likes pl ON sp.id = pl.photo_id
WHERE sp.is_approved = true
GROUP BY sp.id, sp.image_url, sp.likes_count
ORDER BY sp.id;

-- 5️⃣ إصلاح العدادات إذا كانت غير متطابقة
-- ⚠️ قم بتشغيل هذا فقط إذا وجدت عدادات غير متطابقة
UPDATE shared_photos sp
SET likes_count = (
    SELECT COUNT(*)
    FROM photo_likes pl
    WHERE pl.photo_id = sp.id
);

-- 6️⃣ حذف الصور التي ليس لها موظف (تنظيف)
-- DELETE FROM shared_photos WHERE employee_id NOT IN (SELECT id FROM employees);

-- 7️⃣ التحقق من آخر 10 موظفين سجلوا دخول
SELECT
    id,
    employee_number,
    full_name,
    last_login,
    created_at
FROM employees
ORDER BY created_at DESC
LIMIT 10;
