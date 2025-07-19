import { useContext, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import spinner from './Iphone-spinner-2 (2).gif'
import wrong from './wrong.png'
import { toast } from "react-toastify"
import { AuthContext } from "@/context/myContext"
import ViewFormFields from "@/components/ViewFormFields"
import { Button } from "@/components/ui/button"
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
    uniqueId?: string
};

type FieldData = {
    email: string;
    sections: {
        [sectionName: string]: Section[];
    };
};


export default function ViewForm() {
    const { userId } = useContext<any>(AuthContext)
    const navigate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setformData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<boolean>(false)
    const [formType, setFormType] = useState<string>()
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [partialData, setPartialData] = useState<FieldData>();
    const [isExistEmail, setIsExistEmail] = useState<any>()

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
                setError(true)
            }
        }
        getformData()
    }, [])

    useEffect(() => {
        if (formData?.sections.length > 0) {
            setFormType("sections")
        } else if (formData?.fields.length > 0) {
            setFormType("fields")
        }
        console.log(formType)
    }, [formType, formData])

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        getValues,
        trigger,
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

    // SUBMIT FUNCTION FOR SECTIONS DATA 

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

            const { email, sections } = updatedPartialData;

            if (!email) throw new Error("Email is required");

            // Flatten all fields from all sections
            const flattenedFields: any = [];

            for (const sectionKey in sections) {
                if (sections.hasOwnProperty(sectionKey)) {
                    const fields = sections[sectionKey];
                    fields.forEach((field, i) => {
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

            const upload = await fetch(`${apiUrl}/submitform`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    formId: formId,
                    email: email,
                    answers: finalSubmission,
                }),
            });

            const parsed = await upload.json();
            console.log(parsed);

            if (upload.status === 201) {
                toast.success("Form Submitted Successfully.", {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: false,
                    style: { backgroundColor: '#fff', color: '#000', fontSize: '16px' }
                });
                navigate("/thanks");
                reset();
            }

        } catch (error: any) {
            console.error("Error submitting data:", error.message);
            setLoading(false);
            setError(true);
        }
    };


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

        // Check if email already exists (only if email is present)
        if (updatedPartialData?.email) {
            try {
                const isExis = await fetch(`${apiUrl}/submitformbyemailandformid?email=${updatedPartialData.email}&formId=${formId}`);
                const parExis = await isExis.json();
                setIsExistEmail(parExis);
                console.log("Existing email check", parExis);

                if (parExis.forms && parExis.forms.length > 0) {
                    toast.error("Already Responded with this Email.", {
                        position: "top-center",
                        autoClose: 2000,
                        hideProgressBar: true,
                        closeOnClick: true,
                        pauseOnHover: false,
                        style: { backgroundColor: '#fff', color: '#000', fontSize: '16px' }
                    });
                    return "Already Responded with this Email";
                }
            } catch (error) {
                console.error("Error checking email:", error);
            }
        }

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


    return (
        <section className=" lg:px-60 md:px-20 sm:px-10 px-5 py-20 flex flex-col gap-10 bg-gray-100 bg-gradient-l-r from-gray-100 to-gray-200 ">
            {loading && !error && <div className="flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}

            {formType === "fields"
                ?
                <ViewFormFields />
                : <>
                    {!loading && formData?.sections.length ? <div className="relative bg-white rounded-md shadow-lg"><div className="px-10 flex  flex-col gap-4 items-center">
                        <div className={`bg-gray-800 text-center text-white px-7 py-4 rounded-full absolute ${formData?.description.length > 0 ? "top-[-40px]" : "top-[-30px]"} `}>
                            <h1 className="text-xl font-semibold text-left capitalize">{formData?.title}</h1>
                            <p className="text-center text-[13px] capitalize">{formData?.description}</p>
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
                                        <p className="capitalize text-[13px] text-center text-sm">{formData.sections[currentSectionIndex]?.description}</p>
                                    </div>
                                </div>
                                {currentSectionIndex === 0 && <div className="px-10 flex flex-col">
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
                                        <p className="text-red-500 mt-1">{`Email is required`}</p>
                                    )}
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
