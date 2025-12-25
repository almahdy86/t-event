import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, ArrowRight } from 'lucide-react'

export default function EventMapPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState(null)

  const locations = [
    {
      id: 'signin-sessions',
      name: 'سين جيم جلسات',
      coords: { x: 85, y: 24 },
      color: '#9C7DDE',
      description: 'منطقة الجلسات والحوار المفتوح'
    },
    {
      id: 'main-gate',
      name: 'البوابة الخارجية والممر',
      coords: { x: 49, y: 50 },
      color: '#CE7B5B',
      description: 'مدخل الفعالية الرئيسي'
    },
    {
      id: 'reception',
      name: 'الاستقبال',
      coords: { x: 54, y: 45 },
      color: '#AB8025',
      description: 'منطقة استقبال الضيوف'
    },
    {
      id: 'hospitality-journey',
      name: 'رحلة الحفاوة',
      coords: { x: 56, y: 38 },
      color: '#234024',
      description: 'تجربة الضيافة السعودية'
    },
    {
      id: 'signage',
      name: 'اللوح الإرشادية',
      coords: { x: 43, y: 42 },
      color: '#9C7DDE',
      description: 'لوحات إرشادية للتوجيه'
    },
    {
      id: 'hospitality-mark',
      name: 'بصمة الضيافة',
      coords: { x: 55, y: 30 },
      color: '#CE7B5B',
      description: 'منطقة التفاعل مع الضيافة'
    },
    {
      id: 'art-of-hospitality',
      name: 'فن الإكرام',
      coords: { x: 60, y: 25 },
      color: '#AB8025',
      description: 'ورشة فن الإكرام',
      activity: true
    },
    {
      id: 'zero-error',
      name: 'خدمة بلا أخطاء',
      coords: { x: 51, y: 22 },
      color: '#CE7B5B',
      description: 'تحدي الخدمة بلا أخطاء',
      activity: true
    },
    {
      id: 'identity-mirrors',
      name: 'مرايا الهوية الحرفيين',
      coords: { x: 43, y: 23 },
      color: '#9C7DDE',
      description: 'ركن التصوير والهوية',
      activity: true
    },
    {
      id: 'tent-sessions',
      name: 'الخيمة - جلسات',
      coords: { x: 35, y: 26 },
      color: '#234024',
      description: 'خيمة الجلسات الجانبية'
    },
    {
      id: 'photo-wall',
      name: 'جدار التصوير',
      coords: { x: 45, y: 37 },
      color: '#AB8025',
      description: 'جدار التصوير التذكاري'
    },
    {
      id: 'music-stage',
      name: 'منصة الموسيقى (الكورال)',
      coords: { x: 29, y: 33 },
      color: '#9C7DDE',
      description: 'منصة العروض الموسيقية'
    },
    {
      id: 'screen',
      name: 'الشاشة',
      coords: { x: 26, y: 22 },
      color: '#CE7B5B',
      description: 'شاشة العرض الرئيسية'
    },
    {
      id: 'dinner-area',
      name: 'منطقة العشاء',
      coords: { x: 47, y: 13 },
      color: '#AB8025',
      description: 'منطقة تناول العشاء'
    },
    {
      id: 'launch-area',
      name: 'منطقة التدشين',
      coords: { x: 30, y: 23 },
      color: '#234024',
      description: 'منطقة تدشين الفعالية'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: '#F3F0EE'}}>
      {/* Header */}
      <div className="bg-white shadow-lg p-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/map')}
          className="flex items-center gap-2"
          style={{color: '#000000'}}
        >
          <ArrowRight size={20} />
          <span className="font-bold">رجوع</span>
        </button>
        <h1 className="text-xl font-bold" style={{color: '#000000'}}>
          🗺️ خريطة الفعالية
        </h1>
        <button
          onClick={() => window.location.href = '/interactive-map.html'}
          className="px-3 py-2 rounded-lg text-white font-bold text-sm transition-all hover:scale-105"
          style={{background: '#9C7DDE'}}
        >
          خريطة HTML
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[calc(100vh-72px)] overflow-auto">
        <div className="relative min-w-[1920px] min-h-[1080px] w-full h-full">
          {/* Background Image */}
          <img
            src="/event-map.jpg"
            alt="خريطة الفعالية"
            className="w-full h-full object-contain"
          />

          {/* Interactive Points */}
          {locations.map((location) => (
            <motion.div
              key={location.id}
              className="absolute cursor-pointer"
              style={{
                left: `${location.coords.x}%`,
                top: `${location.coords.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedLocation(location)}
            >
              {/* Pulse Animation */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: location.color,
                  opacity: 0.3
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Main Pin */}
              <div
                className="relative w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                style={{background: location.color}}
              >
                <MapPin size={24} color="white" />
                {location.activity && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full" style={{background: '#AB8025'}}>
                    <span className="text-white text-xs">!</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <div
                className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md whitespace-nowrap text-sm font-bold"
                style={{color: '#000000'}}
              >
                {location.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Location Details Modal */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4"
            onClick={() => setSelectedLocation(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="p-6 text-white relative"
                style={{background: selectedLocation.color}}
              >
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{background: 'rgba(255,255,255,0.2)'}}
                >
                  <X size={20} />
                </button>

                <div className="pt-8">
                  <MapPin size={48} className="mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-center">
                    {selectedLocation.name}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-lg mb-6" style={{color: '#000000'}}>
                  {selectedLocation.description}
                </p>

                {selectedLocation.activity && (
                  <div className="rounded-2xl p-4 mb-4" style={{background: '#FFF3E0'}}>
                    <p className="text-sm font-bold" style={{color: '#AB8025'}}>
                      🎯 نشاط تفاعلي
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedLocation(null)}
                  className="w-full py-3 rounded-xl font-bold text-white transition-all"
                  style={{background: selectedLocation.color}}
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-lg p-4 max-w-xs">
        <h3 className="font-bold mb-3" style={{color: '#000000'}}>
          دليل الألوان:
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{background: '#9C7DDE'}}></div>
            <span style={{color: '#000000'}}>منطقة خدمات</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{background: '#CE7B5B'}}></div>
            <span style={{color: '#000000'}}>أنشطة رئيسية</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{background: '#AB8025'}}></div>
            <span style={{color: '#000000'}}>مرافق عامة</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{background: '#234024'}}></div>
            <span style={{color: '#000000'}}>جلسات خاصة</span>
          </div>
        </div>
      </div>
    </div>
  )
}
