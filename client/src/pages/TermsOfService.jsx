import { Link } from 'react-router-dom'

// ─── EDIT THESE before publishing ───────────────────────────────────────────
const COMPANY_NAME = 'Marketing Analyst'
const CONTACT_EMAIL = 'sagarbhagwat9511@gmail.com' // <-- change to your real contact email
const WEBSITE = 'https://ai-content-dashboard-6dh.pages.dev'
const EFFECTIVE_DATE = '30 June 2026' // <-- change if needed
const JURISDICTION = 'India' // <-- change to your governing-law jurisdiction
// ─────────────────────────────────────────────────────────────────────────────

const H2 = ({ children }) => (
  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-3">{children}</h2>
)
const P = ({ children }) => (
  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{children}</p>
)
const LI = ({ children }) => (
  <li className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{children}</li>
)

function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link to="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to home</Link>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-1">Terms of Service</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Effective date: {EFFECTIVE_DATE}</p>

      <P>
        These Terms of Service (“Terms”) govern your use of <strong>{COMPANY_NAME}</strong>
        {' '}(the “Service”). By creating an account or using the Service, you agree to these
        Terms. If you do not agree, do not use the Service.
      </P>

      <H2>1. The Service</H2>
      <P>{COMPANY_NAME} is a web application that lets marketing agencies connect a client’s
        advertising account (currently Google Ads), pull performance metrics via the provider’s
        API, and generate branded performance reports with an automatically written summary.
        All reporting figures are computed by our software from the data returned by the provider.</P>

      <H2>2. Accounts</H2>
      <ul className="list-disc pl-6 mb-3">
        <LI>You must provide accurate information and keep your credentials secure.</LI>
        <LI>You are responsible for activity under your account.</LI>
        <LI>You must have the right and authorisation to connect any advertising account you add.</LI>
      </ul>

      <H2>3. Connecting Google Ads</H2>
      <ul className="list-disc pl-6 mb-3">
        <LI>Connecting requires you to authorise access through Google’s OAuth flow. You may
          disconnect at any time, which deletes the stored access token.</LI>
        <LI>Your use of Google Ads and its data remains subject to Google’s own terms and policies.</LI>
        <LI>We access Google data only as described in our{' '}
          <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link>{' '}
          and in compliance with the Google API Services User Data Policy, including its Limited Use requirements.</LI>
      </ul>

      <H2>4. Acceptable use</H2>
      <P>You agree not to use the Service unlawfully or to access data you are not authorised to
        access; not to attempt to breach security, reverse engineer, or disrupt the Service; and
        not to resell or misrepresent the Service.</P>

      <H2>5. Your data and reports</H2>
      <P>You retain ownership of your account data and the advertising data you connect. You
        grant us the limited rights needed to operate the Service (store, process, and render
        your data into reports) as described in the Privacy Policy. Generated reports are stored
        in your account for your use.</P>

      <H2>6. Availability and changes</H2>
      <P>The Service is provided on an “as available” basis. We may modify, suspend, or
        discontinue features, and we may update these Terms; continued use after changes
        constitutes acceptance.</P>

      <H2>7. Disclaimers</H2>
      <P>The Service is provided “as is” without warranties of any kind. While we compute
        figures faithfully from the provider’s data, we do not warrant that third-party data
        (e.g. from Google Ads) is complete, accurate, or uninterrupted.</P>

      <H2>8. Limitation of liability</H2>
      <P>To the maximum extent permitted by law, we are not liable for indirect, incidental, or
        consequential damages, or for any loss of data or profits arising from your use of the Service.</P>

      <H2>9. Termination</H2>
      <P>You may stop using the Service and request account deletion at any time. We may suspend
        or terminate accounts that violate these Terms.</P>

      <H2>10. Governing law</H2>
      <P>These Terms are governed by the laws of {JURISDICTION}, without regard to conflict of law rules.</P>

      <H2>11. Contact</H2>
      <P>{COMPANY_NAME} — Email:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>{' '}
        — Website:{' '}
        <a href={WEBSITE} className="text-indigo-600 dark:text-indigo-400 hover:underline">{WEBSITE}</a></P>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm">
        <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">Privacy Policy</Link>
      </div>
    </div>
  )
}

export default TermsOfService
