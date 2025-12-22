import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Heart, MapPin, ArrowRight } from 'lucide-react'

export default function HospitalityPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)

  useEffect(() => {
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    if (!storedEmployee) {
      router.push('/')
      return
    }
    setEmployee(JSON.parse(storedEmployee))
  }, [])

  if (!employee) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 to-orange-500 flex flex-col">
      <div className="p-4 flex items-center justify-between bg-white/10 backdrop-blur">
        <button
          onClick={() => router.push('/map')}
          className="text-white"
        >
          ← رجوع
        </button>
        <h1 className="text-white font-bold text-xl">فن الإكرام</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-8"
        >
          <Heart size={64} />
        </motion.div>

        <h2 className="text-4xl font-bold mb-4 text-center">
          فن الإكرام ✨
        </h2>

        <p className="text-xl text-center mb-8 opacity-90 max-w-md">
          شارك في سباق جماعي مثير باستخدام iPad
          <br />
          وشاشات العرض عالية الدقة
        </p>

        <div className="bg-white/20 rounded-2xl p-6 mb-8 w-full max-w-sm">
          <div className="flex items-start gap-3 mb-4">
            <MapPin size={24} className="flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">موقع الفعالية</h3>
              <p className="opacity-90">المنطقة التفاعلية - الجانب الغربي من القاعة</p>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <h4 className="font-bold mb-2">التعليمات:</h4>
            <ul className="space-y-2 opacity-90 text-sm">
              <li>• توجه إلى منطقة الفعالية</li>
              <li>• انضم إلى فريقك</li>
              <li>• اتبع التعليمات على الشاشة</li>
              <li>• تنافس مع الفرق الأخرى</li>
            </ul>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/map')}
          className="bg-white text-red-600 font-bold text-xl px-12 py-4 rounded-full shadow-2xl hover:bg-gray-100 transition-colors"
        >
          عودة للخريطة
        </motion.button>

        <button
          onClick={() => router.push('/finale')}
          className="mt-6 text-white/80 hover:text-white flex items-center gap-2"
        >
          التالي: الصورة الجماعية
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  )
}
