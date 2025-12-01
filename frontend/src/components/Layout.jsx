import { Link, useNavigate } from 'react-router-dom'

export default function Layout({ children }) {
    const navigate = useNavigate()

    const logout = () => {
        localStorage.removeItem('token')
        window.location.reload()
    }

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-slate-800 text-white p-6">
                <h1 className="text-2xl font-bold mb-8">DrillPay</h1>
                <nav className="space-y-4">
                    <Link to="/" className="block hover:text-blue-400">Panel Principal</Link>
                    <Link to="/invoices" className="block hover:text-blue-400">Facturas</Link>
                    <Link to="/templates" className="block hover:text-blue-400">Configuración</Link>
                    <button onClick={logout} className="block text-red-400 hover:text-red-300 mt-8">Cerrar Sesión</button>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
