import { useState } from 'react';
import { toast } from 'sonner';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
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
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    if (!message.trim()) {
      setError('Please enter your message.');
      return;
    }
    // Nothing is sent yet — the backend/inbox is connected before launch. Keep the text so it isn't lost.
    setError('');
    setSubmitted(true);
    toast('Sending feedback is not switched on yet.');
  }

  return (
    <StaticPage
      title="Help & Feedback"
      intro="Need help, want to report a problem, or have a suggestion? We’re here to listen."
      draft
      sections={SECTIONS}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
        <h2 className="font-heading text-lg font-bold text-ink">Send Us a Message</h2>
        <Textarea
          id="help-message"
          label="Your message"
          rows={6}
          value={message}
          error={error}
          placeholder="Write your complaint, suggestion, question, or feedback..."
          onChange={(e) => {
            setMessage(e.target.value);
            setSubmitted(false);
            if (error) setError('');
          }}
        />
        <Button type="submit" className="w-full">
          Send Message
        </Button>
        {submitted && (
          <p role="status" className="font-body text-sm font-semibold text-ink">
            Sending feedback is not switched on yet, so your message has not been sent. We&apos;ll connect it before launch.
          </p>
        )}
      </form>
    </StaticPage>
  );
}
