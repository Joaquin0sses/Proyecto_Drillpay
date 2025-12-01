import { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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

    const token = localStorage.getItem('token')
    const COLORS = ['#0088FE', '#FF8042']

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
                } else {
                    setCharts(null)
                    setTopDebtors([])
                }
            } catch (err) {
                console.error(err)
            }
        }
        fetchData()
    }, [filters])

    if (!stats) return <div>Cargando...</div>

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-bold">Panel Principal</h2>
                <div className="flex flex-wrap gap-2">
                    <select
                        className="border p-2 rounded"
                        value={filters.client_id}
                        onChange={e => setFilters({ ...filters, client_id: e.target.value })}
                    >
                        <option value="">Todos los Clientes</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select
                        className="border p-2 rounded"
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
                        className="border p-2 rounded"
                        value={filters.start_date}
                        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                    />
                    <input
                        type="date"
                        className="border p-2 rounded"
                        value={filters.end_date}
                        onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500">Total Facturas</h3>
                    <p className="text-3xl font-bold">{stats.total_invoices}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500">Total Clientes</h3>
                    <p className="text-3xl font-bold">{stats.total_clients}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500">Monto Pendiente</h3>
                    <p className="text-3xl font-bold text-green-600">${stats.pending_amount?.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500">Facturas Vencidas</h3>
                    <p className="text-3xl font-bold text-red-600">{stats.overdue_count}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Charts Section */}
                {charts && (
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-bold mb-4">Estado de Pagos</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.pie_chart}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {charts.pie_chart.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Top Debtors Section */}
                {topDebtors.length > 0 && (
                    <div className="bg-white p-6 rounded shadow">
                        <h3 className="text-xl font-bold mb-4">Top 5 Deudores (Vencido)</h3>
                        <ul className="space-y-4">
                            {topDebtors.map((d, i) => (
                                <li key={i} className="flex justify-between items-center border-b pb-2">
                                    <span className="font-medium">{i + 1}. {d.name}</span>
                                    <span className="text-red-600 font-bold">${d.debt.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
