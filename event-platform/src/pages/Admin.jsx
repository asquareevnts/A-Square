import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultProducts, loadProducts, saveProducts } from "../data/productsStore";
import { defaultContactInfo, loadContactInfo, saveContactInfo } from "../data/contactStore";
import { defaultEvents, loadEvents, saveEvents } from "../data/eventsStore";
import { defaultGalleryItems, loadGalleryItems, saveGalleryItems } from "../data/galleryStore";
import { defaultSocialLinks, loadSocialLinks, saveSocialLinks } from "../data/socialLinksStore";
import { clearAdminSession } from "../utils/adminAuth";

export default function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => loadProducts());
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [events, setEvents] = useState(() => loadEvents());
  const [eventId, setEventId] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [galleryItems, setGalleryItems] = useState(() => loadGalleryItems());
  const [galleryId, setGalleryId] = useState(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryImage, setGalleryImage] = useState("");

  const [contactInfo, setContactInfo] = useState(() => loadContactInfo());
  const [socialLinks, setSocialLinks] = useState(() => loadSocialLinks());

  const totalProducts = useMemo(() => products.length, [products]);
  const totalEvents = useMemo(() => events.length, [events]);
  const totalGalleryItems = useMemo(() => galleryItems.length, [galleryItems]);

  function resetForm() {
    setName("");
    setPrice("");
    setImage("");
    setEditingId(null);
  }

  function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSubmitProduct(event) {
    event.preventDefault();

    const cleanedName = name.trim();
    if (!cleanedName) {
      return;
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return;
    }

    const finalImage = image.trim() || defaultProducts[0].image;

    let nextProducts;
    if (editingId) {
      nextProducts = products.map((product) =>
        product.id === editingId
          ? { ...product, name: cleanedName, price: numericPrice, image: finalImage }
          : product
      );
    } else {
      nextProducts = [
        ...products,
        {
          id: Date.now(),
          name: cleanedName,
          price: numericPrice,
          image: finalImage
        }
      ];
    }

    setProducts(nextProducts);
    saveProducts(nextProducts);
    resetForm();
  }

  function handleEditProduct(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price ?? ""));
    setImage(product.image);
  }

  function handleDeleteProduct(id) {
    const nextProducts = products.filter((product) => product.id !== id);
    setProducts(nextProducts);
    saveProducts(nextProducts);

    if (editingId === id) {
      resetForm();
    }
  }

  function handleResetProducts() {
    setProducts(defaultProducts);
    saveProducts(defaultProducts);
    resetForm();
  }

  function handleSignOut() {
    clearAdminSession();
    navigate("/signin");
  }

  function resetEventForm() {
    setEventId(null);
    setEventName("");
    setEventDate("");
    setEventType("");
    setEventDescription("");
  }

  function handleSubmitEvent(event) {
    event.preventDefault();

    const payload = {
      id: eventId || Date.now(),
      name: eventName.trim() || "Untitled Event",
      date: eventDate.trim() || "TBD",
      type: eventType.trim() || "General",
      description: eventDescription.trim() || "Event details coming soon."
    };

    const nextEvents = eventId
      ? events.map((item) => (item.id === eventId ? payload : item))
      : [...events, payload];

    setEvents(nextEvents);
    saveEvents(nextEvents);
    resetEventForm();
  }

  function handleEditEvent(item) {
    setEventId(item.id);
    setEventName(item.name);
    setEventDate(item.date);
    setEventType(item.type);
    setEventDescription(item.description);
  }

  function handleDeleteEvent(id) {
    const nextEvents = events.filter((item) => item.id !== id);
    setEvents(nextEvents);
    saveEvents(nextEvents);
    if (eventId === id) {
      resetEventForm();
    }
  }

  function handleResetEvents() {
    setEvents(defaultEvents);
    saveEvents(defaultEvents);
    resetEventForm();
  }

  function resetGalleryForm() {
    setGalleryId(null);
    setGalleryTitle("");
    setGalleryImage("");
  }

  function handleGalleryUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setGalleryImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleSubmitGalleryItem(event) {
    event.preventDefault();

    const payload = {
      id: galleryId || Date.now(),
      title: galleryTitle.trim() || "Untitled Gallery Item",
      image: galleryImage || defaultGalleryItems[0].image
    };

    const nextItems = galleryId
      ? galleryItems.map((item) => (item.id === galleryId ? payload : item))
      : [...galleryItems, payload];

    setGalleryItems(nextItems);
    saveGalleryItems(nextItems);
    resetGalleryForm();
  }

  function handleEditGalleryItem(item) {
    setGalleryId(item.id);
    setGalleryTitle(item.title);
    setGalleryImage(item.image);
  }

  function handleDeleteGalleryItem(id) {
    const nextItems = galleryItems.filter((item) => item.id !== id);
    setGalleryItems(nextItems);
    saveGalleryItems(nextItems);
    if (galleryId === id) {
      resetGalleryForm();
    }
  }

  function handleResetGalleryItems() {
    setGalleryItems(defaultGalleryItems);
    saveGalleryItems(defaultGalleryItems);
    resetGalleryForm();
  }

  function handleContactFieldChange(key, value) {
    setContactInfo((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaveContactInfo(event) {
    event.preventDefault();
    saveContactInfo(contactInfo);
  }

  function handleResetContactInfo() {
    setContactInfo(defaultContactInfo);
    saveContactInfo(defaultContactInfo);
  }

  function handleSocialLinkChange(key, value) {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  }

  function handleSaveSocialLinks(event) {
    event.preventDefault();
    saveSocialLinks(socialLinks);
  }

  function handleResetSocialLinks() {
    setSocialLinks(defaultSocialLinks);
    saveSocialLinks(defaultSocialLinks);
  }

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin Dashboard</h1>
            <p className="mt-2 text-slate-600">Manage Products, Events, Gallery, Contact details, and social links.</p>
          </div>
          <div className="flex w-full flex-wrap gap-3 sm:w-auto">
            <button
              onClick={handleResetProducts}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSignOut}
              className="rounded-xl border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#admin-products" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Products</a>
          <a href="#admin-events" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Events</a>
          <a href="#admin-gallery" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Gallery</a>
          <a href="#admin-contact" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Contact</a>
          <a href="#admin-social" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Social Links</a>
        </div>

        <div id="admin-products" className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit Product" : "Add Product"}</h2>
            <form onSubmit={handleSubmitProduct} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Product Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter product name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Price (₹)</label>
                <input
                  type="number"
                  min="1"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="Enter product price"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Upload Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white"
                />
                {image ? (
                  <img src={image} alt="Preview" className="mt-3 h-28 w-full rounded-lg object-cover" />
                ) : null}
              </div>
              <div className="flex gap-3">
                <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {editingId ? "Update Product" : "Add Product"}
                </button>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Products</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {totalProducts} items
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article key={product.id} className="rounded-xl border border-slate-200 p-3">
                  <img src={product.image} alt={product.name} className="h-36 w-full rounded-lg object-cover" />
                  <p className="mt-3 font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm font-medium text-slate-600">₹ {product.price}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div id="admin-events" className="mt-6 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Events</h2>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {totalEvents} items
              </span>
              <button
                onClick={handleResetEvents}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset Events
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={handleSubmitEvent} className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{eventId ? "Edit Event" : "Add Event"}</h3>
              <input
                value={eventName}
                onChange={(event) => setEventName(event.target.value)}
                placeholder="Event name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <input
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                placeholder="Event date"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <input
                value={eventType}
                onChange={(event) => setEventType(event.target.value)}
                placeholder="Event type"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <textarea
                value={eventDescription}
                onChange={(event) => setEventDescription(event.target.value)}
                placeholder="Event description"
                rows="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <div className="flex gap-3">
                <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {eventId ? "Update Event" : "Add Event"}
                </button>
                {eventId ? (
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="grid gap-4 sm:grid-cols-2">
              {events.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{item.type}</p>
                  <h4 className="mt-3 font-semibold text-slate-900">{item.name}</h4>
                  <p className="mt-1 text-sm text-slate-600">{item.date}</p>
                  <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditEvent(item)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(item.id)}
                      className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div id="admin-gallery" className="mt-6 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Gallery</h2>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {totalGalleryItems} items
              </span>
              <button
                onClick={handleResetGalleryItems}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Reset Gallery
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-6 lg:grid-cols-[380px_1fr]">
            <form onSubmit={handleSubmitGalleryItem} className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{galleryId ? "Edit Gallery Item" : "Add Gallery Item"}</h3>
              <input
                value={galleryTitle}
                onChange={(event) => setGalleryTitle(event.target.value)}
                placeholder="Gallery title"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleGalleryUpload}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white"
              />
              {galleryImage ? <img src={galleryImage} alt="Gallery Preview" className="h-28 w-full rounded-lg object-cover" /> : null}
              <div className="flex gap-3">
                <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                  {galleryId ? "Update Item" : "Add Item"}
                </button>
                {galleryId ? (
                  <button
                    type="button"
                    onClick={resetGalleryForm}
                    className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {galleryItems.map((item) => (
                <article key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <img src={item.image} alt={item.title} className="h-36 w-full rounded-lg object-cover" />
                  <p className="mt-3 font-semibold text-slate-900">{item.title}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditGalleryItem(item)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div id="admin-contact" className="mt-6 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Contact Details</h2>
            <button
              onClick={handleResetContactInfo}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset Contact Info
            </button>
          </div>

          <form onSubmit={handleSaveContactInfo} className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Heading</label>
              <input
                value={contactInfo.heading}
                onChange={(event) => handleContactFieldChange("heading", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Contact heading"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
              <input
                value={contactInfo.description}
                onChange={(event) => handleContactFieldChange("description", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Contact description"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                value={contactInfo.email}
                onChange={(event) => handleContactFieldChange("email", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="hello@domain.com"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input
                value={contactInfo.phone}
                onChange={(event) => handleContactFieldChange("phone", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="+91 90000 00000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
              <input
                value={contactInfo.location}
                onChange={(event) => handleContactFieldChange("location", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="City, Country"
              />
            </div>

            <div className="md:col-span-2">
              <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save Contact Info
              </button>
            </div>
          </form>
        </div>

        <div id="admin-social" className="mt-6 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Contact Social Links</h2>
            <button
              onClick={handleResetSocialLinks}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Reset Social Links
            </button>
          </div>

          <form onSubmit={handleSaveSocialLinks} className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Facebook URL</label>
              <input
                value={socialLinks.facebook}
                onChange={(event) => handleSocialLinkChange("facebook", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="https://facebook.com/your-page"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Instagram URL</label>
              <input
                value={socialLinks.instagram}
                onChange={(event) => handleSocialLinkChange("instagram", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="https://instagram.com/your-page"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">WhatsApp URL</label>
              <input
                value={socialLinks.whatsapp}
                onChange={(event) => handleSocialLinkChange("whatsapp", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="https://wa.me/919000000000"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">YouTube URL</label>
              <input
                value={socialLinks.youtube}
                onChange={(event) => handleSocialLinkChange("youtube", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="https://youtube.com/@your-channel"
              />
            </div>

            <div className="md:col-span-2">
              <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Save Social Links
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}