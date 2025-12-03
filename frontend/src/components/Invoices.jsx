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
        status: 'PENDING',
        document_number: '',
        type: 'Factura'
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
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Facturas</h2>
                    <p className="text-slate-500">Gestión de documentos y cobros</p>
                </div>
                <button
                    onClick={() => setShowManual(!showManual)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 font-medium"
                                        )}
            </td>
        </tr>
    ))
}
                        </tbody >
                    </table >
                </div >
            </div >
        </div >
    )
}
