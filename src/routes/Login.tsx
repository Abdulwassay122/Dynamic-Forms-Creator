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
import { useContext, useEffect, useState } from "react"
import bcrypt from "bcryptjs"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "@/context/myContext"
import { toast } from 'react-toastify';
import { z } from "zod";


// Zod Schema for login
const LoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
});

interface signupInfo {
  email: string;
  password: string;
}

export default function Login({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate()
  const { setLogined, setUserId, setUser } = useContext<any>(AuthContext)
  const [info, setInfo] = useState<signupInfo>({ email: '', password: '' })
  const [Error, setError] = useState<{ email?: string; password?: string; form?: string }>({});
  const [bool, setBool] = useState<boolean>(false)
  useEffect(() => {
    if (info.email.length === 0 || info.password.length === 0) {
      setBool(true)
    } else {
      setBool(false)
    }
  }, [info])

  const handleInputChange = (e: any) => {
    const { id, value } = e.target;
    setInfo((prev) => ({
      ...prev,
      [id]: value,
    }))
    console.log(info)
  }
  const submitInfo = async (e: any) => {
    e.preventDefault()
    console.log('data', info)
    Loginn()
  }
  async function Loginn() {
    try {
      setError({ form: "" })
      const result = LoginSchema.safeParse({
        email: info.email,
        password: info.password,
      });
      if (!result.success) {
        const formatted = result.error.format();
        setError({
          email: formatted.email?._errors[0],
          password: formatted.password?._errors[0],
        });
        return; // prevent further execution
      }
      const existingUser = await fetch(`${apiUrl}/user?email=${info.email}`)
      const parExisUser = await existingUser.json();
      console.log("Existing user", parExisUser)
      if (parExisUser) {
        console.log('ok')
        const checkPass = await bcrypt.compare(info.password, parExisUser[0].password)
        if (checkPass) {
          console.log('logined')
          setUserId(parExisUser[0]._id)
          setUser({email:parExisUser[0].email, name:parExisUser[0].name})
          console.log(parExisUser[0]._id)
          toast.success("Login Successful.")
          setLogined(true)
          navigate('/dashboard')
        } else {
          console.error("Invalid Password")
          setError({ form: "Invalid Password!" })
        }
      } else {
        console.log('error')
        return 'error'
      }
    } catch (error: any) {
      console.error(error.message)
      toast.error("Error Loging in.")
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
              <p className="text-red-400 font-semibold text-center mb-4 text-md">{Error.form}</p>
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
                    <p className="text-red-400 text-sm  text-md">{Error.email}</p>
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
                    <p className="text-red-400 text-sm  text-md">{Error.password}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button disabled={bool} onClick={submitInfo} type="submit" className="w-full">
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
