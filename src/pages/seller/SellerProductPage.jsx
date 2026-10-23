import { PackageX } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import ProductForm from './product/ProductForm';
import SellerPage from './SellerPage';

/** /seller/products/new and /seller/products/:id — the shared product form, loaded from the URL. */
export default function SellerProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <SellerPage title={id ? 'Edit product' : 'Add product'} backTo="/seller/products">
      {(business) =>
        id && !business.products.some((p) => p.id === id) ? (
          <EmptyState
            icon={<PackageX size={28} aria-hidden="true" />}
            title="We couldn't find that product"
            text="It may have been deleted."
            action={{ label: 'Back to products', to: '/seller/products' }}
          />
        ) : (
          <ProductForm key={id ?? 'new'} business={business} productId={id ?? null} onClose={() => navigate('/seller/products')} />
        )
      }
    </SellerPage>
  );
}
