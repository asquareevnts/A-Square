import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultProducts, loadProducts, saveProducts } from "../data/productsStore";
import { defaultContactInfo, loadContactInfo, saveContactInfo } from "../data/contactStore";
import { defaultEvents, loadEvents, saveEvents } from "../data/eventsStore";
import { defaultGalleryItems, loadGalleryItems, saveGalleryItems } from "../data/galleryStore";
import { defaultSocialLinks, loadSocialLinks, saveSocialLinks } from "../data/socialLinksStore";
import { buildApiUrl } from "../config/api";
import { useAuth } from "../context/AuthContext";

export default function Admin() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [products, setProducts] = useState(() => loadProducts());
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [events, setEvents] = useState(() => loadEvents());
  const [eventId, setEventId] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventImage, setEventImage] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [galleryItems, setGalleryItems] = useState(() => loadGalleryItems());
  const [galleryId, setGalleryId] = useState(null);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryImage, setGalleryImage] = useState("");

  const [contactInfo, setContactInfo] = useState(() => loadContactInfo());
  const [socialLinks, setSocialLinks] = useState(() => loadSocialLinks());
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState("");
  const [activeQuoteAction, setActiveQuoteAction] = useState(null);
  const [productSyncNotice, setProductSyncNotice] = useState("");

  const totalProducts = useMemo(() => products.length, [products]);
  const totalEvents = useMemo(() => events.length, [events]);
  const totalGalleryItems = useMemo(() => galleryItems.length, [galleryItems]);

  async function loadQuoteRequests() {
    setQuotesError("");
    try {
      const response = await fetch(buildApiUrl("/api/quotes?limit=200"), {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch quote requests");
      }

      setQuoteRequests(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      setQuotesError(error.message || "Failed to load quote requests");
    } finally {
      setQuotesLoading(false);
    }
  }

  useEffect(() => {
    loadQuoteRequests();
  }, []);

  async function handleQuoteStatusChange(quoteId, status) {
    setActiveQuoteAction(`${quoteId}:${status}`);
    setQuotesError("");

    try {
      const response = await fetch(buildApiUrl(`/api/quotes/${quoteId}/status`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status,
          adminNotes: status === "ACCEPTED" ? "Approved by admin" : "Rejected by admin",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.item) {
        throw new Error(data?.error || "Failed to update quote status");
      }

      setQuoteRequests((prev) => prev.map((item) => (item.id === quoteId ? data.item : item)));
    } catch (error) {
      setQuotesError(error.message || "Failed to update quote status");
    } finally {
      setActiveQuoteAction(null);
    }
  }

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

  async function handleSubmitProduct(event) {
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
    const result = await saveProducts(nextProducts);
    setProductSyncNotice(result?.success ? "Products synced for all users." : result?.message || "Product sync failed.");
    resetForm();
  }

  function handleEditProduct(product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price ?? ""));
    setImage(product.image);
  }

  async function handleDeleteProduct(id) {
    const nextProducts = products.filter((product) => product.id !== id);
    setProducts(nextProducts);
    const result = await saveProducts(nextProducts);
    setProductSyncNotice(result?.success ? "Products synced for all users." : result?.message || "Product sync failed.");

    if (editingId === id) {
      resetForm();
    }
  }

  async function handleResetProducts() {
    setProducts(defaultProducts);
    const result = await saveProducts(defaultProducts);
    setProductSyncNotice(result?.success ? "Products synced for all users." : result?.message || "Product sync failed.");
    resetForm();
  }

  async function handleSignOut() {
    await logout();
    navigate("/signin");
  }

  function resetEventForm() {
    setEventId(null);
    setEventName("");
    setEventImage("");
    setEventDate("");
    setEventType("");
    setEventDescription("");
  }

  function handleEventImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEventImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmitEvent(event) {
    event.preventDefault();

    const payload = {
      id: eventId || Date.now(),
      name: eventName.trim() || "Untitled Event",
      image: eventImage || defaultEvents[0].image,
      date: eventDate.trim() || "TBD",
      type: eventType.trim() || "General",
      description: eventDescription.trim() || "Event details coming soon."
    };

    const nextEvents = eventId
      ? events.map((item) => (item.id === eventId ? payload : item))
      : [...events, payload];

    setEvents(nextEvents);
    const result = await saveEvents(nextEvents);
    setProductSyncNotice(result?.success ? "Events synced for all users." : result?.message || "Event sync failed.");
    resetEventForm();
  }

  function handleEditEvent(item) {
    setEventId(item.id);
    setEventName(item.name);
    setEventImage(item.image || "");
    setEventDate(item.date);
    setEventType(item.type);
    setEventDescription(item.description);
  }

  async function handleDeleteEvent(id) {
    const nextEvents = events.filter((item) => item.id !== id);
    setEvents(nextEvents);
    const result = await saveEvents(nextEvents);
    setProductSyncNotice(result?.success ? "Events synced for all users." : result?.message || "Event sync failed.");
    if (eventId === id) {
      resetEventForm();
    }
  }

  async function handleResetEvents() {
    setEvents(defaultEvents);
    const result = await saveEvents(defaultEvents);
    setProductSyncNotice(result?.success ? "Events synced for all users." : result?.message || "Event sync failed.");
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

  async function handleSubmitGalleryItem(event) {
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
    const result = await saveGalleryItems(nextItems);
    setProductSyncNotice(result?.success ? "Gallery synced for all users." : result?.message || "Gallery sync failed.");
    resetGalleryForm();
  }

  function handleEditGalleryItem(item) {
    setGalleryId(item.id);
    setGalleryTitle(item.title);
    setGalleryImage(item.image);
  }

  async function handleDeleteGalleryItem(id) {
    const nextItems = galleryItems.filter((item) => item.id !== id);
    setGalleryItems(nextItems);
    const result = await saveGalleryItems(nextItems);
    setProductSyncNotice(result?.success ? "Gallery synced for all users." : result?.message || "Gallery sync failed.");
    if (galleryId === id) {
      resetGalleryForm();
    }
  }

  async function handleResetGalleryItems() {
    setGalleryItems(defaultGalleryItems);
    const result = await saveGalleryItems(defaultGalleryItems);
    setProductSyncNotice(result?.success ? "Gallery synced for all users." : result?.message || "Gallery sync failed.");
    resetGalleryForm();
  }

  function handleContactFieldChange(key, value) {
    setContactInfo((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveContactInfo(event) {
    event.preventDefault();
    const result = await saveContactInfo(contactInfo);
    setProductSyncNotice(result?.success ? "Contact info synced for all users." : result?.message || "Contact info sync failed.");
  }

  async function handleResetContactInfo() {
    setContactInfo(defaultContactInfo);
    const result = await saveContactInfo(defaultContactInfo);
    setProductSyncNotice(result?.success ? "Contact info synced for all users." : result?.message || "Contact info sync failed.");
  }

  function handleSocialLinkChange(key, value) {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveSocialLinks(event) {
    event.preventDefault();
    try {
      const response = await saveSocialLinks(socialLinks);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setProductSyncNotice(data?.message || `Failed to sync social links (${response.status}).`);
        return;
      }

      setProductSyncNotice("Social links synced for all users.");
    } catch {
      setProductSyncNotice("Unable to reach server. Social links saved only on this device.");
    }
  }

  async function handleResetSocialLinks() {
    setSocialLinks(defaultSocialLinks);
    try {
      const response = await saveSocialLinks(defaultSocialLinks);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setProductSyncNotice(data?.message || `Failed to sync social links (${response.status}).`);
        return;
      }

      setProductSyncNotice("Social links synced for all users.");
    } catch {
      setProductSyncNotice("Unable to reach server. Social links saved only on this device.");
    }
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
          <a href="#admin-quotes" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Quotes</a>
          <a href="#admin-products" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Products</a>
          <a href="#admin-events" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Events</a>
          <a href="#admin-gallery" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Gallery</a>
          <a href="#admin-contact" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Contact</a>
          <a href="#admin-social" className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Social Links</a>
        </div>

        <div id="admin-quotes" className="mt-8 rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Quote Requests</h2>
            <button
              onClick={loadQuoteRequests}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh Quotes
            </button>
          </div>

          {quotesError ? <p className="mt-4 text-sm font-medium text-rose-600">{quotesError}</p> : null}
          {quotesLoading ? <p className="mt-4 text-sm text-slate-600">Loading quote requests...</p> : null}

          {!quotesLoading && quoteRequests.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No quote requests found.</p>
          ) : null}

          <div className="mt-5 grid gap-4">
            {quoteRequests.map((quote) => (
              <article key={quote.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-900">Quote #{quote.id}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    quote.status === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : quote.status === "ACCEPTED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                  }`}>
                    {quote.status}
                  </span>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <p><span className="font-semibold">Name:</span> {quote.customerName}</p>
                  <p><span className="font-semibold">Phone:</span> {quote.phone}</p>
                  <p><span className="font-semibold">Email:</span> {quote.email || "Not provided"}</p>
                  <p><span className="font-semibold">Required Date:</span> {quote.requirementDate}</p>
                  <p className="md:col-span-2"><span className="font-semibold">Location:</span> {quote.eventLocation || "Not provided"}</p>
                  <p className="md:col-span-2"><span className="font-semibold">Notes:</span> {quote.notes || "None"}</p>
                  <p><span className="font-semibold">Total:</span> ₹ {Number(quote.totalAmount || 0).toLocaleString("en-IN")}</p>
                  <p><span className="font-semibold">Created:</span> {new Date(quote.createdAt).toLocaleString("en-IN")}</p>
                </div>

                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">Requested Items</p>
                  <ul className="mt-2 space-y-1">
                    {(quote.cartItems || []).map((item, index) => (
                      <li key={`${quote.id}-${index}`}>
                        {index + 1}. {item.name} x{item.qty} (₹ {Number(item.price || 0).toLocaleString("en-IN")})
                      </li>
                    ))}
                  </ul>
                </div>

                {quote.status === "PENDING" ? (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleQuoteStatusChange(quote.id, "ACCEPTED")}
                      disabled={activeQuoteAction === `${quote.id}:ACCEPTED`}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {activeQuoteAction === `${quote.id}:ACCEPTED` ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleQuoteStatusChange(quote.id, "REJECTED")}
                      disabled={activeQuoteAction === `${quote.id}:REJECTED`}
                      className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {activeQuoteAction === `${quote.id}:REJECTED` ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <div id="admin-products" className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{editingId ? "Edit Product" : "Add Product"}</h2>
            {productSyncNotice ? (
              <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{productSyncNotice}</p>
            ) : null}
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
                type="file"
                accept="image/*"
                onChange={handleEventImageUpload}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-white"
              />
              {eventImage ? <img src={eventImage} alt="Event Preview" className="h-28 w-full rounded-lg object-cover" /> : null}
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
                  <img src={item.image} alt={item.name} className="h-32 w-full rounded-lg object-cover" />
                  <p className="mt-3 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{item.type}</p>
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
              <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
              <input
                value={contactInfo.address || ""}
                onChange={(event) => handleContactFieldChange("address", event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500"
                placeholder="Full address"
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