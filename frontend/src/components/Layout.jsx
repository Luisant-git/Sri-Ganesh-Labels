import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ToastHost from './Toast'
import ScrollToTop from './ScrollToTop'
import BackToTop from './BackToTop'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <BackToTop />
      <ToastHost />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}