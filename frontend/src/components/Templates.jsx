import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Templates() {
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await axios.get('http://localhost:8000/emails/template', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setSubject(res.data.subject)
                setBody(res.data.body)
            } catch (err) {
                console.error(err)
            }
        }
        fetchTemplate()
    }, [])

    const handleSave = async (e) => {
        e.preventDefault()
        try {
            await axios.post('http://localhost:8000/emails/template', {
                subject,
                body
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Plantilla guardada')
        } catch (err) {
            alert('Error al guardar')
        }
    }

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Configuración de Correos</h2>
            <div className="bg-white p-6 rounded shadow max-w-2xl">
                <h3 className="text-xl font-bold mb-4">Plantilla de Recordatorio</h3>
                <p className="mb-4 text-sm text-gray-600">
                    Variables disponibles: {'{cliente}'}, {'{monto}'}, {'{cantidad_facturas}'}
                </p>
                <form onSubmit={handleSave}>
                    <div className="mb-4">
                        <label className="block mb-2 font-bold">Asunto</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-bold">Cuerpo del Mensaje</label>
                        <textarea
                            className="w-full border p-2 rounded h-48"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        />
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Guardar Cambios
                    </button>
                </form>
            </div>
        </div>
    )
}
