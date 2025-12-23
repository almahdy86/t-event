// scripts/activate-activities.js
// سكريبت لتفعيل جميع الفعاليات

const { Pool } = require('pg');

const databaseUrl = process.env.DATABASE_URL ||
  (process.env.DB_HOST
    ? `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    : null);

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function activateAllActivities() {
  try {
    console.log('🔄 جارٍ تفعيل جميع الفعاليات...\n');

    // تفعيل جميع الفعاليات
    await pool.query("UPDATE activity_status SET is_active = true, updated_at = CURRENT_TIMESTAMP");

    // عرض النتيجة
    const result = await pool.query('SELECT * FROM activity_status ORDER BY id');

    console.log('✅ تم تفعيل جميع الفعاليات بنجاح!\n');
    console.log('═══════════════════════════════════════════════════');

    result.rows.forEach((activity) => {
      const status = activity.is_active ? '✅ مفعّل' : '❌ معطّل';
      console.log(`${status}  ${activity.activity_name}`);
    });

    console.log('═══════════════════════════════════════════════════\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    await pool.end();
    process.exit(1);
  }
}

activateAllActivities();