import { useEffect } from "react"
import { useForm } from "react-hook-form"



type FormValues = {
    name: string
    email: string
    gender: string
    age: number
    isDeveloper: string
    mainSkill: string
}


export default function MyForm() {
    useEffect(()=>{
        async function countClick (){
            const click = await fetch("http://localhost:3000/dashboard/from/click",{method:"POST"})
            console.log("click",click.json())
            return click
        }
        countClick()
    },[])
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>()

    const onSubmit = async (data: FormValues) => {
        console.log("Form Data:", data)
        try {

            const alreadyFilledData = await fetch(`http://localhost:3000/dashboard/from?email=${data.email}`)
            const alreadyFilled = await alreadyFilledData.json()
            console.log(alreadyFilled)
            if(alreadyFilled.length !== 0){
                console.log("You have already filled this form")
                alert("You have already filled this form")
                return "You have already filled this form"
            }

            const upload = await fetch("http://localhost:3000/dashboard/from", {
                method: "POST",
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
            const updateStats = fetch("http://localhost:3000/dashboard/from/formsubmit", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gender:data.gender
                })
            }) 
            const updateDaily = fetch("http://localhost:3000/dashboard/from/dailyvisitors", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    gender:data.gender
                })
            }) 
            console.log("Stats",updateStats,"visitors",  updateDaily)
            const parsed = await upload.json();
            console.log("pardsed", parsed)
            alert("Subbmitted Succeessfully.")
        } catch (error) {
            console.log("Error uploading Data : ", error)
        }
    }

    return (
        <section className="px-48 py-20 flex flex-col gap-10 bg-gray-100">
            <h1 className="text-3xl font-semibold text-left px-10 py-10  bg-white rounded-md border-t-8 border-[#101828]">Application Form</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Full Name</label>
                    <input
                        {...register("name", {
                            required: "name is required",
                        })}
                        className="border px-3 py-2 rounded w-full"
                    />
                    {errors.name && <p className="text-red-500">{errors.name.message}</p>}
                </div>

                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Email</label>
                    <input
                        type="email" 
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
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
                        <option selected value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                    {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
                </div>

                <div className="px-10 py-10  bg-white rounded-md border-l-8 border-[#101828]">
                    <label className="block mb-1">Age</label>
                    <input
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
