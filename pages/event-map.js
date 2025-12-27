import { useRouter } from 'next/router'
import { useState } from 'react'
import { ArrowRight, ZoomIn, ZoomOut, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EventMapPage() {
  const router = useRouter()
  const [zoom, setZoom] = useState(100)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 100))
  }

  const sections = [
    {
      title: 'مرايـــا الهويـــة',
      subtitle: 'MIRRORS OF IDENTITY',
      description: 'تجربة حسية تبرز بصمة الضيافة، تمكن الموظفين من التفاعل مع عناصر التراث السعودي وصناعة تذكار يعكس انتماءهم، لترسيخ الفخر بالهوية ضمن تجربة التنفيذي الفاخرة'
    },
    {
      title: 'هويتنا في تجربة',
      subtitle: 'OUR IDENTITY IN EXPERIENCE',
      description: 'تجربة تفاعلية تعزف الموظفين بهوية التنفيذي عبر اختبار قصير يضيف شخصيتهم ضمن مسارات لونية تعبر عن قيم الدقة، الفردية، الانتماء، والتميز لتشكل لوحة جماعية لهويتنا المشتركة'
    },
    {
      title: 'لحظات استثنائية',
      subtitle: 'EXTRAORDINARY MOMENTS',
      description: 'مزيج متناغم من الفعاليات التفاعلية والموسيقى الطربية'
    },
    {
      title: 'ضيافـــة • حفــاوة • إكــرام',
      subtitle: 'HOSPITALITY • HAFAWA • HONORING',
      description: 'تجربة حسية يصمم فيها الموظف بطاقة ضيافة تعكس أسلوبه الشخصي في الضيافة'
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      backgroundImage: 'url(/bg/newbg.png)',
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="shadow-lg p-4 flex items-center justify-between" style={{background: '#000000'}}>
        <button
          onClick={() => router.push('/map')}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          style={{color: 'white'}}
        >
          <ArrowRight size={20} strokeWidth={1.5} />
          <span className="font-bold">رجوع</span>
        </button>
        <h1 className="text-xl font-bold" style={{color: '#ce7b5b'}}>
          خريطة لقاء التنفيذي 2025
        </h1>
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:opacity-80"
          style={{background: '#ce7b5b', color: 'white'}}
        >
          <Info size={18} strokeWidth={1.5} />
          <span className="text-sm font-bold">دليل</span>
        </button>
      </div>

      {/* Map Container */}
      <div
        className="relative w-full h-[calc(100vh-72px)] overflow-auto bg-black"
        style={{
          scrollBehavior: 'smooth'
        }}
      >
        <div
          className="inline-block min-w-full min-h-full flex items-center justify-center p-4"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
          }}
        >
          <img
            src="/map.png"
            alt="خريطة لقاء التنفيذي 2025"
            className="max-w-full h-auto select-none shadow-2xl"
            draggable={false}
          />
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed left-4 bottom-24 flex flex-col gap-2 z-40">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{background: '#ce7b5b', color: 'white'}}
        >
          <ZoomIn size={24} strokeWidth={1.5} />
        </motion.button>
        <div className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-sm font-bold" style={{background: '#000000', color: 'white'}}>
          {zoom}%
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          disabled={zoom <= 100}
          className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{background: '#ce7b5b', color: 'white'}}
        >
          <ZoomOut size={24} strokeWidth={1.5} />
        </motion.button>
      </div>

      {/* Sliding Panel */}
      <AnimatePresence>
        {isPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPanelOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl overflow-hidden z-50"
              style={{
                background: '#000000',
                maxHeight: '80vh'
              }}
            >
              {/* Panel Handle */}
              <div className="flex items-center justify-center py-3 border-b border-white/10">
                <button
                  onClick={() => setIsPanelOpen(false)}
                  className="w-12 h-1 rounded-full"
                  style={{background: '#ce7b5b'}}
                />
              </div>

              {/* Panel Header */}
              <div className="px-4 py-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-center" style={{color: '#ce7b5b'}}>
                  دليل الفعاليات
                </h2>
              </div>

              {/* Tabs */}
              <div className="overflow-x-auto border-b border-white/10" style={{scrollbarWidth: 'none'}}>
                <div className="flex gap-2 p-3 min-w-max">
                  {sections.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className="px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all"
                      style={{
                        background: activeTab === index ? '#ce7b5b' : '#ffffff20',
                        color: activeTab === index ? 'white' : '#ffffff80'
                      }}
                    >
                      {section.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6" style={{maxHeight: 'calc(80vh - 200px)'}}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-white"
                >
                  <h3 className="text-2xl font-bold mb-2" style={{color: '#ce7b5b'}}>
                    {sections[activeTab].title}
                  </h3>
                  <p className="text-sm opacity-70 mb-4" style={{color: '#ce7b5b'}}>
                    {sections[activeTab].subtitle}
                  </p>
                  <p className="text-lg leading-relaxed opacity-90">
                    {sections[activeTab].description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
