import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { ArrowRight, AlertTriangle, Trash2, CheckCircle } from 'lucide-react'

export default function ResetData() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: confirm, 2: deleting, 3: success
  const [confirmText, setConfirmText] = useState('')
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchStats()
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
      console.error('Error fetching stats:', error)
    }
  }

  const handleReset = async () => {
    if (confirmText !== 'مسح جميع البيانات') {
      setError('يرجى كتابة النص بشكل صحيح')
      return
    }

    setStep(2)
    setError('')

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/reset-all-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStep(3)
      } else {
        console.error('Reset failed:', data)
        setError(data.message || 'حدث خطأ في مسح البيانات')
        setStep(1)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('حدث خطأ في الاتصال: ' + error.message)
      setStep(1)
    }
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{
        backgroundImage: 'url(/bg/newbg.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}>
        <div className="absolute inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-semibold">جارٍ التحميل...</p>
        </div>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative" style={{
        backgroundImage: 'url(/bg/newbg.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}>
        <div className="absolute inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center max-w-md relative z-10"
        >
          <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: '#234024'}}>
            <CheckCircle size={80} strokeWidth={1.5} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-black mb-4">
            تم مسح جميع البيانات بنجاح! ✓
          </h2>
          <p className="text-lg text-black mb-8">
            التطبيق جاهز الآن للفعالية الجديدة
          </p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-8 py-4 rounded-xl text-white font-bold transition-all hover:scale-105 hover:bg-[#ce7b5b] hover:text-black"
            style={{background: '#000000'}}
          >
            العودة للوحة التحكم
          </button>
        </motion.div>
      </div>
    )
  }

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{
        backgroundImage: 'url(/bg/newbg.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}>
        <div className="absolute inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-semibold text-xl">جارٍ مسح البيانات...</p>
          <p className="text-black mt-2">يرجى عدم إغلاق الصفحة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative" style={{
      backgroundImage: 'url(/bg/newbg.png)',
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <div className="fixed inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
      {/* Header */}
      <div className="text-white p-4 shadow-lg relative z-10" style={{background: '#d32f2f'}}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 rounded-lg transition-colors"
              style={{background: 'rgba(255,255,255,0.1)'}}
            >
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
            <h1 className="text-2xl font-bold">⚠️ مسح جميع البيانات</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-2xl relative z-10">
        {/* Warning Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <AlertTriangle size={40} strokeWidth={1.5} className="text-red-500 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                تحذير هام جداً!
              </h2>
              <p className="text-red-700 text-lg">
                هذه العملية ستقوم بمسح <strong>جميع البيانات</strong> بشكل نهائي ولا يمكن التراجع عنها.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-black mb-4">البيانات التي سيتم مسحها:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-black font-semibold">عدد الموظفين المسجلين</span>
              <span className="text-2xl font-bold text-black">{stats.totalEmployees}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-black font-semibold">إجمالي الصور</span>
              <span className="text-2xl font-bold text-black">{stats.totalPhotos}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-black font-semibold">إجمالي الإجابات</span>
              <span className="text-2xl font-bold text-black">{stats.totalAnswers}</span>
            </div>
          </div>
        </motion.div>

        {/* Confirmation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-bold text-black mb-4">تأكيد العملية</h3>
          <p className="text-black mb-4">
            للمتابعة، يرجى كتابة النص التالي بالضبط:
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <code className="text-lg font-bold text-red-600">مسح جميع البيانات</code>
          </div>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 text-black"
            placeholder="اكتب النص هنا..."
            dir="rtl"
          />

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              disabled={confirmText !== 'مسح جميع البيانات'}
              className="flex-1 py-4 rounded-xl text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{background: '#d32f2f'}}
            >
              <Trash2 size={20} strokeWidth={1.5} />
              مسح جميع البيانات
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-6 py-4 rounded-xl font-bold transition-all"
              style={{background: '#E0E0E0', color: '#000000'}}
            >
              إلغاء
            </button>
          </div>
        </motion.div>

        <p className="text-center text-gray-600 mt-6 text-sm">
          💡 ملاحظة: سيتم الاحتفاظ بحسابات المسؤولين وإعدادات النظام
        </p>
      </div>
    </div>
  )
}
