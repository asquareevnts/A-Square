import { useEffect, useState } from "react";
import { loadGalleryItems } from "../data/galleryStore";

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState(() => loadGalleryItems());

  useEffect(() => {
    function refreshGallery() {
      setGalleryItems(loadGalleryItems());
    }

    window.addEventListener("gallery-updated", refreshGallery);
    window.addEventListener("storage", refreshGallery);

    return () => {
      window.removeEventListener("gallery-updated", refreshGallery);
      window.removeEventListener("storage", refreshGallery);
    };
  }, []);

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Event Gallery</h1>
        <p className="mt-3 text-slate-600">A curated visual overview of our premium event experiences.</p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item, index) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <img src={item.image} alt={item.title} className="h-44 w-full object-cover" />
              <div className="p-4">
                <p className="text-sm text-slate-500">Photo {index + 1}</p>
                <h3 className="mt-1 font-semibold text-slate-900">{item.title}</h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
