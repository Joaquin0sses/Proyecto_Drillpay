import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Login({ setToken }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData()
            formData.append('username', username)
            formData.append('password', password)

            const res = await axios.post('http://localhost:8000/auth/token', formData)
            const token = res.data.access_token
            localStorage.setItem('token', token)
            setToken(token)
            navigate('/')
        } catch (err) {
            alert('Error al iniciar sesión')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión DrillPay</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Usuario</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2">Contraseña</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    )
}
