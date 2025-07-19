import { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import wrong from '@/routes/wrong.png'
import spinner from '@/routes/Iphone-spinner-2 (2).gif'
import { toast } from "react-toastify"
import { AuthContext } from "@/context/myContext"
import { Button } from "./ui/button"

type FormValues = {
    name: string
    email: string
    gender: string
    age: number
    isDeveloper: string
    mainSkill: string
}

export default function EditFormResponseFields() {
    const { userId } = useContext<any>(AuthContext)
    const navigate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setformData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [Email, setEmail] = useState<string>()
    const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<string, { label: string, link: string }>>({});

    function useQuery() {
        return new URLSearchParams(useLocation().search)
    }
    const query = useQuery()
    const formId = query.get("formId")
    const responseId = query.get("responseId")
    console.log("responseId", responseId)
    useEffect(() => {
        async function getformData() {
            try {
                const Data = await fetch(`${apiUrl}/getformbyformid?formId=${formId}`)
                const responsedata = await fetch(`${apiUrl}/submitformbyid?responseId=${responseId}`)
                const click = await Data.json()
                const clickk = await responsedata.json()
                setEmail(clickk.forms[0].email)
                console.log("vv", clickk.forms[0].answer)
                const answers = clickk.forms[0].answer
                setformData(click.forms[0])

                console.log("Answersss : ", answers)

                const defaultValues: Record<string, any> = {};
                const uploadedMap: Record<string, { label: string; link: string }> = {};

                answers.forEach((item: any) => {
                    defaultValues[item.fieldId] = item.value;
                    if (item.uniqueId) {
                        uploadedMap[item.fieldId] = {
                            label: item.value,
                            link: `${apiUrl}/file/${item.uniqueId}`
                        };
                    }
                });
                setUploadedFilesMap(uploadedMap);

                reset(defaultValues);
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
        reset
    } = useForm<FormValues>()

    async function uploadFiles(): Promise<
        { fieldId: string; value: string; uniqueId: string }[]
    > {
        const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"][data-field-id]');
        const uploads: { fieldId: string; value: string; uniqueId: string }[] = [];
        const seenFiles = new Set<string>();

        for (const input of fileInputs) {
            const files = input.files;
            const fieldId = input.dataset.fieldId;

            if (!fieldId) continue;

            // If no new file is selected and we have old one — use that
            if (!files || files.length === 0) {
                if (uploadedFilesMap[fieldId]) {
                    uploads.push({
                        fieldId,
                        value: uploadedFilesMap[fieldId].label,
                        uniqueId: uploadedFilesMap[fieldId].link.split('/').pop() || "", // extract uniqueId from link
                    });
                }
                continue;
            }

            // If new file selected, upload it
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
            }
        }

        return uploads;
    }

    const onSubmit = async (data: FormValues) => {
        console.log("Form raw data:", data);

        // Step 1: Upload new files
        const uploadedFiles = await uploadFiles();

        // Step 2: Merge field values
        const finalSubmission = Object.entries(data).map(([fieldId, value]) => {
            const uploaded = uploadedFiles.find(f => f.fieldId === fieldId);

            // Use newly uploaded file
            if (uploaded) {
                return {
                    fieldId,
                    value: uploaded.value,
                    uniqueId: uploaded.uniqueId
                };
            }

            // Use existing uploaded file info (from prefill)
            if (uploadedFilesMap[fieldId]) {
                return {
                    fieldId,
                    value: uploadedFilesMap[fieldId].label,
                    uniqueId: uploadedFilesMap[fieldId].link.split("/").pop() || ""
                };
            }

            // Regular non-file input
            return {
                fieldId,
                value
            };
        });

        console.log("Final Submission Payload:", finalSubmission);

        // Step 3: Submit to backend
        try {
            const res = await fetch(`${apiUrl}/submitform`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    responseId: responseId,
                    answer: finalSubmission
                })
            });

            const parsed = await res.json();
            console.log(parsed);

            if (res.status === 200) {
                toast.success("Form Updated Successfully.", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    style: {
                        backgroundColor: "#fff",
                        color: "#000",
                        fontSize: "16px"
                    }
                });
                reset();
                navigate(`/formresponses?formId=${formId}`);
            }
        } catch (error) {
            console.error("Error uploading data:", error);
            toast.error("Error uploading data. Please try again.", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
                style: {
                    backgroundColor: "#fff",
                    color: "#000",
                    fontSize: "16px"
                }
            });
        }
    };

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
                        <div className="text-[15px] pt-3 flex">
                                    <label className="block mb-1  font-semibold">Email: {` `}</label>
                                    <p>{` ${Email}`}</p>
                                </div>
                        <div className="grid sm:grid-cols-2 gap-10">
                            {formData?.fields.map((ele: any, id: number) => (
                                <div className=""><label key={id} className="block mb-1 capitalize"> {ele.label} <span className="text-red-600">*</span></label>

                                    {ele.type === "text" && (
                                        <input
                                            type="text"
                                            {...register(ele.id, { required: ele.required })}
                                            className="border px-3 py-2 rounded w-full"
                                        />
                                    )}


                                    {ele.type === "number" && (
                                        <input
                                            type="number"
                                            {...register(ele.id, { required: ele.required })}
                                            className="border px-3 py-2 rounded w-full"
                                        />
                                    )}

                                    {ele.type === "file" && (
                                        <div className="relative border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:border-gray-800 transition">
                                            <input
                                                type="file"
                                                multiple
                                                data-field-id={ele.id}
                                                id={`fileInput-${ele.id}`}
                                                {...register(ele.id)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />

                                            <div className="text-gray-500 text-sm pointer-events-none">
                                                <p className="font-medium">Click to upload or drag & drop</p>
                                            </div>

                                        </div>
                                    )}

                                    {ele.type === "textarea" && (
                                        <textarea
                                            {...register(ele.id, { required: ele.required })}
                                            className="border px-3 py-2 rounded w-full"
                                        />
                                    )}

                                    {ele.type === "radio" && (
                                        <div className="flex gap-4">
                                            {ele.options.map((option: string, idx: number) => (
                                                <label key={idx} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        value={option}
                                                        {...register(ele.id, { required: ele.required })}
                                                        className="mr-2"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {ele.type === "select" && (
                                        <select
                                            {...register(ele.id, { required: ele.required })}
                                            className="border px-3 py-2 rounded w-full"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select an option</option>
                                            {ele.options.map((option: string, idx: number) => (
                                                <option key={idx} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    )}

                                    {ele.type === "checkbox" && (
                                        <div className="flex flex-col gap-2">
                                            {ele.options.map((option: string, idx: number) => (
                                                <label key={idx} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        value={option}
                                                        {...register(ele.id)} // checkbox is optional unless you add validation
                                                        className="mr-2"
                                                    />
                                                    {option}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {(errors as any)[ele.id] && (
                                        <p className="text-red-500 mt-1 text-sm"><span className="capitalize">{ele.label}</span> {` is required`}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                            <div className="flex justify-end">

                    <Button type="submit" className="bg-gray-800 mb-5 mx-10 hover:bg-[#111111] text-[white] px-4 py-2 rounded">
                        Submit
                    </Button>
                            </div>
                </form></> : <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
        </section>
    )
}