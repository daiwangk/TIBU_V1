import Wordmark from './Wordmark';

/**
 * Brand logo. Always render the brand through this component.
 * Until the client's final logo arrives it shows the placeholder `Wordmark` (TODO(logo), D40).
 *
 * @param {{ size?: 'sm' | 'md' | 'lg', tagline?: boolean, className?: string }} props
 */
export default function Logo(props) {
  return <Wordmark {...props} />;
}
