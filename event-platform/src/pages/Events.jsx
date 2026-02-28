import { useEffect, useState } from "react";
import { loadEvents } from "../data/eventsStore";

export default function Events() {
  const [events, setEvents] = useState(() => loadEvents());

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
              <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                {event.type}
              </p>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">{event.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{event.date}</p>
              <p className="mt-4 text-slate-600">{event.description}</p>
              <button className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                View Event
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
