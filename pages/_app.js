import '@/styles/globals.css'
import { useEffect } from 'react'
import Head from 'next/head'
import { io } from 'socket.io-client'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // منع التمرير الأفقي
    document.body.style.overflow = 'hidden auto'
    document.documentElement.style.overflow = 'hidden auto'

    // قفل الاتجاه على الوضع الرأسي
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(() => {})
    }

    // الاتصال بـ Socket.io للاستماع لأحداث تسجيل الخروج الإجباري
    const socket = io()

    socket.on('force:logout', (data) => {
      console.log('🔴 Force logout received:', data.message)

      // مسح بيانات المستخدم المحلية
      localStorage.removeItem('employee_uid')
      localStorage.removeItem('employee_data')
      localStorage.removeItem('tanfeethi_employee')
      localStorage.removeItem('tanfeethi_last_page')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_info')

      // عرض رسالة للمستخدم
      alert(data.message)

      // إعادة التوجيه للصفحة الرئيسية
      window.location.href = '/'
    })

    // الاستماع لحدث حذف موظف محدد
    socket.on('employee:deleted', (data) => {
      console.log('🚨 Employee deletion event received')

      // جلب بيانات الموظف الحالي
      const employeeData = localStorage.getItem('tanfeethi_employee')
      if (employeeData) {
        const employee = JSON.parse(employeeData)

        // التحقق إذا كان الموظف المحذوف هو المستخدم الحالي
        if (data.employeeId === employee.id || data.employeeNumber === employee.employee_number) {
          console.log('🗑️ Current user account deleted by admin')

          // عرض الرسالة
          alert(data.message)

          // مسح البيانات المحلية
          localStorage.removeItem('tanfeethi_employee')
          localStorage.removeItem('tanfeethi_last_page')

          // إعادة التوجيه للصفحة الرئيسية
          window.location.href = '/'
        }
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#ce7b5b" />
        <link rel="manifest" content="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <title>فعالية التنفيذي</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
