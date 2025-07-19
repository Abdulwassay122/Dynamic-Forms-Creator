import { useForm, useFieldArray } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/myContext";
import SectionBlock from "./SectionBlocks";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
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

export default function CreateForm() {
    const navigate = useNavigate()
    const { userId } = useContext<any>(AuthContext)
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
            sections: [
                {
                    id: crypto.randomUUID(), // or use a simple string if crypto not available
                    name: "",
                    description: "",
                    fields: [
                        {
                            label: "",
                            type: "text",
                            length: "half",
                            options: [{ value: "" }, { value: "" }],
                        },
                    ],
                },
            ],
        },
    });

    const {
        fields: sectionFields,
        append: appendSection,
        remove: removeSection,
        move: moveSection,
    } = useFieldArray({
        control,
        name: "sections",
    });

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.index !== destination.index) {
            moveSection(source.index, destination.index);
        }
    };

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
            sections: []
        };

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

    return (
        <section className=" px-4 sm:px-8 md:px-16 lg:px-32 py-16 bg-gray-50 min-h-screen">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-gray-800">Create a New Form</h1>
                    <div className="flex gap-4 sm:flex-row flex-col">
                        {/* Title */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Form Title <span className="text-red-600">*</span>
                            </label>
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
                        </div>

                        {/* Description */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Form Description
                            </label>
                            <Controller
                                name="description"
                                control={control}

                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <Input
                                            {...field}
                                            placeholder="Enter Form Description"
                                        />
                                        {/* {fieldState.error && (
                                        <p className="text-sm text-red-500">{fieldState.error.message}</p>
                                    )} */}
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </div>

                {/* Sections Rendering */}
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="sections" key={sectionFields.length}>
                        {(provided) => (
                            <div
                                className="bg-white shadow-md rounded-xl sm:px-6 px-2 space-y-6"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {sectionFields.map((section, index) => (
                                    <Draggable
                                        key={section.id}
                                        draggableId={section.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="relative"
                                            >
                                                <div
                                                    {...provided.dragHandleProps}
                                                    className="absolute -left-0 top-[29px] cursor-grab"
                                                >
                                                    <GripVertical size={20}/>
                                                </div>
                                                <SectionBlock
                                                    sectionIndex={index}
                                                    control={control}
                                                    register={register}
                                                    remove={removeSection}
                                                    errors={errors}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                {/* Footer Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <Button type="submit" className="w-full sm:w-auto">
                        Create Form
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            appendSection({
                                id: `section_${sectionFields.length + 1}`,
                                name: "",
                                description: "",
                                fields: [{ label: "", type: "text", length: "half", options: [{ value: "" }] }],
                            })
                        }
                        className="w-full sm:w-auto"
                    >
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Section
                    </Button>

                </div>
            </form>
        </section>
    );
}
