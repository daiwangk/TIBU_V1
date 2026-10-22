/**
 * The reason Tibu gave when it rejected or unpublished the shop, shown prominently.
 *
 * @param {{ reason: string|null, title?: string }} props nothing is shown without a reason
 */
export default function RejectionReason({ reason, title = 'What Tibu asked you to change' }) {
  if (!reason) return null;
  return (
    <div role="note" className="flex flex-col gap-1 rounded-card bg-blush p-4">
      <p className="font-body text-sm font-semibold text-ink">{title}</p>
      <p className="whitespace-pre-line font-body text-sm text-ink">{reason}</p>
    </div>
  );
}
