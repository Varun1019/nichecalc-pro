import React from 'react';
import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Disclosures - NicheCalc Pro',
  description: 'Read the Privacy Policy and Cookie Disclosures for NicheCalc Pro. Understand how we use Google AdSense, log calculation metrics, and protect data.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 text-slate-300">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
          <Shield className="h-6 w-6" />
        </div>
        <h1 id="privacy-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last Updated: June 16, 2026
        </p>
      </div>

      <div className="space-y-8 text-sm leading-relaxed">
        {/* Intro */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-2">1. Introduction</h2>
          <p>
            At NicheCalc Pro, accessible from our primary domain, protecting the privacy of our visitors is one of our main priorities. This Privacy Policy document outlines the types of information we collect, record, and how we utilize it to optimize our tools.
          </p>
        </section>

        {/* AdSense disclosures */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-2">2. Google AdSense & Third-Party Advertising</h2>
          <p className="mb-3">
            This site uses Google AdSense and other third-party advertising vendors to serve ads. Google, as a third-party vendor, uses cookies to serve ads on our site based on your visits to this and other websites on the internet.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
            <li>
              <strong>DoubleClick DART Cookie:</strong> Google’s use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet.
            </li>
            <li>
              <strong>Opt-Out Options:</strong> Users may opt out of the use of the DART cookie by visiting the Google Ad and Content Network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.
            </li>
            <li>
              Our third-party ad servers or ad networks use technology that sends advertisements directly to your browser. They automatically receive your IP address when this occurs.
            </li>
          </ul>
        </section>

        {/* Cookies policy */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-2">3. Cookies and Web Beacons</h2>
          <p>
            Like any other website, NicheCalc Pro uses &quot;cookies&quot;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
          </p>
        </section>

        {/* Data processing */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-2">4. Calculation History Logging</h2>
          <p>
            To offer our calculation history widgets, our system logs anonymous details about the calculations performed on our tools. This data includes the raw inputs (such as income, grades, or rents) and the calculated outputs. All inputs and outputs logged are tied strictly to an anonymous session ID generated locally in your browser&apos;s localStorage and are not associated with any personally identifiable information (PII).
          </p>
        </section>

        {/* GDPR/CCPA */}
        <section className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-base font-bold text-white mb-2">5. GDPR and CCPA Data Protection Rights</h2>
          <p className="mb-2">
            We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400 text-xs">
            <li><strong>The right to access:</strong> You have the right to request copies of your data.</li>
            <li><strong>The right to erasure:</strong> You have the right to request that we erase your calculation logs. Clearing your browser localStorage deletes your session ID and isolates you from previous logs.</li>
            <li><strong>The right to restrict processing:</strong> You have the right to object to our logging of calculation variables.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
