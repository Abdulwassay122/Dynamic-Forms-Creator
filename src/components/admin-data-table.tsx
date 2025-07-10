"use client"

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Ellipsis } from 'lucide-react'
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
import { useEffect, useState } from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";


import { z } from "zod"

const schema = z.object({
  userId: z.string(), // MongoDB ID
  name: z.string(),
  email: z.string(),
  gender: z.string(),
  role: z.string(),
});

type User = z.infer<typeof schema>;


const columns: ColumnDef<User>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "gender", header: "Gender" },
  { accessorKey: "role", header: "Role" },
];



export function AdminDataTable() {

  const navigate = useNavigate()
  const apiUrl = import.meta.env.VITE_API_URL;
  //data states 
  const [tableData, setTableData] = useState<any>()
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
  async function fetchUsers() {
      const res = await fetch(`${apiUrl}/users`);
      const parsed = await res.json();
      setTableData(parsed.map((ele:any, id:any) => ({
          userId:ele._id,
          id: id + 1,                         
          name: ele.name,         
          email: ele.email,
          gender: ele.gender,
          role: ele.role,
        })));
  }
  fetchUsers();
}, []);


  // react table
const table = useReactTable({
  data: tableData || [],
  columns,
  pageCount: Math.ceil((tableData?.length || 0) / pagination.pageSize),
  state: {
    pagination,
  },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
});

  const handleEdit = (userId: string) => {
    navigate(`/userforms?userId=${userId}`)
  }

  // delete form
  const handleDelete = async (formId: string) => {
    try {
      const res = await fetch(`${apiUrl}/deleteform/${formId}`, {
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

  return (
    <div className="flex flex-col gap-4 items-end">
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
                      px-6 py-4 
                      text-gray-800
                      ${i === 0 ? "rounded-l-lg" : ""}
                      ${i === row.getVisibleCells().length - 1 ? "" : ""}
                    `}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}

                  <TableCell className=" text-right group-hover:rounded-r-lg  px-6 py-4 flex items-center justify-center">
                    <Menubar className="bg-transparent border-none shadow-none">
                      <MenubarMenu>
                        <MenubarTrigger
                          style={{ all: "unset" }}
                          className="p-0 m-0 h-auto w-auto bg-transparent border-none shadow-none focus:outline-none focus:ring-0 hover:bg-transparent data-[state=open]:bg-transparent"
                        >
                          <Ellipsis className="rotate-90" />
                        </MenubarTrigger>
                        <MenubarContent className="w-40">
                          <MenubarItem onClick={() => handleEdit(row.original.userId)} className="flex justify-center">
                            View Forms
                          </MenubarItem>
                          <MenubarItem onClick={() => confirmDelete(row.original.userId)} className="hover:bg-red-400 flex justify-center">
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
      {/* Pagination  */}
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
