"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import spinner from './Iphone-spinner-2 (2).gif'

type Field = {
  id: string
  label: string
  type: string
  required: boolean
  options: string[]
}

type FormData = {
  _id: string
  userId: string
  title: string
  description: string
  fields: Field[]
}

type Answer = {
  fieldId: string
  value: string
}

type ResponseEntry = {
  _id: string
  formId: string
  answer: Answer[]
}

export default function FormResponses() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData | null>(null)
  const [responseData, setResponseData] = useState<ResponseEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 3,
  });
  function useQuery() {
    return new URLSearchParams(useLocation().search)
  }

  const query = useQuery()
  const formId = query.get("formId")


  useEffect(() => {
    async function fetchApi() {
      try {
        const formdata = await fetch(`${apiUrl}/getformbyformid?formId=${formId}`)
        const responsedata = await fetch(`${apiUrl}/submitform?formId=${formId}`)
        const parformdata = await formdata.json()
        const parresponsedata = await responsedata.json()

        setFormData(parformdata.forms[0])
        setResponseData(parresponsedata.forms)
        setLoading(false)

      } catch (error: any) {
        console.error("Error: ", error.message)
        setLoading(false)
      }
    }
    fetchApi()
  }, [formId])

  // Convert responseData into table rows using field IDs as keys
  const tableData = useMemo(() => {
    if (!formData) return []

    return responseData.map((entry: any) => {
      const row: Record<string, string> = {}
      entry.answer.forEach((ans: any) => {
        row[ans.fieldId] = ans.value
      })
      row["_id"] = entry._id
      row["email"] = entry.email
      return row
    })
  }, [responseData, formData])

  console.log(formData)

  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    if (!formData) return []

    const baseColumns: ColumnDef<Record<string, string>>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }: any) => row.getValue("email") || "—",
      },
    ]

    const fieldColumns = formData.fields.map((field) => ({
      accessorKey: field.id,
      header: field.label,
      cell: ({ row }: any) => row.getValue(field.id) || "—",
    }))

    return [...baseColumns, ...fieldColumns]
  }, [formData])


  const table = useReactTable({
    data: tableData,
    columns,
    pageCount: Math.ceil(tableData.length / pagination.pageSize),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  function handleClick() {
    navigate(`/viewform?formId=${formId}`)
  }
  const handleEdit = (formId: string, responseId: string) => {
    navigate(`/editformresponse?formId=${formId}&responseId=${responseId}`)
  }

  return (
    <div className="flex flex-col gap-8 py-10 md:px-20 sm:px-10 px-5">
      {loading && <div className=" flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}
      {!loading && <><div className="flex flex-col gap-4">
        <h1 className="md:text-2xl sm:text-xl font-bold">
          Form Title: <span className="font-semibold">{formData?.title}</span>
        </h1>
        <h1 className="md:text-2xl sm:text-xl font-bold">
          Form Description:{" "}
          <span className="font-semibold">
            {formData?.description?.length ? formData.description : "N/A"}
          </span>
        </h1>
      </div>

        <div className="flex flex-col gap-4 items-end">
          <Button onClick={handleClick} className="w-fit">Use Form</Button>
          <div className="w-full">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow className=" hover:bg-gray-200 bg-gray-200 rounded-md" key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="capitalize">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      ))}
                      <TableHead className="px-6 py-3 rounded-tr-lg text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow className="hover:bg-gray-100 bg-gray-50 rounded-md " key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                        <TableCell className="text-right group-hover:rounded-r-lg px-6 py-4">
                          <Button
                            onClick={() => handleEdit(formData?._id as string, row.original._id)}
                            className=" inline-block rounded-md bg-black px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-[#494848] "
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>  
        </div></>}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => table.previousPage()}
              className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50 cursor-pointer" : "cursor-pointer"}
            />
          </PaginationItem>

          <PaginationItem>
            <span className="text-sm px-4 py-2">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              onClick={() => table.nextPage()}
              className={!table.getCanNextPage() ? "pointer-events-none opacity-50 cursor-pointer" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

    </div>
  )
}
