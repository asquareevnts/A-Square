import Navbar from "../components/Navbar"
import BottomNav from "../components/BottomNav"

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-24 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
