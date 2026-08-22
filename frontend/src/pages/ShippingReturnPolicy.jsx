import LegalLayout from '../components/LegalLayout'

const sections = [
  {
    title: '1. Order Processing',
    body: [
      'Orders are processed on business days (Monday to Saturday, excluding public holidays). Orders placed after 4:00 PM are considered received the next business day.',
      'Ready stock items are typically dispatched within 2–5 business days. Custom printed orders are dispatched after proof approval and production, usually 5–8 business days.',
    ],
  },
  {
    title: '2. Shipping Charges & Delivery',
    body: [
      'We ship across India through trusted courier partners. Shipping charges (if applicable) are shown at checkout before you confirm your order. Free shipping may be available above certain order values.',
      'Estimated delivery is 3–10 business days depending on your location. Delivery timelines shared are estimates and not guaranteed.',
    ],
  },
  {
    title: '3. Cash on Delivery (COD)',
    body: [
      'COD is available on eligible pin codes and order values. COD orders may be confirmed over phone or WhatsApp before dispatch.',
      'Repeated refusal of COD parcels without a valid reason may lead to restriction of COD for future orders.',
    ],
  },
  {
    title: '4. Order Tracking',
    body: [
      'Once dispatched, tracking details are shared with you via SMS/email or WhatsApp, and can also be tracked from the My Orders / Order Tracking page on our website.',
    ],
  },
  {
    title: '5. Damaged or Wrong Items',
    body: [
      'Please inspect the parcel at delivery. If you receive damaged, defective or wrong items, contact us within 48 hours of delivery with photos of the product and packaging.',
      'Verified cases will be replaced or refunded at no extra cost, including return shipping where applicable.',
    ],
  },
  {
    title: '6. Returns & Refunds',
    body: [
      'Ready stock items can be returned within 7 days of delivery if unused, in original packaging and in resalable condition. Custom printed products cannot be returned unless they are damaged, defective or differ from the approved proof.',
      'Once the returned item passes inspection, refunds are initiated to the original payment method within 5–7 business days. For COD orders, refunds are made via bank transfer to the account details provided by you. Shipping charges paid on the original order are non-refundable unless the return is due to our error.',
    ],
  },
  {
    title: '7. Cancellations',
    body: [
      'Orders for ready stock items can be cancelled before dispatch. Once an order is dispatched it cannot be cancelled, but it can be refused at delivery (return shipping charges may apply).',
      'Custom printed orders cannot be cancelled once the digital proof has been approved and production has started.',
    ],
  },
  {
    title: '8. Contact',
    body: ['Sri Ganesh Labels, 300, Cherry Road, Salem – 636007, Tamil Nadu.', 'Phone: 0427-4030892 · Email: sriganeshlabelssale@gmail.com'],
  },
]

export default function ShippingReturnPolicy() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Shipping & Return Policy"
      subtitle="Shipping timelines, COD availability, returns and refunds — everything you need to know."
      crumb="Shipping & Return Policy"
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
