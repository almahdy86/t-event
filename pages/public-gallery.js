import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Trophy, Camera, Sparkles } from 'lucide-react'
import io from 'socket.io-client'

export default function PublicGalleryPage() {
  const [photos, setPhotos] = useState([])
  const [socket, setSocket] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [filter, setFilter] = useState('all') // all, top

  useEffect(() => {
    fetchPhotos()

    // Socket connection for real-time updates
    const newSocket = io()
    setSocket(newSocket)

    // تحديث عداد الإعجابات
    newSocket.on('photo:likes:update', (updatedPhoto) => {
      setPhotos(prev =>
        prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
      )
    })

    // إضافة صورة معتمدة فوراً (تحديث فوري!)
    newSocket.on('photo:approved', (approvedPhoto) => {
      console.log('✅ New photo approved:', approvedPhoto)
      setPhotos(prev => [approvedPhoto, ...prev])
    })

    // تحديث عام عند رفع صورة جديدة
    newSocket.on('photo:new', () => {
      fetchPhotos()
    })

    return () => newSocket.close()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos/public')
      const data = await response.json()
      if (data.success) {
        setPhotos(data.photos)
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  // ترتيب الصور: الأكثر إعجاباً أولاً (6 صور) ثم الباقي بالترتيب الزمني
  const getDisplayedPhotos = () => {
    if (filter === 'top') {
      return photos.filter(p => p.likes_count > 0).sort((a, b) => b.likes_count - a.likes_count).slice(0, 10)
    }

    // فصل الصور حسب الإعجابات
    const sortedByLikes = [...photos].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
    const top6 = sortedByLikes.slice(0, 6) // أفضل 6 صور
    const top6Ids = new Set(top6.map(p => p.id))
    const remaining = photos.filter(p => !top6Ids.has(p.id)) // باقي الصور بالترتيب الأصلي

    return [...top6, ...remaining]
  }

  const displayedPhotos = getDisplayedPhotos()

  return (
    <div className="min-h-screen py-6 px-2 relative" style={{
      backgroundImage: 'url(/bg/newbg.png)',
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <div className="fixed inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
      {/* Header */}
      <div className="w-full mb-6 relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Camera className="w-16 h-16 mx-auto mb-4" strokeWidth={1.5} style={{color: '#CE7B5B'}} />
          <h1 className="text-4xl font-black mb-2" style={{color: '#ffffffff'}}>
             معرض صور الفعالية
          </h1>
          <p className="text-lg" style={{color: '#ce7b5b'}}>
            صور مشاركينا الرائعة
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setFilter('all')}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:bg-[#ce7b5b] hover:text-black"
            style={{
              background: filter === 'all' ? '#000000' : '#ce7b5b',
              color: 'white',
              boxShadow: filter === 'all' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <Camera className="inline-block w-5 h-5 ml-2" strokeWidth={1.5} />
            جميع الصور ({photos.length})
          </button>
          <button
            onClick={() => setFilter('top')}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:bg-[#ce7b5b] hover:text-black"
            style={{
              background: filter === 'top' ? '#000000' : '#ce7b5b',
              color: 'white',
              boxShadow: filter === 'top' ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <Trophy className="inline-block w-5 h-5 ml-2" strokeWidth={1.5} />
            الأكثر إعجاباً
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="w-full relative z-10">
        {photos.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
          >
            <Camera className="w-16 h-16 mx-auto mb-4" strokeWidth={1.5} style={{color: '#9C7DDE'}} />
            <p className="text-xl" style={{color: '#000000'}}>
              لا توجد صور بعد!
            </p>
            <p className="mt-2" style={{color: '#000000', opacity: 0.7}}>
              كن أول من يشارك صورة 📸
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {displayedPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer ${
                  filter === 'all' && index < 6 ? 'ring-4 ring-yellow-400' : ''
                }`}
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* Photo */}
                <div className="relative aspect-square bg-gray-200">
                  <img
                    src={photo.image_url}
                    alt={`صورة من ${photo.full_name}`}
                    className="w-full h-full object-cover"
                  />
                  {/* أيقونة التاج للصور الأكثر إعجاباً */}
                  {filter === 'all' && index < 6 && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                      👑 الأكثر إعجاباً
                    </div>
                  )}
                  {photo.likes_count > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-sm">
                      <Heart className="w-3 h-3 fill-white" strokeWidth={1.5} />
                      <span className="font-bold">{photo.likes_count}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate" style={{color: '#000000'}}>
                        {photo.full_name}
                      </h3>
                      <p className="text-xs" style={{color: '#000000', opacity: 0.6}}>
                        رقم {photo.employee_number}
                      </p>
                    </div>
                    <Heart className="w-6 h-6 flex-shrink-0" strokeWidth={1.5} style={{color: '#CE7B5B', opacity: 0.3}} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_url}
              alt={selectedPhoto.full_name}
              className="w-full max-h-[70vh] object-contain bg-gray-100"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold" style={{color: '#000000'}}>
                    {selectedPhoto.full_name}
                  </h3>
                  <p style={{color: '#000000', opacity: 0.6}}>
                    رقم {selectedPhoto.employee_number}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{background: '#ffebee'}}>
                  <Heart className="w-6 h-6 fill-red-500" strokeWidth={1.5} style={{color: '#ef5350'}} />
                  <span className="text-xl font-bold" style={{color: '#ef5350'}}>
                    {selectedPhoto.likes_count}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-full text-white py-3 rounded-xl font-bold transition-all hover:bg-[#ce7b5b] hover:text-black"
                style={{background: '#000000'}}
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Live Update Indicator */}
      <div className="fixed bottom-4 left-4 bg-white px-4 py-2 rounded-full text-sm flex items-center gap-2 shadow-lg" style={{color: '#000000'}}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full"
          style={{background: '#234024'}}
        />
        تحديث مباشر
      </div>
    </div>
  )
}
