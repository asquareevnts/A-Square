import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { loadContactInfo } from "../data/contactStore";
import { loadSocialLinks } from "../data/socialLinksStore";
import { buildApiUrl } from "../config/api";

export default function Contact() {
  const [contactInfo, setContactInfo] = useState(() => loadContactInfo());
  const [socialLinks, setSocialLinks] = useState(() => loadSocialLinks());
  const [feedback, setFeedback] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    function refreshContactInfo() {
      setContactInfo(loadContactInfo());
    }

    function refreshSocialLinks() {
      setSocialLinks(loadSocialLinks());
    }

    window.addEventListener("contact-updated", refreshContactInfo);
    window.addEventListener("social-links-updated", refreshSocialLinks);
    window.addEventListener("storage", refreshSocialLinks);
    window.addEventListener("storage", refreshContactInfo);

    return () => {
      window.removeEventListener("contact-updated", refreshContactInfo);
      window.removeEventListener("social-links-updated", refreshSocialLinks);
      window.removeEventListener("storage", refreshSocialLinks);
      window.removeEventListener("storage", refreshContactInfo);
    };
  }, []);

  const socialItems = [
    { key: "facebook", label: "Facebook", icon: FaFacebook },
    { key: "instagram", label: "Instagram", icon: FaInstagram },
    { key: "whatsapp", label: "WhatsApp", icon: FaWhatsapp },
    { key: "youtube", label: "YouTube", icon: FaYoutube }
  ];

  async function handleFeedbackSubmit(event) {
    event.preventDefault();
    setSubmitStatus({ type: "", message: "" });

    const payload = {
      name: feedback.name.trim(),
      email: feedback.email.trim(),
      message: feedback.message.trim()
    };

    if (!payload.message) {
      setSubmitStatus({ type: "error", message: "Please enter your feedback." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(buildApiUrl("/api/content/feedback"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Unable to submit feedback right now.");
      }

      setFeedback({ name: "", email: "", message: "" });
      setSubmitStatus({ type: "success", message: "Thank you! Your feedback was submitted." });
    } catch (error) {
      setSubmitStatus({ type: "error", message: error.message || "Unable to submit feedback right now." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="min-h-screen bg-white px-4 pb-20 pt-8 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{contactInfo.heading}</h1>
          <p className="mt-4 text-slate-600">{contactInfo.description}</p>
          <div className="mt-8 space-y-4 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-900">Email:</span> {contactInfo.email}</p>
            <p><span className="font-semibold text-slate-900">Phone:</span> {contactInfo.phone}</p>
            <p><span className="font-semibold text-slate-900">Location:</span> {contactInfo.location}</p>
            <p><span className="font-semibold text-slate-900">Address:</span> {contactInfo.address}</p>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold text-slate-900">Follow us</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {socialItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.key}
                    href={socialLinks[item.key]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600"
                  >
                    <Icon className="text-base" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleFeedbackSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Share Your Feedback</h2>
          <div className="mt-6 space-y-4">
            <input
              value={feedback.name}
              onChange={(event) => setFeedback((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
              placeholder="Your Name"
            />
            <input
              value={feedback.email}
              onChange={(event) => setFeedback((prev) => ({ ...prev, email: event.target.value }))}
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
              placeholder="Email"
            />
            <textarea
              value={feedback.message}
              onChange={(event) => setFeedback((prev) => ({ ...prev, message: event.target.value }))}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
              placeholder="Tell us how we can improve"
              rows="5"
            />
            {submitStatus.message ? (
              <p className={`text-sm ${submitStatus.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                {submitStatus.message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
