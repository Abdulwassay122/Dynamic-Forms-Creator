import { useContext, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import wrong from './wrong.png'
import spinner from './Iphone-spinner-2 (2).gif'
import { toast } from "react-toastify"
import { AuthContext } from "@/context/myContext"
import { Button } from "@/components/ui/button"
import EditFormResponseFields from "@/components/EditFormResponseFields"
import { Label } from "@radix-ui/react-label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

type Section = {
    id: string;
    value: any;
};

type FieldData = {
    email: string;
    sections: {
        [sectionName: string]: Section[];
    };
};

export default function EditFormResponse() {
    const { userId } = useContext<any>(AuthContext)
    const navigate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<boolean>(false)
    const [Email, setEmail] = useState<string>()
    const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<string, { label: string, link: string }>>({});
    const [formType, setFormType] = useState<string>()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [partialData, setPartialData] = useState<FieldData>();


    function useQuery() {
        return new URLSearchParams(useLocation().search)
    }
    const query = useQuery()
    const formId = query.get("formId")
    const responseId = query.get("responseId")
    console.log("responseId", responseId)
    useEffect(() => {
        async function getFormData() {
            try {
                const dataRes = await fetch(`${apiUrl}/getformbyformid?formId=${formId}`);
                const responseRes = await fetch(`${apiUrl}/submitformbyid?responseId=${responseId}`);
                const formJson = await dataRes.json();
                const responseJson = await responseRes.json();

                const formStructure = formJson.forms[0];
                const answers = responseJson.forms[0].answer;
                const userEmail = responseJson.forms[0].email;

                setFormData(formStructure);
                setEmail(userEmail);

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

                // ➕ Build sectioned data with new field IDs
                let answerIndex = 0;
                const reconstructedSections: Record<string, Section[]> = {};

                formStructure.sections.forEach((section: any, sectionIdx: number) => {
                    const sectionKey = `section_${sectionIdx}`;
                    const sectionFields: Section[] = [];

                    for (let fieldIdx = 0; fieldIdx < section.fields.length; fieldIdx++) {
                        const answer = answers[answerIndex++];
                        if (answer) {
                            sectionFields.push({
                                id: `field_${fieldIdx + 1}`,
                                value: answer.value
                            });
                        }
                    }

                    reconstructedSections[sectionKey] = sectionFields;
                });

                const finalPartialData: FieldData = {
                    email: userEmail,
                    sections: reconstructedSections
                };

                setPartialData(finalPartialData);

                setLoading(false)
                return

            } catch (error: any) {
                console.log("Error: ", error.message)
                setLoading(false)
            }
        }
        getFormData()
    }, [])
    useEffect(() => {
        if (formData?.sections.length > 0) {
            setFormType("sections")
        } else if (formData?.fields.length > 0) {
            setFormType("fields")
        }
        console.log(formType)
    }, [formType, formData])
    // console.log("formData", FormData)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
        trigger,
        control
    } = useForm<FormValues>()

    // upload files function 
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

    const onSubmit = async () => {
        try {
            if (!partialData) throw new Error("No data to submit");

            const currentValues: any = getValues();
            const currentSection = formData.sections[currentSectionIndex];
            const currentFields = currentSection?.fields || [];

            //  Upload files like in handleSectionChange
            const uploadedFiles = await uploadFiles();

            const sectionData: Section[] = currentFields.map((field: any) => {
                const value = currentValues[field.id];
                const uploadedFile = uploadedFiles.find(upload => upload.fieldId === field.id);

                if (uploadedFile) {
                    return {
                        id: field.id,
                        value: uploadedFile.value,
                        uniqueId: uploadedFile.uniqueId
                    };
                } else if (field.type === 'file') {
                    return {
                        id: field.id,
                        value: null
                    };
                } else {
                    return {
                        id: field.id,
                        value: value || ''
                    };
                }
            });

            const updatedPartialData: FieldData = {
                email: currentValues.email ?? partialData?.email ?? '',
                sections: {
                    ...(partialData?.sections || {}),
                    [`section_${currentSectionIndex}`]: sectionData
                }
            };

            // Save to session + state
            setPartialData(updatedPartialData);
            sessionStorage.setItem('formPartialData', JSON.stringify(updatedPartialData));

            const { sections } = updatedPartialData;

            // Flatten all fields from all sections
            const flattenedFields: any = [];

            for (const sectionKey in sections) {
                if (sections.hasOwnProperty(sectionKey)) {
                    const fields: any = sections[sectionKey];
                    fields.forEach((field: any, i: number) => {
                        const fieldObj: any = {
                            fieldId: `field_${i + 1}`,
                            value: field.value,
                        };
                        if (field.uniqueId) {
                            fieldObj.uniqueId = field.uniqueId; // Add uniqueId here
                        }
                        flattenedFields.push(fieldObj);
                    });
                }
            }

            // Reindex fields if needed (optional, you already assign fieldId above)
            const reindexFields = (fields: { fieldId: string; value: any; uniqueId?: string }[]) => {
                return fields.map((field, index) => {
                    const newField: any = {
                        fieldId: `field_${index + 1}`,
                        value: field.value,
                    };
                    if (field.uniqueId) {
                        newField.uniqueId = field.uniqueId;
                    }
                    return newField;
                });
            };

            const finalSubmission = reindexFields(flattenedFields);

            console.log('Final Data (including updated files):', finalSubmission);

            try {
                const upload = await fetch(`${apiUrl}/submitform`, {
                    method: "PATCH",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        responseId: responseId,
                        answer: finalSubmission
                    })
                })
                const parsed = await upload.json()
                console.log(parsed)
                if (upload.status === 200) {
                    toast.success("Form Updated Successfully.", {
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
                    reset()
                    navigate(`/formresponses?formId=${formId}`)
                }
            } catch (error) {
                console.log("Error uploading Data : ", error)
                toast.error(`Error uploading Data : ${error}`, {
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
            }
        } catch (error: any) {
            console.error("Error uploading Data:", error.message);
            setLoading(false);
            setError(true);
        }
    }

    useEffect(() => {
        const savedData = sessionStorage.getItem('formPartialData');
        if (savedData) {
            setPartialData(JSON.parse(savedData));
        }
    }, []);

    useEffect(() => {
        if (partialData) {
            sessionStorage.setItem('formPartialData', JSON.stringify(partialData));
        }
    }, [partialData]);



    const handleSectionChange = async (newIndex: number) => {
        const currentValues: any = getValues();
        console.log("currentValues", currentValues);

        const currentSection = formData.sections[currentSectionIndex];
        const currentFields = currentSection?.fields || [];

        // First, upload files for the current section
        const uploadedFiles = await uploadFiles();
        console.log("Uploaded files:", uploadedFiles);

        const sectionData: Section[] = currentFields.map((field: any) => {
            let value = currentValues[field.id];

            // Check if this field has uploaded files
            const uploadedFile = uploadedFiles.find(upload => upload.fieldId === field.id);

            if (uploadedFile) {
                // This is a file field with uploaded data
                return {
                    id: field.id,
                    value: uploadedFile.value, // Original filename
                    uniqueId: uploadedFile.uniqueId // Saved filename
                };
            } else if (field.type === 'file') {
                // File field but no upload (empty)
                return {
                    id: field.id,
                    value: null
                };
            } else {
                // Regular field (text, number, select, etc.)
                return {
                    id: field.id,
                    value: value || ''
                };
            }
        });

        const updatedPartialData: FieldData = {
            email: currentValues.email ?? partialData?.email ?? '',
            sections: {
                ...(partialData?.sections || {}),
                [`section_${currentSectionIndex}`]: sectionData
            }
        };

        // Save to sessionStorage immediately
        sessionStorage.setItem('formPartialData', JSON.stringify(updatedPartialData));

        console.log("Updated partial data with file uploads:", updatedPartialData);

        // Only update state and navigate if email check passes
        setPartialData(updatedPartialData);
        setCurrentSectionIndex(newIndex);
    };


    console.log("Partial Data :", partialData)

    const handleNext = async () => {
        if (!formData || !formData.sections) return;

        const currentSection = formData.sections[currentSectionIndex];
        const currentFieldIds = currentSection?.fields.map((field: any) => field.id) || [];

        // Ensure 'email' field is checked on first section
        if (currentSectionIndex === 0 && !currentFieldIds.includes('email')) {
            currentFieldIds.push('email');
        }

        const isValid = await trigger(currentFieldIds);

        if (!isValid) {
            toast.error("Please fill all required fields correctly.", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: false,
            });
            return;
        }

        // This should only move to the next section, not submit the form
        await handleSectionChange(currentSectionIndex + 1);
    };




    const handlePrevious = () => {
        if (currentSectionIndex > 0) {
            handleSectionChange(currentSectionIndex - 1);
        }
    };

    useEffect(() => {
        if (!formData || !formData.sections || !partialData?.sections) return;

        const sectionKey = `section_${currentSectionIndex}`;
        const sectionData = partialData.sections[sectionKey] || [];

        const defaults: Record<string, any> = {};

        // Prefill values from saved data
        sectionData.forEach((field) => {
            defaults[field.id] = field.value;
        });

        // Restore email if needed
        if (partialData.email) {
            defaults.email = partialData.email;
        }

        if (sectionData.length === 0) {
            reset()
        } else {
            reset(defaults);
        }

    }, [currentSectionIndex, partialData, formData, reset]);

    console.log("Index", currentSectionIndex)
    useEffect(() => {
        console.log("PartialData just updated:", partialData);
    }, [partialData]);

    console.log("Index", currentSectionIndex)
    return (
        <section className=" lg:px-60 md:px-20 sm:px-10 px-5 py-20 flex flex-col gap-10 bg-gray-100 bg-gradient-l-r from-gray-100 to-gray-200 ">
            {loading && <div className="flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}

            {formType === "fields"
                ?
                <EditFormResponseFields />
                : <>
                    {!loading && formData?.sections.length ? <div className="relative bg-white rounded-md shadow-lg"><div className="px-10 flex  flex-col gap-4 items-center">
                        <div className={`bg-gray-800 text-center text-white px-7 py-4 rounded-full absolute ${formData?.description.length > 0 ? "top-[-40px]" : "top-[-30px]"} `}>
                            <h1 className="text-xl font-semibold text-left capitalize">{formData?.title}</h1>
                            <p className="text-center text-[13px] capitalize">{formData?.description} THius is A Decsctieopfuuro</p>
                        </div>
                        <div className="flex items-center pt-18 w-full justify-between">
                            {formData.sections.map((_: any, e: number) => (<>
                                <div className={`rounded-full border-solid ${currentSectionIndex >= e ? 'border-gray-800' : 'border-gray-200'}  w-full border-2`}></div>
                                <div onClick={() => setCurrentSectionIndex(e)} className={`cursor-pointer h-10 min-w-10 flex justify-center items-center rounded-[100%] text-white ${currentSectionIndex >= e ? "bg-gray-800" : "bg-gray-200"} `}>{e + 1}</div>
                                <div className={`rounded-full border-solid ${currentSectionIndex >= e ? 'border-gray-800' : 'border-gray-200'}  w-full border-2`}></div>
                            </>))}
                        </div>
                    </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* <h1 className="text-2xl font-bold">Fields:</h1> */}


                            {formData?.sections.length > 0 && (<div className=" pb-5 pt-5 flex flex-col gap-5 ">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="text-xl font-semibold text-white bg-gray-800 h-12 w-full flex justify-center items-center">Step - {currentSectionIndex + 1}</div>
                                    <div >
                                        <h1 className="text-xl text-center font-semibold  capitalize">{formData.sections[currentSectionIndex]?.name}</h1>
                                        <p className="capitalize text-[13px] text-center text-sm">{formData.sections[currentSectionIndex]?.description} this is the description</p>
                                    </div>
                                </div>
                                {currentSectionIndex < formData.sections.length - 1 && <div className="text-[15px] px-10 flex">
                                    <label className="block mb-1  font-semibold">Email: {` `}</label>
                                    <p>{` ${Email}`}</p>
                                </div>}
                                <div className="grid sm:grid-cols-2 gap-10 px-10">
                                    {formData.sections[currentSectionIndex]?.fields.map((ele: any, id: number) => (
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
                            )}
                            <div className={`justify-between w-full flex px-10 pb-10`}>
                                {currentSectionIndex > 0 && <Button type="button" onClick={handlePrevious}>Previous</Button>}
                                <div className="flex justify-end w-full">
                                    {currentSectionIndex < formData.sections.length - 1 && <Button type="button" onClick={handleNext}>Next</Button>}
                                </div>
                                {currentSectionIndex === formData.sections.length - 1 && <Button type="submit" className="">
                                    Submit
                                </Button>}
                            </div>
                        </form></div> : <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
                </>}
        </section>
    )
}
