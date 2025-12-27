import { useRouter } from 'next/router'
import { ArrowRight } from 'lucide-react'

export default function EventMapPage() {
  const router = useRouter()

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
          className="flex items-center gap-2"
          style={{color: 'white'}}
        >
          <ArrowRight size={20} strokeWidth={1.5} />
          <span className="font-bold">رجوع</span>
        </button>
        <h1 className="text-xl font-bold" style={{color: '#ce7b5b'}}>
           خريطة الفعالية
        </h1>
        {/* <button
          onClick={() => window.location.href = '/interactive-map.html'}
          className="px-3 py-2 rounded-lg text-white font-bold text-sm transition-all hover:scale-105"
          style={{background: '#AB8025'}}
        >
          خريطة HTML
        </button> */}
      </div>

      {/* Map Container - Scrollable */}
      <div
        className="relative w-full h-[calc(100vh-72px)] overflow-auto bg-gradient-to-br from-gray-900 to-gray-800"
        style={{
          scrollBehavior: 'smooth'
        }}
        ref={(el) => {
          if (el) {
            // Start from middle-bottom (like the image shows)
            el.scrollTop = (el.scrollHeight - el.clientHeight) * 0.65;
            el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
          }
        }}
      >
        <div className="inline-block min-w-full min-h-full p-2">
          <div className="relative mx-auto shadow-2xl rounded-xl overflow-hidden" style={{width: '1920px', height: '1080px'}}>
            {/* Map Image */}
            <img
              src="/event-map.jpg"
              alt="خريطة الفعالية"
              className="w-full h-full select-none"
              style={{objectFit: 'contain'}}
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}