import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Cart from './pages/Cart';

export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />}/>
    </Routes>
  )
}