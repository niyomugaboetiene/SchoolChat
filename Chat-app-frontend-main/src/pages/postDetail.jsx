
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";
import { format } from "date-fns";
import {
    X,
    ArrowLeft,
    CalendarDays,
    UserRound,
    Image as ImageIcon
} from "lucide-react";

export default function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await api.get(`/api/posts/${id}`, {
                    withCredentials: true
                });

                setPost(res.data);
            } catch (error) {
                console.error(error);
                setError("Failed to load post.");
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [id]);

    const handleClose = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                    <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />
                    <h2 className="mt-5 font-semibold text-slate-800">
                        Loading post
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Please wait while we fetch this post.
                    </p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <ImageIcon size={28} />
                    </div>

                    <h2 className="mt-5 text-xl font-bold text-slate-900">
                        {error ? "Unable to load post" : "Post not found"}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        {error || "This post may have been deleted or is no longer available."}
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
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:py-10">
            <div className="mx-auto max-w-3xl">

                <div className="mb-6 flex items-center justify-between">
                    <button
                        onClick={handleClose}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                        <ArrowLeft size={17} />
                        Back
                    </button>

                    <button
                        onClick={handleClose}
                        aria-label="Close post"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        <X size={19} />
                    </button>
                </div>

                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
                        <div className="flex items-center gap-3">
                            {post.profile_image ? (
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${post.profile_image}`}
                                    alt={post.author_name || "Author"}
                                    className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">
                                    {post.author_name?.charAt(0).toUpperCase() || <UserRound size={21} />}
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <h2 className="truncate font-bold text-slate-900">
                                    {post.author_name || "Unknown user"}
                                </h2>

                                {post.created_at && (
                                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                        <CalendarDays size={13} />
                                        <span>
                                            {format(
                                                new Date(post.created_at),
                                                "MMM d, yyyy · h:mm a"
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-5 py-6 sm:px-8 sm:py-8">
                        <div className="mb-6">
                            <h1 className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl">
                                Post Details
                            </h1>

                            <p className="whitespace-pre-wrap break-words text-base leading-8 text-slate-700">
                                {post.content}
                            </p>
                        </div>

                        {post.image && (
                            <div className="overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                <img
                                    src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${post.image}`}
                                    alt="Post"
                                    className="mx-auto max-h-[650px] w-full object-contain"
                                />
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-8">
                        <p className="text-center text-xs font-medium text-slate-400">
                            Shared on SchoolChat
                        </p>
                    </div>

                </article>
            </div>
        </div>
    );
}
