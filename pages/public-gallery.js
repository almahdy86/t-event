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

    newSocket.on('photo:likes:update', (updatedPhoto) => {
      setPhotos(prev =>
        prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
      )
    })

    newSocket.on('photo:new', () => {
      fetchPhotos() // تحديث عند رفع صورة جديدة
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

  const displayedPhotos = filter === 'top'
    ? photos.filter(p => p.likes_count > 0).sort((a, b) => b.likes_count - a.likes_count).slice(0, 10)
    : photos

  return (
    <div className="min-h-screen bg-gradient-to-br from-tanfeethi-turquoise to-blue-500 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Camera className="w-16 h-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-black text-white mb-2">
            📸 معرض صور الفعالية
          </h1>
          <p className="text-white/90 text-lg">
            صور مشاركينا الرائعة
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-tanfeethi-turquoise shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Camera className="inline-block w-5 h-5 ml-2" />
            جميع الصور ({photos.length})
          </button>
          <button
            onClick={() => setFilter('top')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              filter === 'top'
                ? 'bg-white text-tanfeethi-turquoise shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Trophy className="inline-block w-5 h-5 ml-2" />
            الأكثر إعجاباً
          </button>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="max-w-6xl mx-auto">
        {photos.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-12 text-center"
          >
            <Camera className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white text-xl">
              لا توجد صور بعد!
            </p>
            <p className="text-white/70 mt-2">
              كن أول من يشارك صورة 📸
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                {/* Photo */}
                <div className="relative aspect-square bg-gray-200">
                  <img
                    src={photo.image_url}
                    alt={`صورة من ${photo.full_name}`}
                    className="w-full h-full object-cover"
                  />
                  {photo.likes_count > 0 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-white" />
                      <span className="font-bold">{photo.likes_count}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {photo.full_name}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        رقم {photo.employee_number}
                      </p>
                    </div>
                    <Heart className="w-8 h-8 text-gray-300" />
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
                  <h3 className="text-2xl font-bold text-gray-800">
                    {selectedPhoto.full_name}
                  </h3>
                  <p className="text-gray-500">
                    رقم {selectedPhoto.employee_number}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                  <span className="text-xl font-bold text-red-500">
                    {selectedPhoto.likes_count}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-full bg-tanfeethi-turquoise text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-all"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Live Update Indicator */}
      <div className="fixed bottom-4 left-4 bg-white/10 backdrop-blur text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-green-400 rounded-full"
        />
        تحديث مباشر
      </div>
    </div>
  )
}
