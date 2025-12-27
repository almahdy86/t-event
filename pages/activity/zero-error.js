import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, CheckCircle, XCircle, Trophy, ArrowRight, ArrowLeft } from 'lucide-react'
import io from 'socket.io-client'

let socket

export default function ZeroErrorChallengePage() {
  const router = useRouter()
  const [employee, setEmployee] = useState(null)
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [isAnswered, setIsAnswered] = useState(false)
  const [result, setResult] = useState(null)
  const [startTime, setStartTime] = useState(null)

  useEffect(() => {
    const storedEmployee = localStorage.getItem('tanfeethi_employee')
    if (!storedEmployee) {
      router.push('/')
      return
    }
    setEmployee(JSON.parse(storedEmployee))

    // الاتصال بـ Socket
    socketInitializer()

    // جلب السؤال النشط
    fetchActiveQuestion()

    return () => {
      if (socket) socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (question && timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)

      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isAnswered) {
      // انتهى الوقت
      handleSubmit(null)
    }
  }, [timeLeft, isAnswered, question])

  const socketInitializer = () => {
    socket = io();

    socket.on('question:active', (newQuestion) => {
      setQuestion(newQuestion)
      setTimeLeft(30)
      setIsAnswered(false)
      setResult(null)
      setSelectedAnswer(null)
      setStartTime(Date.now())
    })

    socket.on('answer:result', (data) => {
      setResult(data)
      setIsAnswered(true)

      // اهتزاز حسب النتيجة
      if (navigator.vibrate) {
        if (data.error === 'already_answered') {
          navigator.vibrate([50, 50, 50, 50, 50])
        } else if (data.isCorrect) {
          navigator.vibrate([100, 50, 100, 50, 100])
        } else {
          navigator.vibrate([200, 100, 200])
        }
      }
    })
  }

  const fetchActiveQuestion = async () => {
    try {
      const response = await fetch('/api/questions/active')
      const data = await response.json()
      
      if (data.success && data.question) {
        setQuestion(data.question)
        setStartTime(Date.now())
      }
    } catch (error) {
      console.error('خطأ في جلب السؤال:', error)
    }
  }

  const handleSubmit = (answer) => {
    if (isAnswered || !employee || !question) return

    const timeTaken = Math.floor((Date.now() - startTime) / 1000)

    if (socket) {
      socket.emit('answer:submit', {
        questionId: question.id,
        employeeId: employee.id,
        employeeNumber: employee.employee_number,
        selectedAnswer: answer,
        timeTaken
      })
    }

    setSelectedAnswer(answer)
  }

  if (!employee) return null

  if (!question) {
    return (
      <div
        className="min-h-screen flex flex-col relative"
        style={{
          backgroundImage: 'url(/bg/newbg.png)',
          backgroundSize: 'auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat'
        }}
      >
        <div className="absolute inset-0 bg-black pointer-events-none" style={{opacity: 0.4}}></div>
        <div className="p-4 flex items-center justify-between relative z-10" style={{background: '#000000'}}>
          <button
            onClick={() => router.push('/map')}
            className="font-bold"
            style={{color: 'white'}}
          >
            ← رجوع
          </button>
          <h1 className="font-bold text-xl" style={{color: 'white'}}>تحدي بلا أخطاء</h1>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-white relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-32 h-32 rounded-full flex items-center justify-center mb-8"
            style={{background: 'rgba(206, 123, 91, 0.2)'}}
          >
            <Trophy size={64} strokeWidth={1.5} style={{color: '#ce7b5b'}} />
          </motion.div>

          <h2 className="text-4xl font-bold mb-4 text-center" style={{color: '#ce7b5b'}}>
            تحدي بلا أخطاء! 🎯
          </h2>

          <p className="text-xl text-center mb-8 opacity-90">
            اختبر معرفتك ببروتوكولات الخدمة
            <br />
            وكن من الفائزين بالجوائز
          </p>

          <div className="bg-white/20 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-lg mb-3">⏰ انتظر بدء التحدي</h3>
            <p className="opacity-90">سيتم عرض السؤال قريباً على جميع المشاركين</p>
          </div>

          <button
            onClick={() => router.push('/activity/hospitality')}
            className="mt-8 text-white/80 hover:text-white flex items-center gap-2"
          >
            التالي: فن الإكرام
            <ArrowRight size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: 'url(/bg/newbg.png)',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat'
      }}
    >
      <div className="absolute inset-0 bg-white pointer-events-none" style={{opacity: 0.4}}></div>
      {/* Header */}
      <div className="p-4 flex items-center justify-between relative z-10" style={{background: '#000000'}}>
        <div className="flex items-center gap-3" style={{color: 'white'}}>
          <button
            onClick={() => router.push('/map')}
            className="hover:opacity-70 transition-opacity flex items-center gap-2 font-bold"
          >
            <ArrowRight size={24} strokeWidth={1.5} />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-2">
            <Clock size={24} strokeWidth={1.5} />
            <span className="text-2xl font-bold">
              {timeLeft}s
            </span>
          </div>
        </div>
        <h1 className="font-bold text-xl" style={{color: 'white'}}>تحدي بلا أخطاء</h1>
        <div className="px-3 py-1 rounded-full font-bold" style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}>
          #{employee.employee_number}
        </div>
      </div>

      {/* السؤال والخيارات */}
      <div className="relative z-10">
      <div className="flex-1 flex flex-col p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 mb-6 shadow-2xl"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{background: '#ce7b5b'}}>
              ؟
            </div>
            <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
              {question.question_text}
            </h2>
          </div>
        </motion.div>

        {/* الخيارات */}
        <div className="space-y-4 flex-1">
          {(Array.isArray(question.options) ? question.options : JSON.parse(question.options)).map((option, index) => {
            const isSelected = selectedAnswer === index
            const isCorrect = result && index === result.correctAnswer
            const isWrong = result && isSelected && !result.isCorrect

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isAnswered && handleSubmit(index)}
                disabled={isAnswered}
                className={`w-full p-5 rounded-2xl font-bold text-right transition-all transform hover:scale-105 active:scale-95 disabled:transform-none ${
                  isCorrect
                    ? 'bg-green-500 text-white'
                    : isWrong
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? 'bg-white border-4'
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                } ${isAnswered && !isCorrect && !isSelected && 'opacity-50'}`}
                style={isSelected && !isCorrect && !isWrong ? {color: '#ce7b5b', borderColor: '#ce7b5b'} : {}}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCorrect ? 'bg-white text-green-500' :
                      isWrong ? 'bg-white text-red-500' :
                      isSelected ? 'text-white' :
                      'text-white'
                    }`}
                    style={!isCorrect && !isWrong ? {background: isSelected ? '#ce7b5b' : 'rgba(206, 123, 91, 0.3)'} : {}}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg">{option}</span>
                  </div>
                  
                  {isCorrect && (
                    <CheckCircle size={28} strokeWidth={1.5} className="text-white" />
                  )}
                  {isWrong && (
                    <XCircle size={28} strokeWidth={1.5} className="text-white" />
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* النتيجة */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className={`mt-6 p-6 rounded-2xl ${
                result.error === 'already_answered'
                  ? 'bg-orange-500'
                  : result.isCorrect
                  ? 'bg-green-500'
                  : 'bg-red-500'
              } text-white text-center`}
            >
              <div className="text-5xl mb-3">
                {result.error === 'already_answered'
                  ? '🚫'
                  : result.isCorrect ? '🎉' : '😔'}
              </div>
              <h3 className="text-2xl font-bold mb-2">
                {result.error === 'already_answered'
                  ? 'تنبيه!'
                  : result.isCorrect ? 'إجابة صحيحة!' : 'إجابة خاطئة'}
              </h3>
              <p className="text-lg opacity-90">
                {result.error === 'already_answered'
                  ? result.message || 'لقد أجبت على هذا السؤال من قبل!'
                  : result.isCorrect
                  ? 'تم تسجيلك في قرعة الجوائز!'
                  : 'لا تقلق، هناك فرص أخرى!'}
              </p>

              <button
                onClick={() => router.push('/map')}
                className="mt-6 bg-white text-gray-800 font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                العودة للخريطة
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </div>
  )
}
