import StaticPage from './StaticPage';

const SECTIONS = [
  {
    heading: '1. About Tibu',
    paragraphs: [
      'Tibu is a platform that helps customers discover homegrown businesses, products, services and other local offerings.',
      'Tibu provides information and connects customers with businesses. Tibu does not directly own or manufacture the products listed by independent businesses unless specifically stated.',
    ],
  },
  {
    heading: '2. Using Tibu',
    paragraphs: [
      'You agree to use Tibu only for lawful purposes and in a way that does not harm other users, businesses or the platform.',
    ],
  },
  {
    heading: '3. Business Information',
    paragraphs: [
      'Businesses may provide information such as their name, location, contact details, products, prices, photos and availability.',
      'While we may try to keep information useful and up to date, businesses are responsible for the accuracy of the information they provide.',
    ],
  },
  {
    heading: '4. Products & Services',
    paragraphs: [
      'Product descriptions, prices, availability and other details may change. Customers should confirm important details directly with the business before making a purchase or visiting.',
    ],
  },
  {
    heading: '5. Contacting Businesses',
    paragraphs: [
      'Tibu may provide options such as calling or messaging a business. When you choose to contact a business, your interaction may take place directly with that business.',
      'Tibu is not responsible for conversations, agreements, payments or transactions that take place directly between customers and businesses, except where Tibu explicitly provides the service.',
    ],
  },
  {
    heading: '6. Reviews & User Content',
    paragraphs: [
      'If Tibu allows users to submit reviews, feedback, photos or other content, you are responsible for ensuring that the content you submit is truthful, lawful and does not violate the rights of others.',
    ],
  },
  {
    heading: '7. Availability of Tibu',
    paragraphs: [
      'We aim to keep Tibu available and working properly, but we cannot guarantee that the platform will always be available, error-free or uninterrupted.',
    ],
  },
  {
    heading: '8. Changes to Tibu',
    paragraphs: [
      'We may update, change or discontinue features of Tibu when necessary. We may also update these Terms & Conditions from time to time.',
    ],
  },
  {
    heading: '9. Your Account',
    paragraphs: [
      'You are responsible for keeping your account information accurate and for using your account appropriately.',
    ],
  },
  {
    heading: '10. Contact Us',
    paragraphs: [
      'If you have questions about these Terms & Conditions, contact Tibu through Help & Feedback.',
    ],
  },
];

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms & Conditions"
      intro="Please read these terms before using Tibu."
      draft
      sections={SECTIONS}
    />
  );
}
