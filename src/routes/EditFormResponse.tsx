import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import wrong from './wrong.png'
import spinner from './Iphone-spinner-2 (2).gif'
import { toast } from "react-toastify"

type FormValues = {
    name: string
    email: string
    gender: string
    age: number
    isDeveloper: string
    mainSkill: string
}

export default function EditFormResponse() {
    const navigate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [FormData, setFormData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)
    const [Email, setEmail] = useState<string>()

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
                const Data = await fetch(`${apiUrl}/getformbyformid?formId=${formId}`)
                const responsedata = await fetch(`${apiUrl}/submitformbyid?responseId=${responseId}`)
                const click = await Data.json()
                const clickk = await responsedata.json()
                setEmail(clickk.forms[0].email)
                console.log("vv", clickk.forms[0].answer)
                const answers = clickk.forms[0].answer
                setFormData(click.forms[0])

                const defaultValues: Record<string, any> = {};
                answers.forEach((item: { fieldId: string; value: any }) => {
                    defaultValues[item.fieldId] = item.value;
                });

                reset(defaultValues);
                setLoading(false)
                return click

            } catch (error: any) {
                console.log("Error: ", error.message)
                setLoading(false)
            }
        }
        getFormData()
    }, [])

    // console.log("formData", FormData)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormValues>()


    const onSubmit = async (data: FormValues) => {
        console.log("Loading Data:", data)

        const cleanedData = Object.entries(data).map(([key, value]) => ({
            fieldId: key,
            value: value
        }));
        console.log("cleanedData", cleanedData)

        try {
            const upload = await fetch(`${apiUrl}/submitform`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    responseId: responseId,
                    answer: cleanedData
                })
            })
            const parsed = await upload.json()
            console.log(parsed)
            if (upload.status === 201) {
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
    }

    return (
        <section className="px-48 py-20 flex flex-col gap-10 bg-gray-100">
            {loading && <div className=" flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}

            {!loading && FormData ? <><div className="shadow-2xl px-10 py-10 flex  flex-col gap-4 bg-white rounded-md border-t-12 border-[#101828]">
                <h1 className="text-3xl font-semibold text-left ">{FormData?.title}</h1>
                <p>{FormData?.description}</p>
                <p><strong>Email: </strong>{Email}</p>
            </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {FormData?.fields.map((ele: any, id: number) => (
                        <div key={id} className="px-10 py-10 bg-white rounded-md border-l-12 border-[#101828] shadow-2xl">
                            <label className="block mb-1">{ele.label}</label>

                            {ele.type === "text" && (
                                <input
                                    type="text"
                                    {...register(ele.id, { required: ele.required })}
                                    className="border px-3 py-2 rounded w-full"
                                />
                            )}

                            {ele.type === "email" && (
                                <input
                                    type="email"
                                    {...register(ele.id, {
                                        required: ele.required,
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email"
                                        }
                                    })}
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

                            {(errors as any)[ele.label] && (
                                <p className="text-red-500 mt-1">{`${ele.label} is required`}</p>
                            )}
                        </div>
                    ))}


                    <button type="submit" className="bg-black hover:bg-[#111111] text-[white] px-4 py-2 rounded">
                        Submit
                    </button>
                </form></> : <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
        </section>
    )
}
