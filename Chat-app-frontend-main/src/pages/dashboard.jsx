
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaCamera, FaTimes } from "react-icons/fa";
import {
    FiSettings,
    FiUsers,
    FiMessageCircle,
    FiPlus,
    FiImage,
    FiUser,
    FiCalendar,
    FiSearch,
    FiX,
    FiUpload,
    FiCheck,
    FiLoader
} from "react-icons/fi";
import { useTranslation } from "react-i18next";

const API_ORIGIN = (() => {
    const baseURL = api.defaults.baseURL;

    if (baseURL && /^https?:\/\//i.test(baseURL)) {
        return baseURL.replace(/\/api\/?$/, "");
    }

    return typeof window !== "undefined" ? window.location.origin : "";
})();

const getImageUrl = (path) => {
    if (!path) return "";

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const imagePath = path.startsWith("/") ? path : `/uploads/${path}`;

    return `${API_ORIGIN}${imagePath}`;
};

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [showPostForm, setShowPostForm] = useState(false);
    const [showprofileMenu, setShowProfileMenu] = useState(false);
    const [showFullProfile, setShowFullProfile] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [post, setPost] = useState([]);
    const [searchUser, setSearchUser] = useState("");

    const navigate = useNavigate();
    const { t } = useTranslation();

    const [showSettingModal, setShowSettingModal] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");

    const [loadingPosts, setLoadingPosts] = useState(true);
    const [isPostSubmitting, setIsPostSubmitting] = useState(false);
    const [isSettingsSaving, setIsSettingsSaving] = useState(false);
    const [isProfileUploading, setIsProfileUploading] = useState(false);

    useEffect(() => {
        const handleUpdateSettings = async () => {
            try {
                const res = await api.get("/api/settings/me", {
                    withCredentials: true
                });

                setName(res.data.name || "");
                setPhone(res.data.phone || "");
            } catch (error) {
                console.error(error);
            }
        };

        handleUpdateSettings();
    }, []);

    const handleSettingSubmit = async (e) => {
        e.preventDefault();
        setIsSettingsSaving(true);
        setMessage("");

        try {
            const res = await api.post(
                "/api/settings/update",
                { name, phone, oldPassword, newPassword },
                { withCredentials: true }
            );

            setMessage(res.data.message);
            setNewPassword("");
            setOldPassword("");

            setUser((prev) => ({
                ...prev,
                name,
                phone
            }));
        } catch (err) {
            setMessage(err.response?.data?.message || "Update failed");
        } finally {
            setIsSettingsSaving(false);
        }
    };

    const fetchPosts = async () => {
        try {
            const res = await api.get("/api/posts");
            setPost(res.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const handlePostSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && !image) return;

        const formData = new FormData();
        formData.append("content", content);

        if (image) {
            formData.append("image", image);
        }

        setIsPostSubmitting(true);

        try {
            await api.post("/api/posts", formData);

            setContent("");
            setImage(null);
            setShowPostForm(false);

            await fetchPosts();
        } catch (err) {
            alert("Post failed.");
        } finally {
            setIsPostSubmitting(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const profileResponse = await api.get("/api/auth/profile");
                setUser(profileResponse.data);

                const usersResponse = await api.get("/api/users");
                setAllUsers(usersResponse.data);
            } catch (err) {
                console.error("Error fetching profile or users:", err);
                alert("Please login first");
                navigate("/");
            }
        };

        fetchDashboardData();
    }, [navigate]);

    function formatTimeStamp(timestamp) {
        if (!timestamp) return "";

        const date = new Date(timestamp);

        if (Number.isNaN(date.getTime())) return "";

        return date.toLocaleString([], {
            dateStyle: "medium",
            timeStyle: "short"
        });
    }

    const handleProfileUpload = async (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const previousImage = profileImage;
        const previewUrl = URL.createObjectURL(file);

        setProfileImage(previewUrl);
        setShowProfileMenu(false);
        setIsProfileUploading(true);

        const formData = new FormData();
        formData.append("profile_image", file);

        try {
            const response = await api.post(
                "/api/users/change-profile-photo",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    },
                    withCredentials: true
                }
            );

            if (response.data.profile_image) {
                setUser((prev) => ({
                    ...prev,
                    profile_image: response.data.profile_image
                }));

                setProfileImage(getImageUrl(response.data.profile_image));
                alert("Photo changed successfully");
            }
        } catch (error) {
            console.error(error);
            setProfileImage(previousImage);
            alert("Upload failed " + (error.response?.data?.error || ""));
        } finally {
            setIsProfileUploading(false);
            e.target.value = "";
        }
    };

    const filteredUsers = allUsers.filter((u) =>
        u.name?.toLowerCase().includes(searchUser.toLowerCase())
    );

    if (!user) {
        return (
            <div className="min-h-screen -mt-20 pt-24 bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <FiLoader className="animate-spin text-3xl text-indigo-600" />
                    <p className="text-sm font-medium text-slate-500">
                        Loading your dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen -mt-20 pt-24 pb-8 bg-slate-50">
            <div className="max-w-[1500px] mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_280px] gap-6 items-start">

                    <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 lg:sticky lg:top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                                {t("MyProfile")}
                            </h2>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FiUser size={17} />
                            </div>
                        </div>

                        <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                            <div className="relative group w-24 h-24 mb-4">
                                {profileImage || user.profile_image ? (
                                    <img
                                        src={profileImage || getImageUrl(user.profile_image)}
                                        alt={user.name}
                                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowProfileMenu(!showprofileMenu)}
                                    className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition"
                                    aria-label="Edit profile picture"
                                >
                                    {isProfileUploading ? (
                                        <FiLoader className="animate-spin" />
                                    ) : (
                                        <FaCamera />
                                    )}
                                </button>

                                {showprofileMenu && (
                                    <div className="absolute z-30 top-full mt-3 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-xl shadow-xl text-sm w-48 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                setShowFullProfile(true);
                                            }}
                                            className="w-full px-4 py-3 hover:bg-slate-50 text-left text-slate-700 transition"
                                        >
                                            {t("ViewProfilePictute")}
                                        </button>

                                        <label
                                            htmlFor="profileUpload"
                                            className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-left text-slate-700 cursor-pointer transition"
                                        >
                                            <FiUpload />
                                            {t("ChangeProfilePicture")}
                                        </label>
                                    </div>
                                )}

                                <input
                                    id="profileUpload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleProfileUpload}
                                />
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 capitalize">
                                {user.name}
                            </h3>

                            <span className="mt-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold capitalize">
                                {user.role}
                            </span>
                        </div>

                        <div className="space-y-5 py-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    {t("Name")}
                                </p>
                                <p className="text-sm font-semibold text-slate-800 capitalize">
                                    {user.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    {t("Phone")}
                                </p>
                                <p className="text-sm font-semibold text-slate-800">
                                    {user.phone || "Not provided"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                                    {t("Role")}
                                </p>
                                <p className="text-sm font-semibold text-slate-800 capitalize">
                                    {user.role}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowSettingModal(true)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white px-4 py-3 text-sm font-semibold transition duration-200"
                        >
                            <FiSettings size={17} />
                            {t("Settings")}
                        </button>
                    </aside>

                    <main className="min-w-0">
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
                                        School Community
                                    </p>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                                        Welcome back, <span className="capitalize">{user.name}</span>
                                    </h1>
                                    <p className="text-sm text-slate-500 mt-2">
                                        Stay connected with your school community.
                                    </p>
                                </div>

                                <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 items-center justify-center">
                                    <FiMessageCircle size={26} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {t("RecentPosts")}
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Updates from your school community
                                </p>
                            </div>

                            {["director", "dos", "patron", "matron", "dod"].includes(user.role) && (
                                <button
                                    type="button"
                                    onClick={() => setShowPostForm(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
                                >
                                    <FiPlus size={18} />
                                    <span className="hidden sm:inline">{t("CreatePost")}</span>
                                    <span className="sm:hidden">Post</span>
                                </button>
                            )}
                        </div>

                        <div className="space-y-5">
                            {loadingPosts ? (
                                Array.from({ length: 3 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-slate-200" />
                                            <div className="space-y-2">
                                                <div className="w-32 h-3 bg-slate-200 rounded" />
                                                <div className="w-20 h-2 bg-slate-100 rounded" />
                                            </div>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded mt-5" />
                                        <div className="w-3/4 h-3 bg-slate-100 rounded mt-2" />
                                    </div>
                                ))
                            ) : post.length === 0 ? (
                                <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-16 px-6 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                                        <FiMessageCircle size={25} />
                                    </div>
                                    <h3 className="font-bold text-slate-800">
                                        No posts yet
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-2">
                                        School updates will appear here when they are published.
                                    </p>
                                </div>
                            ) : (
                                post.map((postItem) => (
                                    <article
                                        key={postItem.post_id}
                                        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-200"
                                    >
                                        <div className="p-5 sm:p-6">
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {postItem.profile_image ? (
                                                        <img
                                                            src={getImageUrl(postItem.profile_image)}
                                                            alt={postItem.name}
                                                            onClick={() =>
                                                                setSelectedImage(getImageUrl(postItem.profile_image))
                                                            }
                                                            className="w-11 h-11 rounded-full object-cover border border-slate-200 cursor-pointer"
                                                        />
                                                    ) : (
                                                        <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shrink-0">
                                                            {postItem.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm text-slate-900 capitalize truncate">
                                                            {postItem.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500 capitalize mt-0.5">
                                                            {postItem.role}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                                                    <FiCalendar size={13} />
                                                    <span>{formatTimeStamp(postItem.created_at)}</span>
                                                </div>
                                            </div>

                                            {postItem.content && (
                                                <p className="text-sm sm:text-base leading-7 text-slate-700 whitespace-pre-wrap mb-4">
                                                    {postItem.content}
                                                </p>
                                            )}

                                            {postItem.image && (
                                                <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                                                    <img
                                                        src={getImageUrl(postItem.image)}
                                                        alt="Post"
                                                        onClick={() =>
                                                            setSelectedImage(getImageUrl(postItem.image))
                                                        }
                                                        className="w-full max-h-[520px] object-contain cursor-zoom-in"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </main>

                    <aside className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 xl:sticky xl:top-24">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">
                                    {t("AllUsers")}
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    {allUsers.length} members
                                </p>
                            </div>

                            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <FiUsers size={18} />
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                placeholder="Search members..."
                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                            />
                        </div>

                        <ul className="space-y-1 max-h-[500px] overflow-y-auto">
                            {filteredUsers.map((u) => (
                                <li key={u.phone || u.user_id || u.name}>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/chat?user=${encodeURIComponent(u.name)}`)}
                                        className="w-full p-3 hover:bg-indigo-50 rounded-xl flex items-center gap-3 text-left transition group"
                                    >
                                        {u.profile_image ? (
                                            <img
                                                src={getImageUrl(u.profile_image)}
                                                alt={u.name}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage(getImageUrl(u.profile_image));
                                                }}
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 cursor-zoom-in"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                                                {u.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-slate-800 capitalize truncate group-hover:text-indigo-700">
                                                {u.name}
                                            </p>
                                            <p className="text-xs text-slate-500 capitalize truncate mt-0.5">
                                                {u.role}
                                            </p>
                                        </div>

                                        <FiMessageCircle className="text-slate-300 group-hover:text-indigo-600 shrink-0" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8">
                                <FiUsers className="mx-auto text-2xl text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500">
                                    No members found.
                                </p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
                    >
                        <FaTimes size={19} />
                    </button>

                    <img
                        src={selectedImage}
                        alt="Full user image"
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-full max-h-[88vh] object-contain rounded-xl shadow-2xl"
                    />
                </div>
            )}

            {showPostForm && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => !isPostSubmitting && setShowPostForm(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t("CreatePost")}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Share something with your school community.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPostForm(false)}
                                disabled={isPostSubmitting}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-red-500 transition"
                            >
                                <FaTimes size={17} />
                            </button>
                        </div>

                        <form
                            className="p-6 flex flex-col gap-5"
                            onSubmit={handlePostSubmit}
                            encType="multipart/form-data"
                        >
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's happening at school?"
                                className="w-full border border-slate-200 p-4 rounded-xl text-sm resize-none min-h-[140px] outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                            />

                            <div className="border border-dashed border-slate-300 rounded-xl p-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <FiImage size={19} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-700">
                                            {t("UploadImage")}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Choose an image to attach to your post.
                                        </p>
                                    </div>

                                    <FiUpload className="text-slate-400" />

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    />
                                </label>

                                {image && (
                                    <div className="flex items-center justify-between mt-4 p-2 bg-slate-50 rounded-lg">
                                        <span className="text-xs text-slate-600 truncate">
                                            {image.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setImage(null)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <FiX size={17} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={(!content.trim() && !image) || isPostSubmitting}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-semibold transition"
                            >
                                {isPostSubmitting ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck />
                                        {t("PublishPost")}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showSettingModal && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowSettingModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {t("EditSettings")}
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    Update your account information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowSettingModal(false)}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-red-500 transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSettingSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block mb-2 text-xs font-semibold text-slate-600">
                                    {t("Name")}
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-xs font-semibold text-slate-600">
                                    {t("Phone")}
                                </label>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-xs font-semibold text-slate-600">
                                    {t("OldPassword")}
                                </label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition"
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block mb-2 text-xs font-semibold text-slate-600">
                                    {t("NewPassword")}
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter a new password"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm transition"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSettingsSaving || (!name && !phone && !newPassword)}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-semibold transition"
                            >
                                {isSettingsSaving ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck />
                                        {t("Save")}
                                    </>
                                )}
                            </button>

                            {message && (
                                <p className="mt-4 text-sm text-center text-indigo-600">
                                    {message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {showFullProfile && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setShowFullProfile(false)}
                >
                    <div
                        className="relative bg-white rounded-2xl p-3 shadow-2xl max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="absolute top-5 right-5 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-slate-600 hover:text-red-500 shadow transition"
                            onClick={() => setShowFullProfile(false)}
                        >
                            <FaTimes size={17} />
                        </button>

                        {profileImage || user.profile_image ? (
                            <img
                                src={profileImage || getImageUrl(user.profile_image)}
                                alt="Full Profile"
                                className="w-full max-h-[75vh] object-contain rounded-xl"
                            />
                        ) : (
                            <div className="py-16 text-center">
                                <FiUser className="mx-auto text-4xl text-slate-300 mb-3" />
                                <p className="text-sm text-slate-500">
                                    {t("NoProfileImageFound")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
