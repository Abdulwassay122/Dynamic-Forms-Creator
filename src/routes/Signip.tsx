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
import { useContext, useState } from "react"
import { userSchema } from "@/schemas/userSchema"
import bcrypt from 'bcryptjs';
import { AuthContext } from "@/context/myContext"
import { useNavigate } from "react-router-dom";

interface signupInfo{
    name:string;
    email:string;
    gender:string;
    password:string;
}


export default function Signip({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const navigate = useNavigate()
    const { setLogined, setUserId } = useContext<any>(AuthContext)

    const [info, setInfo] = useState<signupInfo>({ name: '', email: '', gender: '', password: ''})
    const handleInputChange = (e:any) =>{
        const { id, value } = e.target;
        setInfo((prev)=>({
            ...prev,
            [id]:value,
        }))
    }
    const handleGenderChange = (value:any) => {
    setInfo((prev) => ({
      ...prev,
      gender: value,
    }));
    };
    const submitInfo = async(e:any) =>{
        e.preventDefault()
        console.log('data', info)
        createUser()
    }
    async function createUser() {
        try {
            // check weather if the user exists 
            const existingUser = await fetch(`http://localhost:3000/user?email=${info.email}`)
            const parExisUser = await existingUser.json();
            console.log("Existing user",parExisUser)
            if(parExisUser[0].email === info.email){
                console.log('email already exists.try  another email.')
                return 'email already exists.try  another email.'
            }
            
            // validaate data 
            const result = userSchema.parse(info)
            if(result){
                console.log('validation success')
            }else{
                console.log('validation failed', info)
                return 'data validation failed'
            }

            // hassh pass
            const hasshedPassword = await bcrypt.hash(info.password, 11)
            // create user 
            const user = await fetch('http://localhost:3000/users', {
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
            console.log('user created successffully!', user.json())
            if(user){
                const paarse = await user.json()
                setUserId(paarse[0]._id)
                console.log('logined')
                setLogined(true)
                navigate('/dashboard')
            }
            return 'user created successffully!'
            
        } catch (error) {
          console.log("Error Signing up : ", error)
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
                      </div>
                      <div className="flex flex-col gap-3">
                        <Button onClick={submitInfo} type="submit" className="w-full">
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
