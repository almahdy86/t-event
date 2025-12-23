-- تفعيل جميع الفعاليات
-- نفذ هذا الاستعلام في Railway Query أو في قاعدة البيانات المحلية

UPDATE activity_status SET is_active = true;

-- التحقق من التفعيل
SELECT activity_name, is_active, updated_at FROM activity_status ORDER BY id;