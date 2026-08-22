import LegalLayout from '../components/LegalLayout'

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      'We collect the information you provide when you place an order, create an account or contact us, including your name, email address, phone number, billing and shipping addresses.',
      'For COD (Cash on Delivery) orders we may also verify your contact number before dispatch. We do not store full card details — payments are processed by secure third-party payment gateways.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: [
      'Your information is used only to process and deliver your orders, provide customer support, send order updates, prepare GST invoices and improve our products and services.',
      'We may use your email or phone number to share order-related communication. We will never sell or rent your personal information to any third party.',
    ],
  },
  {
    title: '3. Sharing of Information',
    body: [
      'We share your details only with trusted partners required to complete your order, such as courier companies (for delivery) and payment gateways (for secure transactions).',
      'We may also disclose information if required by law, regulation or valid legal process.',
    ],
  },
  {
    title: '4. Data Security',
    body: [
      'Our website uses industry-standard security measures, including SSL encryption, to protect your data. While no system is completely secure, we take reasonable steps to safeguard your personal information.',
    ],
  },
  {
    title: '5. Cookies',
    body: [
      'We use cookies and similar technologies to keep items in your cart, remember your preferences and analyse site traffic. You can disable cookies in your browser settings, though some features of the site may not work correctly.',
    ],
  },
  {
    title: '6. Your Rights',
    body: [
      'You may request access to, correction of, or deletion of your personal information at any time by contacting us at sriganeshlabelssale@gmail.com.',
    ],
  },
  {
    title: '7. Contact Us',
    body: [
      'Sri Ganesh Labels, 300, Cherry Road, Salem – 636007, Tamil Nadu.',
      'Phone: 0427-4030892 · Email: sriganeshlabelssale@gmail.com',
    ],
  },
]

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How Sri Ganesh Labels collects, uses and protects your personal information."
      crumb="Privacy Policy"
    >
      <p className="text-sm text-slate-500">Last updated: August 2026</p>
      <div className="mt-8 space-y-8">
        {sections.map(({ title, body }) => (
          <div key={title}>
            <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
            {body.map((p, i) => (
              <p key={i} className="mt-3 text-sm leading-relaxed text-slate-600">
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>
    </LegalLayout>
  )
}
