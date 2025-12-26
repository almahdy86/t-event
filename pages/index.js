import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Button from '@/components/Button'
import Card from '@/components/Card'

export default function Home() {
  const router = useRouter()
  const { uid } = router.query
  
  const [step, setStep] = useState('loading')
  const [employee, setEmployee] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    jobTitle: '',
    employeeType: '' // مجلس_الإدارة, موظف, ضيف
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!router.isReady) return
    
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    
    if (storedEmployee) {
      const emp = JSON.parse(storedEmployee)
      setEmployee(emp)
      router.push('/map')
      return
    }
    
    if (uid) {
      checkEmployee(uid)
    } else {
      setStep('register')
    }
  }, [router.isReady, uid])

  const checkEmployee = async (userId) => {
    try {
      const response = await fetch(`/api/employee/${userId}`)
      const data = await response.json()

      if (data.success) {
        setEmployee(data.employee)
        setStep('redirect')
        localStorage.setItem('tanfeethi_employee', JSON.stringify(data.employee))
        
        const lastPage = localStorage.getItem('tanfeethi_last_page')
        
        setTimeout(() => {
          if (lastPage && lastPage !== '/') {
            router.push(lastPage)
          } else {
            router.push('/map')
          }
        }, 2000)
      } else {
        setStep('register')
      }
    } catch (error) {
      console.error('خطأ في التحقق:', error)
      setError('حدث خطأ في الاتصال')
      setStep('register')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.fullName.trim() || !formData.employeeType) {
      setError('يرجى ملء جميع الحقول')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/employee/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          employeeType: formData.employeeType
        })
      })

      const data = await response.json()

      if (data.success) {
        setEmployee(data.employee)
        localStorage.setItem('tanfeethi_employee', JSON.stringify(data.employee))
        
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100])
        }
        
        setStep('success')
        
        setTimeout(() => {
          router.push('/map')
        }, 3000)
      } else {
        setError(data.message || 'حدث خطأ في التسجيل')
      }
    } catch (error) {
      console.error('خطأ في التسجيل:', error)
      setError('حدث خطأ في الاتصال')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#F3F0EE'}}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-semibold">جارٍ التحميل...</p>
        </div>
      </div>
    )
  }

  if (step === 'redirect') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background: '#F3F0EE'}}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6" style={{background: '#234024'}}>
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-2">
            أهلاً بعودتك! 👋
          </h2>
          <p className="text-xl text-black mb-4">
            {employee?.full_name}
          </p>
          <div className="inline-block text-white px-8 py-3 rounded-full text-2xl font-bold" style={{background: '#9C7DDE'}}>
            #{employee?.employee_number}
          </div>
          <p className="mt-4 text-black">
            جارٍ التوجيه...
          </p>
        </motion.div>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background: '#F3F0EE'}}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-center"
        >
          <div className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow" style={{background: '#234024'}}>
            <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-black mb-4"
          >
            مرحباً بك في فعالية التنفيذي! 🎉
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <p className="text-xl text-black mb-2">{employee?.full_name}</p>
            <p className="text-lg text-black mb-4">{employee?.job_title}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className="mb-6"
          >
            <div className="inline-block text-white px-12 py-6 rounded-2xl shadow-2xl" style={{background: '#CE7B5B'}}>
              <p className="text-sm mb-2">رقمك في الفعالية</p>
              <p className="text-6xl font-bold">#{employee?.employee_number}</p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-black"
          >
            احفظ هذا الرقم جيداً!
            <br />
            ستحتاجه في نهاية الفعالية
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col p-6"
      style={{
        backgroundImage: 'url(/bg/BG%2001.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="flex justify-center py-8">
        <div className="w-32 h-32 relative">
          <Image
            src="/logo.png"
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
        <Card className="mb-8">
          <h1 className="text-3xl font-bold text-black text-center mb-2">
            أهلاً بك! 👋
          </h1>
          <p className="text-center text-black mb-8">
            يرجى تأكيد بياناتك للمتابعة
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-black font-semibold mb-2">
                الاسم الثلاثي
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-4 border-2 rounded-xl focus:outline-none text-lg transition-colors text-black"
                style={{borderColor: '#9C7DDE', background: 'white'}}
                placeholder="أدخل اسمك الكامل"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-black font-semibold mb-2">
               المسمى الوظيفي *
              </label>
              <select
                value={formData.employeeType}
                onChange={(e) => setFormData({ ...formData, employeeType: e.target.value, jobTitle: e.target.value })}
                className="w-full px-4 py-4 border-2 rounded-xl focus:outline-none text-lg transition-colors text-black"
                style={{borderColor: '#9C7DDE', background: 'white'}}
                disabled={isSubmitting}
                required
              >
                <option value="">اختر المسمى الوظيفي</option>
                <option value="مجلس_الإدارة">مجلس الإدارة (أرقام 1-20)</option>
                <option value="موظف">موظف (أرقام 31-400)</option>
                <option value="ضيف">ضيف (أرقام 401-440)</option>
              </select>
            </div>

            {error && (
              <div className="border px-4 py-3 rounded-xl text-black" style={{background: '#ffebee', borderColor: '#ef5350'}}>
                {error}
              </div>
            )}

            <Button variant="primary" type="submit" disabled={isSubmitting} className="w-full justify-center">
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  جارٍ التسجيل...
                </span>
              ) : (
                'تأكيد البيانات'
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-black opacity-70">
          بمسح رمز QR، أنت توافق على المشاركة في الفعالية
        </p>
      </motion.div>
    </div>
  )
}
