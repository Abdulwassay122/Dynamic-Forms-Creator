import { useForm, useFieldArray } from "react-hook-form";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import FieldBlock from "./FieldBlock"; // import your child component
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/myContext";

type Option = { value: string };
type Field = { label: string; type: string; options: Option[] };
type FormValues = {
    title: string;
    description: string;
    fields: Field[];
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
            fields: [
                {
                    label: "",
                    type: "text",
                    options: [{ value: "" }, { value: "" }],
                },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "fields",
    });

    const onSubmit = (data: FormValues) => {
        if (!data.fields || data.fields.length === 0) {
            alert("At least one field is required.");
            return;
        }
        const cleanedFields = data.fields.map((field, index) => {
            const id = `field_${index + 1}`;
            if (["radio", "select", "checkbox"].includes(field.type)) {
                const filteredOptions = field.options.filter(opt => opt.value.trim() !== "");

                if (filteredOptions.length === 0) {
                    alert(`Field ${index + 1} must have at least one non-empty option.`);
                    throw new Error(`Field ${index + 1} has no valid options.`);
                }

                return {
                    ...field,
                    options: filteredOptions,
                    id
                };
            }

            return { ...field, id };
        });

        const cleanedData = {
            ...data,
            fields: cleanedFields,
            userId:userId
        };

        console.log("Form Submitted:", data);
        console.log("Cleaned Data to Submit:", cleanedData);

        // post data 
        async function fetchApi(){
            try {
                const data = await fetch(`${apiUrl}/createform`, {
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(cleanedData) 
                })
                console.log("Posted Data",data)
                if(data.status === 201){
                    navigate("/dashboard")
                }
            } catch (error:any) {
                console.log(error)
                alert(`error:${error.message}`)
            }
        }
        fetchApi()

    };

    return (
        <section className="px-48 py-20 flex flex-col gap-10 bg-gray-100">
            <h1 className="shadow-2xl text-3xl font-semibold  px-10 py-10  bg-white rounded-md border-t-12 border-[#101828]">Create a New Form</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="shadow-2xl px-10 py-10 flex flex-col gap-6  bg-white rounded-md border-l-12 border-[#101828]">
                    {/* Title */}
                    <div className="">
                        <label className="block mb-1 font-semibold">Form Title</label>
                        <input
                            placeholder="Enter Form Title"
                            {...register("title", {
                                required: "Title is required",
                            })}
                            className="border px-3 py-2 rounded w-full"
                        />
                        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="">
                        <label className="block mb-1 font-semibold">Form Description</label>
                        <input
                            placeholder="Enter Form Description"
                            {...register("description")}
                            className="border px-3 py-2 rounded w-full"
                        />
                        {/* You can keep this if other rules are added later */}
                        {errors.description && <p className="text-red-500">{errors.description.message}</p>}
                    </div>
                </div>

                {/* Fields */}
                {fields.map((field, index) => (
                    <FieldBlock
                        errors={errors}
                        key={field.id}
                        control={control}
                        register={register}
                        index={index}
                        remove={remove}
                    />
                ))}
                <div className="flex items-center justify-between">
                    <Button type="submit" className="">
                        Create Form
                    </Button>
                    <Button
                        type="button"
                        onClick={() =>
                            append({ label: "", type: "text", options: [{ value: "" }, { value: "" }] })
                        }
                    >
                        <PlusIcon className="mr-2" />
                        Add Field
                    </Button>
                </div>

            </form>
        </section>
    );
}
