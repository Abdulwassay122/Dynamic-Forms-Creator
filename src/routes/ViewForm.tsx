import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import spinner from './Iphone-spinner-2 (2).gif'
import wrong from './wrong.png'
import { toast } from "react-toastify"

type FormValues = {
    name: string
    email: string
    gender: string
    age: number
    isDeveloper: string
    mainSkill: string
}


export default function ViewForm() {
    const navigaate = useNavigate()
    const apiUrl = import.meta.env.VITE_API_URL;
    const [FormData, setFormData] = useState<any>()
    const [loading, setLoading] = useState<boolean>(true)


    function useQuery() {
        return new URLSearchParams(useLocation().search)
    }
    const query = useQuery()
    const formId = query.get("formId")
    console.log("formId", formId)
    useEffect(() => {
        async function getFormData() {
            try {
                const Data = await fetch(`${apiUrl}/getformbyformid?formId=${formId}`)
                const click = await Data.json()
                // console.log("FormData", click)
                setFormData(click.forms[0])
                setLoading(false)
                return click
            } catch (error: any) {
                console.log("Error: ", error.message)
                setLoading(false)
            }
        }
        getFormData()
    }, [])

    console.log("formData", FormData)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<FormValues>()


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

        console.log("Email:", email);
        console.log("Cleaned Data:", cleanedData);

        try {
            const isExis = await fetch(`${apiUrl}/submitformbyemailandformid?email=${email}&formId=${formId}`)
            const parExis = await isExis.json()
            console.log("Existing User",parExis)
            if(parExis.forms && parExis.forms.length > 0){
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
                    formId: FormData._id,
                    email: email,
                    answers: cleanedData
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
        <section className="font lg:px-60 md:px-20 sm:px-10 px-5 py-20 flex flex-col gap-10 bg-gray-100 bg-gradient-l-r from-gray-100 to-gray-200 ">
            {loading && <div className=" flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}

            {!loading && FormData?.fields.length ? <><div className="px-10 py-10 flex  flex-col gap-4 bg-white rounded-md border-t-12 border-[#101828] shadow-lg ">
                <h1 className="text-3xl font-semibold text-left capitalize">{FormData?.title}</h1>
                <p className="capitalize">{FormData?.description}</p>
            </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="px-10 py-10 bg-white rounded-md border-l-12 border-[#101828] shadow-lg">
                        <label className="block mb-1">Email  <span className="text-red-600">*</span></label>
                        <input
                            type="email"
                            {...register("email", {
                                required: true,
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email"
                                }
                            })}
                            className="border px-3 py-2 rounded w-full"
                        />
                        {errors.email  && (
                            <p className="text-red-500 mt-1">{`Email is required`}</p>
                        )}
                    </div>
                    <div className="px-10 py-10 bg-white rounded-md border-l-12 border-[#101828] shadow-lg flex flex-col gap-10">
                    {FormData?.fields.map((ele: any, id: number) => (
                            <div className=""><label key={id} className="block mb-1 capitalize">{id+1}. {ele.label} <span className="text-red-600">*</span></label>

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
                                <p className="text-red-500 mt-1"><span className="capitalize">{ele.label}</span> {` is required`}</p>
                            )}
                            </div>
                        ))}
                        </div>


                    <button type="submit" className="bg-black hover:bg-[#111111] text-[white] px-4 py-2 rounded">
                        Submit
                    </button>
                </form></> : <div className="text-xl font-semibold flex items-center justify-center text-center flex-col gap-3 h-screen"><img src={wrong} className="h-auto w-[60px]" />Oops! <br />Something Went Wrong.</div>}
        </section>
    )
}
