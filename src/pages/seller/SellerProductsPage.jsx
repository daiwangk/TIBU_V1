import { Package, Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { byCreated } from './product/productModel';
import SellerPage from './SellerPage';
import SellerProductRow from './SellerProductRow';

/** /seller/products — every product (inactive ones too) with its Available today and Active switches. */
export default function SellerProductsPage() {
  return (
    <SellerPage title="Products">
      {(business) => {
        const products = [...business.products].sort(byCreated);
        if (products.length === 0) {
          return (
            <EmptyState
              icon={<Package size={28} aria-hidden="true" />}
              title="Add your first product"
              text="Products with photos are what customers browse on your shop page."
              action={{ label: 'Add product', to: '/seller/products/new' }}
            />
          );
        }
        return (
          <>
            <Button to="/seller/products/new" size="lg">
              <Plus size={18} aria-hidden="true" />
              Add product
            </Button>
            <ul className="flex flex-col gap-3">
              {products.map((p) => (
                <SellerProductRow key={p.id} product={p} business={business} />
              ))}
            </ul>
          </>
        );
      }}
    </SellerPage>
  );
}
