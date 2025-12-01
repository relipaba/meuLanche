import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Wave from '../components/Wave'
import { supabase } from '../lib/supabase'

function InfoModal({ user, onClose, onDelete, deleting }){
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
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="h-11 rounded-2xl bg-blueTop text-white font-semibold shadow"
          >
            Fechar
          </button>
          <button
            disabled={deleting}
            onClick={() => onDelete?.(user)}
            className="h-11 rounded-2xl bg-black text-white font-semibold shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? 'Excluindo...' : 'Deletar usuário'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignModal({ user, escolas, loading, onClose, onSelect, assigningId }){
  if(!user) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Aluno</p>
            <p className="font-semibold text-gray-800">{user.email}</p>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-full border text-sm text-gray-600 bg-gray-50">Fechar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-blue-50 text-gray-800 text-xs uppercase tracking-wide">
                <th className="px-3 py-3 text-left">Escola</th>
                <th className="px-3 py-3 text-left">Lanchonetes</th>
                <th className="px-3 py-3 text-left">Confirmar</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-500">Carregando escolas...</td>
                </tr>
              )}
              {!loading && !escolas.length && (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-500">Nenhuma escola cadastrada.</td>
                </tr>
              )}
              {escolas.map((esc) => (
                <tr key={esc.id_escola} className="border-t border-gray-200">
                  <td className="px-3 py-3 font-semibold text-gray-800">{esc.nome_escola || '—'}</td>
                  <td className="px-3 py-3">
                    {esc.lanchonete && esc.lanchonete.length ? (
                      <div className="flex flex-wrap gap-2">
                        {esc.lanchonete.map((lan) => (
                          <span key={lan.id_lanchonete} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                            {lan.nome_lanchonete}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Sem lanchonetes</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      disabled={assigningId === esc.id_escola}
                      onClick={() => onSelect?.(user, esc)}
                      className="px-4 py-2 rounded-full bg-black text-white text-xs font-semibold shadow hover:brightness-110 disabled:opacity-60"
                    >
                      {assigningId === esc.id_escola ? 'Confirmando...' : 'Confirmar escola'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
  const [deletingId, setDeletingId] = useState(null)
  const [assignUser, setAssignUser] = useState(null)
  const [escolas, setEscolas] = useState([])
  const [loadingEscolas, setLoadingEscolas] = useState(false)
  const [assigningSchool, setAssigningSchool] = useState(null)

  useEffect(() => {
    let active = true
    async function loadUsers(){
      try{
        setLoading(true); setError('')
        const { data, error } = await supabase
          .from('perfil')
          .select('id_user,email,nome,foto,id_escola,cidade,estado,telefone,adm,escola:escola(nome_escola)')
          .order('email', { ascending: true })
        if(error) throw error
        if(active){
          const list = (data || []).filter(user => user?.adm !== true)
          setUsers(list)
        }
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

  const handleDeleteUser = async (user) => {
    if(!user?.id_user) return
    const confirmDelete = window.confirm(`Deseja excluir o usuário ${user.email || ''}?`)
    if(!confirmDelete) return
    try{
      setDeletingId(user.id_user)
      const { error } = await supabase.from('perfil').delete().eq('id_user', user.id_user)
      if(error) throw error
      setUsers(list => list.filter(item => item.id_user !== user.id_user))
      setSelectedUser(null)
    }catch(err){
      console.error('Falha ao deletar usuário', err)
      alert(err.message || 'Não foi possível deletar o usuário.')
    }finally{
      setDeletingId(null)
    }
  }

  const openAssign = async (user) => {
    setAssignUser(user)
    try{
      setLoadingEscolas(true)
      const { data: escolasData, error: escolasErr } = await supabase
        .from('escola')
        .select('id_escola,nome_escola')
        .order('nome_escola', { ascending: true })
      if(escolasErr) throw escolasErr

      const { data: lanchonetesData, error: lanchErr } = await supabase
        .from('lanchonete')
        .select('id_lanchonete,nome_lanchonete,id_escola')
      if(lanchErr) throw lanchErr

      const grouped = (escolasData || []).map(esc => ({
        ...esc,
        lanchonete: (lanchonetesData || []).filter(l => l.id_escola === esc.id_escola)
      }))

      setEscolas(grouped)
    }catch(err){
      console.error('Falha ao carregar escolas', err)
      alert(err.message || 'Não foi possível carregar escolas.')
    }finally{
      setLoadingEscolas(false)
    }
  }

  const handleAssignSchool = async (user, escola) => {
    if(!user?.id_user || !escola?.id_escola) return
    try{
      setAssigningSchool(escola.id_escola)
      const { error } = await supabase
        .from('perfil')
        .update({ id_escola: escola.id_escola })
        .eq('id_user', user.id_user)
      if(error) throw error
          setUsers(list => list.map(u => u.id_user === user.id_user ? { ...u, id_escola: escola.id_escola, escola: { nome_escola: escola.nome_escola } } : u))
        setAssignUser(null)
    }catch(err){
      console.error('Falha ao atribuir escola', err)
      alert(err.message || 'Não foi possível atribuir a escola.')
    }finally{
      setAssigningSchool(null)
    }
  }

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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800">{user.escola.nome_escola}</span>
                          <button className="text-blue-600 underline text-xs" onClick={()=>openAssign(user)}>Alterar</button>
                        </div>
                      ) : (
                        <button className="text-red-600 underline text-sm" onClick={()=>openAssign(user)}>Atribuir escola</button>
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

      <InfoModal
        user={selectedUser}
        onClose={()=>setSelectedUser(null)}
        onDelete={handleDeleteUser}
        deleting={Boolean(deletingId)}
      />
      <AssignModal
        user={assignUser}
        escolas={escolas}
        loading={loadingEscolas}
        onClose={()=>setAssignUser(null)}
        onSelect={handleAssignSchool}
        assigningId={assigningSchool}
      />
    </div>
  )
}
