import { useFieldArray, UseFormRegister, Control, useWatch, FieldErrors } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Delete, PlusIcon } from "lucide-react";
type Option = { value: string };
type Field = { label: string; type: string; options: Option[] };
type FormValues = {
    title: string;
    description: string;
    fields: Field[];
};
type FieldBlockProps = {
  index: number;
  control: Control<any>;
  register: UseFormRegister<any>;
  remove: (index: number) => void;
  errors: FieldErrors<FormValues>;
};

export default function FieldBlock({ index, control, register, remove, errors }: FieldBlockProps) {
  const type = useWatch({
    control,
    name: `fields.${index}.type`,
  });

  const { fields, append, remove: removeOption } = useFieldArray({
    control,
    name: `fields.${index}.options`,
  });

  return (
    <div className="bg-white p-6 rounded-md border-l-12 border-[#101828] space-y-4 shadow-2xl">
      <h3 className="text-xl font-semibold">Field {index + 1}</h3>

      {/* Label */}
      <div>
        <label>Label</label>
        <input
          {...register(`fields.${index}.label`, { required: "Label is required" })}
          className="border px-3 py-2 rounded w-full"
        />
        {errors.fields?.[index]?.label && <p className="text-red-500">{errors.fields?.[index]?.label.message}</p>}
      </div>

      {/* Type */}
      <div>
        <label>Type</label>
        <select {...register(`fields.${index}.type`)} className="border px-3 py-2 rounded w-full">
          <option value="text">Text</option>
          <option value="number">Number</option>
          <option value="textarea">Textarea</option>
          <option value="select">Select</option>
          <option value="radio">Radio</option>
          <option value="checkbox">Checkbox</option>
        </select>
      </div>

      {/* Options */}
      {["radio", "select", "checkbox"].includes(type) && (
        <div>
          <label>Options</label>
          {fields.map((opt, i) => (
            <div key={opt.id} className="flex gap-2 items-center mb-2">
              <input
                {...register(`fields.${index}.options.${i}.value`)}
                className="border px-3 py-2 rounded w-full"
              />
              <button type="button" onClick={() => removeOption(i)} className="text-red-500">
                <Delete />
              </button>
            </div>
          ))}
          <Button
            type="button"
            onClick={() => append({ value: "" })}
            className="mt-2 flex w-fit text-white "
          >
            <PlusIcon /> Add Option
          </Button>
        </div>
      )}

      <Button onClick={() => remove(index)}>
        <Delete/>Remove Field
      </Button>
    </div>
  );
}
