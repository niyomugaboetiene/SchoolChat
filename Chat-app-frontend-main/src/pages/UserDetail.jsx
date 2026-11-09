
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import {
    X,
    ArrowLeft,
    UserRound,
    Phone,
    ShieldCheck,
    CalendarDays,
    LoaderCircle
} from "lucide-react";

export default function UserDetail() {
    const { user_id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await api.get(`/api/users/${user_id}`, {
                    withCredentials: true
                });

                setUser(res.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                setError("Unable to load this user profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [user_id]);

    const handleClose = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="text-center">
                    <LoaderCircle
                        size={36}
                        className="mx-auto animate-spin text-indigo-600"
                    />
                    <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading user profile...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <UserRound size={30} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                        User not found
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error || "This user profile is unavailable."}
                    </p>

                    <button
                        onClick={handleClose}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <button
                        onClick={handleClose}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
                    >
                        <ArrowLeft size={17} />
                        Back
                    </button>

                    <h1 className="font-semibold text-slate-800">
                        User Profile
                    </h1>

                    <button
                        onClick={handleClose}
                        title="Close"
                        aria-label="Close"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="px-6 pb-8 pt-9">

                    <div className="flex justify-center">
                        {user.profile_image ? (
                            <img
                                src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${user.profile_image}`}
                                alt={user.name || "User"}
                                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md ring-1 ring-slate-200"
                            />
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100 text-4xl font-bold text-indigo-700 shadow-sm ring-4 ring-white">
                                {user.name?.charAt(0).toUpperCase() || (
                                    <UserRound size={45} />
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mt-5 text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {user.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            SchoolChat Member
                        </p>

                        {user.role && (
                            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold capitalize text-indigo-700">
                                <ShieldCheck size={14} />
                                {user.role}
                            </span>
                        )}
                    </div>

                    <div className="mt-8 space-y-3">

                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                                <UserRound size={19} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-400">
                                    Full Name
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                    {user.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                                <Phone size={19} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-400">
                                    Phone Number
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                    {user.phone}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
                                <CalendarDays size={19} />
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-400">
                                    Joined SchoolChat
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {user.created_at &&
                                    !Number.isNaN(new Date(user.created_at).getTime())
                                        ? new Date(user.created_at).toLocaleDateString(
                                            undefined,
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric"
                                            }
                                        )
                                        : "Not available"}
                                </p>
                            </div>
                        </div>

                    </div>

                    <button
                        onClick={handleClose}
                        className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                        <ArrowLeft size={16} />
                        Back
                    </button>

                </div>
            </div>
        </div>
    );
}
