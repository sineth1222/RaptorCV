import { Lock, Mail, User2Icon } from 'lucide-react'
import React from 'react'
import api from '../configs/api'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

const Login = () => {

    const dispatch = useDispatch()

  const query = new URLSearchParams(window.location.search)
  const urlState = query.get('state')

  const [state, setState] = React.useState(urlState || "login")

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data } = await api.post(`/api/users/${state}`, formData)
            dispatch(login(data))
            localStorage.setItem('token', data.token)
            return data
            //toast.success(data.message)
        } catch (error) {
            //toast(error?.response?.data?.message || error.message)
            throw error
        }

    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const primaryColor = 'text-emerald-600';
    const primaryBg = 'bg-emerald-600';
    const primaryBgHover = 'hover:bg-emerald-700';

    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
            <form onSubmit={handleSubmit} className="w-full ml-4 mr-4 sm:w-[350px] text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
                <Link to='/' className="flex items-center justify-center gap-1 mt-10">
                    <div className="size-8 rounded-md flex items-center justify-center font-bold text-white bg-emerald-600 text-xl">R</div>
                    <span className={`text-2xl font-bold ${primaryColor}`}>aptor<span className='text-slate-700'>CV</span>.</span>
                </Link>
                <h1 className="text-gray-900 text-3xl mt-4 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
                <p className="text-gray-500 text-sm mt-2">Please {state} to continue</p>
                {state !== "login" && (
                    <div className="flex items-center mt-6 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <User2Icon size={16} color='#6B7280'/>
                        <input type="text" name="name" placeholder="Name" className="border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
                    </div>
                )}
                <div className="flex items-center w-full mt-4 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Mail size={13} color='#6B7280' />
                    <input type="email" name="email" placeholder="Email id" className="border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="flex items-center mt-4 w-full bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
                    <Lock size={13} color='#6B7280' />
                    <input type="password" name="password" placeholder="Password" className="border-none outline-none ring-0" value={formData.password} onChange={handleChange} required />
                </div>
                <div className={`mt-4 text-left ${primaryColor}`}>
                    <button className="text-sm" type="reset">Forget password?</button>
                </div>
                <button onClick={(e) => {
                        e.preventDefault(); // submit button click එක handle කිරීමට
                        const loadingMessage = state === "login" ? "Authenticating..." : "Creating account...";
                        // handleSubmit එකේ e.preventDefault() ඇති නිසා මෙතනින් call කළ හැක
                        toast.promise(handleSubmit(e), { 
                            loading: loadingMessage,
                            success: (data) => data.message,
                            error: (error) => error?.response?.data?.message || error.message,
                        });
                    }} 
                    type="submit"   
                    className={`${primaryBg} mt-2 w-full h-11 rounded-full text-white ${primaryBgHover} transition-opacity`}>
                    {state === "login" ? "Login" : "Sign up"}
                </button>
                <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-emerald-500 hover:underline">click here</a></p>
            </form>
          </div>
    )
}

export default Login
