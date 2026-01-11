export default function Contact() {
    return (
      <div className="min-h-screen text-white px-6 max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Contact Us 📬</h1>
  
        <form className="space-y-4">
          <input
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
            placeholder="Your Name"
          />
          <input
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
            placeholder="Email"
          />
          <textarea
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20"
            placeholder="Message"
            rows="4"
          />
          <button className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 font-semibold">
            Send Message
          </button>
        </form>
      </div>
    )
  }
  