import { DataTable } from '@/components/data-table'
import { useEffect, useState } from "react"
import { columns, schema } from "@/components/coloumn"
import { z } from 'zod'
import { useLocation } from 'react-router-dom'
import spinner from './Iphone-spinner-2 (2).gif'

export default function UserForms() {
    const [data, setData] = useState<z.infer<typeof schema>[]>([])
    const [Loading, setLoading] = useState<boolean>(true)
    const [User, setUser] = useState<any>()
    const apiUrl = import.meta.env.VITE_API_URL;
    function useQuery() {
        return new URLSearchParams(useLocation().search)
    }

    const query = useQuery()
    const userId = query.get("userId")

    useEffect(() => {
        async function fetchApi() {
            // fetching user 
            const res2 = await fetch(`${apiUrl}/getuserbyid?id=${userId}`)
            const parsedRes2 = await res2.json()
            setUser(parsedRes2[0])
            // fetching from data 
            const res1 = await fetch(`${apiUrl}/getformbyuserid?userId=${userId}`)
            const parsedRes = await res1.json()
            console.log("Table Data: ", parsedRes)
            setData(parsedRes.forms.map((ele: any, id: any) => ({
                formId: ele.id,
                id: id + 1,
                title: ele.title || "N/A",
                description: ele.description || "N/A",
            })));
            setLoading(false)
        }
        fetchApi()
    }, [])
    return (
        <div className="px-4 lg:px-6 sm:py-10 py-10  flex flex-col gap-10">
            {Loading ? (
                <div className="h-screen flex justify-center items-center">
                    <img src={spinner} alt="Loading..." className="w-16 h-auto" />
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {/* User Info Header */}
                    <div className="bg-gray-50 shadow-sm rounded-lg p-6 border border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">User Forms</h1>
                        <div className="text-gray-700 text-base flex  flex-wrap gap-6">
                            <p className="capitalize">
                                <span className="font-medium text-gray-900">Name:</span> {User.name}
                            </p>
                            <p>
                                <span className="font-medium text-gray-900">Email:</span> {User.email}
                            </p>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="">
                        <DataTable data={data} columns={columns} />
                    </div>
                </div>
            )}
        </div>

    )
}
