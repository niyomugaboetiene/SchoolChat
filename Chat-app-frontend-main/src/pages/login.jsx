
import React, { useState } from "react";
import api from "../api.js";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo 1.png";
import { useTranslation } from "react-i18next";
import {
    FiPhone,
    FiLock,
    FiEye,
    FiEyeOff,
    FiLogIn,
    FiUserPlus,
    FiLoader
} from "react-icons/fi";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { t } = useTranslation();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await api.post("/api/auth/login", { phone, password });
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Login Failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-md">

                <div className="mb-6 text-center">
                    <img
                        src={logo}
                        alt="SchoolChat logo"
                        className="mx-auto h-24 w-auto object-contain sm:h-28"
                    />

                    <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                        {t("Login")}
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Welcome back! Sign in to continue to SchoolChat.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <FiLogIn size={21} />
                        </div>

                        <div>
                            <h2 className="font-semibold text-slate-900">
                                {t("Login")}
                            </h2>
                            <p className="text-xs text-slate-500">
                                Enter your account details
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                            <span className="font-bold">!</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label
                                htmlFor="phone"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                {t("Phone")}
                            </label>

                            <div className="relative">
                                <FiPhone
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />

                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    placeholder={t("Phone")}
                                    value={phone}
                                    required
                                    autoComplete="tel"
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-semibold text-slate-700"
                                >
                                    {t("password")}
                                </label>
                            </div>

                            <div className="relative">
                                <FiLock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={18}
                                />

                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder={t("password")}
                                    value={password}
                                    required
                                    autoComplete="current-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-indigo-600"
                                >
                                    {showPassword ? (
                                        <FiEyeOff size={18} />
                                    ) : (
                                        <FiEye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Link
                                to="#"
                                className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline"
                            >
                                {t("ForgotPassword")}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin" size={18} />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <FiLogIn size={18} />
                                    {t("Login")}
                                </>
                            )}
                        </button>

                    </form>

                    <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-xs text-slate-400">
                            SCHOOLCHAT
                        </span>
                        <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <div className="text-center">
                        <p className="mb-3 text-sm text-slate-600">
                            {t("DontYouHaveAccount")}?
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                            <FiUserPlus size={18} />
                            {t("CreateAccount")}
                        </button>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Connect. Communicate. Learn together.
                </p>

            </div>
        </div>
    );
}
