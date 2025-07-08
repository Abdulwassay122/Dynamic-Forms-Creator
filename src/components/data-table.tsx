"use client"

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table"

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Copy, Ellipsis } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"
import { toast } from 'react-toastify';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Delete } from 'lucide-react'

interface DataTableProps<TData extends { formId: string }> {
  columns: ColumnDef<TData>[]
  data: TData[]
}

export function DataTable<TData extends { formId: string }>({
  columns,
  data,
}: DataTableProps<TData>) {
  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_SITE_URL;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleEdit = (userId: string) => {
    navigate(`/formresponses?formId=${userId}`)
  }

  function handleClick() {
    navigate(`/createform`)
  }

  // delete form
  const handleDelete = async (formId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/deleteform/${formId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete form");
      }

      console.log("Deleted:", data.message);
      navigate("/dashboard")
      toast("Form Deleted Successfully!", {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
      })
    } catch (error) {
      console.error("Error deleting form:", error);
      toast.error("Error Deleting Form!")
    }
  };

  function confirmDelete(id: any) {
    if (window.confirm("Are you sure you want to delete this form?")) {
      handleDelete(id);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(`${apiUrl}/viewform?formId=${text}`)
      .then(() => {
        console.log('Text copied to clipboard:', text);
        toast("URL Copied! ", {
          position: "bottom-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          style: {
            backgroundColor: '#fff',
            color: '#000',
            fontSize: '16px',
          }
        })
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  }

  return (
    <div className="flex flex-col gap-4 items-end">
      <Button onClick={handleClick} className="w-fit">Create Form</Button>
      <div className="overflow-x-auto w-full rounded-lg shadow-lg border border-gray-200">
        <Table className="min-w-full rounded-lg border-collapse">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-50 text-gray-700 uppercase text-sm font-semibold select-none rounded-t-lg"
              >
                {headerGroup.headers.map((header, i) => (
                  <TableHead
                    key={header.id}
                    className={`
                    px-6 py-3
                    ${i === 0 ? "roundedtl-lg" : ""}
                    ${i === headerGroup.headers.length - 1 ? "roundedtr-lg" : ""}
                  `}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
                <TableHead className="px-6 py-3 roundedtr-lg text-right">
                  {/* Copy URL */}
                </TableHead>
                <TableHead className="px-6 py-3 roundedtr-lg text-right">
                  {/* Button */}
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group even:bg-white odd:bg-gray-50 hover:bg-[#ececee] transition-colors"
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <TableCell
                      key={cell.id}
                      className={`
                      px-6 py-4 capitalize
                      text-gray-800
                      ${i === 0 ? "rounded-l-lg" : ""}
                      ${i === row.getVisibleCells().length - 1 ? "" : ""}
                    `}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}

                  <TableCell className="text-right  px-6 py-4">
                    <Button
                      onClick={() => copyToClipboard(row.original.formId)}
                      className=" inline-block rounded-md bg-black px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-[#494848]"
                    >
                      <Copy />
                    </Button>
                  </TableCell>

                  <TableCell className="text-right group-hover:rounded-r-lg  px-6 py-4 flex items-center justify-center">
                    <Menubar className="bg-transparent border-none shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger
                        style={{ all: "unset" }}
                          className="p-0 m-0 h-auto w-auto bg-transparent border-none shadow-none focus:outline-none focus:ring-0 hover:bg-transparent data-[state=open]:bg-transparent"
                        >
                          <Ellipsis className="rotate-90" />
                        </MenubarTrigger>
                        <MenubarContent className="w-40">
                          <MenubarItem onClick={() => handleEdit(row.original.formId)} className="flex justify-center">
                            View Responses
                          </MenubarItem>
                          <MenubarItem onClick={() => confirmDelete(row.original.formId)} className="hover:bg-red-400 flex justify-center">
                            <div className="flex items-center gap-2">
                              <Delete size={16} />
                              <span>Delete Form</span>
                            </div>
                          </MenubarItem>
                        </MenubarContent>
                      </MenubarMenu>
                    </Menubar>
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 1}
                  className="text-center py-10 text-gray-400 italic"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
