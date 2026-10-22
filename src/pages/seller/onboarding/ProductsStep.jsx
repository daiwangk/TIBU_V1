import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import ImagePlaceholder from '../../../components/ui/ImagePlaceholder';
import { formatPrice } from '../../../lib/format';
import ProductForm from '../product/ProductForm';
import { isStepComplete } from './onboardingModel';
import StepFooter from './StepFooter';

function ProductRow({ product, onEdit }) {
  const cover = product.images[0]?.url;
  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-card">
        {cover ? (
          <img src={cover} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder aspect="1/1" className="h-full" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-body text-sm font-semibold text-ink">{product.name}</p>
        <p className="font-body text-sm text-body">{formatPrice(product.price)}</p>
        <div className="flex flex-wrap gap-1">
          {!cover && <Badge tone="warning">Needs a photo</Badge>}
          {!product.isActive && <Badge>Hidden</Badge>}
        </div>
      </div>
      <Button type="button" variant="secondary" onClick={onEdit} aria-label={`Edit ${product.name}`}>
        Edit
      </Button>
    </li>
  );
}

/**
 * Step 5: the shop's products. At least one active product with a photo is needed to continue. Adding
 * or editing opens the shared ProductForm in place of the list.
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness, onBack?: () => void, onSaved: () => void }} props
 */
export default function ProductsStep({ business, onBack, onSaved }) {
  const [editing, setEditing] = useState(null); // null = the list, 'new' = a blank form, else a product id
  const [needMore, setNeedMore] = useState(false);

  if (editing !== null) {
    return (
      <ProductForm
        key={editing}
        business={business}
        productId={editing === 'new' ? null : editing}
        onClose={() => setEditing(null)}
      />
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isStepComplete(5, business)) onSaved();
    else setNeedMore(true);
  }

  const products = business.products;

  return (
    <div className="flex flex-col gap-4">
      {products.length === 0 ? (
        <EmptyState
          icon={<Package size={28} aria-hidden="true" />}
          title="Add your first product"
          text="List at least one product with a photo so customers can see what you sell."
          action={{ label: 'Add product', onClick: () => setEditing('new') }}
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} onEdit={() => setEditing(p.id)} />
            ))}
          </ul>
          <Button type="button" variant="secondary" onClick={() => setEditing('new')}>
            <Plus size={18} aria-hidden="true" />
            Add product
          </Button>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        {needMore && (
          <p role="alert" className="font-body text-sm font-semibold text-error">
            Add at least one product that is shown to customers and has a photo.
          </p>
        )}
        <StepFooter onBack={onBack} />
      </form>
    </div>
  );
}
