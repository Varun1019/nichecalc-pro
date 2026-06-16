'use client';

import React from 'react';
import { BookOpen, HelpCircle } from 'lucide-react';

interface ArticleSectionProps {
  calcType: 'gig-tax' | 'grade-estimator' | 'rent-to-own';
}

export default function ArticleSection({ calcType }: ArticleSectionProps) {
  // 1. Gig-Tax Engine Article details
  const gigTaxContent = {
    title: 'Self-Employment Taxes & Quarterly Estimates: Complete Guide',
    paragraphs: [
      'For independent contractors, freelancers, and gig-economy workers operating on platforms like Upwork, Fiverr, or Uber, understanding the mechanics of self-employment tax is vital to financial health. Unlike traditional W-2 employees whose employers automatically withhold income and FICA taxes (Social Security and Medicare), self-employed individuals must calculate and pay these obligations themselves. The IRS requires freelancers to file quarterly estimated taxes using Form 1040-ES if they expect to owe $1,000 or more in federal taxes for the year.',
      'The foundation of self-employment tax lies in the FICA tax system. The total self-employment tax rate is 15.3%, consisting of two parts: 12.4% for Social Security (old-age, survivors, and disability insurance) and 2.9% for Medicare (hospital insurance). However, you do not pay tax on your entire gross income. The IRS allows you to deduct 7.65% from your net self-employment earnings before calculating the tax. This is mathematically equivalent to multiplying your net business profit by 92.35% (100% - 7.65%) to find your taxable self-employment income, and then applying the 15.3% rate.',
      'In addition to federal self-employment tax, freelancers must account for federal and state income taxes. These are calculated on your net business earnings after subtracting standard or itemized deductions, business expenses, and half of your self-employment tax (which the IRS allows as an "above-the-line" deduction). Contracting platform fees (such as Upwork’s 10% fee or Fiverr’s 20% commission) and direct business expenses (software subscriptions, laptops, home office space) directly reduce your taxable net income, emphasizing the importance of accurate bookkeeping and expense tracking.',
    ],
    formulas: [
      {
        name: 'Net Business Income',
        formula: '\\text{Net Income} = \\text{Gross Freelance Income} - \\text{Platform Commissions} - \\text{Business Expenses}',
        explanation: 'Subtract platform fees and overhead to find your actual business profit.',
      },
      {
        name: 'Federal Self-Employment Tax',
        formula: '\\text{SE Tax} = (\\text{Net Income} \\times 0.9235) \\times 0.153',
        explanation: 'The standard IRS formula representing 15.3% tax on 92.35% of net business income.',
      },
    ],
    faqs: [
      {
        q: 'What are quarterly estimated taxes?',
        a: 'Estimated quarterly taxes are four scheduled tax payments made throughout the year by individuals whose income is not subject to withholding, such as freelancers and sole proprietors. Payments are due in April, June, September, and January.',
      },
      {
        q: 'How does the IRS calculate the self-employment tax deduction?',
        a: 'The IRS allows you to calculate self-employment tax on 92.35% of your net business earnings, which mirrors the FICA tax deduction enjoyed by standard W-2 employees.',
      },
      {
        q: 'Do Upwork and Fiverr fees reduce my taxable income?',
        a: 'Yes, platform fees are considered direct business expenses (commissions paid) and can be fully deducted from your gross income to lower your taxable net profit.',
      },
    ],
  };

  // 2. Grade Estimator Article details
  const gradeContent = {
    title: 'Understanding Weighted Grading Systems & Exam Requirements',
    paragraphs: [
      'In secondary and higher education, syllabi frequently leverage weighted grading systems to determine a student’s final course standing. Unlike a basic points-based system, where every point carries equal value regardless of the assignment type, a weighted grading structure assigns varying percentages of importance to specific categories (e.g., Homework 20%, Lab Reports 15%, Midterm Exams 35%, and the Final Exam 30%). This means that an A grade on a minor homework assignment might have a smaller impact on your final standing than a C grade on a heavily weighted midterm exam.',
      'Calculating your current standing prior to the final exam requires a two-step mathematical normalization. First, you must calculate the weighted score earned in each completed category by multiplying the category score (as a percentage) by its designated weight. Second, you sum these weighted values and divide the result by the sum of the weights of the completed categories. This provides your current standing as a normalized percentage out of 100% of the completed course components, showing you exactly where you stand prior to your final assessment.',
      'To discover what score you need on your final exam to secure your desired final grade (such as 90% for an A, or 80% for a B), you must calculate how many remaining points are needed to bridge the gap. By subtracting your accumulated weighted points from your target grade, you find the required weighted contribution. Dividing this required contribution by the final exam’s weight (expressed as a fraction) gives the exact score you must achieve on the final. If this calculation yields a value greater than 100%, it means the target grade is mathematically impossible without extra credit; if it yields 0% or lower, you have already secured your target grade.',
    ],
    formulas: [
      {
        name: 'Normalized Current Standing',
        formula: '\\text{Current Standing} = \\frac{\\sum (\\text{Category Weight} \\times \\text{Category Score})}{\\sum \\text{Category Weights Completed}}',
        explanation: 'Provides your current class percentage based only on the work submitted so far.',
      },
      {
        name: 'Required Final Exam Score',
        formula: '\\text{Required Score} = \\frac{\\text{Target Grade} - \\text{Total Points Accumulated}}{\\text{Final Exam Weight}} \\times 100',
        explanation: 'Finds the exact exam percentage needed to hit your target course grade.',
      },
    ],
    faqs: [
      {
        q: 'What is a weighted grade?',
        a: 'A weighted grade is a course calculation where assignments are grouped into categories, and each category is assigned a specific percentage of the total course grade. The categories are then averaged and scaled by their weight.',
      },
      {
        q: 'What if my calculated final exam score is negative or zero?',
        a: 'This indicates you have already accumulated enough points in your completed categories to guarantee your target grade, regardless of your performance on the final exam.',
      },
      {
        q: 'How does final exam weight affect my grade?',
        a: 'The higher the weight of the final exam, the more impact it has. A highly weighted final (e.g., 40%) means your grade can swing significantly, while a lower weight (e.g., 10%) provides more stability.',
      },
    ],
  };

  // 3. Rent-to-Own Article details
  const rentContent = {
    title: 'The Financial Structure of Rent-to-Own Home Agreements',
    paragraphs: [
      'Rent-to-own (RTO) or lease-option home contracts are alternative financing arrangements that bridge the gap between traditional renting and homeownership. They are designed for buyers who may not qualify for a conventional mortgage immediately due to credit scores or lack of down payment funds. In a typical lease-option agreement, the buyer signs a contract containing two parts: a standard residential lease and an option agreement. The option agreement grants the tenant the right (but not the obligation) to purchase the home at a locked-in price at the end of the term, typically one to five years.',
      'The economics of rent-to-own contracts differ substantially from standard leases. First, buyers must pay an upfront option fee (option premium), typically 1% to 5% of the purchase price. This fee is non-refundable but is applied towards the down payment or purchase price if the buyer exercises their option. Second, the monthly rent-to-own payment is usually set above market rates. A portion of this monthly payment (the rent credit) is saved by the seller to serve as additional equity buildup, which accumulates over the lease term to form a significant down payment fund.',
      'When analyzing these agreements, it is crucial to perform a side-by-side cost analysis. Standard leasing represents pure sunk cost, as none of the payments build equity or long-term wealth. In contrast, rent-to-own payments split into a sunk rental cost (the portion representing shelter cost) and an equity-buildup credit. However, because rent-to-own monthly payments and option fees are higher than standard market leases, the buyer pays a premium for the option. Calculating this premium ensures the buyer understands the true transaction cost of utilizing alternative owner-financing.',
    ],
    formulas: [
      {
        name: 'Accumulated Equity Buildup',
        formula: '\\text{Total Equity} = \\text{Upfront Option Fee} + (\\text{Monthly Equity Credit} \\times \\text{Months Active})',
        explanation: 'Computes the total funds saved toward your down payment at the end of the agreement.',
      },
      {
        name: 'Sunk Rental Cost',
        formula: '\\text{Sunk Rent} = \\text{Total Rent-to-Own Paid} - \\text{Total Equity Built}',
        explanation: 'Identifies the portion of your payments that represents pure expense rather than savings.',
      },
    ],
    faqs: [
      {
        q: 'What is the option fee in rent-to-own?',
        a: 'The option fee is an upfront, non-refundable payment made by the buyer to the seller to secure the option to buy the home at a future date at a set price. It typically ranges from 1% to 5% of the purchase price.',
      },
      {
        q: 'What happens to the rent credits if I do not buy the house?',
        a: 'In almost all standard rent-to-own agreements, if you choose not to buy the house or fail to obtain a mortgage at the end of the term, the rent credits and upfront option fee are forfeited to the seller.',
      },
      {
        q: 'How does rent-to-own compare to standard renting?',
        a: 'Rent-to-own has higher monthly payments and upfront fees than standard renting, but a portion of the payment builds equity toward home purchase, whereas standard rent is 100% sunk expense.',
      },
    ],
  };

  const activeContent =
    calcType === 'gig-tax'
      ? gigTaxContent
      : calcType === 'grade-estimator'
      ? gradeContent
      : rentContent;

  // Generate Schema.org JSON-LD FAQ Object
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': activeContent.faqs.map((faq) => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a,
      },
    })),
  };

  return (
    <div className="mt-12 border-t border-slate-800 pt-10">
      {/* Inject Schema.org FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="rounded-2xl bg-slate-900/30 p-6 md:p-8 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            {activeContent.title}
          </h2>
        </div>

        {/* Article Paragraphs */}
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          {activeContent.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Formulas segment */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">
            Mathematical Equations & Formulas Used
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeContent.formulas.map((form, i) => (
              <div key={i} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-blue-400 mb-1">{form.name}</h4>
                <div className="bg-slate-950 py-2.5 px-3 rounded-lg border border-slate-900 font-mono text-xs text-white overflow-x-auto my-2">
                  {form.formula}
                </div>
                <p className="text-xs text-slate-400 leading-normal">{form.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Frequently Asked Questions (FAQ)
            </h3>
          </div>
          <div className="space-y-4">
            {activeContent.faqs.map((faq, i) => (
              <div key={i} className="border-b border-slate-800/40 pb-4 last:border-b-0 last:pb-0">
                <h4 className="text-sm font-semibold text-white mb-1.5">{faq.q}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
