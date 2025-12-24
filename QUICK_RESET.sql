-- ═══════════════════════════════════════════════════════════
-- مسح سريع - استخدم هذا الملف للمسح السريع فقط
-- ═══════════════════════════════════════════════════════════

-- مسح كل شيء في أمر واحد
DELETE FROM answers;
DELETE FROM shared_photos;
DELETE FROM employees;

-- إعادة ضبط العدادات
ALTER SEQUENCE employees_id_seq RESTART WITH 1;
ALTER SEQUENCE answers_id_seq RESTART WITH 1;
ALTER SEQUENCE shared_photos_id_seq RESTART WITH 1;

-- إلغاء تفعيل الأنشطة والأسئلة
UPDATE questions SET is_active = false;
UPDATE activity_status SET is_active = false;

-- ✅ تم! الآن التطبيق جاهز للبدء من جديد
