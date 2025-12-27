import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'

export default function QuestionsManagement() {
  const router = useRouter()
  const [questions, setQuestions] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [formData, setFormData] = useState({
    question_text: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correct_answer: 0
  })

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions')
      const data = await response.json()
      if (data.success) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('خطأ في جلب الأسئلة:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const options = [
      formData.option1,
      formData.option2,
      formData.option3,
      formData.option4
    ]

    try {
      const token = localStorage.getItem('admin_token')
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions'

      const response = await fetch(url, {
        method: editingQuestion ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question_text: formData.question_text,
          options: options,
          correct_answer: parseInt(formData.correct_answer)
        })
      })

      if (response.ok) {
        alert('تم حفظ السؤال بنجاح')
        setShowForm(false)
        setEditingQuestion(null)
        resetForm()
        fetchQuestions()
      }
    } catch (error) {
      console.error('خطأ في حفظ السؤال:', error)
      alert('فشل حفظ السؤال')
    }
  }

  const toggleActive = async (questionId, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/questions/${questionId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (response.ok) {
        fetchQuestions()
      }
    } catch (error) {
      console.error('خطأ في تفعيل السؤال:', error)
    }
  }

  const deleteQuestion = async (questionId) => {
    if (!confirm('هل أنت متأكد من حذف السؤال؟')) return

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        alert('تم حذف السؤال')
        fetchQuestions()
      }
    } catch (error) {
      console.error('خطأ في حذف السؤال:', error)
    }
  }

  const editQuestion = (question) => {
    setEditingQuestion(question)
    setFormData({
      question_text: question.question_text,
      option1: question.options[0] || '',
      option2: question.options[1] || '',
      option3: question.options[2] || '',
      option4: question.options[3] || '',
      correct_answer: question.correct_answer
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      question_text: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correct_answer: 0
    })
  }

  return (
    <div className="min-h-screen" style={{
      backgroundImage: 'url(/bg/newbg.png)',
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
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
              <ArrowRight size={24} strokeWidth={1.5} />
            </button>
            <h1 className="text-2xl font-bold" style={{color: '#ce7b5b'}}>إدارة الأسئلة</h1>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingQuestion(null)
              resetForm()
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all hover:bg-[#ce7b5b] hover:text-black"
            style={{background: '#000000', color: 'white'}}
          >
            <Plus size={20} strokeWidth={1.5} />
            سؤال جديد
          </button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Question Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">نص السؤال</label>
                <textarea
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg outline-none"
                  style={{borderColor: '#9C7DDE'}}
                  rows="3"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(num => (
                  <div key={num}>
                    <label className="block text-sm font-semibold mb-2">الخيار {num}</label>
                    <input
                      type="text"
                      value={formData[`option${num}`]}
                      onChange={(e) => setFormData({ ...formData, [`option${num}`]: e.target.value })}
                      className="w-full p-3 border-2 rounded-lg outline-none"
                      style={{borderColor: '#9C7DDE'}}
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">الإجابة الصحيحة</label>
                <select
                  value={formData.correct_answer}
                  onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                  className="w-full p-3 border-2 rounded-lg outline-none"
                  style={{borderColor: '#9C7DDE'}}
                  required
                >
                  <option value="0">الخيار 1</option>
                  <option value="1">الخيار 2</option>
                  <option value="2">الخيار 3</option>
                  <option value="3">الخيار 4</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 text-white py-3 rounded-lg font-bold transition-all hover:bg-[#ce7b5b] hover:text-black"
                  style={{background: '#000000'}}
                >
                  {editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingQuestion(null)
                    resetForm()
                  }}
                  className="px-6 py-3 rounded-lg font-bold transition-all"
                  style={{background: '#E0E0E0', color: '#000000'}}
                  onMouseEnter={(e) => e.target.style.background = '#BDBDBD'}
                  onMouseLeave={(e) => e.target.style.background = '#E0E0E0'}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-400 text-lg">لا توجد أسئلة بعد</p>
              <p className="text-gray-400 mt-2">اضغط على "سؤال جديد" لإضافة أول سؤال</p>
            </div>
          ) : (
            questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl shadow-lg p-6 ${
                  question.is_active ? 'border-2 border-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">السؤال #{question.id}</h3>
                      {question.is_active && (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          نشط الآن
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 text-lg mb-4">{question.question_text}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {question.options.map((option, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg ${
                            idx === question.correct_answer
                              ? 'bg-green-100 border-2 border-green-500'
                              : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {idx === question.correct_answer && (
                              <CheckCircle size={16} strokeWidth={1.5} className="text-green-600" />
                            )}
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => toggleActive(question.id, question.is_active)}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${
                      question.is_active
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {question.is_active ? 'إيقاف' : 'تفعيل'}
                  </button>
                  <button
                    onClick={() => editQuestion(question)}
                    className="px-6 bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600"
                  >
                    <Edit2 size={18} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(question.id)}
                    className="px-6 bg-red-500 text-white py-2 rounded-lg font-bold hover:bg-red-600"
                  >
                    <Trash2 size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
