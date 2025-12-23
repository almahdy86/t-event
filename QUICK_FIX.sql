-- 🚀 حل سريع: تفعيل جميع الأنشطة
-- نفذ هذا فقط بعد تنفيذ RAILWAY_SCHEMA.sql

-- تفعيل جميع الأنشطة
UPDATE activity_status
SET is_active = true,
    updated_at = CURRENT_TIMESTAMP;

-- عرض النتيجة
SELECT
    activity_name AS "اسم النشاط",
    is_active AS "مفعل؟",
    updated_at AS "آخر تحديث"
FROM activity_status
ORDER BY id;