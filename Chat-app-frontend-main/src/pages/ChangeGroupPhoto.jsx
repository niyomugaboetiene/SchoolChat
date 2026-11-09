
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useTranslation } from "react-i18next";
import { FiCamera, FiArrowLeft, FiUploadCloud, FiImage, FiLoader, FiCheck } from "react-icons/fi";

export default function ChangeGroupPhoto() {
    const { g_id } = useParams();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (!photo) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(photo);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [photo]);

    const handleChangePhoto = async (e) => {
        e.preventDefault();

        if (!photo) {
            return alert("Please select a photo");
        }

        const formData = new FormData();
        formData.append("photo", photo);

        setLoading(true);

        try {
            await api.patch(
                `/api/groups/change-group-photo/${g_id}/photo`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert("Group photo updated 😉");
            navigate("/chat");
        } catch (error) {
            console.error("Failed to upload photo:", error);
            alert(error.response?.data?.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
            <div className="mx-auto max-w-xl">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                    className="mb-7 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
                >
                    <FiArrowLeft size={17} />
                    {t("Cancel")}
                </button>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-6 sm:px-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FiCamera size={23} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {t("ChangeGroupPhoto")}
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Choose a new image to represent your group. The selected photo will become the group's profile picture.
                        </p>
                    </div>

                    <form onSubmit={handleChangePhoto} className="space-y-6 p-6 sm:p-8">
                        <div>
                            <label className="mb-3 block text-sm font-semibold text-slate-700">
                                {t("SelectNewGroupPhoto")}
                            </label>

                            <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 py-8 transition hover:border-indigo-300">
                                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
                                    {preview ? (
                                        <img
                                            src={preview}
                                            alt="Group photo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <FiImage size={48} className="text-slate-400" />
                                    )}
                                </div>

                                <div className="mt-5 text-center">
                                    <p className="text-sm font-semibold text-slate-700">
                                        {photo ? photo.name : "Select a group image"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        PNG, JPG, JPEG or other image formats
                                    </p>
                                </div>

                                <label className={`mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 ${loading ? "pointer-events-none opacity-50" : ""}`}>
                                    <FiUploadCloud size={17} />
                                    Choose Photo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                        className="hidden"
                                        required
                                        disabled={loading}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                disabled={loading}
                                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t("Cancel")}
                            </button>

                            <button
                                type="submit"
                                disabled={loading || !photo}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader className="animate-spin" size={17} />
                                        Updating...
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
            </div>
        </div>
    );
}
