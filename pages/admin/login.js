import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Lock, User } from 'lucide-react'
import Image from 'next/image'

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('admin_info', JSON.stringify(data.admin))
        router.push('/admin/dashboard')
      } else {
        setError(data.message || 'فشل تسجيل الدخول')
      }
    } catch (error) {
      console.error('خطأ:', error)
      setError('حدث خطأ في الاتصال')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tanfeethi-brown to-tanfeethi-brown-dark flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* الشعار */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 relative">
              <Image 
                src="/logo.png" 
                alt="التنفيذي" 
                fill
                className="object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-tanfeethi-brown text-center mb-2">
            لوحة التحكم
          </h1>
          <p className="text-center text-gray-600 mb-8">
            فعالية المدرج البشري - التنفيذي
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-tanfeethi-brown font-semibold mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:border-tanfeethi-turquoise focus:outline-none"
                  placeholder="أدخل اسم المستخدم"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-tanfeethi-brown font-semibold mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-12 pl-4 py-4 border-2 border-gray-200 rounded-xl focus:border-tanfeethi-turquoise focus:outline-none"
                  placeholder="أدخل كلمة المرور"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tanfeethi-brown hover:bg-tanfeethi-brown-dark text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 ml-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جارٍ تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/80 mt-6 text-sm">
          مخصص للمشرفين فقط
        </p>
      </motion.div>
    </div>
  )
}
