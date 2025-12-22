# API Documentation 🔌

Base URL: `http://localhost:3001/api`

## Authentication 🔐

معظم نقاط النهاية العامة لا تحتاج مصادقة. نقاط نهاية الأدمن تحتاج JWT Token.

### Admin Authentication Header:
```
Authorization: Bearer <jwt_token>
```

---

## Public Endpoints 🌐

### 1. Register Employee
**POST** `/employee/register`

#### Request Body:
```json
{
  "uid": "EMP001",
  "fullName": "محمد أحمد علي",
  "jobTitle": "مدير تنفيذي"
}
```

#### Response:
```json
{
  "success": true,
  "employee": {
    "id": 1,
    "uid": "EMP001",
    "employee_number": 42,
    "full_name": "محمد أحمد علي",
    "job_title": "مدير تنفيذي",
    "created_at": "2024-01-01T10:00:00Z"
  },
  "isNew": true
}
```

---

### 2. Get Employee Info
**GET** `/employee/:uid`

#### Response:
```json
{
  "success": true,
  "employee": {
    "id": 1,
    "uid": "EMP001",
    "employee_number": 42,
    "full_name": "محمد أحمد علي",
    "job_title": "مدير تنفيذي",
    "is_online": true,
    "last_login": "2024-01-01T10:00:00Z"
  }
}
```

---

### 3. Get Activities Status
**GET** `/activities/status`

#### Response:
```json
{
  "success": true,
  "activities": [
    {
      "id": 1,
      "activity_name": "identity_mirrors",
      "is_active": true,
      "updated_at": "2024-01-01T10:00:00Z"
    },
    {
      "activity_name": "zero_error_challenge",
      "is_active": false
    }
  ]
}
```

---

### 4. Upload Photo
**POST** `/photo/upload`

#### Request (multipart/form-data):
```
photo: [file]
employeeId: 1
employeeNumber: 42
```

#### Response:
```json
{
  "success": true,
  "photo": {
    "id": 1,
    "employee_id": 1,
    "employee_number": 42,
    "image_url": "data:image/jpeg;base64,...",
    "likes_count": 0,
    "is_approved": false,
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

---

### 5. Get Approved Photos
**GET** `/photos/approved`

#### Response:
```json
{
  "success": true,
  "photos": [
    {
      "id": 1,
      "employee_number": 42,
      "image_url": "data:image/jpeg;base64,...",
      "likes_count": 15,
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 6. Get Active Question
**GET** `/questions/active`

#### Response:
```json
{
  "success": true,
  "question": {
    "id": 1,
    "question_text": "ماذا تفعل إذا تأخرت حقيبة ضيف VIP؟",
    "options": [
      "تعتذر وتنتظر",
      "تتصل بشركة الطيران فوراً",
      "تقدم حلول مؤقتة وتتابع",
      "تحيل الأمر للمدير"
    ],
    "is_active": true
  }
}
```

---

### 7. Get Settings
**GET** `/settings`

#### Response:
```json
{
  "success": true,
  "settings": {
    "primary_color": "#8B6F47",
    "secondary_color": "#40E0D0",
    "logo_url": "/logo.svg",
    "min_correct_percentage": "80"
  }
}
```

---

## Admin Endpoints 🛡️

### 1. Admin Login
**POST** `/admin/login`

#### Request Body:
```json
{
  "username": "admin",
  "password": "Tanfeethi@2024"
}
```

#### Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin",
    "fullName": "المشرف الرئيسي"
  }
}
```

---

### 2. Toggle Activity
**POST** `/admin/activity/toggle`

**Auth Required** ✅

#### Request Body:
```json
{
  "activityName": "identity_mirrors",
  "isActive": true
}
```

#### Response:
```json
{
  "success": true
}
```

---

### 3. Approve Photo
**POST** `/admin/photo/approve`

**Auth Required** ✅

#### Request Body:
```json
{
  "photoId": 1
}
```

#### Response:
```json
{
  "success": true,
  "photo": {
    "id": 1,
    "is_approved": true
  }
}
```

---

### 4. Send Notification
**POST** `/admin/notification/send`

**Auth Required** ✅

#### Request Body:
```json
{
  "title": "توجه للصورة الجماعية",
  "message": "الرجاء التوجه لمنطقة التصوير الآن"
}
```

#### Response:
```json
{
  "success": true
}
```

---

### 5. Add Question
**POST** `/admin/question/add`

**Auth Required** ✅

#### Request Body:
```json
{
  "questionText": "ماذا تفعل إذا تأخرت حقيبة ضيف VIP؟",
  "options": [
    "تعتذر وتنتظر",
    "تتصل بشركة الطيران فوراً",
    "تقدم حلول مؤقتة وتتابع",
    "تحيل الأمر للمدير"
  ],
  "correctAnswer": 2
}
```

#### Response:
```json
{
  "success": true,
  "question": {
    "id": 1,
    "question_text": "...",
    "options": [...],
    "correct_answer": 2
  }
}
```

---

### 6. Activate Question
**POST** `/admin/question/activate`

**Auth Required** ✅

#### Request Body:
```json
{
  "questionId": 1
}
```

#### Response:
```json
{
  "success": true,
  "question": {
    "id": 1,
    "is_active": true
  }
}
```

---

### 7. Get Stats
**GET** `/admin/stats`

**Auth Required** ✅

#### Response:
```json
{
  "success": true,
  "stats": {
    "totalEmployees": 150,
    "onlineCount": 120,
    "totalPhotos": 85,
    "pendingPhotos": 12,
    "totalAnswers": 450,
    "correctAnswers": 320
  }
}
```

---

### 8. Update Settings
**POST** `/admin/settings/update`

**Auth Required** ✅

#### Request Body:
```json
{
  "key": "primary_color",
  "value": "#8B6F47"
}
```

#### Response:
```json
{
  "success": true
}
```

---

## WebSocket Events 🔌

### Connection
```javascript
socket.emit('employee:connect', {
  employeeId: 1,
  employeeNumber: 42
})
```

---

### Share Photo
```javascript
socket.emit('photo:share', {
  employeeId: 1,
  employeeNumber: 42,
  imageData: 'data:image/jpeg;base64,...'
})
```

---

### Like Photo
```javascript
socket.emit('photo:like', {
  photoId: 1,
  employeeId: 1
})
```

---

### Submit Answer
```javascript
socket.emit('answer:submit', {
  questionId: 1,
  employeeId: 1,
  employeeNumber: 42,
  selectedAnswer: 2,
  timeTaken: 15
})
```

---

### Receive Events

#### Photo Approved
```javascript
socket.on('photo:approved', (photo) => {
  console.log('Photo approved:', photo)
})
```

#### Photo Likes Updated
```javascript
socket.on('photo:likes:update', (photo) => {
  console.log('Likes updated:', photo.likes_count)
})
```

#### Answer Result
```javascript
socket.on('answer:result', (result) => {
  console.log('Correct:', result.isCorrect)
  console.log('Correct answer:', result.correctAnswer)
})
```

#### Activity Status Changed
```javascript
socket.on('activity:status:change', (data) => {
  console.log('Activity:', data.activityName, 'Active:', data.isActive)
})
```

#### Notification Received
```javascript
socket.on('notification', (notification) => {
  console.log('Title:', notification.title)
  console.log('Message:', notification.message)
})
```

#### Users Count Updated
```javascript
socket.on('users:count', (count) => {
  console.log('Online users:', count)
})
```

#### Question Activated
```javascript
socket.on('question:active', (question) => {
  console.log('New question:', question)
})
```

#### Settings Updated
```javascript
socket.on('settings:update', (setting) => {
  console.log('Setting updated:', setting.key, '=', setting.value)
})
```

---

## Error Responses ❌

### Standard Error Format:
```json
{
  "success": false,
  "message": "وصف الخطأ بالعربية"
}
```

### HTTP Status Codes:
- `200` - نجاح
- `400` - طلب غير صالح
- `401` - غير مصرح
- `404` - غير موجود
- `500` - خطأ في الخادم

---

## Rate Limiting ⏱️

- معظم النقاط: 100 طلب/دقيقة
- رفع الصور: 10 صورة/دقيقة للموظف الواحد
- الإشعارات: 5 إشعارات/دقيقة

---

## Testing with cURL 🧪

### Register Employee:
```bash
curl -X POST http://localhost:3001/api/employee/register \
  -H "Content-Type: application/json" \
  -d '{"uid":"TEST001","fullName":"اختبار","jobTitle":"موظف"}'
```

### Get Activities:
```bash
curl http://localhost:3001/api/activities/status
```

### Admin Login:
```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Tanfeethi@2024"}'
```

### Toggle Activity (with auth):
```bash
curl -X POST http://localhost:3001/api/admin/activity/toggle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"activityName":"identity_mirrors","isActive":true}'
```

---

## Testing with Postman 📮

1. Import collection من `/postman/tanfeethi.json`
2. Set environment variable `BASE_URL` = `http://localhost:3001`
3. Login as admin وانسخ الـ token
4. Set environment variable `ADMIN_TOKEN`
5. جرّب جميع النقاط

---

**Happy Coding! 🚀**
