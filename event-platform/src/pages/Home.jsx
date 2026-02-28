import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="px-6 pb-16 pt-12 md:pt-16">
        <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-2 md:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-sm font-medium text-slate-700">
              Premium event experiences
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Discover events in a
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent"> modern, modular way</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Explore curated experiences, manage bookings smoothly, and host with confidence through an elegant white-first interface.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-800">
                Explore Events
              </button>
              <button className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-50">
                Host an Event
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Active Events</p>
              <p className="mt-2 text-3xl font-bold">120+</p>
              <p className="mt-2 text-sm text-emerald-600">+18% this month</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Happy Attendees</p>
              <p className="mt-2 text-3xl font-bold">35K</p>
              <p className="mt-2 text-sm text-indigo-600">Across multiple cities</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2">
              <p className="text-sm font-medium text-slate-500">Trusted by creators and brands</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm font-medium text-slate-700">
                <span className="rounded-lg bg-slate-50 px-3 py-2">Corporate</span>
                <span className="rounded-lg bg-slate-50 px-3 py-2">Music</span>
                <span className="rounded-lg bg-slate-50 px-3 py-2">Community</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Curated Discovery",
                text: "Find premium events with clean categories and focused recommendations."
              },
              {
                title: "Seamless Booking",
                text: "Book quickly with a reliable flow built for desktop and mobile users."
              },
              {
                title: "Organizer Control",
                text: "Manage schedules, attendance, and updates from one modular dashboard."
              }
            ].map((item) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-600">{item.text}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <h2 className="text-2xl font-semibold text-slate-900">Built for premium event journeys</h2>
            <p className="mt-3 max-w-2xl text-slate-600">
              Minimal visuals, strong typography, and modular content blocks create a polished experience that scales with your brand.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
