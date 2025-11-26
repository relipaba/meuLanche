import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Wave from '../components/Wave'
import { supabase } from '../lib/supabase'

function InfoModal({ user, onClose }){
  if(!user) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Informações do usuário</h2>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden">
            {user.foto ? <img src={user.foto} alt={user.email} className="w-full h-full object-cover" /> : null}
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-semibold text-gray-800">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">Nome</p>
            <p className="font-semibold text-gray-800">{user.nome || '—'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Cidade</p>
            <p className="font-semibold text-gray-800">{user.cidade || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Estado</p>
            <p className="font-semibold text-gray-800">{user.estado || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Telefone</p>
            <p className="font-semibold text-gray-800">{user.telefone || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Escola</p>
            <p className="font-semibold text-gray-800">{user.escola?.nome_escola || 'Não definida'}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full h-11 rounded-2xl bg-blueTop text-white font-semibold shadow">
          Fechar
        </button>
      </div>
    </div>
  )
}

export default function Admin(){
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    let active = true
    async function loadUsers(){
      try{
        setLoading(true); setError('')
        const { data, error } = await supabase
          .from('perfil')
          .select('id_user,email,nome,foto,id_escola,cidade,estado,telefone,adm,escola:escola(nome_escola)')
          .not('adm', 'is', true)
          .order('email', { ascending: true })
        if(error) throw error
        if(active) setUsers(data || [])
      }catch(err){
        console.error('Falha ao carregar usuários', err)
        if(active) setError(err.message || 'Não foi possível carregar usuários.')
      }finally{
        if(active) setLoading(false)
      }
    }
    loadUsers()
    return () => { active = false }
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blueTop/80 via-blue-50/60 to-white overflow-hidden">
      <Wave className="absolute inset-x-0 bottom-0 w-full h-56 md:h-72 lg:h-80 pointer-events-none select-none" />

      <div className="relative z-10 max-w-6xl mx-auto pt-6 px-4">
        <div className="flex items-center justify-between">
          <button onClick={()=>navigate(-1)} className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border text-sm text-gray-600">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            voltar
          </button>
          <h1 className="text-lg font-semibold text-gray-800">Painel Administrativo</h1>
        </div>

        <div className="mt-10 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow border">ALUNOS</span>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-white shadow text-sm text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm3 7h12v2H6v-2zm3 7h6v2H9v-2z"/></svg>
            Filtrar
          </button>
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 mt-6 pb-28">
        <section className="bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-blue-50 text-gray-800 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Usuário</th>
                  <th className="px-4 py-3 text-left">Escola</th>
                  <th className="px-4 py-3 text-left">Informações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Carregando...</td>
                  </tr>
                )}
                {error && !loading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-red-600">{error}</td>
                  </tr>
                )}
                {!loading && !users.length && !error && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500">Nenhum usuário encontrado.</td>
                  </tr>
                )}
                {users.map(user => (
                  <tr key={user.id_user} className="border-t border-gray-200">
                    <td className="px-4 py-4">{user.email}</td>
                    <td className="px-4 py-4">
                      {user.escola?.nome_escola ? (
                        <span className="font-semibold text-gray-800">{user.escola.nome_escola}</span>
                      ) : (
                        <button className="text-red-600 underline text-sm">Atribuir escola</button>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={()=>setSelectedUser(user)} className="px-4 py-2 rounded-full bg-white border shadow text-xs font-semibold">
                        Ver informações
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <InfoModal user={selectedUser} onClose={()=>setSelectedUser(null)} />
    </div>
  )
}
