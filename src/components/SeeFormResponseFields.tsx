import { useContext, useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import wrong from '@/routes/wrong.png'
import spinner from '@/routes/Iphone-spinner-2 (2).gif'
import { AuthContext } from "@/context/myContext"
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

export default function SeeFormResponseFields() {
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


    const {
        register,
        formState: { errors },
        reset,
        control
    } = useForm<FormValues>()


    return (
        <section className="font  flex flex-col gap-5  bg-gradient-l-r from-gray-100 relative justify-center items-center to-gray-200 bg-white rounded-md shadow-lg ">

            {loading && <div className=" flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}
            {!loading && formData?.fields.length ?
                <><div className={`bg-gray-800 text-center text-white px-7 py-4 rounded-full absolute ${formData?.description.length > 0 ? "top-[-40px]" : "top-[-30px]"} `}>
                    <h1 className="text-xl font-semibold text-left capitalize">{formData?.title}</h1>
                    <p className="text-center text-[13px] capitalize">{formData?.description}</p>
                </div>
                    <form className="space-y-6 w-full">
                        <div className="px-10 pt-10 pb-5  flex flex-col gap-5">
                            <div className="text-[15px] pt-3 flex">
                                <label className="block mb-1  font-semibold">Email: {` `}</label>
                                <p>{` ${Email}`}</p>
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
                    </form></> : <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
        </section>
    )
}