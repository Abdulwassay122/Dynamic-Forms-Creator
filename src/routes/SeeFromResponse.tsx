import { useContext, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useLocation } from "react-router-dom"
import wrong from './wrong.png'
import spinner from './Iphone-spinner-2 (2).gif'
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
import SeeFormResponseFields from "@/components/SeeFormResponseFields"

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
    const apiUrl = import.meta.env.VITE_API_URL;
    const [formData, setFormData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
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
        formState: { errors },
        reset,
        control
    } = useForm<FormValues>()

    // upload files function 
      const handleNext = () => {
          setCurrentSectionIndex(currentSectionIndex + 1);
      };
  
  
  
  
      const handlePrevious = () => {
          if (currentSectionIndex > 0) {
              setCurrentSectionIndex(currentSectionIndex - 1);
          }
      };
 

    console.log("Index", currentSectionIndex)
    return (
        <section className=" lg:px-60 md:px-20 sm:px-10 px-5 py-20 flex flex-col gap-10 bg-gray-100 bg-gradient-l-r from-gray-100 to-gray-200 ">
            {loading && <div className="flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}

            {formType === "fields"
                ?
                <SeeFormResponseFields />
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
                        <form  className="space-y-6">
                            {/* <h1 className="text-2xl font-bold">Fields:</h1> */}


                            {formData?.sections.length > 0 && (<div className=" pb-10 pt-5 flex flex-col gap-5 ">
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
                            </div>
                        </form></div> : <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
                </>}
        </section>
    )
}
