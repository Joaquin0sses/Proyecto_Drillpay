import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Invoices from './components/Invoices'
import Layout from './components/Layout'
import Templates from './components/Templates'
import { useState } from 'react'

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'))

    const ProtectedRoute = ({ children }) => {
        if (!token) {
            return <Navigate to="/login" replace />
        }
        return children
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login setToken={setToken} />} />
                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout>
                            <Dashboard />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/invoices" element={
                    <ProtectedRoute>
                        <Layout>
                            <Invoices />
                        </Layout>
                    </ProtectedRoute>
                } />
                <Route path="/templates" element={
                    <ProtectedRoute>
                        <Layout>
                            <Templates />
                        </Layout>
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
