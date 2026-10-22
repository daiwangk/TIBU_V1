import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import IconButton from '../../../components/ui/IconButton';
import { DETAIL_LABEL_MAX, DETAIL_VALUE_MAX, DETAILS_MAX_ROWS } from './productModel';

/**
 * Label / value rows for a product (weight, sizes, material…). Presentational: the form owns the
 * `useFieldArray` and passes its `fields`, `append` and `remove`, plus react-hook-form's `register`.
 *
 * @param {{
 *   fields: Array<{ id: string }>,
 *   register: import('react-hook-form').UseFormRegister<any>,
 *   append: (row: { label: string, value: string }) => void,
 *   remove: (index: number) => void,
 *   errors?: Array<{ label?: { message?: string }, value?: { message?: string } }>,
 *   fashion?: boolean,
 * }} props
 */
export default function ProductDetailsEditor({ fields, register, append, remove, errors, fashion = false }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-body text-sm font-semibold text-ink">Details (optional)</legend>
      <p className="font-body text-xs text-muted">
        Facts customers look for, like weight or size. A row needs both a label and a value to be saved.
      </p>
      {fashion && (
        <p className="font-body text-xs text-body">
          Add a size chart as rows (e.g. M — Chest 38 in) or upload it as one of the product photos.
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {fields.map((field, i) => (
          <li key={field.id} className="flex items-start gap-2">
            <div className="flex flex-1 flex-col gap-2">
              <input
                aria-label={`Detail ${i + 1} label`}
                placeholder="Label, e.g. Weight"
                maxLength={DETAIL_LABEL_MAX}
                className="min-h-11 w-full rounded-btn border border-sage bg-surface px-3 py-2.5 font-body text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                {...register(`details.${i}.label`)}
              />
              <input
                aria-label={`Detail ${i + 1} value`}
                placeholder="Value, e.g. 500 g"
                maxLength={DETAIL_VALUE_MAX}
                className="min-h-11 w-full rounded-btn border border-sage bg-surface px-3 py-2.5 font-body text-base text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                {...register(`details.${i}.value`)}
              />
              {(errors?.[i]?.label || errors?.[i]?.value) && (
                <span role="alert" className="font-body text-sm font-semibold text-error">
                  {errors[i].label?.message ?? errors[i].value?.message}
                </span>
              )}
            </div>
            <IconButton label={`Remove detail ${i + 1}`} onClick={() => remove(i)}>
              <Trash2 size={18} aria-hidden="true" />
            </IconButton>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          disabled={fields.length >= DETAILS_MAX_ROWS}
          onClick={() => append({ label: '', value: '' })}
        >
          <Plus size={18} aria-hidden="true" />
          Add detail
        </Button>
        <span className="font-body text-sm text-muted">{fields.length} of {DETAILS_MAX_ROWS}</span>
      </div>
    </fieldset>
  );
}
