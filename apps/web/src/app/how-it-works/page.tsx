import { StaticPage } from '../StaticPage';

export default function HowItWorksPage() {
  return (
    <StaticPage title="How It Works">
      <ol>
        <li>Choose a tiffin plan and check service availability for your PIN code.</li>
        <li>Select your start date and review meal count, advance, and remaining balance.</li>
        <li>Complete DEMO mock payment locally (or Razorpay when configured).</li>
        <li>Manage holidays, extra orders, and renewals from your dashboard.</li>
      </ol>
    </StaticPage>
  );
}
