import Skeleton from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';

export default function BusinessSkeleton() {
  return (
    <div className="min-h-screen bg-bg pb-28">
      <PageHeader title="Loading..." fallbackTo="/" />
      
      <main className="space-y-4">
        {/* Header Skeleton */}
        <section className="bg-surface border-b border-border pb-4 relative">
          <Skeleton variant="rect" className="w-full aspect-video" />
          
          <div className="px-screen -mt-8 relative z-10 flex flex-col">
            <Skeleton variant="circle" size="xl" className="ring-4 ring-surface" />
            <div className="mt-3 space-y-2">
              <Skeleton variant="text" lines={1} className="w-2/3 h-6" />
              <Skeleton variant="text" lines={1} className="w-1/3 h-4" />
              <Skeleton variant="text" lines={1} className="w-1/2 h-4" />
            </div>
          </div>
        </section>

        {/* Tabs Skeleton */}
        <div className="px-screen pt-2">
          <div className="flex gap-4 border-b border-border pb-2">
            <Skeleton variant="rect" className="w-20 h-6 rounded" />
            <Skeleton variant="rect" className="w-20 h-6 rounded" />
            <Skeleton variant="rect" className="w-20 h-6 rounded" />
          </div>
        </div>

        {/* Content Skeleton (Grid) */}
        <div className="px-screen pt-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton variant="rect" className="w-full aspect-[4/5] rounded-card" />
            <Skeleton variant="rect" className="w-full aspect-[4/5] rounded-card" />
            <Skeleton variant="rect" className="w-full aspect-[4/5] rounded-card" />
            <Skeleton variant="rect" className="w-full aspect-[4/5] rounded-card" />
          </div>
        </div>
      </main>

      {/* Bottom Bar Skeleton */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-surface/95 backdrop-blur-sm border-t border-border px-screen py-3 z-20 flex gap-3">
        <Skeleton variant="rect" className="h-11 flex-1 rounded-btn" />
        <Skeleton variant="rect" className="h-11 flex-1 rounded-btn" />
      </footer>
    </div>
  );
}
