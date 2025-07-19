import { useLocation, Link } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function RouterBreadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter(Boolean)

  return (
    <div className="w-full px-4 lg:px-6 py-3 bg-background/70">
      <Breadcrumb>
        <BreadcrumbList className="flex flex-wrap items-center gap-1 text-sm">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/dashboard" className="capitalize font-medium text-foreground hover:underline">
                Dashboard
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {pathnames.map((segment, index) => {
            const to = "/" + pathnames.slice(0, index + 1).join("/")
            const isLast = index === pathnames.length - 1

            return (
              <span key={to} className="flex items-center gap-1">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="capitalize text-muted-foreground">
                      {decodeURIComponent(segment.replace(/-/g, " "))}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={to} className="capitalize hover:underline">
                        {decodeURIComponent(segment.replace(/-/g, " "))}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
