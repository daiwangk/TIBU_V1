import { PackageX } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import ProductCard from '../../components/ProductCard';

/**
 * @param {{ products: import('../../services/contract').ProductSummary[] }} props
 */
export default function ProductsTab({ products }) {
  if (!products || products.length === 0) {
    return (
      <div className="pt-8">
        <EmptyState
          icon={<PackageX size={32} aria-hidden="true" />}
          title="No products yet"
          text="This business hasn't added any products to their catalog."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 pt-4 pb-8">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} variant="grid" />
      ))}
    </div>
  );
}
