import React, { createContext, useState, ReactNode, Dispatch, SetStateAction, useEffect } from "react";

interface AuthContextType {
  logined: boolean;
  setLogined: Dispatch<SetStateAction<boolean>>;
  formFilled: boolean;
  setFormFilled: Dispatch<SetStateAction<boolean>>;
  userId:string
  setUserId:Dispatch<SetStateAction<string>>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// The fix: make sure to return JSX!
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [logined, setLogined] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("logined");
    return stored === "true"; // Convert string to boolean
  });
  const [formFilled, setFormFilled] = useState<boolean>(() => {
    const stored = sessionStorage.getItem("formFilled");
    return stored === "true"; // Convert string to boolean
  });
  const [userId, setUserId] = useState<string>(()=>{
    const stored = sessionStorage.getItem("userId")
    return stored ?? ''
  })
  // Save to sessionStorage whenever `logined` changes
  useEffect(() => {
    sessionStorage.setItem("logined", logined.toString());
  }, [logined]);
  useEffect(() => {
    sessionStorage.setItem("formFilled", formFilled.toString());
  }, [formFilled]);
  useEffect(()=>{
    sessionStorage.setItem("userId", userId)
  }, [userId])
  return (
    <AuthContext.Provider value={{ logined, setLogined, formFilled, setFormFilled, userId, setUserId }}>
      {children}
    </AuthContext.Provider>
  );
};
