import StaticPage from './StaticPage';

const SECTIONS = [
  {
    heading: 'Information We Collect',
    paragraphs: ['When you use Tibu, we may collect information such as:'],
    list: [
      'Your name',
      'Username',
      'Phone number',
      'Profile photo',
      'Saved businesses and products',
      'Information you provide while using Tibu',
    ],
  },
  {
    heading: 'How We Use Your Information',
    paragraphs: ['We use your information to:'],
    list: [
      'Create and manage your Tibu account',
      'Personalize your experience',
      'Save your preferences and saved items',
      'Help you connect with businesses',
      'Provide support when you contact us',
      'Improve Tibu and its features',
    ],
  },
  {
    heading: 'Your Phone Number',
    paragraphs: [
      'Your phone number is used for your account and relevant Tibu services.',
      'Your phone number is not publicly displayed on your profile or automatically shared with businesses.',
      'When you choose to call or contact a business, the relevant contact information may be used to complete that action.',
    ],
  },
  {
    heading: 'Business Information',
    paragraphs: [
      'Tibu may display information provided by businesses, such as business names, locations, contact details, products, prices, photos, availability and other business information.',
      'Businesses are responsible for the accuracy of the information they provide.',
    ],
  },
  {
    heading: 'Keeping Your Information Safe',
    paragraphs: [
      'We take reasonable steps to protect your personal information from unauthorized access, misuse or disclosure. However, no online service can guarantee complete security.',
    ],
  },
  {
    heading: 'Information Sharing',
    paragraphs: [
      'Tibu does not sell your personal information.',
      'Information may be shared when it is necessary to provide a service you have requested, operate Tibu, comply with legal requirements, or protect the safety and security of users and the platform.',
    ],
  },
  {
    heading: 'Your Information',
    paragraphs: [
      'You can review and update the information in your profile through Edit Profile.',
      'If you want your account or personal information deleted, you can contact Tibu through Help & Feedback.',
    ],
  },
  {
    heading: 'Questions About Privacy?',
    paragraphs: [
      'If you have a privacy or security concern, contact Tibu through Help & Feedback.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy & Security"
      intro="Your privacy matters to us."
      draft
      sections={SECTIONS}
    />
  );
}
