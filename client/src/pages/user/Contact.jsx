import { useState } from "react";
import Footers from "../../components/Footer";
import { toast, Toaster } from "sonner";
import {
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdSend,
  MdCheckCircle,
  MdSupportAgent,
} from "react-icons/md";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setSubmitting(true);
    // Simulate API delivery
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast.success("Thank you! Your message has been sent to our Tamil Nadu team.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 700);
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="bg-slate-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Tamil Nadu Customer Support
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
              We're Here to Help You Drive
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto mt-2 text-sm sm:text-base">
              Have questions about vehicle booking, Tamil Nadu pickup hubs, or document verification? Get in touch with our local support team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between shadow-xl">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
                  <MdSupportAgent className="text-emerald-400 text-2xl" />
                  <span>Support Center</span>
                </h2>

                <div className="space-y-6 text-sm">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl text-emerald-400 text-xl">
                      <MdPhone />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Helpline (24/7)</p>
                      <p className="text-base font-bold text-white mt-0.5">+91 44 2852 0000</p>
                      <p className="text-xs text-slate-400">+91 98400 12345</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl text-blue-400 text-xl">
                      <MdEmail />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Email Us</p>
                      <p className="text-base font-bold text-white mt-0.5">support@rentaride-tn.com</p>
                      <p className="text-xs text-slate-400">bookings@rentaride-tn.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-800 rounded-xl text-rose-400 text-xl">
                      <MdLocationOn />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-semibold uppercase">Regional Head Office</p>
                      <p className="text-sm font-semibold text-white mt-0.5">
                        No. 45, Anna Salai, Guindy,
                      </p>
                      <p className="text-xs text-slate-400">Chennai, Tamil Nadu — 600032</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hubs */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Tamil Nadu Hubs</p>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {["Chennai Airport", "Chennai Central", "Tambaram", "Coimbatore Airport", "Trichy Central", "Kancheepuram"].map((hub) => (
                    <span key={hub} className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md">
                      {hub}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-8 sm:p-10 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Send Us a Message
              </h2>

              {submitted && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-3 text-emerald-800">
                  <MdCheckCircle className="text-2xl text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold">Message Submitted Successfully</p>
                    <p className="text-xs text-emerald-700">
                      Our customer service representative will respond to you within 2 hours.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. +91 98400 00000"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Booking Enquiry / Document Help"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us how we can assist you..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 disabled:bg-slate-400"
                >
                  <MdSend />
                  <span>{submitting ? "Sending..." : "Submit Message"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footers />
    </>
  );
}

export default Contact;
