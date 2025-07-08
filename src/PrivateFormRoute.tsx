import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/myContext";

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateFormRoute = ({ children }: PrivateRouteProps) => {
  const auth = useContext(AuthContext);

  if (!auth?.logined) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateFormRoute;
