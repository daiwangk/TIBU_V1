import StaticPage from './StaticPage';

const SECTIONS = [
  {
    heading: 'Homegrown businesses are everywhere.',
    paragraphs: [
      'Established businesses have stores & showrooms that put them in front of customers.',
      'But millions of homegrown businesses are creating products — from homes, kitchens, studios and workshops.',
      'They are creating products people genuinely want, building brands around their ideas, and growing their own customers and communities.',
      'Without an offline presence, they often sell through social media content, WhatsApp forwards, recommendations from friends, word of mouth, or simply through people who already know the person behind the business.',
      'To reach new customers, they have to keep creating content, promoting their pages and finding ways to bring people to them.',
      'At the same time, customers scroll through social media to find products they like — but finding trusted sellers, checking nearby availability, understanding the price and figuring out how to connect can quickly become a task.',
    ],
  },
  {
    heading: 'That’s where Tibu comes in.',
    paragraphs: ['Discover what’s homegrown.'],
  },
  {
    heading: 'A place to discover homegrown businesses.',
    paragraphs: [
      'Tibu is a discovery marketplace for homegrown businesses — bringing independent creators, local brands and businesses into one place.',
      'Instead of finding them one Instagram page, WhatsApp message or recommendation at a time, Tibu gives people a simpler way to discover businesses, explore what they offer and connect with them directly.',
      'Tibu gives homegrown businesses a place to be found beyond the audience they’ve built themselves, while helping customers find businesses they might never have come across otherwise.',
    ],
  },
  {
    heading: 'Discover. Explore. Connect.',
    paragraphs: [
      'No complicated middleman. No need to become a huge brand. Just homegrown businesses, made easier to find.',
    ],
  },
];

export default function AboutPage() {
  return (
    <StaticPage
      title="About Tibu"
      intro="Homegrown businesses are everywhere. It’s time to find them."
      sections={SECTIONS}
    />
  );
}
