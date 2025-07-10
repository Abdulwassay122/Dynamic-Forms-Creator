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
                formId: ele._id,
                id: id + 1,
                title: ele.title || "N/A",
                description: ele.description || "N/A",
            })));
            setLoading(false)
        }
        fetchApi()
    }, [])
    return (
        <div>
            {Loading && <div className='h-screen flex justify-center items-center'><img src={spinner} /></div>}
            {!Loading && <div className='py-10 px-4 lg:px-6 gap-5 flex flex-col'>
                <div className='flex gap-4 flex-col'>
                    <h1 className='text-xl font-semibold'>User Forms:</h1>
                    <div className='text-[15px] flex gap-5'>
                        <p className='capitalize'><strong>Name: </strong>{User.name}</p>
                        <p><strong>Email: </strong>{User.email}</p>
                    </div>
                </div>
                <DataTable data={data} columns={columns} />
            </div>}
        </div>
    )
}
