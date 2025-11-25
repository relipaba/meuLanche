import React from 'react'
import Wave from '../components/Wave'

export default function Initial(){
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-blueTop/80 via-blue-50/70 to-white overflow-hidden text-gray-900">
      <div className="absolute top-10 -left-8 w-32 h-32 rounded-full bg-blueTop/30 blur-3xl pointer-events-none" />
      <div className="absolute top-32 right-2 w-48 h-48 rounded-full bg-white/40 blur-3xl pointer-events-none" />
      <Wave className="absolute inset-x-0 bottom-0 w-full h-60 md:h-72 lg:h-80 pointer-events-none select-none" loading="lazy"/>

      <header className="relative z-10 flex flex-col items-center pt-12 pb-8">
        <div className="bg-gradient-to-r from-blueTop to-[#5d84d2] w-full max-w-xl rounded-[30px] shadow-xl shadow-blueTop/30 border border-white/30 flex flex-col items-center gap-4 py-6 px-4">
          <img src="/assets/SescSenac.png" alt="Sesc Senac" className="h-16 object-contain" loading="lazy" />
          <div className="-mb-8">
            <span className="px-10 py-1 rounded-full bg-white/20 text-white text-xs font-semibold tracking-[0.3em] uppercase shadow-lg shadow-blueTop/30 border border-white/40">Lanchonete</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-20 gap-6">
        <a href="#/login" className="w-72 h-12 rounded-lg bg-accent text-black font-semibold tracking-wide border border-amber-700/40 shadow-lg shadow-amber-900/25 hover:translate-y-0.5 transition-transform flex items-center justify-center">
          LOGIN
        </a>
        <a href="#/cadastro" className="w-72 h-12 rounded-lg bg-accent text-black font-semibold tracking-wide border border-amber-700/40 shadow-lg shadow-amber-900/25 hover:translate-y-0.5 transition-transform flex items-center justify-center">
          CADASTRAR
        </a>
      </main>
    </div>
  )
}



