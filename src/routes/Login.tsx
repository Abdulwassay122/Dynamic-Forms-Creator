import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContext, useState } from "react"
import bcrypt from "bcryptjs"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/myContext"



interface signupInfo{
    email:string;
    password:string;
}

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
      const navigate = useNavigate()
      const { setLogined, setUserId } = useContext<any>(AuthContext)
      const [info, setInfo] = useState<signupInfo>({ email: '', password: ''})
  
  const handleInputChange = (e:any) =>{
        const { id, value } = e.target;
        setInfo((prev)=>({
            ...prev,
            [id]:value,
        }))
        console.log(info)
    }
    const submitInfo = async(e:any) =>{
        e.preventDefault()
        console.log('data', info)
        Loginn()
    }
    async function Loginn (){
      try {
        const existingUser = await fetch(`http://localhost:3000/user?email=${info.email}`)
        const parExisUser = await existingUser.json();
        console.log("Existing user",parExisUser)
        if(parExisUser){
          console.log('ok')
          const checkPass = await bcrypt.compare(info.password, parExisUser[0].password)
          if(checkPass){
            console.log('logined')
            setUserId(parExisUser[0]._id)
            console.log(parExisUser[0]._id)
            setLogined(true)
            navigate('/dashboard')
          }
        }else{
          console.log('error')
          return 'error'
        }
      } catch (error) {
        
      }
    }
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your email below to login to your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form>
                    <div className="flex flex-col gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          value={info.email}
                          onChange={handleInputChange}
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                        />
                      </div>
                      <div className="grid gap-3">
                        <div className="flex items-center">
                          <Label htmlFor="password">Password</Label>
                          <a
                            href="#"
                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <Input value={info.password} onChange={handleInputChange} id="password" type="password" required />
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button onClick={submitInfo} type="submit" className="w-full">
                          Login
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 text-center text-sm">
                      Don&apos;t have an account?{""}
                      <a href="/" className="underline underline-offset-4">
                        Sign up
                      </a>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
      </div>
    </div>
  )
}
