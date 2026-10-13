import { StaticPage } from '../StaticPage';

export default function FaqPage() {
  return (
    <StaticPage title="FAQ">
      <h3>Is payment real in development?</h3>
      <p>No. Local development uses a clearly labeled DEMO mock provider.</p>
      <h3>Can I pause meals?</h3>
      <p>Yes, submit holiday requests before the configured cutoff (Asia/Kolkata).</p>
      <h3>How are dates calculated?</h3>
      <p>Stored in UTC, displayed in IST. See docs/DATE_POLICY.md in the repository.</p>
    </StaticPage>
  );
}
