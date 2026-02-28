import { useEffect, useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { loadContactInfo } from "../data/contactStore";
import { loadSocialLinks } from "../data/socialLinksStore";

export default function Contact() {
  const [contactInfo, setContactInfo] = useState(() => loadContactInfo());
  const [socialLinks, setSocialLinks] = useState(() => loadSocialLinks());

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

        <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-2xl">Send a Message</h2>
          <div className="mt-6 space-y-4">
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
              placeholder="Your Name"
            />
            <input
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
              placeholder="Email"
            />
            <textarea
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
              placeholder="Message"
              rows="5"
            />
            <button className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
