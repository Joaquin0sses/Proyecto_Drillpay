import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Users() {
    const [users, setUsers] = useState([])
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('user')

    const token = localStorage.getItem('token')

    const handleRegister = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:8000/auth/register', {
                username,
                email,
                password
            })
            alert('Usuario registrado exitosamente')
            setUsername('')
            setEmail('')
            setPassword('')
        } catch (err) {
            alert('Error en el registro: ' + (err.response?.data?.detail || err.message))
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Gestión de Usuarios</h2>

            <div className="bg-white p-6 rounded shadow mb-8 max-w-md">
                <h3 className="text-xl font-bold mb-4">Registrar Nuevo Usuario</h3>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block mb-1">Usuario</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            className="w-full border p-2 rounded"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
                        Crear Usuario
                    </button>
                </form>
            </div>
        </div>
    )
}
