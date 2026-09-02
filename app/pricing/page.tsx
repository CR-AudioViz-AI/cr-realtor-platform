// app/pricing/page.tsx
// Realtor Pricing Page - Competitive pricing with industry-leading features
// Updated: December 28, 2025 - Profitable pricing with 64-65% margins

import Link from 'next/link'
import { Check, X, Star, Zap, Shield, Users, Building2, BarChart3, Phone, ArrowRight, Sparkles, Crown, Briefcase } from 'lucide-react'

export const metadata = {
  title: 'Pricing | CR Realtor Platform',
  description: 'Professional real estate platform pricing. 70-90% less than competitors with MORE features including Javari AI Assistant.'
}

// Individual Agent Plans
const individualPlans = [
  {
    name: 'Starter',
    description: 'Perfect for solo agents building their business',
    price: 99,
    billing: 'per month',
    annualPrice: 990,
    savings: '2 months free',
    credits: '200 AI credits/month',
    features: [
      { text: 'Personal website & branding', included: true },
      { text: 'Up to 50 property listings', included: true },
      { text: 'Lead capture forms', included: true },
      { text: 'Basic CRM (100 leads)', included: true },
      { text: 'Email templates', included: true },
      { text: 'Mobile app access', included: true },
      { text: '1 MLS feed integration', included: true },
      { text: 'Email support', included: true },
      { text: 'Javari AI Assistant (200 credits)', included: true },
      { text: 'Transaction management', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Custom domain', included: false },
    ],
    cta: 'Start 14-Day Free Trial',
    popular: false,
    icon: Zap
  },
  {
    name: 'Professional',
    description: 'For serious agents who want AI working for them',
    price: 249,
    billing: 'per month',
    annualPrice: 2490,
    savings: '2 months free',
    credits: '1,000 AI credits/month',
    features: [
      { text: 'Everything in Starter, plus:', included: true },
      { text: 'Unlimited property listings', included: true },
      { text: 'Unlimited CRM leads', included: true },
      { text: 'Javari AI Assistant (1,000 credits)', included: true },
      { text: '10 transactions/month', included: true },
      { text: '2 MLS feed integrations', included: true },
      { text: 'Advanced analytics dashboard', included: true },
      { text: 'Automated follow-ups', included: true },
      { text: 'Virtual tour integration', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Phone + chat support', included: true },
      { text: 'Investment calculators', included: true },
    ],
    cta: 'Start 14-Day Free Trial',
    popular: true,
    icon: Star
  },
  {
    name: 'Elite',
    description: 'Full power for top-producing agents',
    price: 449,
    billing: 'per month',
    annualPrice: 4490,
    savings: '2 months free',
    credits: '5,000 AI credits/month',
    features: [
      { text: 'Everything in Professional, plus:', included: true },
      { text: 'Javari AI Assistant (5,000 credits)', included: true },
      { text: 'Unlimited transactions', included: true },
      { text: '3 MLS feed integrations', included: true },
      { text: 'White-label website', included: true },
      { text: 'Custom branding & domain', included: true },
      { text: 'API access', included: true },
      { text: 'Dedicated account rep', included: true },
      { text: 'Priority 24/7 support', included: true },
      { text: 'Market analysis reports', included: true },
      { text: 'AI listing descriptions', included: true },
      { text: 'Virtual staging (5/month)', included: true },
    ],
    cta: 'Start 14-Day Free Trial',
    popular: false,
    icon: Crown
  }
]

// Broker & Team Plans
const brokerPlans = [
  {
    name: 'Office',
    description: 'For small teams up to 10 agents',
    price: 499,
    billing: 'per month',
    annualPrice: 4990,
    savings: '2 months free',
    agents: 'Up to 10 agents',
    extraSeat: '$39/mo per additional',
    credits: '5,000 AI credits/month',
    features: [
      { text: 'All Elite features for team', included: true },
      { text: 'Up to 10 agent seats', included: true },
      { text: 'Team lead distribution', included: true },
      { text: 'Agent performance tracking', included: true },
      { text: '2 MLS feeds', included: true },
      { text: 'Logo & color branding', included: true },
      { text: 'Standard analytics dashboard', included: true },
      { text: 'Phone support', included: true },
      { text: 'Online training resources', included: true },
      { text: '3 social impact modules', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    icon: Users
  },
  {
    name: 'Broker',
    description: 'For growing brokerages up to 50 agents',
    price: 1299,
    billing: 'per month',
    annualPrice: 12990,
    savings: '2 months free',
    agents: 'Up to 50 agents',
    extraSeat: '$29/mo per additional',
    credits: '25,000 AI credits/month',
    features: [
      { text: 'Everything in Office, plus:', included: true },
      { text: 'Up to 50 agent seats', included: true },
      { text: '5 MLS feed integrations', included: true },
      { text: 'Full white-label branding', included: true },
      { text: 'Remove CR branding', included: true },
      { text: 'Custom email domain', included: true },
      { text: 'AI concierge for leads', included: true },
      { text: 'Custom AI persona', included: true },
      { text: 'Commission tracking', included: true },
      { text: 'Real-time analytics', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: '10 social impact modules', included: true },
    ],
    cta: 'Contact Sales',
    popular: true,
    icon: Building2
  },
  {
    name: 'Enterprise',
    description: 'For large brokerages up to 200+ agents',
    price: 2999,
    billing: 'per month',
    annualPrice: 29990,
    savings: '2 months free',
    agents: 'Up to 200 agents',
    extraSeat: '$19/mo per additional',
    credits: '100,000 AI credits/month',
    features: [
      { text: 'Everything in Broker, plus:', included: true },
      { text: 'Up to 200 agent seats', included: true },
      { text: 'Unlimited MLS integrations', included: true },
      { text: 'Full custom app & domain', included: true },
      { text: 'Full CSS override capability', included: true },
      { text: 'API + webhooks access', included: true },
      { text: 'Listing syndication', included: true },
      { text: 'Custom AI training', included: true },
      { text: 'Enterprise analytics + API', included: true },
      { text: 'Dedicated customer success manager', included: true },
      { text: 'Custom training & onboarding', included: true },
      { text: 'All 20 social impact modules', included: true },
      { text: '99.9% SLA guarantee', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
    icon: Briefcase
  }
]

const competitors = [
  { name: 'BoomTown', price: '$1,000+', setup: '$750-1,700', aiAssistant: false, allPropertyTypes: false, dataOwnership: false, contracts: '12 months' },
  { name: 'kvCORE', price: '$499-749', setup: 'Included', aiAssistant: false, allPropertyTypes: false, dataOwnership: false, contracts: '12 months' },
  { name: 'CINC', price: '$500-900', setup: 'Varies', aiAssistant: false, allPropertyTypes: false, dataOwnership: false, contracts: '12 months' },
  { name: 'Ylopo', price: '$395+', setup: '+$1k ads', aiAssistant: false, allPropertyTypes: false, dataOwnership: false, contracts: '6-12 months' },
  { name: 'Sierra', price: '$399+', setup: 'Varies', aiAssistant: false, allPropertyTypes: false, dataOwnership: false, contracts: 'Month-to-month' },
  { name: 'Zillow Premier', price: '$300-1,000', setup: 'N/A', aiAssistant: false, allPropertyTypes: false, dataOwnership: false, contracts: '35-40% referral' },
  { name: 'CR Platform', price: '$99-449', setup: 'FREE', aiAssistant: true, allPropertyTypes: true, dataOwnership: true, contracts: 'Month-to-month', highlight: true },
]

const faqs = [
  {
    q: 'How much can I save compared to competitors?',
    a: 'Our Professional plan at $249/month gives you MORE features than BoomTown at $1,000+/month - that\'s 75% savings. Plus we include Javari AI Assistant which competitors don\'t have at any price.'
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! All plans come with a 14-day free trial. No credit card required to start. Test everything before you commit.'
  },
  {
    q: 'What are AI credits and how do they work?',
    a: 'AI credits power Javari, your 24/7 AI assistant. Each credit equals one AI action like writing a listing description, qualifying a lead, sending a follow-up, or generating a market report. Credits refresh monthly and never expire on paid plans.'
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Absolutely. Upgrade or downgrade anytime. When you upgrade, you get immediate access to new features. No long-term contracts, cancel anytime.'
  },
  {
    q: 'Do I own my data?',
    a: 'Yes! 100% data ownership is our core promise. Unlike competitors who lock you in, you can export all your leads, listings, and content anytime. Build here, take it anywhere.'
  },
  {
    q: 'What property types are supported?',
    a: 'All 6 property types: Residential Buy, Residential Rent, Commercial Buy, Commercial Rent, Industrial Buy, and Industrial Rent. Competitors typically only support residential.'
  },
  {
    q: 'What are social impact modules?',
    a: 'Specialized tools for serving underserved communities: veterans, first responders, seniors, first-time buyers, refugees, and more. Each module includes custom workflows, resources, and AI training for that community.'
  },
  {
    q: 'Is there a setup fee?',
    a: 'No setup fees ever. Competitors charge $750-$1,700 for setup. We believe in transparent, simple pricing.'
  }
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">70-90% Less Than Competitors</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Professional Tools,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Fair Pricing
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Why pay $1,000+/month for less features? Get Javari AI Assistant, all 6 property types, 
            and 100% data ownership at a fraction of competitor prices.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> 14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> No setup fees
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> No long-term contracts
            </span>
          </div>
        </div>
      </section>

      {/* Individual Plans */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Individual Agent Plans</h2>
            <p className="text-slate-400">Everything you need to grow your real estate business</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {individualPlans.map((plan) => {
              const Icon = plan.icon
              return (
                <div 
                  key={plan.name}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular 
                      ? 'bg-gradient-to-b from-emerald-500/20 to-slate-800 border-2 border-emerald-500/50' 
                      : 'bg-slate-800/50 border border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>
                  
                  <p className="text-slate-400 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">${plan.price}</span>
                      <span className="text-slate-400">/{plan.billing}</span>
                    </div>
                    <p className="text-sm text-emerald-400 mt-1">
                      ${plan.annualPrice}/year ({plan.savings})
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{plan.credits}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? 'text-slate-300' : 'text-slate-500'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <a 
                    href="https://craudiovizai.com/auth/signup"
                    className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all ${
                      plan.popular
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Broker Plans */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Broker & Team Plans</h2>
            <p className="text-slate-400">Scale your brokerage with enterprise-grade tools</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {brokerPlans.map((plan) => {
              const Icon = plan.icon
              return (
                <div 
                  key={plan.name}
                  className={`relative rounded-2xl p-8 ${
                    plan.popular 
                      ? 'bg-gradient-to-b from-cyan-500/20 to-slate-800 border-2 border-cyan-500/50' 
                      : 'bg-slate-800/50 border border-slate-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Best Value
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${plan.popular ? 'bg-cyan-500/20' : 'bg-slate-700'}`}>
                      <Icon className={`w-6 h-6 ${plan.popular ? 'text-cyan-400' : 'text-slate-400'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  </div>
                  
                  <p className="text-slate-400 mb-2">{plan.description}</p>
                  <p className="text-sm text-cyan-400 mb-6">{plan.agents} • {plan.extraSeat}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-white">${plan.price.toLocaleString()}</span>
                      <span className="text-slate-400">/{plan.billing}</span>
                    </div>
                    <p className="text-sm text-cyan-400 mt-1">
                      ${plan.annualPrice.toLocaleString()}/year ({plan.savings})
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{plan.credits}</p>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link 
                    href="/sales"
                    className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all ${
                      plan.popular
                        ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">See How We Compare</h2>
            <p className="text-slate-400">The same features (and more) at a fraction of the price</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-slate-400 font-medium">Platform</th>
                  <th className="px-6 py-4 text-center text-slate-400 font-medium">Monthly Price</th>
                  <th className="px-6 py-4 text-center text-slate-400 font-medium">Setup Fee</th>
                  <th className="px-6 py-4 text-center text-slate-400 font-medium">AI Assistant</th>
                  <th className="px-6 py-4 text-center text-slate-400 font-medium">All Property Types</th>
                  <th className="px-6 py-4 text-center text-slate-400 font-medium">Data Ownership</th>
                  <th className="px-6 py-4 text-center text-slate-400 font-medium">Contracts</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp) => (
                  <tr 
                    key={comp.name} 
                    className={`border-b border-slate-700/50 ${
                      comp.highlight ? 'bg-emerald-500/10' : ''
                    }`}
                  >
                    <td className={`px-6 py-4 font-semibold ${comp.highlight ? 'text-emerald-400' : 'text-white'}`}>
                      {comp.name}
                      {comp.highlight && <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">YOU</span>}
                    </td>
                    <td className={`px-6 py-4 text-center ${comp.highlight ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                      {comp.price}
                    </td>
                    <td className={`px-6 py-4 text-center ${comp.highlight ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {comp.setup}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {comp.aiAssistant ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {comp.allPropertyTypes ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {comp.dataOwnership ? (
                        <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-400 mx-auto" />
                      )}
                    </td>
                    <td className={`px-6 py-4 text-center text-sm ${comp.highlight ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {comp.contracts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              * Competitor pricing based on publicly available information as of December 2025. 
              Zillow Premier Agent also charges 35-40% referral fees on closed transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 px-4 bg-slate-800/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Why Agents Choose Us</h2>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Javari AI Assistant</h3>
              </div>
              <p className="text-slate-400">
                24/7 AI that qualifies leads, writes listings, sends follow-ups, and generates reports. 
                No competitor offers this at any price.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">All 6 Property Types</h3>
              </div>
              <p className="text-slate-400">
                Residential, commercial, and industrial - buy and rent. 
                Competitors only support residential, limiting your growth.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">100% Data Ownership</h3>
              </div>
              <p className="text-slate-400">
                Your leads, your listings, your content. Export everything anytime. 
                Build here, host anywhere. Never locked in.
              </p>
            </div>
            
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Social Impact Modules</h3>
              </div>
              <p className="text-slate-400">
                20 specialized modules for veterans, first responders, seniors, refugees, and more. 
                Serve your community with purpose-built tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Save 70-90% on Your Real Estate Platform?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of agents who switched and never looked back. 
            14-day free trial, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://craudiovizai.com/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-8 rounded-lg transition-all"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </a>
            <Link 
              href="/demo"
              className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 px-8 rounded-lg transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Powered By */}
      <section className="py-8 px-4 border-t border-slate-700">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-slate-500 text-sm">
            Powered by{' '}
            <Link href="https://craudiovizai.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              CR AudioViz AI
            </Link>
            {' '}• Your Story. Our Design.
          </p>
        </div>
      </section>
    </div>
  )
}
