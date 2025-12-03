import { useEffect, useState } from 'react'
import axios from 'axios'

export default function RiskAnalysis() {
    const [debtors, setDebtors] = useState([])
    const [loading, setLoading] = useState(false)
    const token = localStorage.getItem('token')

    const runBatchAnalysis = async () => {
        setLoading(true)
        try {
            const res = await axios.post('http://localhost:8000/predictions/analyze-batch', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })
            setDebtors(res.data)
        } catch (err) {
            alert('Error al ejecutar análisis masivo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-md border border-slate-200">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Análisis de Riesgo</h2>
                    <p className="text-slate-500">Evaluación predictiva de cartera</p>
                </div>
                <button
                    onClick={runBatchAnalysis}
                    disabled={loading}
                    className={`px-6 py-2 rounded-xl text-white font-medium shadow-lg transition-all ${loading
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analizando...
                                    ))}
                        </tbody>
                            </table>
            </div>
        </div>
                </div >
            )
}
        </div >
    )
}
