"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"
type VisitorData = {
  date: string;
  [formTitle: string]: string | number; // date is string, counts are numbers
}

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  male: {
    label: "Male",
    color: "var(--primary)",
  },
  female: {
    label: "Female",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function AdminChartAreaInteractive() {
  const apiUrl = import.meta.env.VITE_API_URL;
  // const { userId } = React.useContext<any>(AuthContext)
  const [chartData, setChartData] = React.useState<VisitorData[] | undefined>();

  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
  async function fetchApi() {
    try {
      const res = await fetch(`${apiUrl}/users`);
      const users = await res.json();
      // Exclude the User with Role Admin
      const nonAdminUsers = users.filter((user: any) => user.role !== "admin");
      const slicedUsers = nonAdminUsers.slice(); // take last 3 users

      const userFormsData = await Promise.all(
        slicedUsers.map(async (user: any) => {
          const dataRes = await fetch(`${apiUrl}/getformbyuserid?userId=${user.id}`);
          const forms = await dataRes.json();
          return {
            userId: user.id,
            name: user.name,
            forms: forms.forms || [], // ensure array
          };
        })
      );

      const formDateMap: Record<string, Record<string, number>> = {};

      userFormsData.forEach(user => {
        user.forms.forEach((form: any) => {
          const date = new Date(form.createdAt).toISOString().split("T")[0];
          if (!formDateMap[date]) {
            formDateMap[date] = {};
          }
          formDateMap[date][user.name] = (formDateMap[date][user.name] || 0) + 1;
        });
      });

      const allDates = Object.keys(formDateMap).sort();
      const userNames = userFormsData.map(user => user.name);

      const chartFormattedData: VisitorData[] = allDates.map(date => {
        const entry: VisitorData = { date };
        userNames.forEach(name => {
          entry[name] = formDateMap[date][name] || 0;
        });
        return entry;
      });

      setChartData(chartFormattedData);
    } catch (err) {
      console.error("Error fetching or parsing form data", err);
    }
  }

  fetchApi();
}, []);



  console.log("Chatt data ", chartData)
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData?.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })
  // console.log("ChartDta ", chartData)
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total Forms Created By Users</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            {chartData && chartData.length > 0 &&
              Object.keys(chartData[0])
                .filter((key) => key !== "date")
                .map((key) => (
                  <Area
                    key={key}
                    dataKey={key}
                    type="natural"
                    fill="url(#fillDesktop)"
                    stroke="var(--color-desktop)"
                    stackId="a"
                  />
                ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
