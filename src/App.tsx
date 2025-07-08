import './App.css'
import Signup from './routes/Signip'
import './index.css'
import { AuthProvider } from './context/myContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
function App() {
        const apiUrl = import.meta.env.VITE_API_URL;
        console.log('API URL:', apiUrl);
  return (
    <>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard/>
              </PrivateRoute>
            }
          />
          <Route
            path="/editformresponse"
            element={
                <EditFormResponse/>
            }
          />
          <Route
            path="/seeformresponse"
            element={
                <SeeFormResponse/>
            }
          />
          <Route
            path="/createform"
            element={
                <CreateForm/>
            }
          />
          <Route
            path="/viewform"
            element={
                <ViewForm/>
            }
          />
          <Route
            path="/formresponses"
            element={
                <FormResponses/>
            }
          />
          <Route
            path="/viewallforms"
            element={
                <ViewAllResponses/>
            }
          />
          <Route
            path="/thanks"
            element={
                <Thanks/>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    <ToastContainer/>
    </>
  )
}

export default App
