import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Award, Medal, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/router'

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      if (data.success) {
        setLeaderboard(data.leaderboard)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-12 h-12 text-yellow-400" strokeWidth={1.5} />
      case 2:
        return <Medal className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
      case 3:
        return <Award className="w-12 h-12 text-amber-600" strokeWidth={1.5} />
      default:
        return <Star className="w-8 h-8 text-tanfeethi-turquoise" strokeWidth={1.5} />
    }
  }

  const getRankBgColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-400 to-yellow-600'
      case 2:
        return 'bg-gradient-to-br from-gray-300 to-gray-500'
      case 3:
        return 'bg-gradient-to-br from-amber-500 to-amber-700'
      default:
        return 'bg-gradient-to-br from-tanfeethi-turquoise to-blue-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tanfeethi-turquoise to-blue-500 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Trophy className="w-16 h-16 text-white" strokeWidth={1.5} />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tanfeethi-turquoise to-blue-500 py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors mb-6"
        >
          <ArrowRight size={20} strokeWidth={1.5} />
          رجوع
        </button>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <Trophy className="w-20 h-20 text-yellow-300 mx-auto mb-4" strokeWidth={1.5} />
          <h1 className="text-4xl font-black mb-2" style={{color: '#ce7b5b'}}>
            🏆 لائحة المتصدرين
          </h1>
          <p className="text-white/90 text-lg">
            أفضل المشاركين في تحدي بلا أخطاء
          </p>
        </motion.div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-4xl mx-auto space-y-4">
        {leaderboard.length === 0 ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur rounded-2xl p-12 text-center"
          >
            <Trophy className="w-16 h-16 text-white/50 mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-white text-xl">
              لا توجد إجابات بعد!
            </p>
            <p className="text-white/70 mt-2">
              كن أول من يشارك في التحدي 🎯
            </p>
          </motion.div>
        ) : (
          leaderboard.map((entry, index) => {
            const rank = index + 1
            const isTopThree = rank <= 3

            return (
              <motion.div
                key={entry.employee_id}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${
                  isTopThree
                    ? 'bg-white shadow-2xl'
                    : 'bg-white/90'
                } backdrop-blur rounded-2xl p-6 flex items-center gap-6 relative overflow-hidden`}
              >
                {/* خلفية متحركة للمراكز الثلاثة الأولى */}
                {isTopThree && (
                  <motion.div
                    className={`absolute inset-0 ${getRankBgColor(rank)} opacity-10`}
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                )}

                {/* الترتيب والأيقونة */}
                <div className="flex flex-col items-center min-w-[80px] relative z-10">
                  <motion.div
                    animate={isTopThree ? {
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    {getMedalIcon(rank)}
                  </motion.div>
                  <span className={`text-2xl font-black mt-2 ${
                    isTopThree ? 'text-gray-800' : 'text-tanfeethi-turquoise'
                  }`}>
                    #{rank}
                  </span>
                </div>

                {/* معلومات الموظف */}
                <div className="flex-1 relative z-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {entry.full_name}
                  </h3>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" strokeWidth={1.5} />
                      رقم {entry.employee_number}
                    </span>
                    <span className="text-sm">
                      {entry.job_title || 'موظف'}
                    </span>
                  </div>
                </div>

                {/* النتيجة */}
                <div className="text-center relative z-10">
                  <motion.div
                    className={`${
                      isTopThree
                        ? getRankBgColor(rank)
                        : 'bg-tanfeethi-turquoise'
                    } text-white rounded-2xl px-6 py-4 min-w-[120px]`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-4xl font-black">
                      {entry.correct_count}
                    </div>
                    <div className="text-sm font-medium opacity-90">
                      إجابة صحيحة
                    </div>
                  </motion.div>

                  {entry.total_answers > entry.correct_count && (
                    <div className="mt-2 text-sm text-gray-500">
                      من أصل {entry.total_answers}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Footer Stats */}
      {leaderboard.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto mt-8 bg-white/10 backdrop-blur rounded-2xl p-6"
        >
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            <div>
              <div className="text-3xl font-black">
                {leaderboard.length}
              </div>
              <div className="text-sm opacity-80">مشارك</div>
            </div>
            <div>
              <div className="text-3xl font-black">
                {leaderboard.reduce((sum, e) => sum + e.total_answers, 0)}
              </div>
              <div className="text-sm opacity-80">إجمالي الإجابات</div>
            </div>
            <div>
              <div className="text-3xl font-black">
                {leaderboard.reduce((sum, e) => sum + e.correct_count, 0)}
              </div>
              <div className="text-sm opacity-80">إجابات صحيحة</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* تحديث تلقائي */}
      <div className="max-w-4xl mx-auto mt-6 text-center text-white/60 text-sm">
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          • يتم التحديث تلقائياً كل 30 ثانية
        </motion.div>
      </div>
    </div>
  )
}
