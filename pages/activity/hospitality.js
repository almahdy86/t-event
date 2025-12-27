import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Heart, MapPin, ArrowRight, ArrowLeft } from 'lucide-react'

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
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url(/bg/newbg.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat'
      }}
    >
      <div className="absolute inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
      <div className="p-4 flex items-center justify-between relative z-10" style={{background: '#000000'}}>
        <button
          onClick={() => router.push('/map')}
          className="font-bold"
          style={{color: 'white'}}
        >
          → رجوع
        </button>
        <h1 className="font-bold text-xl absolute left-1/2 transform -translate-x-1/2" style={{color: 'white'}}>فن الإكرام</h1>
        <div className="w-8"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-white relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
          style={{backgroundColor: 'black'}}
        >
          <Heart size={64} strokeWidth={1.5} style={{color: 'white'}} />
        </motion.div>

        <h2 className="text-4xl font-bold mb-4 text-center" style={{color: '#ce7b5b'}}>
          فن الإكرام
        </h2>

        <p className="text-xl text-center mb-8 max-w-md">
          شارك في سباق جماعي مثير باستخدام iPad
          <br />
          وشاشات العرض عالية الدقة
        </p>

        <div className="bg-black rounded-2xl p-6 mb-8 w-full max-w-sm">
          {/* <div className="flex items-start gap-3 mb-4">
            <MapPin size={24} strokeWidth={1.5} className="flex-shrink-0 mt-1" />
            {/* <div>
              <h3 className="font-bold text-lg mb-2">موقع الفعالية</h3>
              <p className="opacity-90">المنطقة التفاعلية - الجانب الغربي من القاعة</p>
            </div> *
          </div> */}

          <div className="pt-4 rounded-xl p-4" style={{backgroundColor: 'black'}}>
            <h4 className="font-bold mb-2">التعليمات:</h4>
            <ul className="space-y-2 text-sm">
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
          className="font-bold text-xl px-12 py-4 rounded-full shadow-2xl transition-all hover:bg-[#ce7b5b] hover:text-black"
          style={{background: '#000000', color: '#ce7b5b'}}
        >
          عودة للخريطة
        </motion.button>

        <button
          onClick={() => router.push('/finale')}
          className="mt-6 text-white/80 hover:text-white flex items-center gap-2"
        >
          التالي: الصورة الجماعية
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
