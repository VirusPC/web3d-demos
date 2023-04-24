import './globals.css'
import '../../assets/iconfont/iconfont.css'
import Header from '../../components/header'


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
        {children}
      </body>
    </html>
  )
}
