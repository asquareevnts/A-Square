import { Link, useLocation } from "react-router-dom";
import { FaHome, FaImages, FaCalendarAlt, FaPhone } from "react-icons/fa";

export default function BottomNav() {
  const location = useLocation();

  const navItem = (path, icon) => (
    <Link
      to={path}
      className={`flex flex-col items-center ${
        location.pathname === path ? "text-pink-500" : "text-gray-400"
      }`}
    >
      {icon}
    </Link>
  );

  return (
    <div className="fixed bottom-0 w-full bg-white border-t flex justify-around py-3 md:hidden">
      {navItem("/", <FaHome size={22} />)}
      {navItem("/events", <FaCalendarAlt size={22} />)}
      {navItem("/gallery", <FaImages size={22} />)}
      {navItem("/contact", <FaPhone size={22} />)}
    </div>
  );
}
