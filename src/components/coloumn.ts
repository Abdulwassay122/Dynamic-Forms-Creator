import { ColumnDef } from "@tanstack/react-table"
import { z } from "zod"

export const schema = z.object({
  _id: z.string(),
  UserId: z.string(),
  email: z.string(),
  mainSkill: z.string(),
  isDeveloper: z.string(),
  gender: z.string(),
  age: z.string(),
  name: z.string(),
})

export const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "index",
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "gender", header: "Gender" },
  { accessorKey: "isDeveloper", header: "Developer" },
  { accessorKey: "mainSkill", header: "Skill" },
]
