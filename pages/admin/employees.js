import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { ArrowRight, Trash2, Search, Users, AlertCircle } from 'lucide-react'

export default function EmployeesManagement() {
  const router = useRouter()
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }
    fetchEmployees()
  }, [])

  useEffect(() => {
    filterEmployees()
  }, [searchTerm, filterType, employees])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error('خطأ في جلب الموظفين:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterEmployees = () => {
    let filtered = employees

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(emp => emp.job_title === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_number.toString().includes(searchTerm)
      )
    }

    setFilteredEmployees(filtered)
  }

  const deleteEmployee = async (employeeId, employeeName) => {
    if (!confirm(`هل أنت متأكد من حذف ${employeeName}؟\n\nسيتم حذف جميع بياناته (الصور، الإجابات، إلخ)`)) {
      return
    }

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (data.success) {
        alert('تم حذف الموظف بنجاح')
        fetchEmployees()
      } else {
        alert('فشل حذف الموظف: ' + (data.message || 'حدث خطأ'))
      }
    } catch (error) {
      console.error('خطأ في حذف الموظف:', error)
      alert('فشل حذف الموظف')
    }
  }

  const getTypeLabel = (type) => {
    switch(type) {
      case 'مجلس_الإدارة': return 'مجلس الإدارة'
      case 'موظف': return 'موظف'
      case 'ضيف': return 'ضيف'
      default: return type
    }
  }

  const getTypeBadgeColor = (type) => {
    switch(type) {
      case 'مجلس_الإدارة': return 'bg-purple-500'
      case 'موظف': return 'bg-blue-500'
      case 'ضيف': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#F3F0EE'}}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tanfeethi-brown border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black font-semibold">جارٍ التحميل...</p>
        </div>
      </div>
    )
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
            <div>
              <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
              <p className="text-sm opacity-80">إجمالي: {employees.length} موظف</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو الرقم..."
                className="w-full pr-10 pl-4 py-3 border-2 rounded-lg outline-none"
                style={{borderColor: '#9C7DDE'}}
              />
            </div>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border-2 rounded-lg outline-none"
              style={{borderColor: '#9C7DDE'}}
            >
              <option value="all">جميع الأنواع</option>
              <option value="مجلس_الإدارة">مجلس الإدارة</option>
              <option value="موظف">موظف</option>
              <option value="ضيف">ضيف</option>
            </select>
          </div>

          <div className="mt-4 flex gap-2 text-sm">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
              مجلس الإدارة: {employees.filter(e => e.job_title === 'مجلس_الإدارة').length}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
              موظفين: {employees.filter(e => e.job_title === 'موظف').length}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              ضيوف: {employees.filter(e => e.job_title === 'ضيف').length}
            </span>
          </div>
        </div>

        {/* Employees List */}
        {filteredEmployees.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 text-lg">
              {searchTerm || filterType !== 'all'
                ? 'لا توجد نتائج للبحث'
                : 'لا يوجد موظفين مسجلين بعد'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((employee, index) => (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Employee Number Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{background: '#000000'}}
                    >
                      {employee.employee_number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-1">
                        {employee.full_name}
                      </h3>
                      <span className={`${getTypeBadgeColor(employee.job_title)} text-white text-xs px-2 py-1 rounded-full`}>
                        {getTypeLabel(employee.job_title)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Employee Info */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-semibold">UID:</span>
                    <span className="font-mono">{employee.uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">تاريخ التسجيل:</span>
                    <span>{new Date(employee.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteEmployee(employee.id, employee.full_name)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  حذف الموظف
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
