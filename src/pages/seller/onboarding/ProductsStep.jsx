import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import ProductForm from '../product/ProductForm';
import { byCreated } from '../product/productModel';
import ProductRow from '../product/ProductRow';
import { isStepComplete } from './onboardingModel';
import StepFooter from './StepFooter';

/**
 * Step 5: the shop's products. At least one active product with a photo is needed to continue. Adding
 * or editing opens the shared ProductForm in place of the list.
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness, onBack?: () => void, onSaved: () => void }} props
 */
export default function ProductsStep({ business, onBack, onSaved }) {
  const [editing, setEditing] = useState(null); // null = the list, 'new' = a blank form, else a product id
  const [triedNext, setTriedNext] = useState(false);

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

  const complete = isStepComplete(5, business);
  const products = [...business.products].sort(byCreated);

  function handleSubmit(e) {
    e.preventDefault();
    if (complete) onSaved();
    else setTriedNext(true);
  }

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
        {triedNext && !complete && (
          <p role="alert" className="font-body text-sm font-semibold text-error">
            Add at least one product that is shown to customers and has a photo.
          </p>
        )}
        <StepFooter onBack={onBack} />
      </form>
    </div>
  );
}
