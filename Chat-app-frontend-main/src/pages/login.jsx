import React from "react";
import api from "../api.js";
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react";
import logo from "../assets/logo 1.png"
import { useTranslation } from "react-i18next";

export default function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            await api.post('/api/auth/login', { phone, password });
            navigate('/dashboard');
        } catch(err) {
            setError(err.response?.data?.message || 'Login Failed');
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex justify-center mb-6">
                              <img src={logo} alt="SchoolChat logo" className="h-32 w-auto"/>
                    </div>
                   <h2 className="text-2xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-tr from-blue-500 to-blue-300 via-purple-500">
                         {t('Login')}
                  </h2>
                  {error &&
                   <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
                      {error}
                   </div>
                }
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                   <input
                      type="text" 
                      name="phone"
                      placeholder={`${t('Phone')}`} 
                      value={phone} 
                      required
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    /> <br />
                </div>

                <div>
                   <input 
                      type="password" 
                      name="password" 
                    placeholder={`${t('password')}`} 
                      value={password} required
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
               /> <br />
                </div>

                <button type="submit"
                   className="bg-gradient-to-l from-blue-500 to-blue-300 via-purple-500 hover:scale-105  text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                         {t('Login')}
              </button> 

              <div>
                <Link to={"#"} className="font-normal text-blue-500 hover:underline">{t('ForgotPassword')}</Link>
                <hr className="border-gray-600"/>

                 <p className="font-semibold text-gray-800 mt-2">{t('DontYouHaveAccount')} ?</p>
                
                 <button onClick={() => navigate('/register')}
                   className="bg-gradient-to-l from-blue-500 to-blue-300 via-purple-500 hover:scale-105  text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                         {t('CreateAccount')}
              </button> 
              </div>
            </form>
        </div>
     </div>
    )
}
