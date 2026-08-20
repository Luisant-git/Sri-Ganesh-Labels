import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, ChevronRight } from 'lucide-react'

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...props}>
    <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.6-1.5h1.3V5.1c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3h2.5v7h2.5z" />
  </svg>
)

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
)

const XIcon = (props) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...props}>
    <path d="M17.7 3H21l-7.2 8.2L22.2 21h-6.6l-5.2-6.8L4.5 21H1.2l7.7-8.8L1.5 3h6.8l4.7 6.2L17.7 3zm-1.2 16h1.8L6.9 4.9H5L16.5 19z" />
  </svg>
)

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...props}>
    <path d="M23 12s0-3.9-.5-5.6c-.3-1-1-1.7-2-2C18.8 4 12 4 12 4s-6.8 0-8.5.4c-1 .3-1.7 1-2 2C1 8.1 1 12 1 12s0 3.9.5 5.6c.3 1 1 1.7 2 2 1.7.4 8.5.4 8.5.4s6.8 0 8.5-.4c1-.3 1.7-1 2-2 .5-1.7.5-5.6.5-5.6zM9.8 15.5v-7l6.2 3.5-6.2 3.5z" />
  </svg>
)

const socials = [
  { icon: FacebookIcon, label: 'Facebook' },
  { icon: InstagramIcon, label: 'Instagram' },
  { icon: XIcon, label: 'X' },
  { icon: YoutubeIcon, label: 'YouTube' },
]

const shopLinks = [
  { label: 'All Products', to: '/products' },
  { label: 'Bar code Label', to: '/products?category=Bar+code+Label' },
  { label: 'DT materials', to: '/products?category=DT+materials' },
  { label: 'Thermal Roll', to: '/products?category=Thermal+Roll' },
  { label: 'Wax-Resin Ribbons', to: '/products?category=Wax-Resin+Ribbons' },
]

const serviceLinks = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Shipping', to: '/contact' },
  { label: 'Returns', to: '/contact' },
  { label: 'Privacy Policy', to: '/contact' },
  { label: 'Terms & Conditions', to: '/contact' },
]

const accountLinks = [
  { label: 'My Orders', to: '/order-tracking' },
  { label: 'Cart', to: '/cart' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img src="/web/logo.png" alt="Sri Ganesh Labels" className="h-12 w-12 rounded-xl object-cover" />
              <span className="font-display text-lg font-bold text-white">
                Sri Ganesh <span className="text-accent-400">Labels</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Premium labels, barcode labels, packaging labels and stickers crafted to make your
              products look professional and stand out. Quality materials, reliable printing and
              prompt delivery across India.
            </p>
            <div className="mt-5 space-y-2 text-sm">
              <a href="tel:04274030892" className="flex items-center gap-2.5 hover:text-white">
                <Phone size={15} className="text-accent-400" /> Ph: 0427-4030892
              </a>
              <span className="flex items-center gap-2.5">
                <Phone size={15} className="text-accent-400" /> Cen: 8754030968 · Off: 9443665335
              </span>
              <a href="mailto:sriganeshlabelssale@gmail.com" className="flex items-center gap-2.5 hover:text-white">
                <Mail size={15} className="text-accent-400" /> sriganeshlabelssale@gmail.com
              </a>
              <span className="flex items-center gap-2.5">
                <MapPin size={15} className="text-accent-400" /> 300, Cherry Road, Salem-636007, Tamil Nadu
              </span>
            </div>
            <div className="mt-6 flex gap-3">
              {socials.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-all duration-200 hover:border-accent-500 hover:bg-accent-500 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Shop</h4>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="group flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-accent-400"
                  >
                    <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer service */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">Customer Service</h4>
            <ul className="mt-4 space-y-2.5">
              {serviceLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-slate-400 transition-colors hover:text-accent-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* My account */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-white">My Account</h4>
            <ul className="mt-4 space-y-2.5">
              {accountLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-slate-400 transition-colors hover:text-accent-400">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 Sri Ganesh Labels. All Rights Reserved.</p>
          <p>COD Available • Secure Payments • Pan-India Shipping</p>
        </div>
      </div>
    </footer>
  )
}