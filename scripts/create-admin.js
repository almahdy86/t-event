// scripts/create-admin.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'tanfeethi_event',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function createAdmin() {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'Tanfeethi@2024';
    const fullName = process.argv[4] || 'المشرف الرئيسي';

    console.log('جارٍ إنشاء حساب المشرف...');
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO admins (username, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, username, full_name',
      [username, hashedPassword, fullName]
    );

    console.log('\n✅ تم إنشاء حساب المشرف بنجاح!');
    console.log('==========================================');
    console.log('اسم المستخدم:', result.rows[0].username);
    console.log('كلمة المرور:', password);
    console.log('الاسم الكامل:', result.rows[0].full_name);
    console.log('==========================================');
    console.log('\n⚠️  احفظ هذه المعلومات في مكان آمن!\n');

    await pool.end();
  } catch (error) {
    if (error.code === '23505') {
      console.error('\n❌ خطأ: اسم المستخدم موجود بالفعل\n');
    } else {
      console.error('\n❌ خطأ:', error.message, '\n');
    }
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
