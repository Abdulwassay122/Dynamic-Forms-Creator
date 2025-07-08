import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"



type FormValues = {
    name: string
    email: string
    gender: string
    age: number
    isDeveloper: string
    mainSkill: string
}


export default function EditForm() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormValues>()

    const [userData, setUserData] = useState<any>()

    function useQuery() {
        return new URLSearchParams(useLocation().search)
    }
    const query = useQuery()
    const _id = query.get("userId")
    console.log("id",_id)
    useEffect(() => {
        async function countClick() {
            const click = await fetch(`${apiUrl}/dashboard/from/id?_id=${_id}`)
            const parsedData = await click.json()
            setUserData(parsedData[0])
            console.log("clg pased",parsedData)
            reset(parsedData[0])

            return parsedData
        }
        countClick()
    }, [_id, reset])


    console.log("userrdtadysuklk",userData)

    const onSubmit = async (data: FormValues) => {
        console.log("Form Data:", data)
        try {

            const upload = await fetch(`${apiUrl}/dashboard/from`, {
                method: "PATCH",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name:data.name,
                    email:data.email,
                    gender:data.gender,
                    age:data.age,
                    isDeveloper:data.isDeveloper,
                    mainSkill:data.mainSkill,
                })
            })
            const parsed = await upload.json();
            console.log("pardsed", parsed)
            navigate("/dashboard")
        } catch (error) {
            console.log("Error uploading Data : ", error)
        }
    }

    return (
        <section className="px-48 py-20 flex flex-col gap-10 bg-gray-100">
            <h1 className="text-3xl font-semibold text-left px-10 py-10  bg-white rounded-md border-t-12 border-[#101828]">Application Form</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Full Name</label>
                    <input
                        defaultValue={userData?.name}
                        {...register("name", {
                            required: "name is required",
                        })}
                        className="border px-3 py-2 rounded w-full"
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>

                <div className="px-10 py-10  bg-white rounded-md border-l-12 border-[#101828]">
                    <label className="block mb-1">Email</label>
                    <input
                        defaultValue={userData?.email}
                        type="email" // 👈 Ensures basic HTML5 email validation
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // 👈 Simple email regex
                                message: "Enter a valid email address"
                            }
                        })}
                        className="border px-3 py-2 rounded w-full"
                    />
                    {errors.email && (
                        <p className="text-red-500">{errors.email.message}</p>
                    )}
                </div>


                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Gender</label>
                    <select
                        {...register("gender", { required: "Gender is required" })}
                        className="border px-3 py-2 rounded w-full"
                    >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
                </div>

                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Age</label>
                    <input
                        defaultValue={userData?.age}
                        type="number"
                        {...register("age", {
                            required: "GrowthRate is required",
                            valueAsNumber: true,
                        })}
                        className="border px-3 py-2 rounded w-full"
                    />
                    {errors.age && <p className="text-red-500">{errors.age.message}</p>}
                </div>

                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Are you a Developer?</label>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="yes"
                                {...register("isDeveloper", { required: "Developer selection is required" })}
                                className="mr-2"
                            />
                            Yes
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="no"
                                {...register("isDeveloper", { required: "Developer selection is required" })}
                                className="mr-2"
                            />
                            No
                        </label>
                    </div>
                    {errors.isDeveloper && (
                        <p className="text-red-500 mt-1">{errors.isDeveloper.message}</p>
                    )}
                </div>

                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Select your Main Skill</label>
                    <select
                        {...register("mainSkill", { required: "mainSkill is required" })}
                        className="border px-3 py-2 rounded w-full"
                    >
                        <option selected value="React.js">React.js</option>
                        <option value="Next.js">Next.js</option>
                        <option value="Angular">Angular</option>
                        <option value="Vue.js">Vue.js</option>
                        <option value="Django">Django</option>
                        <option value="Flask">Flask</option>
                        <option value="Express.js (Node.js)">Express.js (Node.js)</option>
                    </select>
                    {errors.mainSkill && <p className="text-red-500">{errors.mainSkill.message}</p>}
                </div>





                <button type="submit" className="bg-black hover:bg-[#111111] text-[white] px-4 py-2 rounded">
                    Submit
                </button>
            </form>
        </section>
    )
}
