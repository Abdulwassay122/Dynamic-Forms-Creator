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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useContext, useEffect, useState } from "react"
import { userSchema } from "@/schemas/userSchema"
import bcrypt from 'bcryptjs';
import { AuthContext } from "@/context/myContext"
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

// Zod Schema 

interface signupInfo {
  name: string;
  email: string;
  gender: string;
  password: string;
}


export default function Signip({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { setLogined, setUserId, setUser } = useContext<any>(AuthContext)
  const apiUrl = import.meta.env.VITE_API_URL;
  const [info, setInfo] = useState<signupInfo>({ name: '', email: '', gender: '', password: '' })
  const [bool, setBool] = useState<boolean>(false)
  const [Error, setError] = useState<{ email?: string; password?: string; form?: string; name?: string; gender?: string }>({});


  useEffect(() => {
    if (info.email.length === 0 || info.password.length === 0 || info.name.length === 0 || info.gender.length === 0) {
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
  }
  const handleGenderChange = (value: any) => {
    setInfo((prev) => ({
      ...prev,
      gender: value,
    }));
  };
  const submitInfo = async (e: any) => {
    e.preventDefault()
    console.log('data', info)
    createUser()
  }
  async function createUser() {
    try {
      setError({ form: "" })
      // validaate data 

      const result = userSchema.safeParse({
        email: info.email,
        password: info.password,
        gender: info.gender,
        name: info.name
      })
      if (!result.success) {
        const formatted = result.error.format();
        setError({
          email: formatted.email?._errors[0],
          password: formatted.password?._errors[0],
          name: formatted.name?._errors[0],
          gender: formatted.gender?._errors[0],
        });
      } else {
        console.log('validation success')
      }

      // check weather if the user exists 
      const existingUser = await fetch(`${apiUrl}/user?email=${info.email}`);
      const parExisUser = await existingUser.json();
      console.log("Existing user", parExisUser);
      if (parExisUser && parExisUser[0]?.email === info.email) {
        const errorMessage = "Email already exists. Try another email.";
        console.log(errorMessage);
        setError({ form: errorMessage });
        toast.error(errorMessage);
        return errorMessage;
      }


      // hassh pass
      const hasshedPassword = await bcrypt.hash(info.password, 11)
      // create user 
      const user = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: info.name,
          email: info.email,
          gender: info.gender,
          password: hasshedPassword
        })
      })

      if (user.status === 201) {
        const paarse = await user.json()
        setUserId(paarse[0]?._id)
        setUser({email:paarse[0].email, name:paarse[0].name})
        console.log('logined')
        toast.success("User Creaated successffully.")
        setLogined(true)
        navigate('/dashboard')
        return 'user created successffully!'
      }

    } catch (error) {
      console.log("Error Signing up : ", error)
      toast.error("Error Creating User.")
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className={cn("flex flex-col gap-6", className)} {...props}>
          <Card>
            <CardHeader>
              <CardTitle>Create a New Account</CardTitle>
              <CardDescription>
                Enter your details to create account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-red-400  text-center mb-4 text-md">{Error.form}</p>
              <form>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      onChange={handleInputChange}
                      value={info?.name}
                      id="name"
                      type="text"
                      placeholder="Enter your fullname"
                      required
                    />
                    <p className="text-red-400 text-sm  text-md">{Error.name}</p>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      onChange={handleInputChange}
                      value={info?.email}
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                    <p className="text-red-400 text-sm  text-md">{Error.email}</p>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Gender</Label>
                    <Select value={info?.gender} onValueChange={handleGenderChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Gender</SelectLabel>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <p className="text-red-400 text-sm  text-md">{Error.gender}</p>
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
                    <Input onChange={handleInputChange} value={info?.password} id="password" type="password" required />
                    <p className="text-red-400 text-sm  text-md">{Error.password}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button disabled={bool} onClick={submitInfo} type="submit" className="w-full">
                      Sign up
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm">
                  If you Already have an account?{" "}
                  <a href="/login" className="underline underline-offset-4">
                    Login
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
