import { useEffect, useState } from 'react'
import axios from 'axios'

export default function Templates() {
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [includeTable, setIncludeTable] = useState(false)
    const token = localStorage.getItem('token')

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const res = await axios.get('http://localhost:8000/emails/template', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setSubject(res.data.subject || '')
                setBody(res.data.body || '')
                setIncludeTable(res.data.include_table === 1)
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
                subject: subject || 'Recordatorio de Pago',
                body: body || 'Estimado {cliente}, ...',
                include_table: includeTable
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })
            alert('Configuración guardada exitosamente')
        } catch (err) {
            alert('Error al guardar la configuración')
            console.error(err)
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
                <div className="bg-slate-50 -m-6 mb-6 p-6 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800">📧 Configuración de Correos</h2>
                    <p className="text-slate-500">Personaliza las plantillas de notificación</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <label className="block mb-2 font-bold text-slate-700">Asunto del Correo</label>
                                <input
                                    type="text"
                                    className="w-full border-2 border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Ej: Recordatorio de Pago Pendiente"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 font-bold text-slate-700">Cuerpo del Mensaje</label>
                                <div className="mb-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <span className="font-bold">Variables disponibles:</span> {'{cliente}'}, {'{monto}'}, {'{cantidad_facturas}'}
                                </div>
                                <textarea
                                    className="w-full border-2 border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all h-48"
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Escribe el contenido del correo aquí..."
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <input
                                    type="checkbox"
                                    id="includeTable"
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                    checked={includeTable}
                                    onChange={(e) => setIncludeTable(e.target.checked)}
                                />
                                <label htmlFor="includeTable" className="font-bold text-purple-900 cursor-pointer">
                                    Incluir Tabla Detallada de Facturas Vencidas
                                </label>
                            </div>

                            <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 font-bold text-lg">
                                Guardar Cambios
                            </button>
                        </form>
                    </div>

                    {/* Preview Section */}
                    <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-700 mb-4 uppercase tracking-wider">Vista Previa</h3>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
                            <div className="border-b pb-4 mb-4">
                                <p className="text-sm text-slate-500">Asunto:</p>
                                <p className="font-bold text-slate-800">{subject || '(Sin Asunto)'}</p>
                            </div>
                            <div className="prose prose-slate max-w-none">
                                <p className="whitespace-pre-wrap text-slate-700">
                                    {body.replace('{cliente}', 'Juan Pérez')
                                        .replace('{monto}', '$1,500,000')
                                        .replace('{cantidad_facturas}', '3') || '(Cuerpo del mensaje vacío)'}
                                </p>

                                {includeTable && (
                                    <div className="mt-6">
                                        <h4 className="font-bold text-slate-800 mb-2">Detalle de Facturas Vencidas</h4>
                                        <table className="w-full text-sm text-left border-collapse border border-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="border border-slate-200 p-2">N° Doc</th>
                                                    <th className="border border-slate-200 p-2">Vencimiento</th>
                                                    <th className="border border-slate-200 p-2 text-right">Monto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-slate-200 p-2">1001</td>
                                                    <td className="border border-slate-200 p-2">2023-10-01</td>
                                                    <td className="border border-slate-200 p-2 text-right">$500,000</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-slate-200 p-2">1002</td>
                                                    <td className="border border-slate-200 p-2">2023-11-01</td>
                                                    <td className="border border-slate-200 p-2 text-right">$1,000,000</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
