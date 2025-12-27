import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, ArrowRight, Award, Medal, Gift } from 'lucide-react'

export default function LotteryPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState(null)
  const [eligibleEmployees, setEligibleEmployees] = useState([])
  const [numberOfWinners, setNumberOfWinners] = useState(3)
  const [winners, setWinners] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentDrawing, setCurrentDrawing] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    const adminInfo = localStorage.getItem('admin_info')

    if (!token || !adminInfo) {
      router.push('/admin/login')
      return
    }

    setAdmin(JSON.parse(adminInfo))
    fetchEligibleEmployees()
  }, [])

  const fetchEligibleEmployees = async () => {
    try {
      const response = await fetch('/api/admin/lottery/eligible')
      const data = await response.json()
      if (data.success) {
        setEligibleEmployees(data.employees)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const startDraw = async () => {
    if (eligibleEmployees.length === 0) {
      alert('لا يوجد موظفون مؤهلون للقرعة!')
      return
    }

    if (numberOfWinners > eligibleEmployees.length) {
      alert(`عدد الفائزين أكبر من عدد المؤهلين (${eligibleEmployees.length})`)
      return
    }

    setIsDrawing(true)
    setWinners([])

    const selected = []
    const available = [...eligibleEmployees]

    for (let i = 0; i < numberOfWinners; i++) {
      // انتظر قليلاً بين كل فائز
      await new Promise(resolve => setTimeout(resolve, 2000))

      // اختيار عشوائي
      const randomIndex = Math.floor(Math.random() * available.length)
      const winner = available[randomIndex]

      // إضافة الفائز مع رقم الجائزة
      const winnerWithRank = {
        ...winner,
        rank: i + 1,
        prize: getPrizeName(i + 1)
      }

      setCurrentDrawing(winnerWithRank)
      await new Promise(resolve => setTimeout(resolve, 1500))

      selected.push(winnerWithRank)
      available.splice(randomIndex, 1)

      setWinners([...selected])
      setCurrentDrawing(null)
    }

    setIsDrawing(false)
  }

  const getPrizeName = (rank) => {
    const prizes = {
      1: 'الجائزة الأولى 🥇',
      2: 'الجائزة الثانية 🥈',
      3: 'الجائزة الثالثة 🥉',
    }
    return prizes[rank] || `الجائزة رقم ${rank}`
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-12 h-12 text-yellow-400" strokeWidth={1.5} />
      case 2:
        return <Medal className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
      case 3:
        return <Award className="w-12 h-12 text-amber-600" strokeWidth={1.5} />
      default:
        return <Gift className="w-10 h-10 text-tanfeethi-turquoise" strokeWidth={1.5} />
    }
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{background: 'linear-gradient(135deg, #234024 0%, #AB8025 100%)'}}>
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-colors mb-6"
          style={{background: 'rgba(255,255,255,0.2)'}}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          <ArrowRight size={20} strokeWidth={1.5} />
          رجوع للوحة التحكم
        </button>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-4" strokeWidth={1.5} style={{color: '#CE7B5B'}} />
          <h1 className="text-4xl font-black mb-2" style={{color: '#bc785b'}}>
            🎁 قرعة الفائزين
          </h1>
          <p className="text-white/90 text-lg">
            اسحب الفائزين من المشاركين المؤهلين
          </p>
        </motion.div>

        {/* Settings */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-bold mb-2">
                عدد المؤهلين للقرعة:
              </label>
              <div className="bg-white/20 rounded-xl px-4 py-3 text-white text-xl font-bold">
                {eligibleEmployees.length} موظف
              </div>
            </div>

            <div>
              <label className="block text-white font-bold mb-2">
                عدد الفائزين:
              </label>
              <input
                type="number"
                min="1"
                max={eligibleEmployees.length}
                value={numberOfWinners}
                onChange={(e) => setNumberOfWinners(parseInt(e.target.value) || 1)}
                className="w-full bg-white/20 text-white rounded-xl px-4 py-3 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-white/50"
                disabled={isDrawing}
              />
            </div>
          </div>

          <button
            onClick={startDraw}
            disabled={isDrawing || eligibleEmployees.length === 0}
            className="w-full mt-6 py-4 rounded-xl font-bold text-xl transition-all hover:bg-[#bc785b] hover:text-black"
            style={{
              background: isDrawing || eligibleEmployees.length === 0 ? '#9E9E9E' : '#000000',
              color: 'white',
              cursor: isDrawing || eligibleEmployees.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {isDrawing ? '🎲 جارٍ السحب...' : '🎁 ابدأ القرعة'}
          </button>
        </div>
      </div>

      {/* Current Drawing Animation */}
      <AnimatePresence>
        {currentDrawing && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="bg-white rounded-3xl p-12 text-center max-w-md"
            >
              {getRankIcon(currentDrawing.rank)}
              <h2 className="text-3xl font-black mt-4 mb-2" style={{color: '#234024'}}>
                {currentDrawing.prize}
              </h2>
              <h3 className="text-5xl font-black mb-4" style={{color: '#CE7B5B'}}>
                {currentDrawing.full_name}
              </h3>
              <div className="text-6xl font-black" style={{color: '#AB8025'}}>
                #{currentDrawing.employee_number}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Winners List */}
      {winners.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-4" style={{background: 'linear-gradient(90deg, #AB8025 0%, #CE7B5B 100%)'}}>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Trophy className="w-6 h-6" strokeWidth={1.5} />
                الفائزون
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {winners.map((winner, index) => (
                <motion.div
                  key={winner.employee_id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{background: 'linear-gradient(90deg, #F3F0EE 0%, #E8DDD3 100%)'}}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(winner.rank)}
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-bold mb-1" style={{color: '#234024'}}>
                      {winner.prize}
                    </div>
                    <div className="text-2xl font-black" style={{color: '#000000'}}>
                      {winner.full_name}
                    </div>
                    <div className="text-sm" style={{color: '#666666'}}>
                      رقم {winner.employee_number} • {winner.correct_count} إجابة صحيحة
                    </div>
                  </div>

                  <div className="text-4xl font-black" style={{color: '#CE7B5B'}}>
                    #{winner.employee_number}
                  </div>
                </motion.div>
              ))}
            </div>

            {!isDrawing && (
              <div className="px-6 py-4 flex gap-4" style={{background: '#F3F0EE'}}>
                <button
                  onClick={() => setWinners([])}
                  className="flex-1 py-3 rounded-xl font-bold transition-all"
                  style={{background: '#E0E0E0', color: '#000000'}}
                  onMouseEnter={(e) => e.target.style.background = '#BDBDBD'}
                  onMouseLeave={(e) => e.target.style.background = '#E0E0E0'}
                >
                  إعادة القرعة
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 text-white py-3 rounded-xl font-bold transition-all hover:bg-[#bc785b] hover:text-black"
                  style={{background: '#000000'}}
                >
                  طباعة النتائج
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
