-- تحديث نظام الإعجابات ليعمل مثل انستقرام
-- يجب تنفيذ هذا في Railway Query

-- جدول الإعجابات موجود بالفعل في RAILWAY_SCHEMA.sql
-- لكن نحتاج التأكد من وجوده
CREATE TABLE IF NOT EXISTS photo_likes (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER REFERENCES shared_photos(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(photo_id, employee_id)
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_photo_likes_photo ON photo_likes(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_likes_employee ON photo_likes(employee_id);

-- ✅ تم! نظام الإعجابات جاهز
