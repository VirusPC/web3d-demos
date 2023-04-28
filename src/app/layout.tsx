import './globals.css'
import '../../assets/iconfont/iconfont.css'
import { Inter } from 'next/font/google'
import Header from '../../components/header'

const inter = Inter({ subsets: ['latin'] })


export const metadata = {
  title: 'Web3D Demos',
  description: 'web 3d demos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='bg-white'>
        {/* <Header/> */}
        <Header/>
        <main className="relative isolate px-6 pt-14 lg:px-8">
        {children}
        </main>
      </body>
    </html>
  )
}
