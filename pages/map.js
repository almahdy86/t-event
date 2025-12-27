import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Camera, Brain, Heart, Users, LogOut } from 'lucide-react'
import io from 'socket.io-client'

let socket

export default function MapPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [activities, setActivities] = useState({})
  const [showGallery, setShowGallery] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    if (!storedEmployee) {
      router.push('/')
      return
    }

    const emp = JSON.parse(storedEmployee)
    setEmployee(emp)

    // الاتصال بـ Socket.io
    socketInitializer(emp)

    // جلب حالة الفعاليات
    fetchActivities()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  const socketInitializer = (emp) => {
    socket = io();

    socket.on('connect', () => {
      socket.emit('employee:connect', {
        employeeId: emp.id,
        employeeNumber: emp.employee_number
      })
    })

    socket.on('activity:status:change', (data) => {
      setActivities(prev => ({
        ...prev,
        [data.activityName]: data.isActive
      }))
    })

    socket.on('notification', (data) => {
      setNotification(data)

      // اهتزاز
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200])
      }

      // إخفاء بعد 5 ثوان
      setTimeout(() => setNotification(null), 5000)

      // إذا كان الإشعار للصورة النهائية
      if (data.title.includes('الصورة') || data.title.includes('توجه')) {
        setTimeout(() => {
          router.push('/finale')
        }, 2000)
      }
    })

    // الاستماع لحدث حذف الموظف من الإدارة
    socket.on('employee:deleted', (data) => {
      // التحقق إذا كان الموظف المحذوف هو المستخدم الحالي
      if (data.employeeId === emp.id || data.employeeNumber === emp.employee_number) {
        console.log('🚨 Account deleted by admin')

        // عرض الرسالة
        alert(data.message)

        // مسح البيانات المحلية
        localStorage.removeItem('tanfeethi_employee')
        localStorage.removeItem('tanfeethi_last_page')

        // إعادة التوجيه للصفحة الرئيسية
        window.location.href = '/'
      }
    })
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/activities/status')
      const data = await response.json()

      if (data.success) {
        const statusMap = {}
        data.activities.forEach(activity => {
          statusMap[activity.activity_name] = activity.is_active
        })
        setActivities(statusMap)
      }
    } catch (error) {
      console.error('خطأ في جلب الفعاليات:', error)
    }
  }

  const handleLogout = () => {
    const confirmLogout = confirm(
      '⚠️ تحذير هام!\n\n' +
      'عند تسجيل الخروج، سيتم مسح جميع بياناتك نهائياً من النظام:\n' +
      '• الصور التي قمت برفعها\n' +
      '• إجاباتك في التحديات\n' +
      '• جميع بياناتك الشخصية\n\n' +
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟'
    )

    if (confirmLogout) {
      const doubleConfirm = confirm(
        '⚠️ تأكيد نهائي!\n\n' +
        'هذا القرار لا يمكن التراجع عنه.\n' +
        'سيتم حذف جميع بياناتك نهائياً.\n\n' +
        'هل تريد المتابعة؟'
      )

      if (doubleConfirm) {
        // مسح البيانات المحلية
        localStorage.removeItem('tanfeethi_employee')
        localStorage.removeItem('tanfeethi_last_page')

        // إرسال طلب لحذف البيانات من السيرفر
        deleteEmployeeData()

        // إعادة التوجيه للصفحة الرئيسية
        router.push('/')
      }
    }
  }

  const deleteEmployeeData = async () => {
    try {
      await fetch(`/api/employee/delete/${employee.id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error)
    }
  }

  const activityCards = [
    {
      id: 'identity_mirrors',
      title: 'مرايا الهوية',
      icon: Camera,
      bgColor: '#AB8025',
      route: '/activity/identity-mirrors'
    },
    {
      id: 'zero_error_challenge',
      title: 'تحدي بلا أخطاء',
      icon: Brain,
      bgColor: '#AB8025',
      route: '/activity/zero-error'
    },
    {
      id: 'art_of_hospitality',
      title: 'فن الإكرام',
      icon: Heart,
      bgColor: '#AB8025',
      route: '/activity/hospitality'
    },
    {
      id: 'final_photo',
      title: 'الصورة الجماعية',
      icon: Users,
      bgColor: '#AB8025',
      route: '/finale'
    }
  ]

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tanfeethi-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tanfeethi-brown font-semibold">جارٍ التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-20 relative"
      style={{
        backgroundImage: 'url(/bg/newbg.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="fixed inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
      {/* Header ثابت */}
      <div className="shadow-lg sticky top-0 z-50 relative" style={{background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(201,169,97,0.3)'}}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/logo.svg"
                alt="التنفيذي"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="font-bold" style={{color: 'white'}}>{employee.full_name}</p>
              <p className="text-sm" style={{color: 'rgba(255,255,255,0.6)'}}>{employee.job_title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-white px-4 py-2 rounded-full font-bold text-xl" style={{background: '#ce7b5b'}}>
              #{employee.employee_number}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full transition-all hover:scale-110"
              style={{background: '#d32f2f'}}
              title="تسجيل الخروج"
            >
              <LogOut size={20} strokeWidth={1.5} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* الإشعارات */}
      <div className="relative z-10">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-20 left-0 right-0 z-50 mx-4"
          >
            <div className="text-white p-4 rounded-2xl shadow-2xl" style={{background: '#234024'}}>
              <h3 className="font-bold text-lg mb-1">{notification.title}</h3>
              <p>{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* خريطة الفعاليات */}
      <div className="p-6">
        {/* زر خريطة الفعالية التفاعلية */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.push('/event-map')}
          className="w-full p-6 rounded-2xl shadow-xl mb-6 transition-all transform hover:scale-105 hover:bg-[#ce7b5b] hover:text-black active:scale-95"
          style={{background: '#000000', color: 'white' }}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
                 style={{background: 'rgba(0,0,0,0.2)'}}>
              <MapPin size={32} strokeWidth={1.5} />
            </div>

            <div className="flex-1 text-right">
              <h3 className="text-2xl font-bold mb-1"> خريطة الفعالية</h3>
              <p className="text-sm" style={{color: '#ce7b5b'}}>
                خريطة تفصيلية لجميع مواقع الفعالية
              </p>
            </div>

            <div>
              <MapPin size={32} className="animate-pulse" />
            </div>
          </div>
        </motion.button>

        <div className="space-y-4">
          {activityCards.map((activity, index) => {
            const isActive = activities[activity.id]
            const Icon = activity.icon
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => isActive && router.push(activity.route)}
                  disabled={!isActive}
                  className={`w-full p-6 rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 ${isActive ? 'hover:bg-[#ce7b5b] hover:text-black' : ''}`}
                  style={{
                    background: isActive ? '#000000' : 'rgba(255,255,255,0.1)',
                    color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
                    opacity: isActive ? 1 : 0.5,
                    cursor: isActive ? 'pointer' : 'not-allowed',
                    border: isActive ? 'none' : '1px solid #ce7b5b0b'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                         style={{background: isActive ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)'}}>
                      <Icon size={32} strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 text-right">
                      <h3 className="text-xl font-bold mb-1">{activity.title}</h3>
                      <p className="text-sm" style={{color: '#ce7b5b'}}>
                        {isActive ? 'انقر للدخول' : 'غير متاح حالياً'}
                      </p>
                    </div>

                    {isActive && (
                      <div className="animate-pulse">
                        <MapPin size={24} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* زر معرض الصور */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push('/gallery')}
        className="fixed bottom-6 left-6 w-16 h-16 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all hover:scale-110 hover:bg-[#ce7b5b] hover:text-white"
        style={{background: '#000000',color:'#ce7b5b'}}
      >
        <Camera size={28} strokeWidth={1.5} />
      </motion.button>

      {/* معرض الصور */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 bg-white z-50"
          >
            <div className="h-full flex flex-col">
              <div className="bg-tanfeethi-brown text-white p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">معرض الصور</h2>
                <button
                  onClick={() => setShowGallery(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                <GalleryGrid employeeId={employee.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  )
}

// مكون معرض الصور
function GalleryGrid({ employeeId }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLikes, setUserLikes] = useState(new Set())

  useEffect(() => {
    fetchPhotos()

    // الاستماع للصور الجديدة
    if (socket) {
      socket.on('photo:approved', (photo) => {
        setPhotos(prev => [photo, ...prev])
      })

      socket.on('photo:likes:update', (updatedPhoto) => {
        setPhotos(prev =>
          prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p)
            .sort((a, b) => b.likes_count - a.likes_count)
        )

        // تحديث حالة الإعجاب للمستخدم الحالي
        if (updatedPhoto.employeeId === employeeId) {
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
    }
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/photos/approved?employeeId=${employeeId}`)
      const data = await response.json()

      if (data.success) {
        setPhotos(data.photos)
        if (data.userLikes) {
          setUserLikes(new Set(data.userLikes))
        }
      }
    } catch (error) {
      console.error('خطأ في جلب الصور:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (photoId) => {
    if (socket) {
      socket.emit('photo:like', { photoId, employeeId })

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

      // اهتزاز خفيف
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-tanfeethi-brown border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Camera size={64} strokeWidth={1.5} className="mx-auto mb-4 opacity-30" />
        <p>لا توجد صور بعد</p>
        <p className="text-sm mt-2">كن أول من يشارك صورة!</p>
      </div>
    )
  }

  return (
    <div className="columns-2 gap-4">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="mb-4 break-inside-avoid"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img
              src={photo.image_url}
              alt={`صورة #${photo.employee_number}`}
              className="w-full h-auto"
            />
            
            <div className="p-3 flex items-center justify-between">
              <span className="font-bold text-tanfeethi-brown">
                #{photo.employee_number}
              </span>
              
              <button
                onClick={() => handleLike(photo.id)}
                className="flex items-center gap-2 touch-effect px-3 py-1 rounded-full hover:bg-pink-50 transition-colors"
              >
                <Heart
                  size={20}
                  strokeWidth={1.5}
                  fill={userLikes.has(photo.id) ? 'currentColor' : 'none'}
                  className={userLikes.has(photo.id) ? 'text-red-500' : 'text-gray-400'}
                />
                <span className="font-semibold">{photo.likes_count || 0}</span>
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
