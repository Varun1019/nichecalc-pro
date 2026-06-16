import React from 'react';
import { ShieldCheck, Award, BookOpen, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About the Team - NicheCalc Pro',
  description: 'Meet the team of financial analysts, educators, and mathematical modelers behind NicheCalc Pro. Learn about our EEAT standards for calculator development.',
};

export default function AboutPage() {
  const team = [
    {
      name: 'Dr. Sarah Jenkins',
      role: 'Lead Mathematical Modeler',
      bio: 'Dr. Jenkins holds a Ph.D. in Applied Mathematics from Stanford University. With over 12 years of academic experience, she oversees the algorithmic integrity and precision modeling of all academic and grading tools.',
      credential: 'Ph.D. Applied Mathematics',
    },
    {
      name: 'David Thorne, CFA',
      role: 'Senior Financial Analyst',
      bio: 'David is a Chartered Financial Analyst (CFA) with a decade of experience in consumer real estate modeling and freelance tax structures. He ensures all financial projections align with IRS guidelines and owner-financing structures.',
      credential: 'CFA Charterholder',
    },
    {
      name: 'Marcus Vance',
      role: 'Curriculum & Academic Architect',
      bio: 'Marcus is an educational consultant specializing in secondary syllabus development. He designs student-centric grading engines that model modern course weights, helping students track and estimate exam standing.',
      credential: 'M.Ed. Curriculum Design',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
          <Users className="h-6 w-6" />
        </div>
        <h1 id="about-heading" className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          About NicheCalc Pro
        </h1>
        <p className="mt-4 text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          NicheCalc Pro was founded with a single mission: to create accessible, mathematically rigorous calculators that empower freelancers, students, and prospective home buyers.
        </p>
      </div>

      {/* EEAT Value Proposition */}
      <div className="mb-12 rounded-2xl bg-slate-900/40 p-6 border border-slate-800 shadow-md">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          Our Professional Standards (E-E-A-T)
        </h2>
        <div className="grid gap-6 md:grid-cols-2 text-sm text-slate-300 leading-relaxed">
          <div>
            <p className="font-semibold text-white mb-1">Mathematical Authority</p>
            <p className="text-xs text-slate-400">
              Every formula deployed across our site is reviewed by academic mathematicians. We use official IRS formulas (e.g., standard 92.35% FICA self-employment scaling) to guarantee our tax calculations match real-world filings.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Expert Financial Input</p>
            <p className="text-xs text-slate-400">
              Our real estate and tax tools are audited by certified financial professionals. This ensures lease-to-own projections account for option premiums and sunk rental costs accurately.
            </p>
          </div>
        </div>
      </div>

      {/* Team Biographies */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-800 pb-3">
          <Award className="h-5 w-5 text-emerald-400" />
          Meet the Analysts
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {team.map((member) => (
            <div key={member.name} className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{member.name}</h3>
                <span className="inline-block text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 mt-1 mb-3">
                  {member.role}
                </span>
                <p className="text-xs text-slate-400 leading-relaxed">{member.bio}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase">
                <BookOpen className="h-3.5 w-3.5 text-slate-600" />
                {member.credential}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
