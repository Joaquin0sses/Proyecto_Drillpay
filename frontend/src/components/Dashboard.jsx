import { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [charts, setCharts] = useState(null)
    const [topDebtors, setTopDebtors] = useState([])
    const [clients, setClients] = useState([])
    const [filters, setFilters] = useState({
        client_id: '',
        status: '',
        start_date: '',
        end_date: ''
    })
    const [selectedClient, setSelectedClient] = useState(null)

    const token = localStorage.getItem('token')
    const COLORS = ['#10B981', '#EF4444'] // Green for Paid, Red for Unpaid

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Clients
                const clientsRes = await axios.get('http://localhost:8000/clients/', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setClients(clientsRes.data)

                // Fetch Stats
                const params = new URLSearchParams()
                if (filters.client_id) params.append('client_id', filters.client_id)
                if (filters.status) params.append('status', filters.status)
                if (filters.start_date) params.append('start_date', filters.start_date)
                if (filters.end_date) params.append('end_date', filters.end_date)

                const statsRes = await axios.get(`http://localhost:8000/dashboard/stats?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setStats(statsRes.data)

                // Fetch Charts & Top Debtors (only if no specific client filter for global view)
                if (!filters.client_id) {
                    const chartsRes = await axios.get('http://localhost:8000/dashboard/charts', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setCharts(chartsRes.data)

                    const debtorsRes = await axios.get('http://localhost:8000/dashboard/top-debtors', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setTopDebtors(debtorsRes.data)
                    setSelectedClient(null)
                } else {
                    setCharts(null)
                    setTopDebtors([])
                    // Find selected client details
                    const client = clientsRes.data.find(c => c.id === parseInt(filters.client_id))
                    setSelectedClient(client)
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [filters])

    if (!stats) return <div className="flex justify-center items-center h-screen text-purple-600">Cargando...</div>

    return (
        <div className="space-y-8">
            {/* Header & Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">Panel de Control</h2>
                        <p className="text-slate-500">Resumen financiero y operativo</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            className="bg-white border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={filters.client_id}
                            onChange={e => setFilters({ ...filters, client_id: e.target.value })}
                        >
                            <option value="">Todos los Clientes</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            className="bg-white border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={filters.status}
                            onChange={e => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">Todos los Estados</option>
                            <option value="PENDING">Pendiente</option>
                            <option value="PAID">Pagado</option>
                            <option value="OVERDUE">Vencido</option>
                        </select>
                        <input
                            type="date"
                            className="bg-white border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={filters.start_date}
                            onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                        />
                        <input
                            type="date"
                            className="bg-white border border-slate-200 p-2 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                            value={filters.end_date}
                            onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                        />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 border-l-8 border-l-blue-500">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Facturado</h3>
                        <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.total_invoices}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 border-l-8 border-l-purple-500">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Clientes</h3>
                        <p className="text-3xl font-extrabold text-slate-800 mt-2">{stats.total_clients}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 border-l-8 border-l-green-500">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Monto Pendiente</h3>
                        <p className="text-3xl font-extrabold text-green-600 mt-2">${stats.pending_amount?.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 border-l-8 border-l-red-500">
                        <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Facturas Vencidas</h3>
                        <p className="text-3xl font-extrabold text-red-600 mt-2">{stats.overdue_count}</p>
                    </div>
                </div>
            </div>

            {/* Client Profile (Conditional) */}
            {selectedClient && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800">👤 Perfil del Cliente</h3>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-slate-500 text-sm font-semibold uppercase">Nombre</p>
                            <p className="text-lg font-bold text-slate-800">{selectedClient.name}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold uppercase">Email</p>
                            <p className="text-lg font-bold text-slate-800">{selectedClient.email}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold uppercase">RUT</p>
                            <p className="text-lg font-bold text-slate-800">{selectedClient.rut || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-semibold uppercase">Teléfono</p>
                            <p className="text-lg font-bold text-slate-800">{selectedClient.phone || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-slate-500 text-sm font-semibold uppercase">Dirección</p>
                            <p className="text-lg font-bold text-slate-800">{selectedClient.address || 'N/A'}, {selectedClient.city}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {charts && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pie Chart */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden lg:col-span-1 flex flex-col">
                        <div className="bg-slate-50 p-5 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">Distribución de Pagos</h3>
                        </div>
                        <div className="p-6 flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.pie_chart}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {charts.pie_chart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart (Trends) */}
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col">
                        <div className="bg-slate-50 p-5 border-b border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800">Tendencia de Facturación (Últimos 6 Meses)</h3>
                        </div>
                        <div className="p-6 flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.bar_chart}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Debtors Section */}
            {topDebtors.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 p-6 border-b border-slate-200">
                        <h3 className="text-xl font-bold text-slate-800">⚠️ Top 5 Deudores Críticos</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topDebtors.map((d, i) => (
                            <div key={i} className="border-2 border-slate-100 p-5 rounded-xl hover:shadow-md transition-shadow bg-white">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">#{i + 1}</span>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${d.risk_score > 0.7 ? 'bg-red-50 text-red-800 border-red-200' :
                                        d.risk_score > 0.3 ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 'bg-green-50 text-green-800 border-green-200'
                                        }`}>
                                        Riesgo: {d.risk_score ? (d.risk_score * 100).toFixed(0) + '%' : 'N/A'}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg text-slate-800 truncate mb-1">{d.name}</h4>
                                <p className="text-2xl font-extrabold text-red-600 mb-4">${d.debt.toLocaleString()}</p>
                                <button
                                    onClick={async () => {
                                        try {
                                            await axios.post(`http://localhost:8000/predictions/analyze/${d.id}`, {}, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            })
                                            alert('Análisis actualizado')
                                            window.location.reload()
                                        } catch (e) {
                                            alert('Error al analizar')
                                        }
                                    }}
                                    className="w-full bg-white border-2 border-purple-100 text-purple-600 font-bold text-sm py-3 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all"
                                >
                                    Re-Analizar Riesgo
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
