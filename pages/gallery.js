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
  const [userLikes, setUserLikes] = useState(new Set()) // تتبع إعجابات المستخدم

  useEffect(() => {
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    if (!storedEmployee) {
      router.push('/')
      return
    }
    const emp = JSON.parse(storedEmployee)
    setEmployee(emp)
    fetchPhotos(emp.id)

    // Socket connection for real-time updates
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('photo:likes:update', (updatedPhoto) => {
      setPhotos(prev =>
        prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
      )

      // تحديث حالة الإعجاب للمستخدم الحالي
      if (updatedPhoto.employeeId === emp.id) {
        setUserLikes(prev => {
          const newLikes = new Set(prev)
          if (updatedPhoto.isLiked) {
            newLikes.add(updatedPhoto.id)
          } else {
            newLikes.delete(updatedPhoto.id)
          }
          return newLikes
        })
      }
    })

    // إضافة صورة معتمدة فوراً (تحديث فوري!)
    newSocket.on('photo:approved', (approvedPhoto) => {
      console.log('✅ New photo approved:', approvedPhoto)
      setPhotos(prev => [approvedPhoto, ...prev])
    })

    return () => newSocket.close()
  }, [])

  const fetchPhotos = async (employeeId) => {
    try {
      const response = await fetch(`/api/photos/approved?employeeId=${employeeId}`)
      const data = await response.json()
      if (data.success) {
        setPhotos(data.photos)
        // تحديث الإعجابات الخاصة بالمستخدم
        if (data.userLikes) {
          setUserLikes(new Set(data.userLikes))
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الصور:', error)
    }
  }

  const likePhoto = (photoId) => {
    if (socket && employee) {
      socket.emit('photo:like', { photoId, employeeId: employee.id })

      // تحديث فوري للواجهة
      setUserLikes(prev => {
        const newLikes = new Set(prev)
        if (newLikes.has(photoId)) {
          newLikes.delete(photoId)
        } else {
          newLikes.add(photoId)
        }
        return newLikes
      })

      // Vibration feedback
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  if (!employee) return null

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{backgroundImage: 'url(/bg/newbg.png)'}}>
      {/* Header */}
      <div className="p-6 shadow-lg sticky top-0 z-10" style={{background: '#000000'}}>
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/map')}
              className="p-2 rounded-lg transition-colors"
              style={{background: 'rgba(255,255,255,0.1)', color: 'white'}}
            >
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{color: 'white'}}>
              {/* <Camera size={32} strokeWidth={2.5} /> */}
              معرض الصور المشاركة
            </h1>
            <div className="w-10" />
          </div>

          {/* <div className="rounded-xl p-4" style={{background: '#CE7B5B'}}>
            {/* <p className="text-center text-lg font-semibold" style={{color: '#000000'}}>
              شاهد وأعجب بصور زملائك! 
            </p> 
          </div> */}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="container mx-auto p-6">
        {photos.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-12 text-center">
            <Camera size={64} strokeWidth={1.5} className="mx-auto mb-4" style={{color: '#bc785b'}} />
            <p className="text-xl" style={{color: '#bc785b'}}>لا توجد صور معتمدة بعد</p>
            <p className="mt-2 text-white">عد لاحقاً لمشاهدة الصور المشاركة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                isLiked={userLikes.has(photo.id)}
                onLike={() => likePhoto(photo.id)}
                onClick={() => setSelectedPhoto(photo)}
              />
            ))}
          </div>
        )}

        {/* Top 3 Section */}
        {photos.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3 text-white">
              <Trophy size={40} strokeWidth={1.5} style={{color: '#bc785b'}} />
              الأكثر إعجاباً
              <Trophy size={40} strokeWidth={1.5} style={{color: '#bc785b'}} />
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
                      isLiked={userLikes.has(photo.id)}
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
                  <Heart size={24} strokeWidth={1.5} fill="currentColor" />
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

function PhotoCard({ photo, index, isLiked, onLike, onClick, isTopRanked = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow ${
        isTopRanked ? 'border-4' : ''
      }`}
      style={isTopRanked ? {borderColor: '#bc785b'} : {}}
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
            <h3 className="font-bold text-lg" style={{color: '#bc785b'}}>{photo.full_name}</h3>
            <p className="text-sm text-white">رقم #{photo.employee_number}</p>
          </div>
        </div>

        {/* Like Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onLike}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all ${
            isLiked
              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Heart size={24} strokeWidth={1.5} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="text-xl">{photo.likes_count || 0}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
