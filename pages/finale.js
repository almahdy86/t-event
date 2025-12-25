import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Users, ArrowRight } from 'lucide-react'

export default function FinalePage() {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [showNumber, setShowNumber] = useState(false)

  useEffect(() => {
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    if (!storedEmployee) {
      router.push('/')
      return
    }
    setEmployee(JSON.parse(storedEmployee))

    // إظهار الرقم بعد ثانية
    setTimeout(() => {
      setShowNumber(true)
      
      // اهتزاز قوي
      if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300])
      }
    }, 1000)
  }, [])

  if (!employee) return null

  if (!showNumber) {
    return (
      <div className="min-h-screen flex flex-col" style={{background: 'linear-gradient(135deg, #AB8025 0%, #CE7B5B 100%)'}}>
        {/* زر الرجوع */}
        <div className="p-4">
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}
          >
            <ArrowRight size={20} />
            رجوع
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 1 }}
            className="text-center text-white"
          >
            <Users size={100} className="mx-auto mb-6" />
            <h1 className="text-4xl font-bold">
              حان وقت الصورة الجماعية! 📸
            </h1>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #AB8025 0%, #CE7B5B 100%)'}}>
      {/* زر الرجوع */}
      <div className="p-4 z-20">
        <button
          onClick={() => router.push('/map')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
          style={{background: 'rgba(255,255,255,0.2)'}}
        >
          <ArrowRight size={20} />
          رجوع
        </button>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* الرقم الضخم */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1 }}
          className="text-center"
        >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-8"
        >
          <div className="text-9xl font-black mb-4 drop-shadow-2xl" style={{ fontSize: '12rem' }}>
            {employee.employee_number}
          </div>
          <div className="text-4xl font-bold mb-2">
            #{employee.employee_number}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/20 backdrop-blur rounded-3xl p-8 max-w-md"
        >
          <h2 className="text-3xl font-bold mb-4">
            ابحث عن رقمك! 🎯
          </h2>
          <p className="text-xl leading-relaxed">
            توجه إلى منطقة التصوير
            <br />
            وقف على الملصق الأرضي
            <br />
            رقم <span className="font-bold text-4xl">#{employee.employee_number}</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-2xl font-bold animate-pulse"
        >
          📍 المنطقة المخصصة للتصوير
        </motion.div>
        </motion.div>
      </div>

      {/* تأثيرات بصرية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => {
          const randomX = Math.random() * 100
          const randomDelay = Math.random() * 2
          const randomDuration = Math.random() * 3 + 2

          return (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white rounded-full opacity-20"
              style={{
                left: `${randomX}%`,
                top: '-20px'
              }}
              animate={{
                y: ['0vh', '100vh'],
                x: [`${randomX}%`, `${Math.random() * 100}%`]
              }}
              transition={{
                duration: randomDuration,
                repeat: Infinity,
                delay: randomDelay
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
