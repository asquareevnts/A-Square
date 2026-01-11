export default function Gallery() {
    return (
      <div className="min-h-screen text-white px-6">
        <h1 className="text-4xl font-bold mb-6">Event Gallery 📸</h1>
  
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div
              key={i}
              className="h-40 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 opacity-80"
            />
          ))}
        </div>
      </div>
    )
  }
  