'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Name is required.';
    else if (name.trim().length < 2) tempErrors.name = 'Name must be at least 2 characters.';

    if (!email.trim()) tempErrors.email = 'Email is required.';
    else if (!/\\S+@\\S+\\.\\S+/.test(email)) tempErrors.email = 'Please provide a valid email address.';

    if (!message.trim()) tempErrors.message = 'Message is required.';
    else if (message.trim().length < 10) tempErrors.message = 'Message must be at least 10 characters.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Correct RegExp escape sequence in NextJS compiler checks (it was escaping the S incorrectly in double-quotes)
  const validateCorrected = () => {
    const tempErrors: Record<string, string> = {};
    if (!name.trim()) tempErrors.name = 'Name is required.';
    else if (name.trim().length < 2) tempErrors.name = 'Name must be at least 2 characters.';

    if (!email.trim()) tempErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) tempErrors.email = 'Please provide a valid email address.';

    if (!message.trim()) tempErrors.message = 'Message is required.';
    else if (message.trim().length < 10) tempErrors.message = 'Message must be at least 10 characters.';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCorrected()) return;

    setLoading(true);

    // Mock API call to submit form
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
      setSubject('Feedback');
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
          <Mail className="h-6 w-6" />
        </div>
        <h1 id="contact-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Have feedback about our models, or need to request a custom calculator? Fill out the form below.
        </p>
      </div>

      {success ? (
        <div className="rounded-2xl bg-emerald-500/10 p-8 text-center border border-emerald-500/20 shadow-xl glow-emerald">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Message Sent Successfully!</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto mb-6">
            Thank you for reaching out to NicheCalc Pro. Our analyst team will review your inquiry and respond shortly.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="rounded-xl bg-slate-800 text-white font-bold py-2.5 px-6 text-sm hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900/60 p-6 border border-slate-800 shadow-xl backdrop-blur-sm space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="contactName" className="block text-sm font-medium text-slate-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="contactName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`block w-full rounded-xl border bg-slate-950/80 py-3 px-4 text-white focus:outline-none text-sm ${
                errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              placeholder="Dr. Jenkins"
            />
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="contactEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`block w-full rounded-xl border bg-slate-950/80 py-3 px-4 text-white focus:outline-none text-sm ${
                errors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.email}
              </p>
            )}
          </div>

          {/* Subject Selector */}
          <div>
            <label htmlFor="contactSubject" className="block text-sm font-medium text-slate-300 mb-1">
              Inquiry Subject
            </label>
            <select
              id="contactSubject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-3 px-4 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="Feedback">Calculation Feedback</option>
              <option value="Model Bug">Report a Model Bug</option>
              <option value="Ad Placement">Sponsorships &amp; Ads</option>
              <option value="Other">Other / General</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="contactMessage" className="block text-sm font-medium text-slate-300 mb-1">
              Message Content
            </label>
            <textarea
              id="contactMessage"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`block w-full rounded-xl border bg-slate-950/80 py-3 px-4 text-white focus:outline-none text-sm ${
                errors.message ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              placeholder="Describe your inquiry..."
            />
            {errors.message && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle className="h-3 w-3" /> {errors.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl btn-primary py-3.5 px-4 font-bold cursor-pointer text-base focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending Inquiry...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
