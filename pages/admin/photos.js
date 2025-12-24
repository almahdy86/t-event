import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, ArrowRight, Trash2, Eye } from 'lucide-react'

export default function PhotosManagement() {
  const router = useRouter()
  const [photos, setPhotos] = useState([])
  const [filter, setFilter] = useState('pending') // pending, approved, all
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchPhotos()
  }, [filter])

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/admin/photos?filter=${filter}`)
      const data = await response.json()
      if (data.success) {
        setPhotos(data.photos)
      }
    } catch (error) {
      console.error('خطأ في جلب الصور:', error)
    }
  }

  const approvePhoto = async (photoId) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/photos/${photoId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_approved: true })
      })

      if (response.ok) {
        alert('تم اعتماد الصورة')
        fetchPhotos()
      }
    } catch (error) {
      console.error('خطأ في اعتماد الصورة:', error)
    }
  }

  const rejectPhoto = async (photoId) => {
    if (!confirm('هل أنت متأكد من رفض هذه الصورة؟')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('تم رفض وحذف الصورة')
        fetchPhotos()
      }
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error)
    }
  }

  const deletePhoto = async (photoId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/photos/${photoId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('تم حذف الصورة')
        fetchPhotos()
      }
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error)
    }
  }

  return (
    <div className="min-h-screen" style={{background: '#F3F0EE'}}>
      {/* Header */}
      <div className="text-white p-4 shadow-lg" style={{background: '#234024'}}>
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="p-2 rounded-lg transition-colors"
              style={{background: 'rgba(255,255,255,0.1)'}}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            >
              <ArrowRight size={24} />
            </button>
            <h1 className="text-2xl font-bold">إدارة الصور</h1>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('pending')}
              className="px-4 py-2 rounded-lg font-bold transition-all"
              style={{
                background: filter === 'pending' ? '#AB8025' : 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              قيد الانتظار
            </button>
            <button
              onClick={() => setFilter('approved')}
              className="px-4 py-2 rounded-lg font-bold transition-all"
              style={{
                background: filter === 'approved' ? '#AB8025' : 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              المعتمدة
            </button>
            <button
              onClick={() => setFilter('all')}
              className="px-4 py-2 rounded-lg font-bold transition-all"
              style={{
                background: filter === 'all' ? '#AB8025' : 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              الكل
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Photos Grid */}
        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-400 text-lg">
              {filter === 'pending' ? 'لا توجد صور بانتظار الموافقة' : 'لا توجد صور'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Photo */}
                <div className="relative aspect-square bg-gray-200">
                  <img
                    src={photo.image_url}
                    alt={`Photo by ${photo.full_name}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                  {photo.is_approved && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle size={16} />
                      معتمد
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-lg">{photo.full_name}</p>
                      <p className="text-sm text-gray-500">رقم #{photo.employee_number}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{photo.likes_count || 0}</p>
                      <p className="text-xs text-gray-500">إعجاب</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(photo.created_at).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Actions */}
                  {!photo.is_approved ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approvePhoto(photo.id)}
                        className="flex-1 text-white py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                        style={{background: '#234024'}}
                        onMouseEnter={(e) => e.target.style.background = '#AB8025'}
                        onMouseLeave={(e) => e.target.style.background = '#234024'}
                      >
                        <CheckCircle size={18} />
                        اعتماد
                      </button>
                      <button
                        onClick={() => rejectPhoto(photo.id)}
                        className="flex-1 text-white py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                        style={{background: '#CE7B5B'}}
                        onMouseEnter={(e) => e.target.style.background = '#AB8025'}
                        onMouseLeave={(e) => e.target.style.background = '#CE7B5B'}
                      >
                        <XCircle size={18} />
                        رفض
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      className="w-full text-white py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                      style={{background: '#CE7B5B'}}
                      onMouseEnter={(e) => e.target.style.background = '#AB8025'}
                      onMouseLeave={(e) => e.target.style.background = '#CE7B5B'}
                    >
                      <Trash2 size={18} />
                      حذف
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_url}
              alt="Full size"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full hover:bg-gray-200"
            >
              <XCircle size={24} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
