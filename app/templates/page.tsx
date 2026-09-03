// app/templates/page.tsx
// Email Templates for Realtor Outreach
// Ready-to-use templates for sales and onboarding

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Copy, Check, ArrowLeft, Sparkles, Users, Building2, Star, Phone } from 'lucide-react'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  useCase: string
}

const templates: EmailTemplate[] = [
  {
    id: 'intro',
    name: 'Initial Outreach',
    subject: 'Upgrade Your Real Estate Business - Free Demo',
    useCase: 'First contact with a new prospect',
    body: `Hi [AGENT_NAME],

I noticed [BROKERAGE_NAME] is doing great work in [MARKET_AREA]. I wanted to reach out because we've developed a real estate platform that's helping agents like you close more deals with less effort.

What makes us different:
• AI assistant that qualifies leads 24/7
• All 6 property types (residential, commercial, industrial - buy & rent)
• You own 100% of your data
• Starting at just $99/month

I've created a personalized demo showing exactly how [BROKERAGE_NAME] would look on our platform:

[DEMO_URL]

Would you have 15 minutes this week for a quick call? I'd love to show you how agents are using Javari AI to automate their follow-ups and close more deals.

Best,
[YOUR_NAME]
CR Realtor Platform
[YOUR_PHONE]`
  },
  {
    id: 'demo-sent',
    name: 'Demo Follow-Up',
    subject: 'Your Personalized Demo is Ready - [BROKERAGE_NAME]',
    useCase: 'After creating a demo for a prospect',
    body: `Hi [AGENT_NAME],

Great news! I've created a personalized demo site showing how [BROKERAGE_NAME] would look on the CR Realtor Platform.

🔗 View Your Demo: [DEMO_URL]

Login Credentials:
Email: [DEMO_EMAIL]
Password: [DEMO_PASSWORD]

What you'll see:
✅ Your branding and profile
✅ Property search with all 6 categories
✅ Lead capture that actually converts
✅ AI assistant (try asking it a question!)
✅ Analytics dashboard

This demo is yours to explore - no credit card required, no pressure. Just see what's possible.

If you have any questions or want a walkthrough, I'm happy to hop on a quick call.

Best,
[YOUR_NAME]
CR Realtor Platform
[YOUR_PHONE]`
  },
  {
    id: 'follow-up-1',
    name: 'First Follow-Up',
    subject: 'Quick question about your demo',
    useCase: '3-5 days after sending demo',
    body: `Hi [AGENT_NAME],

I wanted to check in and see if you had a chance to explore your demo site:

[DEMO_URL]

I noticed you serve [MARKET_AREA] - we've had great success with agents in that area who use our platform for:

• Capturing leads from all property types (not just residential)
• Automated follow-up sequences
• Real-time market analytics

Would you have 10 minutes this week for a quick call? I'd love to answer any questions and hear your feedback on the demo.

Best,
[YOUR_NAME]
[YOUR_PHONE]`
  },
  {
    id: 'follow-up-2',
    name: 'Second Follow-Up',
    subject: 'Last chance to check out your demo',
    useCase: '7-10 days after first follow-up',
    body: `Hi [AGENT_NAME],

I know you're busy, so I'll keep this short.

Your personalized demo for [BROKERAGE_NAME] is still available:
[DEMO_URL]

If now isn't the right time, no worries at all. But if you're looking to:
• Save time on lead follow-up
• Expand into commercial or industrial listings
• Get better insights into your business

I'm here to help whenever you're ready.

Best,
[YOUR_NAME]`
  },
  {
    id: 'pricing-inquiry',
    name: 'Pricing Response',
    subject: 'Re: Pricing for CR Realtor Platform',
    useCase: 'When a prospect asks about pricing',
    body: `Hi [AGENT_NAME],

Thanks for your interest in pricing! Here's our straightforward structure:

📊 STARTER - $99/month per agent
• Personal website
• Up to 50 listings
• Basic CRM
• Lead capture forms

⭐ PROFESSIONAL - $199/month per agent (Most Popular)
• Everything in Starter
• Unlimited listings
• Javari AI Assistant
• Advanced analytics
• Automated follow-ups

🏢 ENTERPRISE - $399/month per agent
• Everything in Professional
• Unlimited team members
• White-label branding
• API access
• Dedicated support

All plans include:
✅ No long-term contracts
✅ 14-day free trial
✅ Full data ownership
✅ All 6 property types

Would you like me to set up a demo so you can see exactly what you'd be getting?

Best,
[YOUR_NAME]`
  },
  {
    id: 'competitor-switch',
    name: 'Competitor Migration',
    subject: 'Thinking about switching from [COMPETITOR]?',
    useCase: 'When a prospect uses kvCORE, BoomTown, etc.',
    body: `Hi [AGENT_NAME],

I heard you're currently using [COMPETITOR]. Many agents come to us after feeling frustrated with:

• High monthly costs ($500-$1,000+/month)
• Limited to residential only
• No real AI assistance
• Locked into their ecosystem

Here's what switching to CR Realtor Platform gets you:

| Feature | [COMPETITOR] | CR Platform |
|---------|-------------|-------------|
| Price | $[COMPETITOR_PRICE]/mo | $199/mo |
| AI Assistant | ❌ | ✅ Javari AI |
| All Property Types | ❌ | ✅ All 6 |
| Data Ownership | ❌ | ✅ 100% yours |
| Contract | 12 months | Month-to-month |

We'll even help migrate your data for free.

Want to see a side-by-side comparison? I can create a demo with your actual listings.

Best,
[YOUR_NAME]`
  },
  {
    id: 'closed-won',
    name: 'Welcome Email',
    subject: 'Welcome to CR Realtor Platform! 🎉',
    useCase: 'After closing a new customer',
    body: `Hi [AGENT_NAME],

Welcome to the CR Realtor Platform family! 🎉

We're thrilled to have [BROKERAGE_NAME] on board. Here's everything you need to get started:

📍 YOUR DASHBOARD
[DASHBOARD_URL]

📱 MOBILE APP
Download for iOS: [IOS_LINK]
Download for Android: [ANDROID_LINK]

🎓 GETTING STARTED
1. Complete your profile
2. Add your first listing
3. Set up Javari AI preferences
4. Connect your calendar

📚 RESOURCES
• Video tutorials: [TUTORIALS_URL]
• Help center: [HELP_URL]
• Live chat support: Available 24/7

🗓️ YOUR ONBOARDING CALL
I've scheduled a 30-minute onboarding call for [DATE_TIME].
Join link: [MEETING_LINK]

Questions before then? Just reply to this email or call me at [YOUR_PHONE].

Welcome aboard!

Best,
[YOUR_NAME]
Your Dedicated Account Manager`
  }
]

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(templates[0])
  const [copied, setCopied] = useState(false)
  const [customValues, setCustomValues] = useState({
    AGENT_NAME: 'Tony',
    BROKERAGE_NAME: 'Premiere Plus Realty',
    MARKET_AREA: 'Naples, FL',
    DEMO_URL: 'https://javarikeys.com',
    DEMO_EMAIL: 'demo@example.com',
    DEMO_PASSWORD: 'Demo2024!',
    YOUR_NAME: 'Roy Henderson',
    YOUR_PHONE: '(239) 555-0100',
    COMPETITOR: 'kvCORE',
    COMPETITOR_PRICE: '499'
  })

  const replaceVariables = (text: string) => {
    let result = text
    Object.entries(customValues).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
    })
    return result
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(replaceVariables(text))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/sales" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Email Templates</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Template List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="font-bold text-lg mb-4">Templates</h2>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedTemplate.id === template.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-500">{template.useCase}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Variable Editor */}
            <div className="bg-white rounded-xl shadow-sm p-4 mt-6">
              <h2 className="font-bold text-lg mb-4">Customize Variables</h2>
              <div className="space-y-3">
                {Object.entries(customValues).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm text-gray-500 mb-1">{key}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setCustomValues({ ...customValues, [key]: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Subject */}
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Subject:</div>
                    <div className="font-medium">{replaceVariables(selectedTemplate.subject)}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedTemplate.subject)}
                    className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center space-x-1"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Email Body</h3>
                  <button
                    onClick={() => copyToClipboard(selectedTemplate.body)}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                      copied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Body</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-gray-700 bg-gray-50 p-4 rounded-lg text-sm leading-relaxed">
                  {replaceVariables(selectedTemplate.body)}
                </pre>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 rounded-xl p-6 mt-6">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Pro Tips for This Template
              </h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                {selectedTemplate.id === 'intro' && (
                  <>
                    <li>• Research the agent before reaching out - mention something specific</li>
                    <li>• Always include a personalized demo link</li>
                    <li>• Keep the first email under 200 words</li>
                  </>
                )}
                {selectedTemplate.id === 'demo-sent' && (
                  <>
                    <li>• Send within 24 hours of demo creation</li>
                    <li>• Include easy-to-copy credentials</li>
                    <li>• Highlight one specific feature they'd love</li>
                  </>
                )}
                {selectedTemplate.id === 'follow-up-1' && (
                  <>
                    <li>• Wait 3-5 days before first follow-up</li>
                    <li>• Reference something specific about their market</li>
                    <li>• Keep it short - 3-4 sentences max</li>
                  </>
                )}
                {selectedTemplate.id === 'competitor-switch' && (
                  <>
                    <li>• Know the competitor's pricing and limitations</li>
                    <li>• Emphasize pain points they likely experience</li>
                    <li>• Offer free data migration as a sweetener</li>
                  </>
                )}
                {selectedTemplate.id === 'closed-won' && (
                  <>
                    <li>• Send immediately after contract signing</li>
                    <li>• Include ALL login info and resources</li>
                    <li>• Schedule onboarding call within 48 hours</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
