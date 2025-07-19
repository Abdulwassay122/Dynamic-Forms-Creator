import { useFieldArray, useWatch, Control, UseFormRegister, FieldErrors, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Delete, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

type Option = { value: string };
type Field = { label: string; type: string; options: Option[] };
type Section = {
  id: string;
  name: string;
  description?: string;
  fields: Field[];
};
type FormValues = {
  title: string;
  description: string;
  fields?: Field[];
  sections?: Section[];
};
type SectionBlockProps = {
  sectionIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  remove: (index: number) => void;
  errors: FieldErrors<FormValues>;
};

export default function SectionBlock({
  sectionIndex,
  control,
  register,
  remove,
  errors,
}: SectionBlockProps) {
  const { fields, append, remove: removeField } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields`,
  });

  const typeWatch = useWatch({
    control,
    name: `sections.${sectionIndex}.fields`,
  });

  return (
    <div className="bg-white p-6 space-y-4 ">
      <h2 className="text-2xl font-bold mb-4">Section {sectionIndex + 1}</h2>

      {/* Section Name */}
      <div>
        <label className="block mb-1 font-semibold">Section Name</label>
        <Controller
          name={`sections.${sectionIndex}.name`}
          control={control}
          rules={{ required: "Section name is required" }}
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                placeholder="Section Name"
                className="w-full px-3 py-2"
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
        {errors.sections?.[sectionIndex]?.name && (
          <p className="text-red-500">{errors.sections?.[sectionIndex]?.name?.message}</p>
        )}
      </div>

      {/* Section Description */}
      <div>
        <label className="block mb-1 font-semibold">Section Description</label>
        <Controller
          name={`sections.${sectionIndex}.description`}
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                placeholder="Section Description"
                className="w-full px-3 py-2"
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {fields.map((field, fieldIndex) => {
          const fieldType = typeWatch?.[fieldIndex]?.type;

          return (
            <div
              key={field.id}
              className="border border-gray-300 rounded-md p-4 space-y-4 bg-gray-50"
            >
              <h4 className="text-lg font-semibold">Field {fieldIndex + 1}</h4>

              <div className="flex gap-5">
                {/* Field Label */}
                <div className="w-full">
                  <label className="block mb-1 font-medium">Label</label>
                  <Controller
                    control={control}
                    name={`sections.${sectionIndex}.fields.${fieldIndex}.label`}
                    rules={{ required: "Label is required" }}
                    render={({ field, fieldState }) => (
                      <>
                        <Input {...field} placeholder="Enter field label" />
                        {fieldState.error && (
                          <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>

                {/* Field Type */}
                <div className="w-full">
                  <label className="block mb-1 font-medium">Type</label>
                  <Controller
                    control={control}
                    name={`sections.${sectionIndex}.fields.${fieldIndex}.type`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                          <SelectItem value="radio">Radio</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              {/* Options (conditional) */}
              {["radio", "select", "checkbox"].includes(fieldType) && (
                <NestedOptions
                  sectionIndex={sectionIndex}
                  fieldIndex={fieldIndex}
                  control={control}
                  register={register}
                />
              )}

              <Button type="button" variant="destructive" onClick={() => removeField(fieldIndex)}>
                <Delete className="mr-2 h-4 w-4" />
                Remove Field
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          type="button"
          onClick={() =>
            append({
              label: "",
              type: "text",
              options: [{ value: "" }],
            })
          }
        >
          <PlusIcon className="mr-2" /> Add Field
        </Button>

        <Button type="button" onClick={() => remove(sectionIndex)} >
          <Delete className="mr-2" />
          Remove Section
        </Button>
      </div>
    </div>
  );
}

// 👇 Component for nested options in section fields
function NestedOptions({
  sectionIndex,
  fieldIndex,
  control,
  register,
}: {
  sectionIndex: number;
  fieldIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields.${fieldIndex}.options`,
  });

  return (
    <div>
      <label className="block font-semibold">Options</label>
      {fields.map((opt, i) => (
        <div key={opt.id} className="flex gap-2 items-center mb-2">
          <input
            {...register(`sections.${sectionIndex}.fields.${fieldIndex}.options.${i}.value`)}
            className="border px-3 py-2 rounded w-full"
          />
          <Button type="button" onClick={() => remove(i)} variant="ghost">
            <Delete className="" />
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ value: "" })} className="mt-2">
        <PlusIcon className="mr-2" />
        Add Option
      </Button>
    </div>
  );
}
