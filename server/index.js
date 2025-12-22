// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// إعدادات قاعدة البيانات
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tanfeethi_event',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const JWT_SECRET = process.env.JWT_SECRET || 'tanfeethi_secret_key_2024';

app.use(express.json());
app.use(express.static('public'));

// إعداد Multer لرفع الصور
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// متتبع المستخدمين المتصلين
let onlineUsers = new Map();

// ============= WebSocket Events =============
io.on('connection', (socket) => {
  console.log('مستخدم جديد متصل:', socket.id);

  // تسجيل اتصال موظف
  socket.on('employee:connect', async (data) => {
    const { employeeId, employeeNumber } = data;
    onlineUsers.set(socket.id, { employeeId, employeeNumber });
    
    await pool.query(
      'UPDATE employees SET is_online = TRUE, last_login = NOW() WHERE id = $1',
      [employeeId]
    );

    io.emit('users:count', onlineUsers.size);
  });

  // مشاركة صورة
  socket.on('photo:share', async (data) => {
    try {
      const { employeeId, employeeNumber, imageData } = data;
      
      // حفظ الصورة في قاعدة البيانات
      const result = await pool.query(
        'INSERT INTO shared_photos (employee_id, employee_number, image_url, is_approved) VALUES ($1, $2, $3, FALSE) RETURNING *',
        [employeeId, employeeNumber, imageData]
      );

      // إرسال للأدمن للموافقة
      io.emit('admin:photo:pending', result.rows[0]);
    } catch (error) {
      console.error('خطأ في مشاركة الصورة:', error);
      socket.emit('photo:error', { message: 'فشل رفع الصورة' });
    }
  });

  // إعجاب بصورة
  socket.on('photo:like', async (data) => {
    try {
      const { photoId, employeeId } = data;
      
      // التحقق من وجود الإعجاب
      const existingLike = await pool.query(
        'SELECT * FROM photo_likes WHERE photo_id = $1 AND employee_id = $2',
        [photoId, employeeId]
      );

      if (existingLike.rows.length > 0) {
        // إزالة الإعجاب
        await pool.query(
          'DELETE FROM photo_likes WHERE photo_id = $1 AND employee_id = $2',
          [photoId, employeeId]
        );
        await pool.query(
          'UPDATE shared_photos SET likes_count = likes_count - 1 WHERE id = $1',
          [photoId]
        );
      } else {
        // إضافة إعجاب
        await pool.query(
          'INSERT INTO photo_likes (photo_id, employee_id) VALUES ($1, $2)',
          [photoId, employeeId]
        );
        await pool.query(
          'UPDATE shared_photos SET likes_count = likes_count + 1 WHERE id = $1',
          [photoId]
        );
      }

      // الحصول على العدد المحدث
      const updatedPhoto = await pool.query(
        'SELECT * FROM shared_photos WHERE id = $1',
        [photoId]
      );

      io.emit('photo:likes:update', updatedPhoto.rows[0]);
    } catch (error) {
      console.error('خطأ في الإعجاب:', error);
    }
  });

  // إرسال إجابة
  socket.on('answer:submit', async (data) => {
    try {
      const { questionId, employeeId, employeeNumber, selectedAnswer, timeTaken } = data;
      
      // الحصول على الإجابة الصحيحة
      const question = await pool.query(
        'SELECT correct_answer FROM questions WHERE id = $1',
        [questionId]
      );

      const isCorrect = question.rows[0].correct_answer === selectedAnswer;

      // حفظ الإجابة
      await pool.query(
        'INSERT INTO answers (question_id, employee_id, employee_number, selected_answer, is_correct, time_taken) VALUES ($1, $2, $3, $4, $5, $6)',
        [questionId, employeeId, employeeNumber, selectedAnswer, isCorrect, timeTaken]
      );

      socket.emit('answer:result', { isCorrect, correctAnswer: question.rows[0].correct_answer });
    } catch (error) {
      console.error('خطأ في حفظ الإجابة:', error);
    }
  });

  // قطع الاتصال
  socket.on('disconnect', async () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      await pool.query(
        'UPDATE employees SET is_online = FALSE WHERE id = $1',
        [user.employeeId]
      );
      onlineUsers.delete(socket.id);
    }
    io.emit('users:count', onlineUsers.size);
    console.log('مستخدم قطع الاتصال:', socket.id);
  });
});

// ============= API Routes =============

// تسجيل موظف جديد
app.post('/api/employee/register', async (req, res) => {
  try {
    const { uid, fullName, jobTitle } = req.body;

    // التحقق من وجود الموظف
    const existing = await pool.query('SELECT * FROM employees WHERE uid = $1', [uid]);
    
    if (existing.rows.length > 0) {
      return res.json({ 
        success: true, 
        employee: existing.rows[0],
        isNew: false 
      });
    }

    // الحصول على أقل رقم متاح
    const result = await pool.query(`
      WITH numbers AS (
        SELECT generate_series(1, 200) AS num
      )
      SELECT num FROM numbers
      WHERE num NOT IN (SELECT employee_number FROM employees)
      ORDER BY num
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'تم تسجيل جميع الموظفين (200)' });
    }

    const employeeNumber = result.rows[0].num;

    // تسجيل الموظف
    const newEmployee = await pool.query(
      'INSERT INTO employees (uid, employee_number, full_name, job_title) VALUES ($1, $2, $3, $4) RETURNING *',
      [uid, employeeNumber, fullName, jobTitle]
    );

    res.json({ 
      success: true, 
      employee: newEmployee.rows[0],
      isNew: true 
    });
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// الحصول على معلومات موظف
app.get('/api/employee/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const result = await pool.query('SELECT * FROM employees WHERE uid = $1', [uid]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
    }

    res.json({ success: true, employee: result.rows[0] });
  } catch (error) {
    console.error('خطأ في الحصول على المعلومات:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// الحصول على حالة الفعاليات
app.get('/api/activities/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_status');
    res.json({ success: true, activities: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// رفع صورة
app.post('/api/photo/upload', upload.single('photo'), async (req, res) => {
  try {
    const { employeeId, employeeNumber } = req.body;
    const photoBuffer = req.file.buffer;

    // معالجة الصورة
    const processedImage = await sharp(photoBuffer)
      .resize(1080, 1920, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toBuffer();

    const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;

    // حفظ في قاعدة البيانات
    const result = await pool.query(
      'INSERT INTO shared_photos (employee_id, employee_number, image_url, is_approved) VALUES ($1, $2, $3, FALSE) RETURNING *',
      [employeeId, employeeNumber, base64Image]
    );

    // إرسال للأدمن
    io.emit('admin:photo:pending', result.rows[0]);

    res.json({ success: true, photo: result.rows[0] });
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    res.status(500).json({ success: false, message: 'خطأ في رفع الصورة' });
  }
});

// الحصول على الصور المعتمدة
app.get('/api/photos/approved', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shared_photos WHERE is_approved = TRUE ORDER BY likes_count DESC, created_at DESC'
    );
    res.json({ success: true, photos: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// الحصول على الأسئلة النشطة
app.get('/api/questions/active', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1');
    res.json({ success: true, question: result.rows[0] || null });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ============= Admin Routes =============

// Middleware للتحقق من الأدمن
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'غير مصرح' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'رمز غير صالح' });
  }
};

// تسجيل دخول الأدمن
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور خاطئة' });
    }

    const admin = result.rows[0];
    const isValid = await bcrypt.compare(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور خاطئة' });
    }

    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      success: true, 
      token,
      admin: { id: admin.id, username: admin.username, fullName: admin.full_name }
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// تفعيل/إيقاف فعالية
app.post('/api/admin/activity/toggle', authenticateAdmin, async (req, res) => {
  try {
    const { activityName, isActive } = req.body;
    
    await pool.query(
      'UPDATE activity_status SET is_active = $1, updated_at = NOW() WHERE activity_name = $2',
      [isActive, activityName]
    );

    io.emit('activity:status:change', { activityName, isActive });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// الموافقة على صورة
app.post('/api/admin/photo/approve', authenticateAdmin, async (req, res) => {
  try {
    const { photoId } = req.body;
    
    const result = await pool.query(
      'UPDATE shared_photos SET is_approved = TRUE WHERE id = $1 RETURNING *',
      [photoId]
    );

    io.emit('photo:approved', result.rows[0]);

    res.json({ success: true, photo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// إرسال إشعار
app.post('/api/admin/notification/send', authenticateAdmin, async (req, res) => {
  try {
    const { title, message } = req.body;
    
    await pool.query(
      'INSERT INTO notifications (title, message) VALUES ($1, $2)',
      [title, message]
    );

    io.emit('notification', { title, message });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// إضافة سؤال
app.post('/api/admin/question/add', authenticateAdmin, async (req, res) => {
  try {
    const { questionText, options, correctAnswer } = req.body;
    
    const result = await pool.query(
      'INSERT INTO questions (question_text, options, correct_answer) VALUES ($1, $2, $3) RETURNING *',
      [questionText, JSON.stringify(options), correctAnswer]
    );

    res.json({ success: true, question: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// تفعيل سؤال
app.post('/api/admin/question/activate', authenticateAdmin, async (req, res) => {
  try {
    const { questionId } = req.body;
    
    // إيقاف جميع الأسئلة
    await pool.query('UPDATE questions SET is_active = FALSE');
    
    // تفعيل السؤال المحدد
    const result = await pool.query(
      'UPDATE questions SET is_active = TRUE WHERE id = $1 RETURNING *',
      [questionId]
    );

    io.emit('question:active', result.rows[0]);

    res.json({ success: true, question: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// إحصائيات
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const totalEmployees = await pool.query('SELECT COUNT(*) FROM employees');
    const onlineCount = onlineUsers.size;
    const totalPhotos = await pool.query('SELECT COUNT(*) FROM shared_photos WHERE is_approved = TRUE');
    const pendingPhotos = await pool.query('SELECT COUNT(*) FROM shared_photos WHERE is_approved = FALSE');
    const totalAnswers = await pool.query('SELECT COUNT(*) FROM answers');
    const correctAnswers = await pool.query('SELECT COUNT(*) FROM answers WHERE is_correct = TRUE');

    res.json({
      success: true,
      stats: {
        totalEmployees: parseInt(totalEmployees.rows[0].count),
        onlineCount,
        totalPhotos: parseInt(totalPhotos.rows[0].count),
        pendingPhotos: parseInt(pendingPhotos.rows[0].count),
        totalAnswers: parseInt(totalAnswers.rows[0].count),
        correctAnswers: parseInt(correctAnswers.rows[0].count)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// تحديث الإعدادات
app.post('/api/admin/settings/update', authenticateAdmin, async (req, res) => {
  try {
    const { key, value } = req.body;
    
    await pool.query(
      'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
      [key, value]
    );

    io.emit('settings:update', { key, value });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// الحصول على الإعدادات
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
});
