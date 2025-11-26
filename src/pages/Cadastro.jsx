import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Wave from '../components/Wave'
import { supabase } from '../lib/supabase'

export default function Cadastro(){
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blueTop/80 via-blue-50/60 to-white overflow-hidden text-gray-900">
      <div className="absolute top-10 -left-6 w-32 h-32 rounded-full bg-blueTop/30 blur-3xl pointer-events-none" />
      <div className="absolute top-36 right-4 w-40 h-40 rounded-full bg-white/40 blur-3xl pointer-events-none" />
      <Wave className="absolute inset-x-0 bottom-0 w-full h-60 md:h-72 lg:h-80 pointer-events-none select-none" />

      <div className="relative z-10 max-w-xl mx-auto px-6 pt-10">
        <button
          aria-label="voltar"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm text-gray-600 shadow border border-white/60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          voltar
        </button>
      </div>

      <main className="relative z-10 flex justify-center px-4 pb-24">
        <section className="w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-[30px] shadow-2xl ring-1 ring-white/60 px-8 py-10 mt-6 space-y-5">
          <div className="flex flex-col items-center gap-4">
            <img src="/assets/SescSenac.png" alt="Sesc Senac" className="h-16 object-contain" />
            <span className="px-6 py-1 rounded-full bg-blueTop text-white text-xs font-semibold tracking-[0.3em] uppercase border border-white/40 shadow shadow-blueTop/30">Cadastro</span>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Nome completo</span>
              <input
                type="text"
                placeholder="digite seu nome"
                value={nome}
                onChange={(e)=>setNome(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border border-gray-200 px-4 text-base shadow-inner shadow-gray-200 focus:outline-none focus:ring-2 focus:ring-blueTop"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Email</span>
              <input
                type="email"
                placeholder="digite seu email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border border-gray-200 px-4 text-base shadow-inner shadow-gray-200 focus:outline-none focus:ring-2 focus:ring-blueTop"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Senha</span>
              <input
                type="password"
                placeholder="crie uma senha"
                value={senha}
                onChange={(e)=>setSenha(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border border-gray-200 px-4 text-base shadow-inner shadow-gray-200 focus:outline-none focus:ring-2 focus:ring-blueTop"
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Confirmar senha</span>
              <input
                type="password"
                placeholder="repita a senha"
                value={confirmar}
                onChange={(e)=>setConfirmar(e.target.value)}
                className="mt-1 w-full h-12 rounded-2xl border border-gray-200 px-4 text-base shadow-inner shadow-gray-200 focus:outline-none focus:ring-2 focus:ring-blueTop"
              />
            </label>
            {erro && <div className="text-center text-red-600 text-sm">{erro}</div>}
            <button
              disabled={loading}
              onClick={async()=>{
                try{
                  setErro('')
                  if(!email || !senha || !nome) throw new Error('Preencha nome, email e senha')
                  if(senha !== confirmar) throw new Error('As senhas não conferem')
                  setLoading(true)
                  const { data, error } = await supabase.auth.signUp({
                    email,
                    password: senha,
                    options: { data: { nome } }
                  })
                  if(error) throw error
                  const userId = data?.user?.id
                  const userEmail = data?.user?.email || email
                  if(userId){
                    await supabase.from('perfil').upsert(
                      { id_user: userId, nome, email: userEmail },
                      { onConflict: 'id_user' }
                    )
                  }
                  navigate('/options')
                }catch(e){ setErro(e.message || 'Falha ao cadastrar') }
                finally{ setLoading(false) }
              }}
              className="w-full h-12 rounded-2xl bg-accent text-black font-semibold tracking-wide border border-amber-700/40 shadow hover:brightness-95 disabled:opacity-60"
            >
              {loading ? 'Cadastrando...' : 'CADASTRAR'}
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
