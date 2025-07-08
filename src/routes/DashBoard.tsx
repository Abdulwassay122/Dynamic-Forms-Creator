import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"


import { useEffect, useState } from "react"
import { columns, schema } from "@/components/coloumn"
import { z } from "zod"
export default function Page() {

const [data, setData] = useState<z.infer<typeof schema>[]>([])

  useEffect(() => {
    async function fetchApi() {
      const stats = await fetch("http://localhost:3000/dashboard/from")
      const parsedStats = await stats.json()
      console.log(parsedStats)
      setData(parsedStats.map((ele:any, id:any) => ({
        UserId:ele._id,
        id: id + 1,                         
        email: ele.email || "N/A",         
        mainSkill: ele.mainSkill || "N/A",
        isDeveloper: ele.isDeveloper || "Unknown",
        gender: ele.gender || "N/A",
        age: String(ele.age || "N/A"),     
        name: ele.name || "Anonymous"
      })));
    }
    fetchApi()
  }, [])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <div className="px-4 lg:px-6">
              <DataTable data={data} columns={columns} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
