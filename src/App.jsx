import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Initial from './pages/Initial'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Options from './pages/Options'
import HomeSesc from './pages/HomeSesc'
import HomeSenac from './pages/HomeSenac'
import User from './pages/User'
import Historico from './pages/Historico'
import Cart from './pages/Cart'
import Success from './pages/Success'
import Admin from './pages/Admin'

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Initial />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/options" element={<Options />} />
      <Route path="/sesc" element={<HomeSesc />} />
      <Route path="/senac" element={<HomeSenac />} />
      <Route path="/perfil" element={<User />} />
      <Route path="/historico" element={<Historico />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/success" element={<Success />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Initial />} />
    </Routes>
  )
}
