import { useState } from 'react';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { SUPPORT_EMAIL } from '../../lib/support';
import StaticPage from './StaticPage';

const SECTIONS = [
  {
    heading: 'Get Help',
    paragraphs: [
      'If you’re having trouble using Tibu or need help with your account, saved items, businesses, products, or any other feature, let us know.',
    ],
  },
  {
    heading: 'Report a Problem',
    paragraphs: [
      'Found something that isn’t working correctly? Tell us what happened so we can look into it.',
    ],
  },
  {
    heading: 'Complaints & Suggestions',
    paragraphs: [
      'Your feedback helps us improve Tibu. You can share a complaint, suggestion, feature request, or anything you’d like us to know.',
    ],
  },
];

export default function HelpPage() {
  const [message, setMessage] = useState('');
  const emailHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Tibu support')}&body=${encodeURIComponent(message)}`;

  return (
    <StaticPage
      title="Help & Feedback"
      intro="Need help, want to report a problem, or have a suggestion? We’re here to listen."
      draft
      sections={SECTIONS}
    >
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-bold text-ink">Send Us a Message</h2>
        <Textarea
          id="help-message"
          label="Your message"
          rows={6}
          value={message}
          placeholder="Write your complaint, suggestion, question, or feedback..."
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button href={emailHref} className="w-full">
          Email Tibu support
        </Button>
        <p className="font-body text-sm text-muted">Your email app will open with this message ready to send.</p>
      </div>
    </StaticPage>
  );
}
