import { useId, useMemo, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import PhotoGrid from '../../../components/PhotoGrid';
import Button from '../../../components/ui/Button';
import Dialog from '../../../components/ui/Dialog';
import Select from '../../../components/ui/Select';
import Switch from '../../../components/ui/Switch';
import Textarea from '../../../components/ui/Textarea';
import { shouldToast, userMessage } from '../../../lib/errors';
import { isFashionCategory, templateFor } from '../../../lib/productDetailTemplates';
import { useCategories } from '../../../queries/catalog';
import { useDeleteProduct, useRemoveProductImage, useSaveProduct, useUploadProductImage } from '../../../queries/seller';
import FormAlert from '../../auth/FormAlert';
import TextField from '../../auth/TextField';
import { groupLeafCategories } from '../onboarding/onboardingModel';
import { SWITCH_ROW } from '../switchRow';
import ProductDeliveryField from './ProductDeliveryField';
import ProductDetailsEditor from './ProductDetailsEditor';
import { formToProductInput, PRODUCT_IMAGES_MAX, prefillDetails, productSchema, productToForm } from './productModel';

/**
 * Add or edit one product (shared by onboarding step 5 and the seller dashboard). A new product is
 * saved first, then its photos can be added (they need the product to exist). Save keeps the form open
 * so photos can be added; "Done" goes back.
 *
 * @param {{
 *   business: import('../../../services/contract.js').MyBusiness,
 *   productId: string|null,
 *   onClose: () => void,
 * }} props `productId` null = a new product
 */
export default function ProductForm({ business, productId, onClose }) {
  const id = useId();
  const [currentId, setCurrentId] = useState(productId);
  const product = business.products.find((p) => p.id === currentId) ?? null;
  const categories = useCategories();
  const saveProduct = useSaveProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();
  const removeImage = useRemoveProductImage();
  const [failure, setFailure] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [photosBusy, setPhotosBusy] = useState(false);

  const [defaults] = useState(() => {
    const values = productToForm(product, business);
    if (values.details.length === 0) values.details = prefillDetails([], templateFor(business.categorySlug)) ?? [];
    return values;
  });
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(productSchema), defaultValues: defaults });
  const { fields, append, remove, replace } = useFieldArray({ control, name: 'details' });
  const [categorySlug, availableToday, isActive, deliveryMode, deliveryAvailable, pickupAvailable, deliveryTime] = useWatch({
    control,
    name: ['categorySlug', 'availableToday', 'isActive', 'deliveryMode', 'deliveryAvailable', 'pickupAvailable', 'deliveryTime'],
  });
  const { groups, singles } = useMemo(() => groupLeafCategories(categories.data ?? []), [categories.data]);
  const effectiveCategory = categorySlug || business.categorySlug;
  const set = (name, value) => setValue(name, value, { shouldDirty: true, shouldValidate: true });

  async function onValid(values) {
    setFailure(null);
    try {
      const saved = await saveProduct.mutateAsync(formToProductInput(values, currentId));
      setCurrentId(saved.id);
      setJustSaved(true);
    } catch (err) {
      // Network / unknown errors already raise the global toast; show the rest here.
      if (!shouldToast(err)) setFailure(err);
    }
  }

  async function handleDelete() {
    try {
      await deleteProduct.mutateAsync(currentId);
      onClose();
    } catch (err) {
      setConfirmDelete(false);
      toast.error(userMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={photosBusy}>
          <ChevronLeft size={18} aria-hidden="true" />
          Products
        </Button>
        <h3 className="font-heading text-lg font-bold text-ink">{currentId ? 'Edit product' : 'Add product'}</h3>
      </div>

      {failure && <FormAlert>{userMessage(failure)}</FormAlert>}
      {justSaved && !failure && (
        <FormAlert tone="success">
          Saved.{(product?.images.length ?? 0) === 0 ? ' Now add at least one photo.' : ''}
        </FormAlert>
      )}

      <TextField id={`${id}-name`} label="Product name" maxLength={100} error={errors.name?.message} {...register('name')} />
      <TextField
        id={`${id}-price`}
        label="Price (₹)"
        inputMode="numeric"
        placeholder="e.g. 1250"
        error={errors.price?.message}
        {...register('price')}
      />
      <Textarea id={`${id}-description`} label="Description (optional)" rows={4} maxLength={2000} error={errors.description?.message} {...register('description')} />

      <Select
        id={`${id}-category`}
        label="Category"
        hint={categories.isError ? "Couldn't load categories" : undefined}
        disabled={categories.isLoading}
        {...register('categorySlug', {
          onChange: (e) => {
            const rows = prefillDetails(getValues('details'), templateFor(e.target.value || business.categorySlug));
            if (rows) replace(rows);
          },
        })}
      >
        <option value="">Same as my shop</option>
        {singles.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
        {groups.map(({ parent, children }) => (
          <optgroup key={parent.slug} label={parent.name}>
            {children.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </optgroup>
        ))}
      </Select>

      <div className="flex flex-col gap-2">
        <p className="font-body text-sm font-semibold text-ink">Photos (up to {PRODUCT_IMAGES_MAX})</p>
        {currentId ? (
          <PhotoGrid
            images={product?.images ?? []}
            max={PRODUCT_IMAGES_MAX}
            noun="photo"
            upload={(file) => uploadImage.mutateAsync({ productId: currentId, file })}
            remove={(imageId) => removeImage.mutateAsync(imageId)}
            onBusyChange={setPhotosBusy}
          />
        ) : (
          <p className="font-body text-sm text-muted">Save the product first, then add its photos.</p>
        )}
      </div>

      <ProductDetailsEditor
        fields={fields}
        register={register}
        append={append}
        remove={remove}
        errors={errors.details}
        fashion={isFashionCategory(effectiveCategory)}
      />

      <ProductDeliveryField
        id={id}
        mode={deliveryMode}
        deliveryAvailable={deliveryAvailable}
        pickupAvailable={pickupAvailable}
        deliveryTime={deliveryTime}
        onChange={set}
      />

      <div className="flex flex-col rounded-card border border-border bg-surface px-4 py-1">
        <Switch id={`${id}-today`} className={SWITCH_ROW} label="Available today" checked={availableToday} onChange={(v) => set('availableToday', v)} />
        <Switch id={`${id}-active`} className={SWITCH_ROW} label="Show this product to customers" checked={isActive} onChange={(v) => set('isActive', v)} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" size="lg" className="flex-[2]" loading={isSubmitting} disabled={photosBusy}>
          {currentId ? 'Save changes' : 'Save product'}
        </Button>
        {currentId && (
          <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={onClose} disabled={photosBusy || isSubmitting}>
            Done
          </Button>
        )}
      </div>

      {currentId && (
        <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)} disabled={photosBusy}>
          Delete product
        </Button>
      )}

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this product?">
        <div className="flex flex-col gap-4 px-4 pb-4">
          <p className="font-body text-sm text-body">This removes the product and its photos. You can&apos;t undo it.</p>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>Keep it</Button>
            <Button type="button" variant="danger" className="flex-1" loading={deleteProduct.isPending} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Dialog>
    </form>
  );
}
