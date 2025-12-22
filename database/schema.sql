-- قاعدة بيانات فعالية التنفيذي
-- إنشاء الجداول الأساسية

-- جدول الموظفين
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(10) UNIQUE NOT NULL,
    employee_number INTEGER UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_online BOOLEAN DEFAULT FALSE
);

-- جدول الصور المشاركة
CREATE TABLE IF NOT EXISTS shared_photos (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    employee_number INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الإعجابات
CREATE TABLE IF NOT EXISTS photo_likes (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER REFERENCES shared_photos(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(photo_id, employee_id)
);

-- جدول الأسئلة
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الإجابات
CREATE TABLE IF NOT EXISTS answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id),
    employee_id INTEGER REFERENCES employees(id),
    employee_number INTEGER NOT NULL,
    selected_answer INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken INTEGER
);

-- جدول حالة الفعاليات
CREATE TABLE IF NOT EXISTS activity_status (
    id SERIAL PRIMARY KEY,
    activity_name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الإشعارات
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول مسؤولي النظام
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الإعدادات
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إدراج الفعاليات الأساسية
INSERT INTO activity_status (activity_name, is_active) VALUES
    ('identity_mirrors', FALSE),
    ('zero_error_challenge', FALSE),
    ('art_of_hospitality', FALSE),
    ('final_photo', FALSE)
ON CONFLICT (activity_name) DO NOTHING;

-- إدراج الإعدادات الافتراضية
INSERT INTO settings (key, value) VALUES
    ('primary_color', '#8B6F47'),
    ('secondary_color', '#40E0D0'),
    ('logo_url', '/logo.svg'),
    ('min_correct_percentage', '80')
ON CONFLICT (key) DO NOTHING;

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_employees_uid ON employees(uid);
CREATE INDEX IF NOT EXISTS idx_employees_number ON employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_photos_approved ON shared_photos(is_approved);
CREATE INDEX IF NOT EXISTS idx_photos_employee ON shared_photos(employee_id);
CREATE INDEX IF NOT EXISTS idx_answers_correct ON answers(is_correct);
CREATE INDEX IF NOT EXISTS idx_answers_employee ON answers(employee_id);
