import { useForm, useFieldArray } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldBlock from "./FieldBlock"; // import your child component
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/myContext";
import SectionBlock from "./SectionBlocks";
import { Label } from "recharts";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";

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
enum FormType {
    Fields = "fields",
    Sections = "sections"
}
export default function CreateForm() {
    const navigate = useNavigate()
    const { userId } = useContext<any>(AuthContext)
    const [formType, setFormType] = useState<FormType>(FormType.Fields)
    const apiUrl = import.meta.env.VITE_API_URL;
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            title: "",
            description: "",
            fields: [
                {
                    label: "",
                    type: "text",
                    options: [{ value: "" }, { value: "" }],
                },
            ],
            sections: [
                {
                    id: crypto.randomUUID(), // or use a simple string if crypto not available
                    name: "",
                    description: "",
                    fields: [
                        {
                            label: "",
                            type: "text",
                            options: [{ value: "" }, { value: "" }],
                        },
                    ],
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "fields",
    });
    const {
        fields: sectionFields,
        append: appendSection,
        remove: removeSection,
    } = useFieldArray({
        control,
        name: "sections",
    });

    const onSubmit = (data: FormValues) => {
        const cleanFields = (fields: Field[], context: string = "form") => {
            return fields.map((field, index) => {
                const id = `field_${index + 1}`;

                if (["radio", "select", "checkbox"].includes(field.type)) {
                    const filteredOptions = field.options.filter(opt => opt.value.trim() !== "");

                    if (filteredOptions.length === 0) {
                        alert(`${context} field ${index + 1} must have at least one non-empty option.`);
                        throw new Error(`${context} field ${index + 1} has no valid options.`);
                    }

                    return {
                        ...field,
                        options: filteredOptions,
                        id
                    };
                }

                return { ...field, id };
            });
        };

        let cleanedData: any = {
            userId: userId,
            title: data.title,
            description: data.description,
            fields: [],
            sections: []
        };

        if (formType === FormType.Fields) {
            // Handle fields-based form
            if (!data.fields || data.fields.length === 0) {
                alert("At least one field is required.");
                return;
            }

            const cleanedFields = cleanFields(data.fields);
            cleanedData.fields = cleanedFields;
            cleanedData.sections = []; // Empty array for sections

        } else if (formType === FormType.Sections) {
            // Handle sections-based form
            if (!data.sections || data.sections.length === 0) {
                alert("At least one section is required.");
                return;
            }

            const cleanedSections = data.sections.map((section, sectionIndex) => {
                const sectionId = `section_${sectionIndex + 1}`;

                if (!section.fields || section.fields.length === 0) {
                    alert(`Section ${sectionIndex + 1} must have at least one field.`);
                    throw new Error(`Section ${sectionIndex + 1} has no fields.`);
                }

                const cleanedFields = cleanFields(section.fields, `Section ${sectionIndex + 1}`);

                return {
                    id: sectionId,
                    name: section.name,
                    description: section.description || "",
                    fields: cleanedFields
                };
            });

            cleanedData.sections = cleanedSections;
            cleanedData.fields = []; // Empty array for fields
        }

        console.log("Form Submitted:", data);
        console.log("Cleaned Data to Submit:", cleanedData);

        // Post data
        async function fetchApi() {
            try {
                const response = await fetch(`${apiUrl}/createform`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cleanedData)
                });

                console.log("Posted Data", response);

                if (response.status === 201) {
                    navigate("/dashboard");
                } else {
                    const errorData = await response.json();
                    alert(`Error: ${errorData.message || 'Failed to create form'}`);
                }
            } catch (error: any) {
                console.log(error);
                alert(`Error: ${error.message}`);
            }
        }

        fetchApi();
    };

    useEffect(() => {
        console.log("From Type:", formType)
    }, [formType])
    return (
        <section className=" px-4 sm:px-8 md:px-16 lg:px-32 py-16 bg-gray-50">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white shadow-lg rounded-xl p-8 space-y-8">
                    <h1 className="text-3xl font-bold text-gray-800">Create a New Form</h1>

                    {/* Title */}
                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Form Title <span className="text-red-600">*</span>
                        </Label>
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: "Title is required" }}
                            render={({ field, fieldState }) => (
                                <div className="space-y-1">
                                    <Input
                                        {...field}
                                        placeholder="Enter Form Title"
                                    />
                                    {fieldState.error && (
                                        <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />
                        {/* {errors.title && (
                            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                        )} */}
                    </div>

                    {/* Description */}
                    <div>
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Form Description
                        </Label>
                        <Controller
                            name="description"
                            control={control}
                            rules={{ required: "Description is required" }}
                            render={({ field, fieldState }) => (
                                <div className="space-y-1">
                                    <Input
                                        {...field}
                                        placeholder="Enter Form Description"
                                    />
                                    {fieldState.error && (
                                        <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                    )}
                                </div>
                            )}
                        />
                        {/* {errors.description && (
                            <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                        )} */}
                    </div>

                    {/* Form Type */}
                    <div className="w-fit">
                        <Label className="block text-sm font-medium text-gray-700 mb-1">
                            Form Type
                        </Label>
                        <Select value={formType} onValueChange={(value) => setFormType(value as FormType)}>
                            <SelectTrigger className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                <SelectValue placeholder="Select form type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fields">Fields</SelectItem>
                                <SelectItem value="sections">Sections</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Fields or Sections Rendering */}
                <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
                    {formType === FormType.Fields &&
                        fields.map((field, index) => (
                            <FieldBlock
                                key={field.id}
                                control={control}
                                register={register}
                                index={index}
                                remove={remove}
                                errors={errors}
                            />
                        ))}

                    {formType === FormType.Sections &&
                        sectionFields.map((section, index) => (
                            <SectionBlock
                                key={section.id}
                                sectionIndex={index}
                                control={control}
                                register={register}
                                remove={removeSection}
                                errors={errors}
                            />
                        ))}
                </div>

                {/* Footer Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <Button type="submit" className="w-full sm:w-auto">
                        Create Form
                    </Button>

                    {formType === "fields" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                append({ label: "", type: "text", options: [{ value: "" }] })
                            }
                            className="w-full sm:w-auto"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Field
                        </Button>
                    )}

                    {formType === "sections" && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                appendSection({
                                    id: `section_${sectionFields.length + 1}`,
                                    name: "",
                                    description: "",
                                    fields: [{ label: "", type: "text", options: [{ value: "" }] }],
                                })
                            }
                            className="w-full sm:w-auto"
                        >
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Add Section
                        </Button>
                    )}
                </div>
            </form>
        </section>
    );
}
