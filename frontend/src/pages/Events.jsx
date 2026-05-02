import { useEffect, useState } from "react";
import { loadEvents } from "../data/eventsStore";
import { buildApiUrl } from "../config/api";

export default function Events() {
  const [events, setEvents] = useState(() => loadEvents());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [enquiryForm, setEnquiryForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    requirementDate: "",
    eventLocation: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    function refreshEvents() {
      setEvents(loadEvents());
    }

    window.addEventListener("events-updated", refreshEvents);
    window.addEventListener("storage", refreshEvents);

    return () => {
      window.removeEventListener("events-updated", refreshEvents);
      window.removeEventListener("storage", refreshEvents);
    };
  }, []);

  function openEnquiry(eventItem) {
    setSelectedEvent(eventItem);
    setSubmitMessage({ type: "", text: "" });
    setEnquiryForm((prev) => ({
      ...prev,
      message: prev.message || `I am interested in booking ${eventItem.name}. Please share package details.`
    }));
  }

  function closeEnquiry() {
    setSelectedEvent(null);
    setSubmitMessage({ type: "", text: "" });
  }

  async function submitEnquiry(event) {
    event.preventDefault();
    setSubmitMessage({ type: "", text: "" });

    const payload = {
      enquiryType: "event",
      eventName: selectedEvent?.name || "",
      customerName: enquiryForm.customerName.trim(),
      phone: enquiryForm.phone.trim(),
      email: enquiryForm.email.trim(),
      requirementDate: enquiryForm.requirementDate,
      eventLocation: enquiryForm.eventLocation.trim(),
      message: enquiryForm.message.trim()
    };

    if (!payload.customerName || !payload.phone || !payload.message) {
      setSubmitMessage({ type: "error", text: "Please fill name, phone and enquiry details." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("/api/content/enquiry"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit enquiry");
      }

      setSubmitMessage({ type: "success", text: "Enquiry submitted. Our team will contact you shortly." });
      setEnquiryForm({
        customerName: "",
        phone: "",
        email: "",
        requirementDate: "",
        eventLocation: "",
        message: ""
      });
    } catch (error) {
      setSubmitMessage({ type: "error", text: error.message || "Failed to submit enquiry" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Upcoming Events</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Browse premium events with clear details and an easy booking-first experience.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {events.map((event) => (
            <article
              key={event.name}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <img src={event.image} alt={event.name} className="h-40 w-full rounded-xl object-cover" />
              <p className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {event.type}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{event.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{event.date}</p>
              <p className="mt-4 text-slate-600">{event.description}</p>
              <button
                onClick={() => openEnquiry(event)}
                className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Book / Enquire
              </button>
            </article>
          ))}
        </div>
      </div>

      {selectedEvent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={closeEnquiry}>
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-900">Event Enquiry</h2>
            <p className="mt-2 text-sm text-slate-600">{selectedEvent.name}</p>

            <form onSubmit={submitEnquiry} className="mt-5 space-y-3">
              <input
                value={enquiryForm.customerName}
                onChange={(event) => setEnquiryForm((prev) => ({ ...prev, customerName: event.target.value }))}
                placeholder="Full Name"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900"
              />
              <input
                value={enquiryForm.phone}
                onChange={(event) => setEnquiryForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="Phone Number"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900"
              />
              <input
                type="email"
                value={enquiryForm.email}
                onChange={(event) => setEnquiryForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email (optional)"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900"
              />
              <input
                type="date"
                value={enquiryForm.requirementDate}
                onChange={(event) => setEnquiryForm((prev) => ({ ...prev, requirementDate: event.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900"
              />
              <input
                value={enquiryForm.eventLocation}
                onChange={(event) => setEnquiryForm((prev) => ({ ...prev, eventLocation: event.target.value }))}
                placeholder="Event Location"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900"
              />
              <textarea
                rows="4"
                value={enquiryForm.message}
                onChange={(event) => setEnquiryForm((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Enquiry details"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900"
              />

              {submitMessage.text ? (
                <p className={`text-sm ${submitMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                  {submitMessage.text}
                </p>
              ) : null}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeEnquiry}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
