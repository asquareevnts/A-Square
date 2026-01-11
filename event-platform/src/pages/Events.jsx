export default function Events() {
    return (
      <div className="min-h-screen text-white px-6">
        <h1 className="text-4xl font-bold mb-6">Upcoming Events 🎉</h1>
  
        <div className="grid md:grid-cols-3 gap-6">
          {["Music Fest", "Tech Conference", "Startup Meetup"].map((event, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:scale-105 transition"
            >
              <h3 className="text-xl font-semibold">{event}</h3>
              <p className="text-gray-300 mt-2">
                Discover amazing experiences curated just for you.
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }
  