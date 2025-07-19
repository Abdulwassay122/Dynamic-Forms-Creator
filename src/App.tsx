import './App.css'
import Signup from './routes/Signip'
import './index.css'
import { AuthProvider } from './context/myContext'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import Login from './routes/Login'
import Dashboard from './routes/DashBoard'
import CreateForm from './routes/CreateForm'
import ViewForm from './routes/ViewForm'
import FormResponses from './routes/FormResponses'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditFormResponse from './routes/EditFormResponse'
import ViewAllResponses from './routes/ViewAllResponses'
import SeeFormResponse from './routes/SeeFromResponse'
import Thanks from './routes/Thanks'
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from './components/app-sidebar'
import { SiteHeader } from './components/site-header'
import UserForms from './routes/UserForms'
import {RouterBreadcrumb} from './components/BreadCrumb'


function LayoutWrapper() {
  const location = useLocation();

  // Routes where sidebar and header should be hidden
  const excludedRoutes = [
    "/createform",
    "/thanks",
    "/editformresponse",
    "/seeformresponse",
    "/viewform",
    "/login",
    "/"
  ];

  const shouldHideLayout = excludedRoutes.includes(location.pathname);
  return (
    <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
    >

      {!shouldHideLayout && <AppSidebar />}

      <SidebarInset>

        {!shouldHideLayout && <SiteHeader />}

        {!shouldHideLayout && <RouterBreadcrumb />}

        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/userforms"
            element={
              <PrivateRoute>
                <UserForms />
              </PrivateRoute>
            }
          />
          <Route
            path="/formresponses"
            element={
              <FormResponses />
            }
          />
          <Route
            path="/viewallforms"
            element={
              <ViewAllResponses />
            }
          />
          {/* j */}
          <Route
            path="/editformresponse"
            element={
              <EditFormResponse />
            }
          />
          {/* j */}
          <Route
            path="/seeformresponse"
            element={
              <SeeFormResponse />
            }
          />
          {/* j */}
          <Route
            path="/createform"
            element={
              <CreateForm />
            }
          />
          {/* j */}
          <Route
            path="/viewform"
            element={
              <ViewForm />
            }
          />
          {/* j */}
          <Route
            path="/thanks"
            element={
              <Thanks />
            }
          />
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  )
}


function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('API URL:', apiUrl);
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <LayoutWrapper />
        </AuthProvider>
      </BrowserRouter>
      <ToastContainer />
    </>
  )
}

export default App
