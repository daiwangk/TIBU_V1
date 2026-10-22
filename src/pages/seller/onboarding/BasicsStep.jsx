import { useId, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ErrorState from '../../../components/ui/ErrorState';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Skeleton from '../../../components/ui/Skeleton';
import Textarea from '../../../components/ui/Textarea';
import { shouldToast, userMessage } from '../../../lib/errors';
import { useCategories } from '../../../queries/catalog';
import { useSaveMyBusiness } from '../../../queries/seller';
import FormAlert from '../../auth/FormAlert';
import TextField from '../../auth/TextField';
import { businessToInput, groupLeafCategories } from './onboardingModel';
import { basicsSchema } from './onboardingSchemas';
import StepFooter from './StepFooter';

const DESCRIPTION_MAX = 2000;

/**
 * Step 1: name, category, description and (optional) year started. Next creates the draft business on
 * the first save and updates it afterwards.
 *
 * @param {{ business: import('../../../services/contract.js').MyBusiness|null, onBack?: () => void, onSaved: () => void }} props
 */
export default function BasicsStep({ business, onBack, onSaved }) {
  const id = useId();
  const categories = useCategories();
  const saveBusiness = useSaveMyBusiness();
  const [failure, setFailure] = useState(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(basicsSchema),
    defaultValues: {
      name: business?.name ?? '',
      categorySlug: business?.categorySlug ?? '',
      description: business?.description ?? '',
      establishedYear: business?.establishedYear ? String(business.establishedYear) : '',
    },
  });
  const description = useWatch({ control, name: 'description' });
  const { groups, singles } = useMemo(() => groupLeafCategories(categories.data ?? []), [categories.data]);

  async function onValid(values) {
    setFailure(null);
    try {
      await saveBusiness.mutateAsync({
        ...businessToInput(business),
        name: values.name,
        categorySlug: values.categorySlug,
        description: values.description,
        establishedYear: values.establishedYear === '' ? null : Number(values.establishedYear),
      });
      onSaved();
    } catch (err) {
      // Network / unknown errors already raise the global toast; show the rest here.
      if (!shouldToast(err)) setFailure(err);
    }
  }

  if (categories.isError) return <ErrorState error={categories.error} onRetry={() => categories.refetch()} />;
  if (categories.isLoading) {
    return (
      <div className="flex flex-col gap-4" role="status" aria-label="Loading">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onValid)} noValidate className="flex flex-col gap-5">
      {failure && <FormAlert>{userMessage(failure)}</FormAlert>}

      <TextField
        id={`${id}-name`}
        label="Business name"
        autoComplete="organization"
        maxLength={80}
        error={errors.name?.message}
        {...register('name')}
      />

      <Select id={`${id}-category`} label="Category" error={errors.categorySlug?.message} {...register('categorySlug')}>
        <option value="">Choose a category</option>
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

      <Textarea
        id={`${id}-description`}
        label="Description"
        rows={5}
        maxLength={DESCRIPTION_MAX}
        placeholder="What do you make or sell? What makes it special?"
        hint={`${description.length} / ${DESCRIPTION_MAX}`}
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        id={`${id}-year`}
        label="Business started in (optional)"
        inputMode="numeric"
        maxLength={4}
        placeholder="e.g. 2019"
        error={errors.establishedYear?.message}
        {...register('establishedYear')}
      />

      <StepFooter onBack={onBack} loading={isSubmitting} />
    </form>
  );
}
