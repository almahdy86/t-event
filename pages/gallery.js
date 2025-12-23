import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Heart, Trophy, Camera, ArrowRight } from 'lucide-react'
import io from 'socket.io-client'

export default function GalleryPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [photos, setPhotos] = useState([])
  const [socket, setSocket] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    if (!storedEmployee) {
      router.push('/')
      return
    }
    setEmployee(JSON.parse(storedEmployee))
    fetchPhotos()

    // Socket connection for real-time updates
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('photo:likes:update', (updatedPhoto) => {
      setPhotos(prev =>
        prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
      )
    })

    return () => newSocket.close()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos/approved')
      const data = await response.json()
      if (data.success) {
        setPhotos(data.photos)
      }
    } catch (error) {
      console.error('خطأ في جلب الصور:', error)
    }
  }

  const likePhoto = (photoId) => {
    if (socket) {
      socket.emit('photo:like', { photoId })

      // Vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  if (!employee) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-tanfeethi-brown to-tanfeethi-turquoise text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/map')}
              className="p-2 hover:bg-white/10 rounded-lg"
            >
              <ArrowRight size={24} />
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Camera size={32} />
              معرض الصور المشاركة
            </h1>
            <div className="w-10" />
          </div>

          <div className="bg-white/20 backdrop-blur rounded-xl p-4">
            <p className="text-center text-lg">
              شاهد وأعجب بصور زملائك! 📸✨
            </p>
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="container mx-auto p-6">
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Camera size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-xl">لا توجد صور معتمدة بعد</p>
            <p className="text-gray-400 mt-2">عد لاحقاً لمشاهدة الصور المشاركة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                onLike={() => likePhoto(photo.id)}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
          </div>
        )}

        {/* Top 3 Section */}
        {photos.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <Trophy className="text-yellow-500" size={40} />
              الأكثر إعجاباً
              <Trophy className="text-yellow-500" size={40} />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {photos
                .slice()
                .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
                .slice(0, 3)
                .map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg ${
                        index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        'bg-orange-400 text-orange-900'
                      }`}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                    </div>
                    <PhotoCard
                      photo={photo}
                      index={index}
                      onLike={() => likePhoto(photo.id)}
                      onClick={() => setSelectedPhoto(photo)}
                      isTopRanked
                    />
                  </motion.div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_url}
              alt="Full size"
              className="w-full h-auto object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedPhoto.full_name}</h3>
              <p className="text-lg mb-4">رقم #{selectedPhoto.employee_number}</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    likePhoto(selectedPhoto.id)
                  }}
                  className="bg-red-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <Heart size={24} fill="currentColor" />
                  {selectedPhoto.likes_count || 0}
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-3 rounded-full hover:bg-gray-200"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function PhotoCard({ photo, index, onLike, onClick, isTopRanked = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
        isTopRanked ? 'border-4 border-yellow-400' : ''
      }`}
    >
      {/* Photo */}
      <div className="relative aspect-square bg-gray-200 cursor-pointer" onClick={onClick}>
        <img
          src={photo.image_url}
          alt={`Photo by ${photo.full_name}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg">{photo.full_name}</h3>
            <p className="text-sm text-gray-500">رقم #{photo.employee_number}</p>
          </div>
        </div>

        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onLike}
          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
        >
          <Heart size={24} fill="currentColor" />
          <span className="text-xl">{photo.likes_count || 0}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
