import { motion } from "framer-motion";

export default function Home() {
  return (
    /* MAIN HERO WRAPPER — SINGLE SOURCE OF HEIGHT */
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">

      {/* BACKGROUND GLOWS (SAFE & CONTAINED) */}
      {/* SUBTLE GRAIN OVERLAY */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] animate-grain">
        <div className="w-full h-full bg-[url('/noise.png')]"></div>
        <div className="absolute -top-32 -left-32 w-[460px] h-[460px] bg-purple-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[360px] h-[360px] bg-pink-600/20 rounded-full blur-[120px]" />
      </div>

      {/* HERO CONTENT */}
      <section className="relative z-10 h-screen flex items-center px-6 pt-[80px]">
        <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-heading text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              Discover & Host <br />
              <span className="relative inline-block">
                <span className="font-elegant italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Amazing Events
                </span>

                {/* Animated underline */}
                <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                    className="
                    absolute left-0 -bottom-2 h-[2px] w-full
                    origin-left
                    bg-gradient-to-r from-purple-400 to-pink-500
                    rounded-full
                    "
                />
                </span>

            </h1>

            <p className="mt-6 font-body text-lg text-gray-300 max-w-xl leading-relaxed">
              A modern platform to explore events, manage bookings,
              and create unforgettable experiences — all in one place.
            </p>

            <p className="mt-2 text-sm text-purple-300">
              Trusted by creators, brands, and communities
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                className="
                  px-6 py-3 rounded-xl font-semibold
                  bg-gradient-to-r from-purple-500 to-pink-500
                  hover:scale-105
                  hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]
                  active:scale-95
                  transition-all duration-300
                "
              >
                Explore Events
              </button>

              <button
                className="
                  px-6 py-3 rounded-xl
                  border border-white/30
                  hover:bg-white/10
                  transition-all duration-300
                "
              >
                Host an Event
              </button>
            </div>
          </motion.div>

          {/* RIGHT GLASS CARD */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full md:w-[380px]"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25" />

            <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-xl">
              <h3 className="text-2xl font-semibold mb-4">
                Why choose us?
              </h3>

              <ul className="space-y-4 text-gray-200">
                <li>✨ Curated premium events</li>
                <li>⚡ Fast & seamless booking</li>
                <li>📱 Works as website & app</li>
                <li>🔒 Secure & scalable</li>
              </ul>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
