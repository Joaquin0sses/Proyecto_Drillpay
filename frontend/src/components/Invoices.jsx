import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Invoices() {
    const [invoices, setInvoices] = useState([])
    const [file, setFile] = useState(null)
    const [clients, setClients] = useState([])

    // Manual Entry State
    const [showManual, setShowManual] = useState(false)
    const [newInvoice, setNewInvoice] = useState({
        client_id: '',
        amount: '',
        issue_date: '',
        due_date: '',
        status: 'PENDING'
    })

    const token = localStorage.getItem('token')

    const fetchInvoices = async () => {
        try {
            const res = await axios.get('http://localhost:8000/invoices/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setInvoices(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchClients = async () => {
        try {
            const res = await axios.get('http://localhost:8000/clients/', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setClients(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        fetchInvoices()
        fetchClients()
    }, [])

    const handleUpload = async (e) => {
        e.preventDefault()
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            await axios.post('http://localhost:8000/invoices/upload', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            alert('Carga exitosa')
            fetchInvoices()
        } catch (err) {
            alert('Error en la carga')
        }
    }

    const handleManualSubmit = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:8000/invoices/create', newInvoice, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Factura creada')
            setShowManual(false)
            fetchInvoices()
        } catch (err) {
            alert('Error al crear factura')
        }
    }

    const sendReminder = async (clientId) => {
        if (!confirm('¿Enviar recordatorio a este cliente?')) return
        try {
            await axios.post(`http://localhost:8000/emails/send/${clientId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Correo enviado')
        } catch (err) {
            alert('Error al enviar correo')
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Facturas</h2>
                <button
                    onClick={() => setShowManual(!showManual)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {showManual ? 'Cerrar Formulario' : 'Nueva Factura Manual'}
                </button>
            </div>

            {showManual && (
                <div className="bg-white p-6 rounded shadow mb-8 border-l-4 border-green-500">
                    <h3 className="text-xl font-bold mb-4">Ingreso Manual</h3>
                    <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1">Cliente</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={newInvoice.client_id}
                                onChange={e => setNewInvoice({ ...newInvoice, client_id: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar Cliente</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">Monto</label>
                            <input
                                type="number" step="0.01"
                                className="w-full border p-2 rounded"
                                value={newInvoice.amount}
                                onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Fecha Emisión</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded"
                                value={newInvoice.issue_date}
                                onChange={e => setNewInvoice({ ...newInvoice, issue_date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1">Fecha Vencimiento</label>
                            <input
                                type="date"
                                className="w-full border p-2 rounded"
                                value={newInvoice.due_date}
                                onChange={e => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Guardar Factura</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-6 rounded shadow mb-8">
                <h3 className="text-xl font-bold mb-4">Cargar Facturas (CSV/Excel)</h3>
                <form onSubmit={handleUpload} className="flex gap-4">
                    <input
                        type="file"
                        accept=".csv, .xlsx"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="border p-2 rounded"
                    />
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Subir Archivo
                    </button>
                </form>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4">N° Doc</th>
                            <th className="p-4">RUT Cliente</th>
                            <th className="p-4">Monto</th>
                            <th className="p-4">Vencimiento</th>
                            <th className="p-4">Estado</th>
                            <th className="p-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id} className="border-b hover:bg-slate-50">
                                <td className="p-4">{inv.document_number}</td>
                                <td className="p-4">{inv.client?.rut || 'N/A'}</td>
                                <td className="p-4">${inv.amount?.toLocaleString()}</td>
                                <td className="p-4">{inv.due_date}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-sm ${inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                                            inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    {inv.status === 'OVERDUE' && (
                                        <button
                                            onClick={() => sendReminder(inv.client_id)}
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            Enviar Recordatorio
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
