import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import logo from "../assets/logo 1.png"
import { useTranslation } from "react-i18next";


export default function Register() {
    const [form, setForm] = useState({ name: '', phone: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { t } = useTranslation();

    // e means event like input field changes
    // name: means attribute of input field like, email, text
    //value: is value of input fieled and and make copy of that values by using spread opeator(...)
    const handleChange = (e) => {
      setForm({...form, [e.target.name]: e.target.value});
    }


const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // const Allowed = ['director', 'dos', 'patron', 'matron', 'dod'];
        // if (Allowed.includes(user.role)) {
            await api.post('/api/auth/register', form);
            alert('Registered Successfully');
            navigate('/');
        // } else {
        //     setError("You are not allowed to create Account. Ask school for more details");
        // }
    } catch(err) {
        setError(err.response?.data?.message || "Error during registration");
    }
};



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div>
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="SchoolChat logo" className="h-32 w-auto"/>
                </div>
               <h2 className="text-xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-blue-300 via-purple-500">{t('CreateFreeAccount')}</h2>
              {error && (
                  <div className="mb-4 bg-red-100 text-red-600 rounded-md text-sm">
                     {error}
                  </div>
             )}
             
            <form onSubmit={handleSubmit}  className="space-y-4">
               <input 
                type="text" 
                name="name" 
                placeholder={`${t('YourFullName')}`}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus::outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
                />  <br />

               <input 
                   type="phone" 
                   name="phone" 
                   placeholder={`${t('Phone')}`}
                   onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus::outline-none focus:ring-2 focus:ring-blue-500"
                
                /> <br />    

               <input 
                type="password" 
                name="password" 
                placeholder={`${t('password')}`}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus::outline-none focus:ring-2 focus:ring-blue-500"

                />    
                <button type="submit" className="bg-gradient-to-l from-blue-500 to-blue-300 via-purple-500 hover:scale-105  text-white font-semibold py-2 px-4 mb-5 rounded-lg transition duration-300">
                    {t('CreateAccount')}
                </button>  
            </form>
            <Link onClick={() => navigate(-1)} className="font-normal text-blue-500 hover:underline">{t('BackToMainLogin')}</Link>      
            </div>
            </div>
        </div>
    )
}