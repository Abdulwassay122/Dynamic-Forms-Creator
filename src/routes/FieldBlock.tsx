import { useFieldArray, UseFormRegister, Control, useWatch, FieldErrors, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Delete, PlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Option = { value: string };
type Field = { label: string; type: string; options: Option[] };
type FormValues = {
  title: string;
  description: string;
  fields: Field[];
  sections?: {
    name: string;
    description?: string;
    fields: Field[];
  }[];
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
    <div className="flex flex-col gap-3">
      <h3 className="text-xl font-semibold">Field {index + 1}</h3>

      {/* Label */}
      <div>
        {/* <label>Label</label> */}
        <Controller
          control={control}
          name={`fields.${index}.label`}
          rules={{ required: "Label is required" }}
          render={({ field, fieldState }) => (
            <div className="w-full">
              <label className="block text-sm font-medium mb-1">Label</label>
              <Input
                {...field}
                className="w-full"
              />
              {fieldState.error && (
                <p className="text-sm text-red-500 mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Type */}
      <Controller
        control={control}
        name={`fields.${index}.type`}
        rules={{ required: "Type is required" }}
        render={({ field, fieldState }) => (
          <div className="w-full">
            <label className="block text-sm font-medium mb-1">Type</label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a type" />
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
            {fieldState.error && (
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      {/* Options */}
      {["radio", "select", "checkbox"].includes(type) && (
        <div className="mt-4 space-y-3">
          <label className="text-sm font-medium">Options</label>
          {fields.map((opt, i) => (
            <div key={opt.id} className="flex items-center gap-2">
              <Controller
                control={control}
                name={`fields.${index}.options.${i}.value`}
                render={({ field, fieldState }) => (
                  <div className="w-full">
                    <Input {...field} placeholder={`Option ${i + 1}`} />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
                    )}
                  </div>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeOption(i)}
              >
                <Delete className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={() => append({ value: "" })}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Option
          </Button>
        </div>
      )}

      <Button className="w-fit" onClick={() => remove(index)}>
        <Delete />Remove Field
      </Button>
    </div>
  );
}
