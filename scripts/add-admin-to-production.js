// scripts/add-admin-to-production.js
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// استخدام نفس إعدادات قاعدة البيانات من المشروع
const databaseUrl = process.env.DATABASE_URL ||
  (process.env.DB_HOST
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : null);

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found! Please set it in environment variables.');
  console.log('\nتأكد من وجود ملف .env بالمتغيرات التالية:');
  console.log('DATABASE_URL=postgresql://...');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function createAdmin() {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'Tanfeethi@2024';
    const fullName = process.argv[4] || 'المشرف الرئيسي';

    console.log('\n🔄 جارٍ الاتصال بقاعدة البيانات...');

    // اختبار الاتصال
    await pool.query('SELECT NOW()');
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');

    console.log('\n🔄 جارٍ إنشاء حساب المشرف...');

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO admins (username, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, username, full_name',
      [username, hashedPassword, fullName]
    );

    console.log('\n✅ تم إنشاء حساب المشرف بنجاح!');
    console.log('==========================================');
    console.log('المعرف:', result.rows[0].id);
    console.log('اسم المستخدم:', result.rows[0].username);
    console.log('كلمة المرور:', password);
    console.log('الاسم الكامل:', result.rows[0].full_name);
    console.log('==========================================');
    console.log('\n⚠️  احفظ هذه المعلومات في مكان آمن!');
    console.log('🔗 يمكنك الآن تسجيل الدخول من: https://your-domain.com/admin/login\n');

    await pool.end();
  } catch (error) {
    if (error.code === '23505') {
      console.error('\n❌ خطأ: اسم المستخدم موجود بالفعل');
      console.log('💡 جرب اسم مستخدم آخر أو احذف الحساب القديم أولاً\n');
    } else {
      console.error('\n❌ خطأ:', error.message);
      console.error('التفاصيل:', error);
    }
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
