import '@/styles/globals.css'
import { useEffect } from 'react'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // منع التمرير الأفقي
    document.body.style.overflow = 'hidden auto'
    document.documentElement.style.overflow = 'hidden auto'
    
    // قفل الاتجاه على الوضع الرأسي
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(() => {})
    }
  }, [])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#8B6F47" />
        <link rel="manifest" content="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <title>فعالية التنفيذي - المدرج البشري</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}
