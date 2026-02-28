import BottomNav from "../components/BottomNav";

export default function AppLayout({ children }) {
  return (
    <div className="md:hidden pb-16">
      {children}
      <BottomNav />
    </div>
  );
}
