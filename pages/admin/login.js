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
    <div
      className="min-h-screen flex flex-col p-6"
      style={{
        backgroundImage: 'url(/bg/newbg.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat'
      }}
    >
      <div className="flex justify-center py-8">
        <div className="w-32 h-32 relative">
          <Image
            src="/logo.svg"
            alt="شعار التنفيذي"
            fill
            className="object-contain"
          />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full"
      >
        <div className="mb-8 p-8 rounded-3xl" style={{background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(201,169,97,0.3)'}}>
          <h1 className="text-3xl font-bold text-center mb-2" style={{color: 'white'}}>
            لوحة التحكم
          </h1>
          <p className="text-center mb-8" style={{color: 'rgba(255,255,255,0.7)'}}>
            فعالية المدرج البشري - التنفيذي
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold mb-2" style={{color: 'white'}}>
                اسم المستخدم
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-4 rounded-xl focus:outline-none text-lg transition-colors"
                style={{
                  border: '2px solid #ce7b5b',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'white'
                }}
                placeholder="أدخل اسم المستخدم"
                disabled={isLoading}
                required
              />
            </div>
                كلمة المرور
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="أدخل كلمة المرور"
            {error && (
              <div className="px-4 py-3 rounded-xl" style={{background: 'rgba(255,51,51,0.2)', color: '#ff6666', border: '1px solid #ff3333'}}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full font-bold text-xl transition-all disabled:opacity-50 hover:bg-[#ce7b5b] hover:text-black"
              style={{
                background: '#000000',
                color: '#ce7b5b'
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
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
        <p className="text-center mt-6 text-sm" style={{color: 'rgba(255,255,255,0.6)'}}>
          مخصص للمشرفين فقط
        </p>
      </motion.div>
    </div>
  )
}
