import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Delete, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Fields = {
    label: string
    type: string
    options: { value: string }[];
}
type FormValues = {
    title: string
    description: string
    fields:Fields[]
}


export default function CreateForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
    } = useForm<FormValues>({
        defaultValues: {
            options: [{ value: "" }, { value: "" }], // start with 2 inputs
        },
    })

    const selectedType = watch('type')
    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });
    const onSubmit = async (data: FormValues) => {
        if (["radio", "select", "checkbox"].includes(data.type)) {
            const cleanedOptions = data.options
                .map(opt => opt.value.trim())
                .filter(Boolean); // remove empty strings

            if (cleanedOptions.length === 0) {
                alert("Please add at least one option");
                return;
            }

            console.log("Submitted with options:", cleanedOptions);
        }
        console.log("Form Data:", data)
    }

    return (
        <section className="px-48 py-20 flex flex-col gap-10 bg-gray-100">
            <h1 className="text-3xl font-semibold text-left px-10 py-10  bg-white rounded-md border-t-8 border-black">Create a new Form</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-black">
                    <label className="block mb-1 font-semibold">Form Title</label>
                    <input
                        placeholder="Enter Form Title"
                        {...register("title", {
                            required: "title is required",
                        })}
                        className="border px-3 py-2 rounded w-full"
                    />
                    {errors.title && <p className="text-red-500">{errors.title.message}</p>}
                </div>

                <div className="px-10 py-10 bg-white rounded-md border-l-8 border-black">
                    <label className="block mb-1 font-semibold">Form Description</label>
                    <input
                        placeholder="Enter Form Description"
                        {...register("description")}
                        className="border px-3 py-2 rounded w-full"
                    />
                    {/* You can keep this if other rules are added later */}
                    {errors.description && <p className="text-red-500">{errors.description.message}</p>}
                </div>

                {/* fields */}
                <h2 className="text-2xl font-semibold">Enter Form Fields</h2>

                <div className="px-10 py-10 flex flex-col gap-4  bg-white rounded-md border-l-8 border-black">
                    <div className="">
                        <label className="block mb-1 font-semibold">Label</label>
                        <input
                            placeholder="Enter field label"
                            {...register("label", {
                                required: "label is required",
                            })}
                            className="border px-3 py-2 rounded w-full"
                        />
                        {errors.label && <p className="text-red-500">{errors.label.message}</p>}
                    </div>

                    <div className="">
                        <label className="block mb-1">Select your field type</label>
                        <select
                            {...register("type", { required: "type is required" })}
                            className="border px-3 py-2 rounded w-full"
                        >
                            <option selected value="text">text</option>
                            <option value="email">email</option>
                            <option value="number">number</option>
                            <option value="textarea">textarea</option>
                            <option value="select">select</option>
                            <option value="radio">radio</option>
                            <option value="checkbox">checkbox</option>
                        </select>
                        {errors.type && <p className="text-red-500">{errors.type.message}</p>}
                    </div>
                    {["radio", "select", "checkbox"].includes(selectedType) && (
                        <div>
                            <label className="block mb-1 font-semibold">Options</label>
                            <div className="flex flex-col gap-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-center">
                                        <input
                                            {...register(`options.${index}.value` as const)}
                                            placeholder={`Option ${index + 1}`}
                                            className="border px-3 py-2 rounded w-full"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="text-red-500"
                                        >
                                            <Delete/>
                                        </button>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    onClick={() => append({ value: "" })}
                                    className="mt-2 flex w-fit text-white bg-black"
                                >
                                    <PlusIcon/> Add Option
                                </Button>
                            </div>
                        </div>
                    )}

                </div>

                <Button type="submit">
                    Create Form
                </Button>
            </form>
        </section>
    )
}
