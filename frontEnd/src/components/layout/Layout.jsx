import Navbar from './Navbar'
import Footer from './Footer'
import FloatingWhatsApp from '../ui/FloatingWhatsApp'
import PageTransition from '../ui/PageTransition'

export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <PageTransition />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
