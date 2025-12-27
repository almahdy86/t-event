import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Camera, Upload, ArrowRight, Check, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function IdentityMirrorsPage() {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [step, setStep] = useState('intro') // intro, camera, preview, success
  const [photoData, setPhotoData] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [cameraFacing, setCameraFacing] = useState('environment') // user = front, environment = back
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  useEffect(() => {
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    if (!storedEmployee) {
      router.push('/')
      return
    }
    setEmployee(JSON.parse(storedEmployee))
    return () => {
      stopCamera()
  }, [])
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        videoRef.current.play()
      }
      setStep('camera')
    } catch (error) {
      console.error('خطأ في فتح الكاميرا:', error)
      alert('لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.')
  }
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
  const toggleCamera = async () => {
    stopCamera()
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')
    
    setTimeout(() => {
      startCamera()
    }, 100)
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    // ضبط حجم اللوحة
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    // رسم الفيديو على اللوحة
    context.drawImage(video, 0, 0)
    // إضافة إطار التنفيذي
    addTanfeethiFrame(context, canvas.width, canvas.height)
    // الحصول على البيانات
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setPhotoData(imageData)
    setStep('preview')
    // اهتزاز
    if (navigator.vibrate) {
      navigator.vibrate(100)
  const addTanfeethiFrame = (ctx, width, height) => {
    // إضافة إطار بني فاتح
    const frameWidth = 40
    ctx.strokeStyle = '#8B6F47'
    ctx.lineWidth = frameWidth
    ctx.strokeRect(frameWidth / 2, frameWidth / 2, width - frameWidth, height - frameWidth)
    // إضافة شعار في الأعلى
    ctx.fillStyle = '#8B6F47'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('التنفـيذي', width / 2, 80)
    // إضافة رقم الموظف في الأسفل
    if (employee) {
      ctx.fillStyle = '#40E0D0'
      ctx.font = 'bold 60px Arial'
      ctx.fillText(`#${employee.employee_number}`, width / 2, height - 60)
  const handleUpload = async () => {
    if (!photoData || !employee) return
    setIsUploading(true)
      // تحويل base64 إلى blob
      const response = await fetch(photoData)
      const blob = await response.blob()
      // إنشاء FormData
      const formData = new FormData()
      formData.append('photo', blob, 'photo.jpg')
      formData.append('employeeId', employee.id)
      formData.append('employeeNumber', employee.employee_number)
      // رفع الصورة
      const uploadResponse = await fetch('/api/photo/upload', {
        method: 'POST',
        body: formData
      const data = await uploadResponse.json()
      if (data.success) {
        setStep('success')
        
        // اهتزاز النجاح
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100, 50, 100])
        }
      } else {
        alert('فشل رفع الصورة. يرجى المحاولة مرة أخرى.')
      console.error('خطأ في رفع الصورة:', error)
      alert('حدث خطأ. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsUploading(false)
  const retake = () => {
    setPhotoData(null)
    startCamera()
  if (!employee) return null
  if (step === 'intro') {
    return (
      <div
        className="min-h-screen flex flex-col"
        style={{
          backgroundImage: 'url(/bg/newbg.png)',
          backgroundSize: 'auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="p-4 flex items-center justify-between shadow" style={{background: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(201,169,97,0.3)'}}>
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-2 font-bold"
            style={{color: 'white'}}
          >
            <ArrowRight size={24} strokeWidth={1.5} />
            <span>رجوع</span>
          </button>
          <h1 className="font-bold text-xl" style={{color: 'white'}}>مرايا الهوية</h1>
          <div className="w-8"></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
            style={{background: '#000000'}}
            <Camera size={64} strokeWidth={1.5} color="#FFFFFF" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4 text-center"
            style={{color: '#ce7b5b'}}
            التقط لحظتك!
          </motion.h2>
          <motion.p
            transition={{ delay: 0.3 }}
            className="text-xl text-center mb-8"
            style={{color: 'rgba(255,255,255,0.7)'}}
            شارك لحظاتك المميزة مع زملائك
            <br />
            على الشاشة الكبيرة
          </motion.p>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.95 }}
            onClick={startCamera}
            className="font-bold text-xl px-12 py-4 rounded-full shadow-2xl transition-all flex items-center gap-3 hover:bg-[#ce7b5b] hover:text-black"
            style={{background: '#000000', color: '#ce7b5b'}}
            <Camera size={28} strokeWidth={1.5} />
            ابدأ التصوير
          </motion.button>
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => router.push('/activity/zero-error')}
            className="mt-6 flex items-center gap-2"
            style={{color: '#f9f5f7ff'}}
            التالي: تحدي بلا أخطاء
            <ArrowLeft size={20} strokeWidth={1.5} />
      </div>
    )
  if (step === 'camera') {
      <div className="fixed inset-0 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        {/* أزرار التحكم */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                stopCamera()
                setStep('intro')
              }}
              className="text-white bg-white/20 px-4 py-2 rounded-full"
            >
              إلغاء
            </button>
              onClick={toggleCamera}
              className="text-white bg-white/20 px-4 py-2 rounded-full flex items-center gap-2"
              🔄 فتح \ تبديل
          </div>
            onClick={capturePhoto}
            className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
            <div className="w-16 h-16 border-4 border-gray-800 rounded-full"></div>
  if (step === 'preview') {
      <div className="min-h-screen bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <img
            src={photoData}
            alt="Preview"
            className="max-w-full max-h-full rounded-2xl shadow-2xl"
          />
        <div className="p-6 bg-gradient-to-t from-black to-transparent">
          <div className="flex gap-4">
              onClick={retake}
              className="flex-1 bg-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/30 transition-colors"
              إعادة التصوير
            
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-tanfeethi-turquoise text-white font-bold py-4 rounded-xl hover:bg-tanfeethi-turquoise-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  جارٍ الرفع...
                </>
              ) : (
                  <Upload size={20} strokeWidth={1.5} />
                  مشاركة
              )}
  if (step === 'success') {
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-white" style={{background: 'linear-gradient(135deg, #AB8025 0%, #CE7B5B 100%)'}}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
          className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-8"
        >
          <Check size={80} strokeWidth={1.5} className="text-green-500" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4 text-center"
          رائع! 🎉
        </motion.h2>
        <motion.p
          transition={{ delay: 0.2 }}
          className="text-xl text-center mb-8 opacity-90"
          تم إرسال صورتك للمراجعة
          <br />
          ستظهر على الشاشة الكبيرة قريباً
        </motion.p>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push('/map')}
          className="font-bold text-xl px-12 py-4 rounded-full shadow-2xl transition-all hover:bg-[#ce7b5b] hover:text-black"
          style={{background: '#000000', color: '#FFFFFF'}}
          العودة للخريطة
        </motion.button>
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => router.push('/activity/zero-error')}
          className="mt-6 text-white/80 hover:text-white flex items-center gap-2"
          التالي: تحدي بلا أخطاء
          <ArrowRight size={20} />
  return null
}
