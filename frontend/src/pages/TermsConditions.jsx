import LegalLayout from '../components/LegalLayout'

const sections = [
  {
    title: '1. General',
    body: [
      'By accessing or placing an order on this website, you agree to be bound by these Terms & Conditions. Sri Ganesh Labels operates this website and sells labels, stickers, barcode labels, DT materials and thermal rolls manufactured by us.',
      'We reserve the right to update these terms at any time. Changes will be effective immediately once published on this page.',
    ],
  },
  {
    title: '2. Orders & Pricing',
    body: [
      'All prices are listed in Indian Rupees (₹) and are subject to change without prior notice. Applicable GST is added as per government regulations.',
      'An order is confirmed only after successful payment or COD verification. We reserve the right to cancel any order due to pricing errors, stock unavailability or suspected fraud, with a full refund where payment was already made.',
    ],
  },
  {
    title: '3. Custom Printed Products',
    body: [
      'For custom-designed labels, we share a digital proof for approval before printing. Once you approve the proof, production begins and the order cannot be modified or cancelled.',
      'Colours may vary slightly between the on-screen proof and the final printed product due to monitor differences and printing processes.',
    ],
  },
  {
    title: '4. Payments',
    body: [
      'We accept secure online payments and Cash on Delivery (COD) on eligible orders and pin codes. COD orders may be verified by phone before dispatch.',
    ],
  },
  {
    title: '5. Shipping & Delivery',
    body: [
      'Orders are dispatched from our Salem facility, typically within 2–5 business days. Delivery timelines vary by location, usually 3–10 business days across India.',
      'Please refer to our Shipping & Return Policy for full details.',
    ],
  },
  {
    title: '6. Intellectual Property',
    body: [
      'All content on this website — including text, images, logos and designs — is the property of Sri Ganesh Labels and may not be reproduced without written permission.',
      'Customers retain ownership of the artwork they submit for custom printing and confirm they hold the rights to use it.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    body: [
      'Sri Ganesh Labels shall not be liable for any indirect or consequential damages arising from the use of our products or website. Our total liability is limited to the value of the order in question.',
    ],
  },
  {
    title: '8. Contact',
    body: ['Sri Ganesh Labels, 1&2, Sri Ayyappan Nagar, Mookaneri Adikarai, Salem 636008.', 'Phone: 0427 2221968 · Email: sriganeshlabelssalem@gmail.com'],
  },
]

export default function TermsConditions() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      subtitle="The terms that govern your use of our website and purchases from Sri Ganesh Labels."
      crumb="Terms & Conditions"
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
