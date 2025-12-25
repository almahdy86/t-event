import { useState } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, ArrowRight } from 'lucide-react'

export default function EventMapPage() {
  const router = useRouter()
  const [selectedLocation, setSelectedLocation] = useState(null)

//   const locations = [
//   {
//     id: 'signin-sessions',
//     name: 'سين جيم جلسات',
//     coords: { x: 1649, y: 386 },
//     color: '#9C7DDE',
//     description: 'منطقة الجلسات والحوار المفتوح'
//   },
//   {
//     id: 'main-gate',
//     name: 'البوابة الخارجية والممر',
//     coords: { x: 895, y: 775 },
//     color: '#CE7B5B',
//     description: 'مدخل الفعالية الرئيسي'
//   },
//   {
//     id: 'reception',
//     name: 'الاستقبال',
//     coords: { x: 1053, y: 649 },
//     color: '#AB8025',
//     description: 'منطقة استقبال الضيوف'
//   },
//   {
//     id: 'hospitality-journey',
//     name: 'رحلة الحفاوة',
//     coords: { x: 1310, y: 426 },
//     color: '#234024',
//     description: 'تجربة الضيافة السعودية'
//   },
//   {
//     id: 'zero-error',
//     name: 'خدمة بلا أخطاء',
//     coords: { x: 1138, y: 355 },
//     color: '#CE7B5B',
//     description: 'تحدي الخدمة بلا أخطاء',
//     activity: true
//   },
//   {
//     id: 'art-of-hospitality',
//     name: 'فن الإكرام',
//     coords: { x: 1129, y: 407 },
//     color: '#AB8025',
//     description: 'ورشة فن الإكرام',
//     activity: true
//   },
//   {
//     id: 'hospitality-mark',
//     name: 'بصمة الضيافة',
//     coords: { x: 1054, y: 462 },
//     color: '#CE7B5B',
//     description: 'منطقة التفاعل مع الضيافة'
//   },
//   {
//     id: 'identity-mirrors',
//     name: 'مرايا الهوية الحرفيين',
//     coords: { x: 982, y: 372 },
//     color: '#9C7DDE',
//     description: 'ركن التصوير والهوية',
//     activity: true
//   },
//   {
//     id: 'photo-wall',
//     name: 'جدار التصوير',
//     coords: { x: 848, y: 527 },
//     color: '#AB8025',
//     description: 'جدار التصوير التذكاري'
//   },
//   {
//     id: 'signage', // الستيشن في الكود الجديد
//     name: 'اللوح الإرشادية',
//     coords: { x: 720, y: 518 },
//     color: '#9C7DDE',
//     description: 'لوحات إرشادية للتوجيه'
//   },
//   {
//     id: 'music-stage', // فرقة الاوركسترا
//     name: 'منصة الموسيقى (الكورال)',
//     coords: { x: 605, y: 496 },
//     color: '#9C7DDE',
//     description: 'منصة العروض الموسيقية'
//   },
//   {
//     id: 'launch-area', // الصورة الجماعية والتدشين
//     name: 'منطقة التدشين',
//     coords: { x: 484, y: 449 },
//     color: '#234024',
//     description: 'منطقة تدشين الفعالية'
//   },
//   {
//     id: 'screen', // الشاشات
//     name: 'الشاشة',
//     coords: { x: 508, y: 366 },
//     color: '#CE7B5B',
//     description: 'شاشة العرض الرئيسية'
//   },
//   {
//     id: 'tent-sessions', // جلسات
//     name: 'الخيمة - جلسات',
//     coords: { x: 666, y: 409 },
//     color: '#234024',
//     description: 'خيمة الجلسات الجانبية'
//   },
//   {
//     id: 'dinner-area',
//     name: 'منطقة العشاء',
//     coords: { x: 825, y: 204 },
//     color: '#AB8025',
//     description: 'منطقة تناول العشاء'
//   }
// ];

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
        {/* <button
          onClick={() => window.location.href = '/interactive-map.html'}
          className="px-3 py-2 rounded-lg text-white font-bold text-sm transition-all hover:scale-105"
          style={{background: '#AB8025'}}
        >
          خريطة HTML
        </button> */}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[calc(100vh-72px)] overflow-auto bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="inline-block min-w-full min-h-full p-8">
          <div className="relative mx-auto shadow-2xl" style={{width: '1920px', height: '1080px'}}>
    <img
      src="/event-map.jpg"
      className="absolute inset-0 w-full h-full select-none"
      draggable={false}
    />
    {/* رندر النقاط هنا */}
</div>

          {/* Interactive Points */}
          {locations.map((location) => (
            <motion.div
              key={location.id}
              className="absolute cursor-pointer"
              style={{
                left: `${location.coords.x}px`,
                top: `${location.coords.y}px`,
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
                className="relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center border-4 border-white"
                style={{background: location.color}}
              >
                <MapPin size={28} color="white" strokeWidth={2.5} />
                {location.activity && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white" style={{background: '#AB8025'}}>
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
              </div>

              {/* Label */}
              <div
                className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-xl shadow-lg whitespace-nowrap text-sm font-bold border-2"
                style={{color: '#000000', borderColor: location.color}}
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
      {/* <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-5 max-w-sm border-2" style={{borderColor: '#AB8025'}}>
        <h3 className="font-bold mb-4 text-lg flex items-center gap-2" style={{color: '#000000'}}>
          <span>🎯</span>
          <span>دليل الخريطة</span>
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-gray-50">
            <div className="w-5 h-5 rounded-full shadow-md" style={{background: '#9C7DDE'}}></div>
            <span className="font-medium" style={{color: '#000000'}}>منطقة خدمات وأنشطة</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-gray-50">
            <div className="w-5 h-5 rounded-full shadow-md" style={{background: '#CE7B5B'}}></div>
            <span className="font-medium" style={{color: '#000000'}}>أنشطة رئيسية</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-gray-50">
            <div className="w-5 h-5 rounded-full shadow-md" style={{background: '#AB8025'}}></div>
            <span className="font-medium" style={{color: '#000000'}}>مرافق عامة</span>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-gray-50">
            <div className="w-5 h-5 rounded-full shadow-md" style={{background: '#234024'}}></div>
            <span className="font-medium" style={{color: '#000000'}}>جلسات خاصة</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs" style={{color: '#666'}}>
            💡 اضغط على أي نقطة لعرض التفاصيل
          </p>
        </div>
      </div> */}
    </div>
  )
}

// أضف هذا التابع داخل المكون
const handleMapClick = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  console.log(`Coords: x: ${x}, y: ${y}`);
};

// وفي كود الـ JSX، أضف الـ onClick للحاوية التي تحتوي الصورة
<div 
  className="relative mx-auto ..." 
  style={{width: '1920px', height: '1080px'}}
  onClick={handleMapClick} // <--- أضف هذا السطر
></div>