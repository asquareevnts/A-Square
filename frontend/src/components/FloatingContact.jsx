import { useEffect, useRef, useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { FiMessageCircle, FiX } from "react-icons/fi";
import { loadSocialLinks } from "../data/socialLinksStore";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState(() => loadSocialLinks());
  const ref = useRef(null);

  useEffect(() => {
    function refresh() {
      setSocialLinks(loadSocialLinks());
    }
    window.addEventListener("social-links-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("social-links-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const items = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      icon: FaWhatsapp,
      bg: "bg-green-500 hover:bg-green-600",
      href: socialLinks.whatsapp,
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: FaInstagram,
      bg: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:brightness-110",
      href: socialLinks.instagram,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: FaFacebook,
      bg: "bg-blue-600 hover:bg-blue-700",
      href: socialLinks.facebook,
    },
  ];

  return (
    // Positioned above the mobile bottom nav (bottom-20) and at bottom-6 on desktop
    <div ref={ref} className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3 md:bottom-8 md:right-6">
      {/* Social icons — slide up when open */}
      <div
        className={`flex flex-col items-end gap-2.5 transition-all duration-300 ${
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.key}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              {/* Label pill */}
              <span className="rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
                {item.label}
              </span>
              {/* Icon button */}
              <button
                className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition ${item.bg}`}
                aria-label={item.label}
              >
                <Icon size={20} />
              </button>
            </a>
          );
        })}
      </div>

      {/* Main toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300 ${
          open
            ? "bg-slate-800 text-white hover:bg-slate-700 rotate-0"
            : "bg-indigo-600 text-white hover:bg-indigo-500"
        }`}
        aria-label="Contact us"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={24} />}
      </button>
    </div>
  );
}
