// server.js - Combined Next.js + Express Server
const express = require('express')
const next = require('next')
const http = require('http')
const { Server } = require('socket.io')
const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'  // للعمل في Railway
const port = process.env.PORT || 3000

// تهيئة Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// قاعدة البيانات
const databaseUrl = process.env.DATABASE_URL || 
  (process.env.DB_HOST 
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : null)

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found! Please set it in environment variables.')
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.includes('DB')))
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// تهيئة Multer للتخزين المحلي
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('نوع الملف غير مسموح'))
    }
  }
})

// تجهيز Next.js
app.prepare().then(() => {
  const server = express()
  const httpServer = http.createServer(server)
  
  // Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })

  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))

  // مجلد الصور
  const uploadsDir = path.join(__dirname, 'public', 'uploads')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  // تقديم الصور الثابتة (Static Files)
  server.use('/uploads', express.static(uploadsDir))

  // Socket.io handlers
  const onlineUsers = new Map()

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    socket.on('employee:connect', (data) => {
      if (data && data.employeeId) {
        onlineUsers.set(socket.id, data.employeeId);
        console.log(`✅ Employee ${data.employeeId} connected. Total online: ${onlineUsers.size}`);

        // إرسال العدد المحدث للمشرفين
        io.emit('online:count', { count: onlineUsers.size });
      }
      socket.join('employees');
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id);
      console.log(`❌ User disconnected. Total online: ${onlineUsers.size}`);

      // إرسال العدد المحدث للمشرفين
      io.emit('online:count', { count: onlineUsers.size });
    });

    // استقبال إجابة الموظف في التحدي
    socket.on('answer:submit', async (data) => {
      try {
        const { questionId, employeeId, employeeNumber, selectedAnswer, timeTaken } = data;

        if (!questionId || !employeeId || selectedAnswer === undefined) {
          socket.emit('error', { message: 'بيانات غير كاملة' });
          return;
        }

        // التحقق من أن الموظف لم يجب على هذا السؤال من قبل
        const existingAnswer = await pool.query(
          'SELECT id FROM answers WHERE employee_id = $1 AND question_id = $2',
          [employeeId, questionId]
        );

        if (existingAnswer.rows.length > 0) {
          socket.emit('answer:result', {
            error: 'already_answered',
            message: 'لقد أجبت على هذا السؤال من قبل! 🚫'
          });
          return;
        }

        const questionResult = await pool.query(
          'SELECT correct_answer FROM questions WHERE id = $1',
          [questionId]
        );

        if (questionResult.rows.length === 0) {
          socket.emit('error', { message: 'السؤال غير موجود' });
          return;
        }

        const isCorrect = selectedAnswer === questionResult.rows[0].correct_answer;

        // حفظ الإجابة في قاعدة البيانات
        await pool.query(
          'INSERT INTO answers (employee_id, employee_number, question_id, selected_answer, is_correct, time_taken) VALUES ($1, $2, $3, $4, $5, $6)',
          [employeeId, employeeNumber, questionId, selectedAnswer, isCorrect, timeTaken || 0]
        );

        console.log(`${isCorrect ? '✅' : '❌'} Employee ${employeeNumber} answered question ${questionId}: ${isCorrect ? 'Correct' : 'Wrong'}`);

        // إرسال النتيجة للموظف فقط
        socket.emit('answer:result', {
          isCorrect,
          correctAnswer: questionResult.rows[0].correct_answer
        });

        // تحديث اللوحة العامة
        io.emit('leaderboard:update');
      } catch (error) {
        console.error('❌ Error in answer:submit:', error);
        socket.emit('error', { message: 'حدث خطأ في معالجة الإجابة' });
      }
    });

    // استقبال الإعجاب بصورة (مثل انستقرام)
    socket.on('photo:like', async (data) => {
      try {
        const { photoId, employeeId } = data;

        if (!photoId || !employeeId) {
          socket.emit('error', { message: 'بيانات غير كاملة' });
          return;
        }

        // التحقق من وجود إعجاب سابق
        const existingLike = await pool.query(
          'SELECT * FROM photo_likes WHERE photo_id = $1 AND employee_id = $2',
          [photoId, employeeId]
        );

        let isLiked = false;

        if (existingLike.rows.length > 0) {
          // إلغاء الإعجاب
          await pool.query(
            'DELETE FROM photo_likes WHERE photo_id = $1 AND employee_id = $2',
            [photoId, employeeId]
          );
          await pool.query(
            'UPDATE shared_photos SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = $1',
            [photoId]
          );
          isLiked = false;
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
          isLiked = true;
        }

        // جلب الصورة المحدثة
        const photoResult = await pool.query(
          'SELECT * FROM shared_photos WHERE id = $1',
          [photoId]
        );

        if (photoResult.rows.length > 0) {
          // إرسال التحديث للجميع
          io.emit('photo:likes:update', {
            ...photoResult.rows[0],
            isLiked,
            employeeId
          });
        }
      } catch (error) {
        console.error('❌ Error in photo:like:', error);
        socket.emit('error', { message: 'حدث خطأ في الإعجاب بالصورة' });
      }
    });
  });

  // ============ API Routes ============
// جلب السؤال النشط لتحدي بلا أخطاء
  server.get('/api/questions/active', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM questions WHERE is_active = true LIMIT 1');
      if (result.rows.length > 0) {
        const question = result.rows[0];
        // Parse options if it's a string
        question.options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
        res.json({ success: true, question });
      } else {
        res.json({ success: true, question: null });
      }
    } catch (error) {
      console.error('Error fetching active question:', error);
      res.status(500).json({ success: false });
    }
  });

  // تغيير حالة الفعالية (تفعيل/تعطيل)
  server.post('/api/admin/activity/toggle', async (req, res) => {
    try {
      const { activityName, isActive } = req.body;
      await pool.query(
        'UPDATE activity_status SET is_active = $1 WHERE activity_name = $2',
        [isActive, activityName]
      );
      // إرسال تحديث لجميع المستخدمين عبر Socket
      io.emit('activity:status:change', { activityName, isActive });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  // إرسال إشعار عام للموظفين
  server.post('/api/admin/notification/send', async (req, res) => {
    try {
      const { title, message } = req.body;
      io.emit('notification', { title, message });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });
  // Employee - Get by UID
  server.get('/api/employee/:uid', async (req, res) => {
    try {
      const { uid } = req.params
      const result = await pool.query(
        'SELECT * FROM employees WHERE uid = $1',
        [uid]
      )

      if (result.rows.length > 0) {
        res.json({ success: true, employee: result.rows[0] })
      } else {
        res.json({ success: false, message: 'الموظف غير موجود' })
      }
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'خطأ في الخادم' })
    }
  })

  // Employee - Register
  server.post('/api/employee/register', async (req, res) => {
    try {
      let { uid, fullName, jobTitle } = req.body

      // إذا لم يكن هناك uid، نولد واحد تلقائياً
      if (!uid) {
        uid = 'EMP' + Date.now().toString().slice(-6)
      }

      // التحقق من أن الـ UID غير مستخدم
      const existing = await pool.query(
        'SELECT * FROM employees WHERE uid = $1',
        [uid]
      )

      if (existing.rows.length > 0) {
        return res.json({ 
          success: false, 
          message: 'هذا الرمز مستخدم مسبقاً' 
        })
      }

      // البحث عن أول رقم متاح من 1-200
      const numbersResult = await pool.query(`
        WITH RECURSIVE numbers AS (
          SELECT 1 AS num
          UNION ALL
          SELECT num + 1 FROM numbers WHERE num < 200
        )
        SELECT num FROM numbers
        WHERE num NOT IN (SELECT employee_number FROM employees)
        ORDER BY num
        LIMIT 1
      `)

      if (numbersResult.rows.length === 0) {
        return res.json({
          success: false,
          message: 'عذراً، لقد اكتمل العدد المسموح'
        })
      }

      const employeeNumber = numbersResult.rows[0].num

      // التسجيل
      const result = await pool.query(
        `INSERT INTO employees (uid, employee_number, full_name, job_title) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [uid, employeeNumber, fullName, jobTitle]
      )

      res.json({ success: true, employee: result.rows[0] })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'خطأ في التسجيل' })
    }
  })

  // Activities Status
  server.get('/api/activities/status', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM activity_status ORDER BY id')
      // إرجاع array بدلاً من object لتتوافق مع map.js
      res.json({ success: true, activities: result.rows })
    } catch (error) {
      console.error('Error fetching activities:', error)
      res.status(500).json({ success: false, error: error.message })
    }
  })

  // Photo Upload (التخزين المحلي)
  server.post('/api/photo/upload', upload.single('photo'), async (req, res) => {
    try {
      const { employeeId, employeeNumber } = req.body;
      const photoFile = req.file;

      if (!photoFile) {
        return res.status(400).json({ success: false, message: 'لم يتم رفع صورة' });
      }

      if (!employeeId || !employeeNumber) {
        return res.status(400).json({ success: false, message: 'بيانات الموظف مفقودة' });
      }

      // إنشاء اسم فريد للملف
      const filename = `photo-${employeeNumber}-${Date.now()}.jpg`;
      const filepath = path.join(uploadsDir, filename);

      // معالجة الصورة بـ Sharp (تصغير + ضغط)
      await sharp(photoFile.buffer)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(filepath);

      const imageUrl = `/uploads/${filename}`;

      const result = await pool.query(
        `INSERT INTO shared_photos (employee_id, employee_number, image_url, is_approved)
         VALUES ($1, $2, $3, false)
         RETURNING *`,
        [employeeId, employeeNumber, imageUrl]
      );

      console.log('✅ Photo uploaded:', filepath);

      res.json({
        success: true,
        photo: result.rows[0],
        message: 'تم رفع الصورة بنجاح وفي انتظار الموافقة'
      });
    } catch (error) {
      console.error('❌ Error uploading photo:', error);
      res.status(500).json({ success: false, message: 'خطأ في رفع الصورة' });
    }
  });

  // Photos - Approved
  server.get('/api/photos/approved', async (req, res) => {
    try {
      const { employeeId } = req.query

      const result = await pool.query(`
        SELECT sp.*, e.full_name, e.employee_number
        FROM shared_photos sp
        JOIN employees e ON sp.employee_id = e.id
        WHERE sp.is_approved = true
        ORDER BY sp.likes_count DESC, sp.created_at DESC
      `)

      // إذا تم توفير employeeId، جلب إعجابات المستخدم
      let userLikes = []
      if (employeeId) {
        const likesResult = await pool.query(
          'SELECT photo_id FROM photo_likes WHERE employee_id = $1',
          [employeeId]
        )
        userLikes = likesResult.rows.map(row => row.photo_id)
      }

      res.json({
        success: true,
        photos: result.rows,
        userLikes
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false })
    }
  })

  // Photos - Public (للمعرض العام - بدون تسجيل دخول)
  server.get('/api/photos/public', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT sp.*, e.full_name, e.employee_number
        FROM shared_photos sp
        JOIN employees e ON sp.employee_id = e.id
        WHERE sp.is_approved = true
        ORDER BY sp.likes_count DESC, sp.created_at DESC
      `)

      res.json({
        success: true,
        photos: result.rows
      })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false })
    }
  })

  // Admin Login
  server.post('/api/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body
      
      const result = await pool.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
      )

      if (result.rows.length === 0) {
        return res.json({ success: false, message: 'اسم المستخدم غير صحيح' })
      }

      const admin = result.rows[0]
      const isValid = await bcrypt.compare(password, admin.password_hash)

      if (!isValid) {
        return res.json({ success: false, message: 'كلمة المرور غير صحيحة' })
      }

      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET || 'tanfeethi_secret_key_2024',
        { expiresIn: '24h' }
      )

      res.json({ success: true, token, admin: { id: admin.id, username: admin.username } })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false, message: 'خطأ في الخادم' })
    }
  })

  // Admin - Stats
  server.get('/api/admin/stats', async (req, res) => {
    try {
      const employeesCount = await pool.query('SELECT COUNT(*) FROM employees')
      const photosCount = await pool.query('SELECT COUNT(*) FROM shared_photos WHERE is_approved = true')
      const pendingPhotos = await pool.query('SELECT COUNT(*) FROM shared_photos WHERE is_approved = false')
      const answersCount = await pool.query('SELECT COUNT(*) FROM answers')
      const correctAnswersCount = await pool.query('SELECT COUNT(*) FROM answers WHERE is_correct = true')

      const stats = {
        totalEmployees: parseInt(employeesCount.rows[0].count),
        onlineCount: onlineUsers.size,
        totalPhotos: parseInt(photosCount.rows[0].count),
        pendingPhotos: parseInt(pendingPhotos.rows[0].count),
        totalAnswers: parseInt(answersCount.rows[0].count),
        correctAnswers: parseInt(correctAnswersCount.rows[0].count),
        employees: parseInt(employeesCount.rows[0].count),
        photos: parseInt(photosCount.rows[0].count),
        answers: parseInt(answersCount.rows[0].count)
      }

      console.log('📊 Stats:', {
        totalAnswers: stats.totalAnswers,
        correctAnswers: stats.correctAnswers,
        onlineCount: stats.onlineCount
      })

      res.json({
        success: true,
        stats
      })
    } catch (error) {
      console.error('❌ Error fetching stats:', error)
      res.status(500).json({ success: false })
    }
  })

  // ============ Questions Management APIs ============

  // Get all questions
  server.get('/api/admin/questions', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM questions ORDER BY created_at DESC')
      // Parse options if it's a string
      const questions = result.rows.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }))
      res.json({ success: true, questions })
    } catch (error) {
      console.error('Error fetching questions:', error)
      res.status(500).json({ success: false })
    }
  })

  // Create new question
  server.post('/api/admin/questions', async (req, res) => {
    try {
      const { question_text, options, correct_answer } = req.body

      const result = await pool.query(
        `INSERT INTO questions (question_text, options, correct_answer, is_active)
         VALUES ($1, $2, $3, false)
         RETURNING *`,
        [question_text, JSON.stringify(options), correct_answer]
      )

      res.json({ success: true, question: result.rows[0] })
    } catch (error) {
      console.error('Error creating question:', error)
      res.status(500).json({ success: false })
    }
  })

  // Update question
  server.put('/api/admin/questions/:id', async (req, res) => {
    try {
      const { id } = req.params
      const { question_text, options, correct_answer } = req.body

      const result = await pool.query(
        `UPDATE questions
         SET question_text = $1, options = $2, correct_answer = $3
         WHERE id = $4
         RETURNING *`,
        [question_text, JSON.stringify(options), correct_answer, id]
      )

      res.json({ success: true, question: result.rows[0] })
    } catch (error) {
      console.error('Error updating question:', error)
      res.status(500).json({ success: false })
    }
  })

  // Toggle question active status
  server.post('/api/admin/questions/:id/toggle', async (req, res) => {
    try {
      const { id } = req.params
      const { is_active } = req.body

      // إيقاف جميع الأسئلة الأخرى إذا كان التفعيل
      if (is_active) {
        await pool.query('UPDATE questions SET is_active = false WHERE id != $1', [id])
      }

      const result = await pool.query(
        'UPDATE questions SET is_active = $1 WHERE id = $2 RETURNING *',
        [is_active, id]
      )

      res.json({ success: true, question: result.rows[0] })
    } catch (error) {
      console.error('Error toggling question:', error)
      res.status(500).json({ success: false })
    }
  })

  // Delete question
  server.delete('/api/admin/questions/:id', async (req, res) => {
    try {
      const { id } = req.params
      await pool.query('DELETE FROM questions WHERE id = $1', [id])
      res.json({ success: true })
    } catch (error) {
      console.error('Error deleting question:', error)
      res.status(500).json({ success: false })
    }
  })

  // ============ Lottery API ============

  // Get eligible employees for lottery (those with correct answers)
  server.get('/api/admin/lottery/eligible', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          e.id as employee_id,
          e.employee_number,
          e.full_name,
          e.job_title,
          COUNT(a.id) as total_answers,
          SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct_count
        FROM employees e
        LEFT JOIN answers a ON e.id = a.employee_id
        GROUP BY e.id, e.employee_number, e.full_name, e.job_title
        HAVING SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) > 0
        ORDER BY correct_count DESC
      `)

      console.log(`✅ Lottery: Found ${result.rows.length} eligible employees`)
      res.json({ success: true, employees: result.rows })
    } catch (error) {
      console.error('❌ Error fetching eligible employees:', error)
      res.status(500).json({ success: false })
    }
  })

  // ============ Leaderboard API ============

  // Get leaderboard (top employees by correct answers)
  server.get('/api/leaderboard', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          e.id as employee_id,
          e.employee_number,
          e.full_name,
          e.job_title,
          COUNT(a.id) as total_answers,
          SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) as correct_count
        FROM employees e
        LEFT JOIN answers a ON e.id = a.employee_id
        GROUP BY e.id, e.employee_number, e.full_name, e.job_title
        HAVING SUM(CASE WHEN a.is_correct THEN 1 ELSE 0 END) > 0
        ORDER BY correct_count DESC, total_answers ASC
      `)

      res.json({ success: true, leaderboard: result.rows })
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      res.status(500).json({ success: false })
    }
  })

  // ============ Photos Management APIs ============

  // Get photos (filtered)
  server.get('/api/admin/photos', async (req, res) => {
    try {
      const { filter = 'all' } = req.query

      let query = `
        SELECT sp.*, e.full_name, e.employee_number
        FROM shared_photos sp
        JOIN employees e ON sp.employee_id = e.id
      `

      if (filter === 'pending') {
        query += ' WHERE sp.is_approved = false'
      } else if (filter === 'approved') {
        query += ' WHERE sp.is_approved = true'
      }

      query += ' ORDER BY sp.created_at DESC'

      const result = await pool.query(query)
      res.json({ success: true, photos: result.rows })
    } catch (error) {
      console.error('Error fetching photos:', error)
      res.status(500).json({ success: false })
    }
  })

  // Approve/reject photo
  server.post('/api/admin/photos/:id/approve', async (req, res) => {
    try {
      const { id } = req.params
      const { is_approved } = req.body

      const result = await pool.query(
        `UPDATE shared_photos SET is_approved = $1 WHERE id = $2 RETURNING *`,
        [is_approved, id]
      )

      // إذا تم اعتماد الصورة، أرسل إشعار فوري لجميع الشاشات
      if (is_approved && result.rows.length > 0) {
        // جلب معلومات الموظف مع الصورة
        const photoWithEmployee = await pool.query(
          `SELECT sp.*, e.full_name, e.employee_number
           FROM shared_photos sp
           JOIN employees e ON sp.employee_id = e.id
           WHERE sp.id = $1`,
          [id]
        )

        if (photoWithEmployee.rows.length > 0) {
          console.log('✅ Photo approved, broadcasting to all clients:', photoWithEmployee.rows[0].id)
          io.emit('photo:approved', photoWithEmployee.rows[0])
        }
      }

      res.json({ success: true, photo: result.rows[0] })
    } catch (error) {
      console.error('Error approving photo:', error)
      res.status(500).json({ success: false })
    }
  })

  // Delete photo
  server.delete('/api/admin/photos/:id', async (req, res) => {
    try {
      const { id } = req.params

      // Get image URL to delete local file
      const photoResult = await pool.query('SELECT image_url FROM shared_photos WHERE id = $1', [id])

      if (photoResult.rows.length > 0) {
        const imageUrl = photoResult.rows[0].image_url

        // حذف الملف المحلي
        if (imageUrl && imageUrl.startsWith('/uploads/')) {
          try {
            const filename = imageUrl.replace('/uploads/', '')
            const filepath = path.join(uploadsDir, filename)

            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath)
              console.log('✅ Deleted local file:', filepath)
            }
          } catch (fileError) {
            console.error('⚠️ Could not delete local file:', fileError)
          }
        }
      }

      await pool.query('DELETE FROM shared_photos WHERE id = $1', [id])
      res.json({ success: true })
    } catch (error) {
      console.error('Error deleting photo:', error)
      res.status(500).json({ success: false })
    }
  })

  // Next.js handler (يجب أن يكون آخر شيء)
  server.all('*', (req, res) => {
    return handle(req, res)
  })

  // Start server
  httpServer.listen(port, () => {
    console.log(`✅ Server ready on http://${hostname}:${port}`)
    console.log(`✅ Next.js ${dev ? 'development' : 'production'} mode`)
  })

  // Database connection test
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ Database connection failed:', err)
    } else {
      console.log('✅ Database connected:', res.rows[0].now)
    }
  })
})
