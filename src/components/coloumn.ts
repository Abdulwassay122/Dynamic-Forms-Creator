import { ColumnDef } from "@tanstack/react-table"
import { z } from "zod"

export const schema = z.object({
  _id: z.string(),
  formId: z.string(),
  title: z.string(),
  description: z.string(),
})

export const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  { accessorKey: "title", header: "Title" },
  { accessorKey: "description", header: "Description" },
]
