import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"


import { useContext, useEffect, useState } from "react"
import { columns, schema } from "@/components/coloumn"
import { z } from "zod"
import { AuthContext } from "@/context/myContext"
import { AdminDataTable } from "@/components/admin-data-table"

export default function Page() {
const { userId } = useContext<any>(AuthContext)
const [data, setData] = useState<z.infer<typeof schema>[]>([])
const apiUrl = import.meta.env.VITE_API_URL;

// Check User or Admin
  const { user } = useContext<any>(AuthContext)
  const isAdmin = user.role === "admin"
  
  useEffect(() => {
      async function fetchApi() {
        const stats = await fetch(`${apiUrl}/getformbyuserid?userId=${userId}`)
        const parsedStats = await stats.json()
        console.log("Table Data: ",parsedStats)
        setData(parsedStats.forms.map((ele:any, id:any) => ({
          formId:ele._id,
          id: id + 1,                         
          title: ele.title || "N/A",         
          description: ele.description || "N/A",
        })));
      }
      fetchApi()
  }, [])

  return (
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="px-4 lg:px-6">
              {isAdmin ? <AdminDataTable/> : <DataTable data={data} columns={columns} />}
              </div>
            </div>
          </div>
        </div>
  )
}
