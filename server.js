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

// تهيئة Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
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

  // Socket.io handlers
  const onlineUsers = new Map()

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id)

    socket.on('employee:connect', (employeeData) => {
      onlineUsers.set(socket.id, employeeData)
      io.emit('users:online', onlineUsers.size)
    })

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.id)
      io.emit('users:online', onlineUsers.size)
    })
  })

  // ============ API Routes ============

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
      const result = await pool.query('SELECT * FROM activity_status')
      const activities = {}
      result.rows.forEach(row => {
        activities[row.activity_name] = row.is_active
      })
      res.json({ success: true, activities })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ success: false })
    }
  })

  // Photos - Approved
  server.get('/api/photos/approved', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT sp.*, e.full_name, e.employee_number
        FROM shared_photos sp
        JOIN employees e ON sp.employee_id = e.id
        WHERE sp.is_approved = true
        ORDER BY sp.likes_count DESC, sp.created_at DESC
      `)
      res.json({ success: true, photos: result.rows })
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
      const answersCount = await pool.query('SELECT COUNT(*) FROM answers')
      
      res.json({
        success: true,
        stats: {
          employees: parseInt(employeesCount.rows[0].count),
          photos: parseInt(photosCount.rows[0].count),
          answers: parseInt(answersCount.rows[0].count)
        }
      })
    } catch (error) {
      console.error('Error:', error)
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
