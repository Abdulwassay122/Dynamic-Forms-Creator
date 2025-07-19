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
import { ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import spinner from './Iphone-spinner-2 (2).gif'
import { AuthContext } from "@/context/myContext";

type Field = {
  id: string
  label: string
  type: string
  required: boolean
  options: string[]
}

type FormData = {
  id: string
  userId: string
  title: string
  description: string
  fields: Field[]
  sections: Field[]
}

type Answer = {
  fieldId: string
  value: string
}

type ResponseEntry = {
  id: string
  formId: string
  answer: Answer[]
}
type TableCellValue = string | { label: string; link: string };

export default function FormResponses() {
  const { userId } = useContext<any>(AuthContext)
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate()

  const [formData, setFormData] = useState<FormData | null>(null)
  const [responseData, setResponseData] = useState<ResponseEntry[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
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
  console.log('res Data', responseData)
  // Convert responseData into table rows using field IDs as keys
  const tableData = useMemo(() => {
    if (!formData || !responseData) return []

    return responseData.map((entry: any) => {
      const row: Record<string, TableCellValue> = {}

      // Add safety check
      if (entry.answer && Array.isArray(entry.answer)) {
        entry.answer.forEach((ans: any) => {
          if (ans.uniqueId) {
            row[ans.fieldId] = {
              label: ans.value,
              link: `${apiUrl}/file/${userId}/${formId}/${ans.uniqueId}`
            };
          } else {
            row[ans.fieldId] = ans.value || "";
          }
        });
      }

      row["id"] = entry.id
      row["email"] = entry.email || ""
      return row
    })
  }, [responseData, formData, apiUrl, userId, formId])


  const generateFieldColumns = () => {
    const fields = formData?.fields?.length
      ? formData.fields
      : formData?.sections?.flatMap((section: any) => section.fields) || [];
    return fields.map((field, i) => ({
      accessorKey: `field_${i + 1}`,
      header: field.label,
      cell: ({ row }: any) => {
        const value = row.getValue(`field_${i + 1}`);

        if (typeof value === "string") return value;

        if (value && typeof value === "object" && "label" in value && "link" in value) {
          return (
            <a
              href={value.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {value.label}
            </a>
          );
        }

        return "—";
      },
    }));
  };

  const columns = useMemo<ColumnDef<Record<string, TableCellValue>>[]>(() => {
    if (!formData) return [];

    const baseColumns: ColumnDef<Record<string, TableCellValue>>[] = [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => row.getValue("email") || "—",
      },
    ];

    const fieldColumns = generateFieldColumns();
    return [...baseColumns, ...fieldColumns];
  }, [formData]);



  const table = useReactTable<Record<string, TableCellValue>>({
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


  // Ahsan bhai ki debbugging 
  // table.getRowModel().rows.map((row) => {
  //   row.getVisibleCells().forEach((cell) => {
  //     const cellId = cell.column.id;
  //     const cellValue = cell.getValue();
  //     console.log(`ID: ${cellId}, Value: ${cellValue}`);
  //   });
  // });


  return (
    <section className="flex flex-col gap-8 py-10 px-4 lg:px-6">
      {loading && <div className=" flex justify-center items-center h-screen"><img src={spinner} alt="" /></div>}
      {!loading && <>
        <div className="bg-gray-50 shadow-sm rounded-lg p-6 border border-gray-200 ">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Form Responses</h1>
          <div className="text-gray-700 text-base flex flex-col flex-wrap gap-2">
            <p className="capitalize">
              <span className="font-medium text-gray-900">Form Title: </span>{formData?.title}
            </p>
            <p>
              <span className="font-medium text-gray-900">Form Description: </span>{formData?.description?.length ? formData.description : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 items-end w-full overflow-x-auto">
          <Button onClick={handleClick} className="w-fit">Use Form</Button>
          <div className="min-w-full inline-block align-middle">
            <div className="rounded-md border max-w-[1015px]">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow className=" hover:bg-gray-200 bg-gray-200 rounded-md" key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="capitalize">
                          {!header.isPlaceholder &&
                            flexRender(header.column.columnDef.header, header.getContext())
                          }
                        </TableHead>
                      ))}

                      <TableHead className="px-6 py-3 rounded-tr-lg text-right">
                        {/* Action */}
                      </TableHead>
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow className="hover:bg-gray-100 bg-gray-50 rounded-md" key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.column.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                        <TableCell className="text-right group-hover:rounded-r-lg px-6 py-4">
                          <Button
                            onClick={() => handleEdit(formData?.id as string, row.original.id as string)}
                            className="inline-block rounded-md bg-black px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-[#494848] "
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="h-24 text-center">
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

    </section>
  )
}
