import { Link } from 'react-router-dom'

// ─── EDIT THESE before publishing ───────────────────────────────────────────
const COMPANY_NAME = 'Marketing Analyst'
const CONTACT_EMAIL = 'YOUR_CONTACT_EMAIL@example.com' // <-- change to your real contact email
const WEBSITE = 'https://ai-content-dashboard-6dh.pages.dev'
const EFFECTIVE_DATE = '30 June 2026' // <-- change if needed
const HOSTING_REGION = 'India' // <-- where your data is processed/hosted
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

function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Link to="/" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to home</Link>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4 mb-1">Privacy Policy</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Effective date: {EFFECTIVE_DATE}</p>

      <P>
        This Privacy Policy explains how <strong>{COMPANY_NAME}</strong> (“{COMPANY_NAME}”,
        “we”, “us”) collects, uses, stores, and protects information when you use our web
        application and website at{' '}
        <a href={WEBSITE} className="text-indigo-600 dark:text-indigo-400 hover:underline">{WEBSITE}</a>{' '}
        (the “Service”). Questions? Contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>.
      </P>
      <P>
        {COMPANY_NAME} is a reporting tool for marketing agencies. Agencies connect a
        client’s advertising account (currently Google Ads) so the Service can pull
        performance metrics and generate clean, client-ready reports.
      </P>

      <H2>1. Information we collect</H2>
      <P><strong>Account information you provide.</strong> Your email address, a hashed
        password, your agency/organisation name, the clients you report on (name, reporting
        currency), and optional branding (logo, brand colour).</P>
      <P><strong>Google user data (via the Google Ads API).</strong> When you choose to
        connect a Google Ads account and authorise access, we receive and store:</P>
      <ul className="list-disc pl-6 mb-3">
        <LI>An <strong>OAuth refresh token</strong> that lets us call the Google Ads API on your behalf.</LI>
        <LI>The <strong>Google Ads customer ID(s)</strong> you choose to connect.</LI>
        <LI><strong>Advertising performance data</strong> returned by the API — campaign names
          and daily metrics (impressions, clicks, cost, conversions, conversion value) for the
          date ranges you request.</LI>
      </ul>
      <P>We request a single OAuth scope,
        <code className="px-1 text-sm">https://www.googleapis.com/auth/adwords</code>, and use it
        <strong> only to read</strong> the reporting data needed to produce your reports.</P>
      <P><strong>Generated reports.</strong> The reports we produce (computed metrics, an
        AI-written summary, and the rendered HTML/PDF) are stored in your account so you can
        view, download, and re-send them.</P>

      <H2>2. How we use information</H2>
      <P>We use the information solely to operate the Service: to authenticate you and keep
        your data isolated to your agency; to pull the metrics you request and
        <strong> compute reporting figures in our own code</strong> (CTR, CPC, ROAS, etc.);
        to generate a written summary (only already-computed, formatted figures are sent to an
        AI model, which cannot change any number); and to store and render your reports.</P>
      <P>We do <strong>not</strong> use Google user data for advertising, we do
        <strong> not</strong> sell it, and we do <strong>not</strong> use it to train AI/ML models.</P>

      <H2>3. Limited Use — Google API Services disclosure</H2>
      <P>
        {COMPANY_NAME}’s use and transfer of information received from Google APIs to any other
        app will adhere to the{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy"
           className="text-indigo-600 dark:text-indigo-400 hover:underline">Google API Services User Data Policy</a>,
        including the <strong>Limited Use</strong> requirements. Specifically:
      </P>
      <ul className="list-disc pl-6 mb-3">
        <LI>We use Google user data only to provide and improve the user-facing reporting features described here.</LI>
        <LI>We do not transfer or sell Google user data for serving ads, or use it for any other purpose.</LI>
        <LI>Humans do not read Google user data except with your consent for support, for security/abuse handling, or where required by law.</LI>
        <LI>We do not use Google user data to develop, improve, or train generalised AI and/or ML models.</LI>
      </ul>

      <H2>4. How we store and protect data</H2>
      <ul className="list-disc pl-6 mb-3">
        <LI><strong>Token encryption at rest:</strong> OAuth refresh tokens are encrypted before
          storage (authenticated symmetric encryption) and are never written to logs or shown in the UI.</LI>
        <LI><strong>Tenant isolation:</strong> every record is scoped to the agency that owns it;
          one agency can never access another’s data.</LI>
        <LI><strong>Transport security:</strong> access is over HTTPS.</LI>
        <LI><strong>Least access:</strong> a single read scope; we pull only the metrics needed for your reports.</LI>
      </ul>

      <H2>5. Sharing and subprocessors</H2>
      <P>We do not sell your data. We share data only with service providers that help us run
        the Service: <strong>Google</strong> (the Google Ads API as the data source, and the
        Google Gemini API for the written summary, which receives only pre-computed formatted
        figures — never raw account data or tokens) and our hosting/infrastructure providers.</P>

      <H2>6. Data retention and deletion</H2>
      <ul className="list-disc pl-6 mb-3">
        <LI>We retain your account data, connections, and reports while your account is active.</LI>
        <LI><strong>Disconnecting</strong> a Google Ads account immediately deletes the stored refresh token.</LI>
        <LI>You can request account deletion by emailing{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>;
          we delete it within 30 days, except where law requires limited retention.</LI>
        <LI>You can revoke our access anytime at{' '}
          <a href="https://myaccount.google.com/permissions" className="text-indigo-600 dark:text-indigo-400 hover:underline">myaccount.google.com/permissions</a>.</LI>
      </ul>

      <H2>7. Your rights</H2>
      <P>Depending on your location you may have rights to access, correct, export, or delete
        your personal data. To exercise them, contact{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>.</P>

      <H2>8. International transfers</H2>
      <P>Your data may be processed in {HOSTING_REGION}. Where required, we rely on appropriate
        safeguards for cross-border transfers.</P>

      <H2>9. Changes to this policy</H2>
      <P>We may update this policy; we will post the new version here and update the effective date.</P>

      <H2>10. Contact</H2>
      <P>{COMPANY_NAME} — Email:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">{CONTACT_EMAIL}</a></P>

      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 text-sm">
        <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link>
      </div>
    </div>
  )
}

export default PrivacyPolicy
