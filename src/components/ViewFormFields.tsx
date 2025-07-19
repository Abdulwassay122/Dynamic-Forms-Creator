import { useContext, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import spinner from '@/routes/Iphone-spinner-2 (2).gif'
import wrong from '@/routes/wrong.png'
import { toast } from "react-toastify"
import { AuthContext } from "@/context/myContext"
import { Button } from "./ui/button"
import { Label } from "@radix-ui/react-label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

type FormValues = {
    name: string
    email: string
    gender: string
    age: number
    isDeveloper: string
    mainSkill: string
}


export default function ViewFormFields() {
    const { userId } = useContext<any>(AuthContext)
    const navigaate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setformData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<boolean>(false)

    function useQuery() {
        return new URLSearchParams(useLocation().search)
    }
    const query = useQuery()
    const formId = query.get("formId")
    console.log("formId", formId)
    useEffect(() => {
        async function getformData() {
            try {
                const Data = await fetch(`${apiUrl}/getformbyformid?formId=${formId}`)
                const click = await Data.json()
                // console.log("formData", click)
                setformData(click.forms[0])
                setLoading(false)
                return click
            } catch (error: any) {
                console.log("Error: ", error.message)
                setLoading(false)
            }
        }
        getformData()
    }, [])

    console.log("formData", formData)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control
    } = useForm<FormValues>()

    // Uplaod File Function 
    async function uploadFiles(): Promise<
        { fieldId: string; value: string; uniqueId: string }[]
    > {
        const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"][data-field-id]');
        const uploads: { fieldId: string; value: string; uniqueId: string }[] = [];

        const seenFiles = new Set<string>();

        for (const input of fileInputs) {
            const files = input.files;
            const fieldId = input.dataset.fieldId;

            if (!files || files.length === 0 || !fieldId) continue;

            const formData = new FormData();
            formData.append("userId", userId);
            formData.append("formId", formId as string);
            let hasNewFiles = false;

            for (let i = 0; i < files.length; i++) {
                const key = `${fieldId}_${files[i].name}_${files[i].size}`;
                if (!seenFiles.has(key)) {
                    seenFiles.add(key);
                    formData.append('myFiles', files[i]);
                    hasNewFiles = true;
                }
            }

            if (!hasNewFiles) continue;

            try {
                const res = await fetch('http://localhost:3000/upload-multiple', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.statusText}`);
                }

                const parsed = await res.json();

                parsed.files.forEach((file: any) => {
                    uploads.push({
                        fieldId,
                        value: file.originalName,
                        uniqueId: file.savedAs,
                    });
                });
            } catch (err) {
                console.error(`Error uploading files for field ${fieldId}:`, err);
                setError(true)
            }
        }

        return uploads;
    }

    const onSubmit = async (data: FormValues) => {
        console.log("Loading Data:", data);

        // Extract email separately
        const email = data.email;

        // Exclude email from cleanedData
        const cleanedData = Object.entries(data)
            .filter(([key]) => key !== "email") // exclude email
            .map(([key, value]) => ({
                fieldId: key,
                value: value
            }));


        // Upload files and get upload info
        const uploadedFiles = await uploadFiles();
        // Merge non-file fields and uploaded files
        const finalSubmission = [...cleanedData, ...uploadedFiles];

        console.log("Email:", email);
        console.log("Cleaned Data:", finalSubmission);

        try {
            const isExis = await fetch(`${apiUrl}/submitformbyemailandformid?email=${email}&formId=${formId}`)
            const parExis = await isExis.json()
            console.log("Existing User", parExis)
            if (parExis.forms && parExis.forms.length > 0) {
                toast.error("Already Responded with this Email.", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    style: {
                        backgroundColor: '#fff',
                        color: '#000',
                        fontSize: '16px',
                    }
                })
                return "Already Responded with this Email"
            }

            const upload = await fetch(`${apiUrl}/submitform`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    formId: formData.id,
                    email: email,
                    answers: finalSubmission
                })
            })
            const parsed = await upload.json()
            console.log(parsed)
            if (upload.status === 201) {
                toast.success("Form Subbmitted Successfully.", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    style: {
                        backgroundColor: '#fff',
                        color: '#000',
                        fontSize: '16px',
                    }
                })
                navigaate("/thanks")
                reset()
            }
        } catch (error: any) {
            console.log("Error uploading Data : ", error.message)
            setLoading(false)
        }
    }

    return (
        <section className="font  flex flex-col gap-5  bg-gradient-l-r from-gray-100 relative justify-center items-center to-gray-200 bg-white rounded-md shadow-lg ">

            {loading && <div className=" flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}
            {!loading && formData?.fields.length ?
                <><div className={`bg-gray-800 text-center text-white px-7 py-4 rounded-full absolute ${formData?.description.length > 0 ? "top-[-40px]" : "top-[-30px]"} `}>
                    <h1 className="text-xl font-semibold text-left capitalize">{formData?.title}</h1>
                    <p className="text-center text-[13px] capitalize">{formData?.description}</p>
                </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
                        <div className="px-10 pt-10 pb-5  flex flex-col gap-5">
                            <div className="grid w-full items-center gap-1.5">
                                <Label className="text-[15px]" htmlFor="email">
                                    Email<span className="text-red-600 ml-1">*</span>
                                </Label>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            {...field}
                                        />
                                    )}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.email.message as string}
                                    </p>
                                )}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-10">
                                {formData?.fields.map((ele: any, id: number) => (
                                    <div className=""><Label key={id} className="block mb-1 capitalize text-[15px]"> {ele.label} <span className="text-red-600">*</span></Label>
                                        {ele.type === "text" && (
                                            <Controller
                                                name={ele.id}
                                                control={control}
                                                rules={{ required: ele.required }}
                                                render={({ field }) => (
                                                    <Input
                                                        type="text"
                                                        {...field}
                                                        className="w-full"
                                                    />
                                                )}
                                            />
                                        )}

                                        {ele.type === "number" && (
                                            <Controller
                                                name={ele.id}
                                                control={control}
                                                rules={{ required: ele.required }}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="w-full"
                                                    />
                                                )}
                                            />
                                        )}

                                        {ele.type === "file" && (
                                            <Controller
                                                name={ele.id}
                                                control={control}
                                                defaultValue={[]}
                                                render={({ field }) => (
                                                    <div className="relative border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-800 transition">
                                                        <Input
                                                            type="file"
                                                            multiple
                                                            data-field-id={ele.id}
                                                            id={`fileInput-${ele.id}`}
                                                            onChange={(e) => {
                                                                field.onChange(e.target.files);
                                                            }}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="text-gray-500 text-sm pointer-events-none">
                                                            <p className="font-medium">Click to upload or drag & drop</p>
                                                        </div>
                                                    </div>
                                                )}
                                            />
                                        )}

                                        {ele.type === "textarea" && (
                                            <Controller
                                                name={ele.id}
                                                control={control}
                                                rules={{ required: ele.required }}
                                                render={({ field }) => (
                                                    <Textarea
                                                        {...field}
                                                        className="w-full"
                                                        placeholder="Enter text"
                                                    />
                                                )}
                                            />
                                        )}

                                        {ele.type === "radio" && (
                                            <Controller
                                                name={ele.id}
                                                control={control}
                                                rules={{ required: ele.required }}
                                                render={({ field }) => (
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className="flex gap-4"
                                                    >
                                                        {ele.options.map((option: string, idx: number) => (
                                                            <div key={idx} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={option} id={`${ele.id}-${idx}`} />
                                                                <label htmlFor={`${ele.id}-${idx}`} className="text-sm">
                                                                    {option}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                )}
                                            />
                                        )}

                                        {ele.type === "select" && (
                                            <Controller
                                                name={ele.id}
                                                control={control}
                                                rules={{ required: ele.required }}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        defaultValue=""
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select an option" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ele.options.map((option: string, idx: number) => (
                                                                <SelectItem key={idx} value={option}>
                                                                    {option}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        )}

                                        {ele.type === "checkbox" && (
                                            <Controller
                                                name={ele.id}
                                                control={control}
                                                defaultValue={[]}
                                                rules={{
                                                    validate: (value) =>
                                                        ele.required && (!value || value.length === 0)
                                                            ? `${ele.label} is required`
                                                            : true,
                                                }}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-2">
                                                        {ele.options.map((option: string, idx: number) => {
                                                            const id = `${ele.id}-${idx}`;
                                                            const isChecked = field.value?.includes(option);

                                                            return (
                                                                <div key={id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={id}
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => {
                                                                            const updated = checked
                                                                                ? [...(field.value || []), option]
                                                                                : (field.value || []).filter((v: string) => v !== option);

                                                                            field.onChange(updated);
                                                                        }}
                                                                    />
                                                                    <label
                                                                        htmlFor={id}
                                                                        className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed"
                                                                    >
                                                                        {option}
                                                                    </label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            />
                                        )}

                                        {(errors as any)[ele.id] && (
                                            <p className="text-red-500 mt-1 text-sm"><span className="capitalize">{ele.label}</span> {` is required`}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end">

                            <Button type="submit" className="mb-5 mx-10">
                                Submit
                            </Button>
                        </div>
                    </form></> : <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
        </section>
    )
}