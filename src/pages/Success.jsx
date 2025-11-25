import React from 'react'
import { useNavigate } from 'react-router-dom'
import Wave from '../components/Wave'

export default function Success(){
  const navigate = useNavigate()
  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <Wave className="absolute inset-x-0 bottom-0 w-full h-56 md:h-72 lg:h-80 pointer-events-none select-none" />

      {/* Logo no topo direito */}
      <div className="absolute right-4 top-4 bg-white rounded-md px-3 py-1 shadow border">
        <img src="/assets/Senac.png" alt="Logo" className="h-8" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-10 pb-28">
        {/* Título + check */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className="text-xl md:text-2xl font-semibold underline">COMPRA FEITA</h1>
          <span className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </span>
        </div>

        {/* Mensagens */}
        <div className="space-y-6">
          <div className="rounded-xl border shadow p-4 text-center text-gray-800 bg-white">compra realizada com sucesso</div>
          <div className="rounded-xl border shadow p-4 text-center text-gray-800 bg-white">aguarde o seu pedido</div>
        </div>

        {/* Botão Voltar */}
        <div className="mt-8 flex justify-center">
          <button onClick={()=>navigate('/options')} className="w-64 h-12 rounded-md bg-accent text-black font-semibold border border-amber-700/40 shadow">
            VOLTAR
          </button>
        </div>
      </div>
    </div>
  )
}

