
import React, { useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiEdit3, FiArrowLeft, FiLoader, FiCheck } from "react-icons/fi";

export default function ChangeGroupName() {
    const navigate = useNavigate();
    const { g_id } = useParams();
    const [newName, setNewName] = useState("");
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    const handleChangeName = async (e) => {
        e.preventDefault();

        if (!newName.trim()) return;

        setLoading(true);

        try {
            await api.patch(`/api/groups/rename/${g_id}/name`, {
                group_name: newName.trim()
            });

            alert("Group name updated!");
            navigate("/chat");
        } catch (err) {
            console.error("Failed to update group name:", err);
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen -mt-20 pt-28 pb-12 px-4 bg-slate-50 flex items-start justify-center">
            <div className="w-full max-w-lg">
                <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition mb-6"
                >
                    <FiArrowLeft size={17} />
                    Back to chat
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                            <FiEdit3 size={25} />
                        </div>

                        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
                            Group management
                        </p>

                        <h2 className="text-2xl font-bold text-slate-900">
                            {t("ChangeGroupName")}
                        </h2>

                        <p className="text-sm text-slate-500 mt-2 leading-6">
                            Give your group a clear name that members can easily recognize.
                        </p>

                        <form onSubmit={handleChangeName} className="mt-8">
                            <label className="block mb-2 text-sm font-semibold text-slate-700">
                                {t("NewGroupName")}
                            </label>

                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t("EnterNewName")}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                                required
                                maxLength={60}
                            />

                            <p className="text-xs text-slate-400 mt-2">
                                {newName.length}/60 characters
                            </p>

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => navigate("/chat")}
                                    disabled={loading}
                                    className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                                >
                                    {t("Cancel")}
                                </button>

                                <button
                                    type="submit"
                                    disabled={loading || !newName.trim()}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <FiLoader className="animate-spin" size={17} />
                                            {t("Updating")}
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck size={17} />
                                            {t("Update")}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="px-6 sm:px-8 py-4 bg-slate-50 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                            Your updated group name will be used throughout the chat.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
