
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AuthContext } from "@/context/myContext"
import { useContext, useEffect, useState } from "react"



export function SectionCards() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { userId } = useContext<any>(AuthContext)

  const [data, setData] = useState<any>()
  const [totalResponses, setTotalResponses] = useState<any>()
  useEffect(() => {
    async function fetchData() {
      try {
        const dataRes = await fetch(`${apiUrl}/getformbyuserid?userId=${userId}`);
        const parsedData = await dataRes.json();
        setData(parsedData);

        // Now that we have forms, calculate total responses directly
        const forms = parsedData?.forms || [];

        const responseCounts = await Promise.all(
          forms.map(async (form: any) => {
            const res = await fetch(`${apiUrl}/submitform?formId=${form._id}`);
            const resData = await res.json();
            return resData.forms?.length || 0;
          })
        );
        const total = responseCounts.reduce((sum, count) => sum + count, 0);
        setTotalResponses(total);

      } catch (err) {
        console.error("Error fetching data or responses:", err);
      }
    }

    fetchData();
  }, [apiUrl, userId]);


  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-2">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Forms</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.forms.length}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
          </div>
          <div className="text-muted-foreground">
            Total number of Froms Created
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Form Responses</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalResponses}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
          </div>
          <div className="text-muted-foreground">
            Number off forms subbmited by the user
          </div>
        </CardFooter>
      </Card>
      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Males</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.males}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Females</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {data?.females}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card> */}
    </div>
  )
}
