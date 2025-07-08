import './App.css'
import Signup from './routes/Signip'
import './index.css'
import { AuthProvider } from './context/myContext'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import Login from './routes/Login'
import Dashboard from './routes/DashBoard'
import Form from './routes/Form'
import EditForm from './routes/EditForm'
import CreateForm from './routes/CreateForm'

function App() {
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
            path="/form"
            element={
                <Form/>
            }
          />
          <Route
            path="/editform"
            element={
                <EditForm/>
            }
          />
          <Route
            path="/createform"
            element={
                <CreateForm/>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </>
  )
}

export default App
