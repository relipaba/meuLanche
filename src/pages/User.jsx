import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Wave from '../components/Wave'
import { supabase } from '../lib/supabase'

const profileFields = ['nome','idade','cep','cidade','estado','rua','bairro','complemento','sexo','telefone','foto']
const placeholderDefaults = {
  nome: 'nome',
  idade: 'idade',
  cep: 'cep',
  cidade: 'cidade',
  estado: 'estado',
  rua: 'rua',
  bairro: 'bairro',
  complemento: 'complemento',
  sexo: 'sexo',
  telefone: 'telefone',
  foto: '',
  email: 'email',
}
const metadataAliases = {
  nome: ['full_name', 'display_name'],
  idade: ['age'],
  cep: ['zip', 'postal_code'],
  cidade: ['city'],
  estado: ['state', 'uf'],
  rua: ['street', 'address', 'logradouro'],
  bairro: ['district', 'neighborhood'],
  complemento: ['complement', 'address_complement'],
  sexo: ['gender'],
  telefone: ['phone', 'celular'],
  foto: ['foto', 'avatar'],
}

function metadataValue(meta, field){
  const candidates = [field, ...(metadataAliases[field] || [])]
  for(const candidate of candidates){
    const direct = meta?.[candidate]
    if(isFilled(direct)) return formatValue(direct)
    if(typeof candidate === 'string'){
      const lower = meta?.[candidate.toLowerCase()]
      if(isFilled(lower)) return formatValue(lower)
    }
  }
  return ''
}
function isFilled(value){
  if(typeof value === 'number') return true
  if(typeof value === 'string') return value.trim().length > 0
  return false
}
function formatValue(value){ return typeof value === 'number' ? String(value) : value }

export default function User(){
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '', idade: '', cep: '', cidade: '', estado: '', rua: '', bairro: '', complemento: '', sexo: '', telefone: '', email: '', senha: '', confirmar: '', foto: ''
  })
  const [placeholders, setPlaceholders] = useState(placeholderDefaults)
  const [loggingOut, setLoggingOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [hasProfile, setHasProfile] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [activeUserId, setActiveUserId] = useState(null)
  const update = (k) => (e) => setForm(v => ({ ...v, [k]: e.target.value }))
  const displayName = form.nome || placeholders.nome || 'nome'

  useEffect(() => {
    let active = true
    async function loadActiveUser(){
      try{
        const { data, error } = await supabase.auth.getUser()
        if(error) throw error
        const user = data?.user
        if(!user || !active) return
        setActiveUserId(user.id)
        const meta = user.user_metadata || {}
        const basePlaceholders = { ...placeholderDefaults }
        profileFields.forEach(field => {
          const value = metadataValue(meta, field)
          if(value) basePlaceholders[field] = value
        })
        if(user.email){
          basePlaceholders.email = user.email
          if((!basePlaceholders.nome || basePlaceholders.nome === placeholderDefaults.nome)) basePlaceholders.nome = user.email
        }

        let mergedPlaceholders = basePlaceholders
        try{
          const { data: profile, error: profileError } = await supabase
            .from('perfil')
            .select('*')
            .eq('id_user', user.id)
            .maybeSingle()
          if(profileError) throw profileError
          if(profile){
            setHasProfile(true)
            mergedPlaceholders = { ...basePlaceholders }
            profileFields.forEach(field => {
              const value = profile[field]
              if(isFilled(value)) mergedPlaceholders[field] = formatValue(value)
            })
            if(isFilled(profile.email)) mergedPlaceholders.email = formatValue(profile.email)
          }
        }catch(profileErr){
          console.warn('Falha ao buscar perfil detalhado, usando apenas dados básicos', profileErr)
        }
        if(active){
          setPlaceholders(mergedPlaceholders)
          setPhotoPreview(mergedPlaceholders.foto || null)
        }
      }catch(err){
        console.error('Falha ao carregar usuário ativo', err)
      }
    }
    loadActiveUser()
    return () => { active = false }
  }, [])

  const handleSave = async () => {
    if(saving) return
    try{
      setSaveError('')
      setSaving(true)
      const { data, error } = await supabase.auth.getUser()
      if(error) throw error
      const userId = data?.user?.id
      if(!userId) throw new Error('Faça login para atualizar o perfil.')
      const payload = {}
      profileFields.forEach(field => {
        if(field === 'email') return
        const value = form[field]
        if(isFilled(value)) payload[field] = value
      })
      if(!Object.keys(payload).length){
        setSaveError('Preencha algum campo para atualizar.')
        return
      }
      if(hasProfile){
        const { error: updateErr } = await supabase.from('perfil').update(payload).eq('id_user', userId)
        if(updateErr) throw updateErr
      }else{
        const { error: insertErr } = await supabase.from('perfil').insert({ id_user: userId, ...payload })
        if(insertErr) throw insertErr
        setHasProfile(true)
      }
      setPlaceholders(prev => {
        const next = { ...prev }
        Object.keys(payload).forEach(field => { next[field] = payload[field] })
        return next
      })
      if(payload.foto){
        setPhotoPreview(payload.foto)
      }
      setForm(prev => ({ ...prev, ...profileFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {}) }))
    }catch(err){
      console.error('Falha ao salvar perfil', err)
      setSaveError(err.message || 'Erro ao salvar perfil.')
    }finally{
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if(loggingOut) return
    try{
      setLoggingOut(true)
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    }catch(err){
      console.error('Falha ao sair', err)
      alert(err.message || 'Não foi possível sair. Tente novamente.')
    }finally{
      setLoggingOut(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blueTop/80 via-blue-50/60 to-white overflow-hidden">
      <Wave className="absolute inset-x-0 bottom-0 w-full h-56 md:h-72 lg:h-80 pointer-events-none select-none" />

      <div className="relative z-10 max-w-4xl mx-auto pt-6 px-4">
        <button aria-label="voltar" onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 shadow border text-sm text-gray-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          voltar
        </button>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 mt-4 pb-28 space-y-6">
        <section className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl ring-1 ring-black/5 p-6 flex flex-col items-center gap-4">
          <label htmlFor="foto-input" className="relative w-36 h-36 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center cursor-pointer overflow-hidden">
            {photoPreview || placeholders.foto ? (
              <img src={photoPreview || placeholders.foto} alt="foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0 1 12 0"/></svg>
            )}
            <input id="foto-input" type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if(file){
                const reader = new FileReader()
                reader.onload = () => {
                  const base64 = reader.result
                  setPhotoPreview(base64)
                  setForm(v => ({ ...v, foto: base64 }))
                }
                reader.readAsDataURL(file)
              }
            }} />
          </label>
          <div className="text-lg font-semibold text-gray-900">{displayName}</div>
        </section>

        <section className="bg-white/90 backdrop-blur rounded-3xl shadow-2xl ring-1 ring-black/5 p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <input placeholder={placeholders.email} value={form.email} onChange={update('email')} className="input md:col-span-2" />
            <input placeholder={placeholders.nome} value={form.nome} onChange={update('nome')} className="input" />
            <input placeholder={placeholders.idade} value={form.idade} onChange={update('idade')} className="input" />
            <input placeholder={placeholders.cep} value={form.cep} onChange={update('cep')} className="input" />
            <input placeholder={placeholders.cidade} value={form.cidade} onChange={update('cidade')} className="input" />
            <input placeholder={placeholders.estado} value={form.estado} onChange={update('estado')} className="input" />
            <input placeholder={placeholders.rua} value={form.rua} onChange={update('rua')} className="input" />
            <input placeholder={placeholders.bairro} value={form.bairro} onChange={update('bairro')} className="input" />
            <input placeholder={placeholders.complemento} value={form.complemento} onChange={update('complemento')} className="input" />
            <input placeholder={placeholders.sexo} value={form.sexo} onChange={update('sexo')} className="input" />
            <input placeholder={placeholders.telefone} value={form.telefone} onChange={update('telefone')} className="input" />
            <input type="password" placeholder="senha" value={form.senha} onChange={update('senha')} className="input md:col-span-2" />
            <input type="password" placeholder="confirmar senha" value={form.confirmar} onChange={update('confirmar')} className="input md:col-span-2" />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link to="/historico" className="text-accent underline">Ver historico de compras</Link>
            <button
              disabled={saving}
              onClick={handleSave}
              className="px-5 py-3 rounded-2xl bg-accent text-black font-semibold border border-amber-700/40 shadow hover:brightness-95 disabled:opacity-60">
              {saving ? 'SALVANDO...' : 'CONFIRMAR'}
            </button>
          </div>
          {saveError && <div className="mt-2 text-sm text-red-600">{saveError}</div>}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full mt-4 h-11 rounded-2xl bg-gray-800 text-white text-sm tracking-wide border border-gray-900/50 shadow hover:brightness-110 disabled:opacity-60">
            {loggingOut ? 'Saindo...' : 'SAIR DA CONTA'}
          </button>
        </section>
      </div>

      <style>{`.input{height:3rem;padding:0 1rem;border:1px solid #d1d5db;border-radius:.5rem;box-shadow:0 1px 3px rgba(0,0,0,.1);}`}</style>
    </div>
  )
}
