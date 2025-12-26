import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import {
  Users, Image as ImageIcon, Brain, Settings, Bell,
  Activity, TrendingUp, CheckCircle, XCircle, LogOut, Gift, Trash2
} from 'lucide-react'

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState({})
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const adminInfo = localStorage.getItem('admin_info')
    
    if (!token || !adminInfo) {
      router.push('/admin/login')
      return
    }

    setAdmin(JSON.parse(adminInfo))
    fetchStats()
    fetchActivities()

    // تحديث كل 5 ثواني
    const interval = setInterval(() => {
      fetchStats()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error)
    }
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities/status')
      const data = await response.json()
      if (data.success) {
        const statusMap = {}
        data.activities.forEach(activity => {
          statusMap[activity.activity_name] = activity.is_active
        })
        setActivities(statusMap)
      }
    } catch (error) {
      console.error('خطأ في جلب الفعاليات:', error)
    }
  }

  const toggleActivity = async (activityName) => {
    try {
      const token = localStorage.getItem('admin_token')
      const newStatus = !activities[activityName]
      
      const response = await fetch('/api/admin/activity/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activityName, isActive: newStatus })
      })

      if (response.ok) {
        setActivities(prev => ({ ...prev, [activityName]: newStatus }))
      }
    } catch (error) {
      console.error('خطأ في تبديل الفعالية:', error)
    }
  }

  const sendNotification = async () => {
    const title = prompt('عنوان الإشعار:')
    if (!title) return

    const message = prompt('نص الإشعار:')
    if (!message) return

    try {
      const token = localStorage.getItem('admin_token')
      await fetch('/api/admin/notification/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, message })
      })
      alert('تم إرسال الإشعار بنجاح!')
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error)
      alert('فشل إرسال الإشعار')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_info')
    router.push('/admin/login')
  }

  if (!admin || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tanfeethi-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tanfeethi-brown font-semibold">جارٍ التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: '#F3F0EE'}}>
      {/* Header */}
      <div className="text-white p-4 shadow-lg" style={{background: '#234024'}}>
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم - التنفيذي</h1>
            <p className="text-sm opacity-80">مرحباً، {admin.fullName || admin.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{background: 'rgba(255,255,255,0.2)'}}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
          >
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="إجمالي الموظفين"
            value={stats.totalEmployees}
            icon={<Users size={32} />}
            color="bg-blue-500"
          />
          <StatCard
            title="المتصلون حالياً"
            value={stats.onlineCount}
            icon={<Activity size={32} />}
            color="bg-green-500"
            isLive
          />
          <StatCard
            title="الصور المعتمدة"
            value={stats.totalPhotos}
            icon={<ImageIcon size={32} />}
            color="bg-purple-500"
          />
          <StatCard
            title="الإجابات الصحيحة"
            value={stats.correctAnswers}
            subtitle={`من ${stats.totalAnswers}`}
            icon={<CheckCircle size={32} />}
            color="bg-emerald-500"
          />
        </div>

        {/* Activities Control */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6" style={{color: '#234024'}}>
            التحكم في الفعاليات
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: 'identity_mirrors', name: 'مرايا الهوية', icon: '📸' },
              { id: 'zero_error_challenge', name: 'تحدي بلا أخطاء', icon: '🎯' },
              { id: 'art_of_hospitality', name: 'فن الإكرام', icon: '✨' },
              { id: 'final_photo', name: 'الصورة الجماعية', icon: '📷' }
            ].map(activity => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border-2 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activity.icon}</span>
                  <span className="font-semibold text-lg">{activity.name}</span>
                </div>
                
                <button
                  onClick={() => toggleActivity(activity.id)}
                  className={`px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 ${
                    activities[activity.id]
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {activities[activity.id] ? 'مفعّل' : 'معطّل'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <ActionCard
            title="إدارة الموظفين"
            icon={<Users size={40} />}
            color="bg-emerald-500"
            badge={stats.totalEmployees}
            onClick={() => router.push('/admin/employees')}
          />
          <ActionCard
            title="إرسال إشعار"
            icon={<Bell size={40} />}
            color="bg-blue-500"
            onClick={sendNotification}
          />
          <ActionCard
            title="إدارة الأسئلة"
            icon={<Brain size={40} />}
            color="bg-purple-500"
            onClick={() => router.push('/admin/questions')}
          />
          <ActionCard
            title="الصور المعلقة"
            icon={<ImageIcon size={40} />}
            color="bg-orange-500"
            badge={stats.pendingPhotos}
            onClick={() => router.push('/admin/photos')}
          />
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ActionCard
            title="قرعة الفائزين"
            icon={<Gift size={40} />}
            color="bg-gradient-to-r from-yellow-400 to-orange-500"
            onClick={() => router.push('/admin/lottery')}
          />
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
            ⚠️ منطقة الخطر
          </h3>
          <p className="text-red-600 mb-4">
            استخدم هذه الأدوات بحذر شديد - العمليات لا يمكن التراجع عنها
          </p>
          <button
            onClick={() => router.push('/admin/reset-data')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <Trash2 size={20} />
            مسح جميع البيانات (تحضير للفعالية)
          </button>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, color, isLive }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} text-white p-3 rounded-xl`}>
          {icon}
        </div>
        {isLive && (
          <div className="flex items-center gap-1 text-green-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold">مباشر</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </motion.div>
  )
}

function ActionCard({ title, icon, color, badge, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${color} text-white rounded-2xl shadow-lg p-6 relative overflow-hidden`}
    >
      {badge > 0 && (
        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </div>
      )}
      <div className="flex flex-col items-center">
        {icon}
        <h3 className="text-xl font-bold mt-4">{title}</h3>
      </div>
    </motion.button>
  )
}
