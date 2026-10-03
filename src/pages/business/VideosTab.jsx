import { Clapperboard } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import ReelEmbed from '../../components/ReelEmbed';

/**
 * @param {{ videos: import('../../services/contract').Video[] }} props
 */
export default function VideosTab({ videos }) {
  if (!videos || videos.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState
          icon={<Clapperboard size={32} aria-hidden="true" />}
          title="No videos yet"
          text="This business hasn't shared any Instagram reels."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 pt-4 pb-8">
      {videos.map((v) => (
        <ReelEmbed key={v.id} video={v} />
      ))}
    </div>
  );
}
