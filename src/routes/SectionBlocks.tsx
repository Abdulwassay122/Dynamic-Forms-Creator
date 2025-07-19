import {
  useFieldArray,
  useWatch,
  Control,
  UseFormRegister,
  FieldErrors,
  Controller,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Delete, PlusIcon } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { GripVertical } from "lucide-react";

type Option = { value: string };
type Field = { label: string; type: string; length: "half" | "full"; options: Option[] };
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
}: SectionBlockProps) {
  const {
    fields,
    append,
    remove: removeField,
    move,
  } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields`,
  });

  const typeWatch = useWatch({
    control,
    name: `sections.${sectionIndex}.fields`,
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from !== to) move(from, to);
  };

  return (
    <div className="bg-white sm:p-6 px-2 py-4 space-y-4">
        <h2 className="text-2xl font-bold mb-2">Section {sectionIndex + 1}</h2>
      <div className="flex sm:flex-row flex-col gap-4">
        <div className="w-full">
          <label className="block mb-1 font-semibold text-sm">Section Name</label>
          <Controller
            name={`sections.${sectionIndex}.name`}
            control={control}
            rules={{ required: "Section name is required" }}
            render={({ field, fieldState }) => (
              <div>
                <Input {...field} placeholder="Section Name" />
                {fieldState.error && (
                  <p className="text-red-500 text-sm mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        <div className="w-full">
          <label className="block mb-1 font-semibold text-sm">Section Description</label>
          <Controller
            name={`sections.${sectionIndex}.description`}
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Section Description" />
            )}
          />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}  >
        <Droppable droppableId={`section-${sectionIndex}`} key={fields.length}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-6">
              {fields.map((field, fieldIndex) => {
                const fieldType = typeWatch?.[fieldIndex]?.type;

                return (
                  <Draggable
                    key={field.id}
                    draggableId={field.id}
                    index={fieldIndex}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        // {...provided.dragHandleProps}
                        className="border border-gray-300 rounded-md p-2 h-fit flex flex-col gap-2 bg-gray-50 w-full"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-lg font-semibold">Field {fieldIndex + 1}</h4>

                          <div {...provided.dragHandleProps} className="cursor-grab p-1 select-none">
                            <GripVertical className="text-gray-500" />
                          </div>
                        </div>
                        <div className="flex gap-5">
                          {/* Field Label input */}
                          <div className="w-fit">
                            <label className="block mb-1 font-medium text-sm">Label</label>
                            <Controller
                              control={control}
                              name={`sections.${sectionIndex}.fields.${fieldIndex}.label`}
                              rules={{ required: "Label is required" }}
                              render={({ field, fieldState }) => (
                                <>
                                  <Input {...field} placeholder="Enter field label" />
                                  {fieldState.error && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {fieldState.error.message}
                                    </p>
                                  )}
                                </>
                              )}
                            />
                          </div>
                          {/*Field Type selection */}
                          <div className="w-fit">
                            <label className="block mb-1 font-medium text-sm">Type</label>
                            <Controller
                              control={control}
                              name={`sections.${sectionIndex}.fields.${fieldIndex}.type`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
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
                          {/* Lenght Selection */}
                          <div className="w-fit">
                            <label className="block mb-1 font-medium text-sm">Length</label>
                            <Controller
                              control={control}
                              name={`sections.${sectionIndex}.fields.${fieldIndex}.length`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select length" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="half">Half</SelectItem>
                                    <SelectItem value="full">Full</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>

                        {["radio", "select", "checkbox"].includes(fieldType) && (
                          <NestedOptions
                            sectionIndex={sectionIndex}
                            fieldIndex={fieldIndex}
                            control={control}
                            register={register}
                          />
                        )}

                        <Button
                          className="w-fit"
                          type="button"
                          // variant="destructive"
                          onClick={() => removeField(fieldIndex)}
                        >
                          <Delete className="mr-2 h-4 w-4" />
                          Remove Field
                        </Button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex justify-between items-center mt-4">
        <Button
          type="button"
          onClick={() =>
            append({
              label: "",
              type: "text",
              length: "half",
              options: [{ value: "" }],
            })
          }
        >
          <PlusIcon className="mr-2" /> Add Field
        </Button>

        <Button type="button" onClick={() => remove(sectionIndex)}>
          <Delete className="mr-2" />
          Remove Section
        </Button>
      </div>
    </div>
  );
}

function NestedOptions({
  sectionIndex,
  fieldIndex,
  control,
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
      <label className="block font-semibold text-sm">Options</label>
      <div className="flex flex-wrap gap-2">
        {fields.map((opt, i) => (
          <div key={opt.id} className="flex gap-2 items-center mb-2">
            <Controller
              control={control}
              name={`sections.${sectionIndex}.fields.${fieldIndex}.options.${i}.value`}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Option value"
                  className="w-fit"
                />
              )}
            />
            <Button type="button" onClick={() => remove(i)} variant="ghost">
              <Delete className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => append({ value: "" })}
          className="w-fit"
        >
          <PlusIcon />
        </Button>
      </div>
    </div>
  );
}
