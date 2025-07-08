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

import { useNavigate } from "react-router-dom"

interface DataTableProps<TData extends { UserId: string }> {
  columns: ColumnDef<TData>[]
  data: TData[]
}

export function DataTable<TData extends { UserId: string }>({
  columns,
  data,
}: DataTableProps<TData>) {
  const navigate = useNavigate()

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleEdit = (userId: string) => {
    navigate(`/editform?userId=${userId}`)
  }

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
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
                    ${i === 0 ? "rounded-tl-lg" : ""}
                    ${i === headerGroup.headers.length - 1 ? "rounded-tr-lg" : ""}
                  `}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
              <TableHead className="px-6 py-3 rounded-tr-lg text-right">
                Actions
              </TableHead>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="group even:bg-white odd:bg-gray-50   hover:bg-[#ececee] transition-colors"
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
                <TableCell className="text-right group-hover:rounded-r-lg px-6 py-4">
                  <button
                    onClick={() => handleEdit(row.original.UserId)}
                    className="invisible group-hover:visible inline-block rounded-md bg-black px-3 py-1 text-sm font-medium text-white shadow-sm hover:bg-[#494848] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Edit
                  </button>
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
  )
}
