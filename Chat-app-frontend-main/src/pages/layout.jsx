
import {
    Outlet,
    Link,
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    FaHome,
    FaEnvelope,
    FaBell,
    FaUserCircle,
    FaCamera,
    FaSignOutAlt,
    FaUserPlus,
    FaChevronDown,
    FaBars,
    FaTimes,
    FaGlobe
} from "react-icons/fa";
import {FiMessageCircle} from "react-icons/fi"

import api from "../api";
import { useTranslation } from "react-i18next";
import i18n from "../i18n.js";

import { useEffect, useState } from "react";

const API_ORIGIN = (
    api.defaults.baseURL || import.meta.env.VITE_BACKEND_URL
).replace(/\/api\/?$/, "");

const getProfileImageUrl = (image) => {
    if (!image) return null;

    if (image.startsWith("https")) return image;

    return `${API_ORIGIN}/uploads/${image}`;
};

export default function Layout() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const [profileImage, setProfileImage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [isAllowed, setIsAllowed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [unreadMessages, setUnreadMessages] = useState(0);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const [user, setUser] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const { t } = useTranslation();

    // Fetch the current user's profile
     useEffect(() => {
     let active = true;

     const fetchProfile = async () => {
          try {
               const res = await api.get("/api/auth/profile");

               if (!active) return;

               setUser(res.data);

               if (res.data.profile_image) {
                    setProfileImage(getProfileImageUrl(res.data.profile_image));
               }

               const allowedRoles = ["director", "dos", "patron", "matron", "dod"];
               setIsAllowed(allowedRoles.includes(res.data.role));

          } catch (error) {
               if (active) {
                    console.error("Profile loading failed:", error);
                    navigate("/");
               }
          } finally {
               if (active) setIsLoading(false);
          }
     };

     fetchProfile();

     return () => {
          active = false;
     };
     }, [navigate]);

    // Fetch unread notification count
    useEffect(() => {
        if (!user) return;

        let active = true;

        const fetchUnreadNotifications = async () => {
            try {
                const response = await api.get(
                    "/api/notifications/unread-count"
                );

                if (active) {
                    setUnreadNotifications(
                        response.data.unread_count || 0
                    );
                }
            } catch (error) {
                console.error(
                    "Error fetching unread notifications:",
                    error
                );
            }
        };

        fetchUnreadNotifications();

        const interval = setInterval(
            fetchUnreadNotifications,
            15000
        );

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [user]);

    // Fetch unread message count
    useEffect(() => {
        if (!user) return;

        let active = true;

        const fetchUnreadMessages = async () => {
            try {
                const response = await api.get("/api/messages/unread");

                const totalUnread = response.data.reduce(
                    (sum, message) =>
                        sum + Number(message.unread_count || 0),
                    0
                );

                if (active) {
                    setUnreadMessages(totalUnread);
                }
            } catch (error) {
                console.error(
                    "Error fetching unread messages:",
                    error
                );
            }
        };

        fetchUnreadMessages();

        const interval = setInterval(
            fetchUnreadMessages,
            5000
        );

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [user]);

    // Reset message badge when opening the chat page
    useEffect(() => {
        if (location.pathname === "/chat") {
            setUnreadMessages(0);
        }

        setShowUserMenu(false);
        setShowMobileMenu(false);
    }, [location.pathname]);

    // Clean up temporary profile preview URLs
    useEffect(() => {
        return () => {
            if (profileImage?.startsWith("blob:")) {
                URL.revokeObjectURL(profileImage);
            }
        };
    }, [profileImage]);

    // Handle selected profile photo
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image size must not exceed 5MB.");
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setProfileImage((previous) => {
            if (previous?.startsWith("blob:")) {
                URL.revokeObjectURL(previous);
            }

            return previewUrl;
        });

        setSelectedFile(file);
    };

    const handleProfilePhotoChange = async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            alert("Please select an image first.");
            return;
        }

        const formData = new FormData();

        formData.append("profile_image", selectedFile);

        setIsUploading(true);

        try {
            const response = await api.post(
                "/api/users/change-profile-photo",
                formData,
                {
                    withCredentials: true
                }
            );

            if (response.data.profile_image) {
                setProfileImage(
                    getProfileImageUrl(response.data.profile_image)
                );
            }

            setSelectedFile(null);
            setShowUserMenu(false);

            alert("Profile photo updated successfully.");

        } catch (error) {
            console.error("Profile photo upload failed:", error);

            alert(
                error.response?.data?.error ||
                "Unable to upload your profile photo."
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await api.post("/api/auth/logout");

            navigate("/");

        } catch (error) {
            console.error("Logout failed:", error);
            alert("Unable to log out. Please try again.");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const navigationLinks = [
        {
            name: t("Home"),
            path: "/dashboard",
            icon: <FaHome />
        },
        {
            name: t("Messages"),
            path: "/chat",
            icon: <FaEnvelope />,
            count: unreadMessages
        },
        {
            name: t("Notification"),
            path: "/notifications",
            icon: <FaBell />,
            count: unreadNotifications
        }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <header className="h-[68px] bg-white border-b border-slate-200 flex items-center px-6">
                    <div className="h-7 w-36 bg-slate-200 rounded animate-pulse" />
                </header>

                <main className="max-w-7xl mx-auto px-6 py-10">
                    <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-8" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="bg-white border border-slate-200 rounded-xl p-6"
                            >
                                <div className="h-10 w-10 bg-slate-200 rounded-full animate-pulse mb-5" />
                                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse mb-3" />
                                <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">

            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">

                <nav className="max-w-[1600px] mx-auto h-[68px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">

                    <Link
                        to="/dashboard"
                        className="flex items-center gap-3 shrink-0"
                    >
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                            <FiMessageCircle className="text-lg" />
                        </div>

                        <div className="hidden sm:block">
                            <h1 className="text-lg font-bold tracking-tight text-slate-900">
                                School Chat
                            </h1>
                            <p className="text-[11px] text-slate-500 -mt-0.5">
                                Stay connected
                            </p>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">

                        {navigationLinks.map((item) => {
                            const active =
                                location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        relative flex items-center gap-2
                                        px-4 py-2.5 rounded-lg
                                        text-sm font-medium
                                        transition-colors duration-200
                                        ${
                                            active
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                        }
                                    `}
                                >
                                    <span className="text-base">
                                        {item.icon}
                                    </span>

                                    {item.name}

                                    {item.count > 0 && (
                                        <span className="ml-1 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                                            {item.count > 99
                                                ? "99+"
                                                : item.count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">

                        <div className="hidden sm:flex items-center gap-2 text-slate-500">
                            <FaGlobe className="text-sm" />

                            <select
                                value={i18n.language?.startsWith("rw") ? "rw" : "en"}
                                onChange={(e) =>
                                    i18n.changeLanguage(e.target.value)
                                }
                                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                                aria-label="Select language"
                            >
                                <option value="en">English</option>
                                <option value="rw">Kinyarwanda</option>
                            </select>
                        </div>

                        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

                        <button
                            type="button"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 pr-2 rounded-full hover:bg-slate-100 transition-colors"
                            aria-label="Open profile menu"
                            aria-expanded={showUserMenu}
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                />
                            ) : (
                                <FaUserCircle className="text-3xl text-slate-400" />
                            )}

                            <span className="hidden lg:block text-sm font-semibold text-slate-700 max-w-28 truncate">
                                {user.name}
                            </span>

                            <FaChevronDown className="hidden sm:block text-[10px] text-slate-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                            aria-label="Toggle navigation"
                        >
                            {showMobileMenu ? (
                                <FaTimes />
                            ) : (
                                <FaBars />
                            )}
                        </button>

                    </div>
                </nav>

                {showMobileMenu && (
                    <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1">

                        {navigationLinks.map((item) => {
                            const active =
                                location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        flex items-center justify-between
                                        px-4 py-3 rounded-lg text-sm font-medium
                                        ${
                                            active
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    <span className="flex items-center gap-3">
                                        {item.icon}
                                        {item.name}
                                    </span>

                                    {item.count > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                            {item.count > 99 ? "99+" : item.count}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        <div className="px-4 py-3 flex items-center gap-3 text-sm text-slate-600">
                            <FaGlobe />

                            <select
                                value={i18n.language?.startsWith("rw") ? "rw" : "en"}
                                onChange={(e) =>
                                    i18n.changeLanguage(e.target.value)
                                }
                                className="bg-transparent outline-none"
                            >
                                <option value="en">English</option>
                                <option value="rw">Kinyarwanda</option>
                            </select>
                        </div>
                    </div>
                )}

                {showUserMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowUserMenu(false)}
                        />

                        <div className="absolute right-4 sm:right-8 top-[60px] z-50 w-[min(340px,calc(100vw-32px))] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">

                            <div className="p-5 bg-slate-50 border-b border-slate-200">

                                <div className="flex items-center gap-3">
                                    {profileImage ? (
                                        <img
                                            src={profileImage}
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                                        />
                                    ) : (
                                        <FaUserCircle className="text-4xl text-slate-400" />
                                    )}

                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">
                                            {user.name}
                                        </h3>

                                        <p className="text-sm text-slate-500 truncate">
                                            {user.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">
                                        Account role
                                    </span>

                                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md font-semibold capitalize">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">

                                <form onSubmit={handleProfilePhotoChange}>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Profile photo
                                    </label>

                                    <label className="flex items-center gap-3 border border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">

                                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                                            <FaCamera />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700">
                                                Choose a new photo
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                JPG, PNG · Maximum 5MB
                                            </p>
                                        </div>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>

                                    {selectedFile && (
                                        <button
                                            type="submit"
                                            disabled={isUploading}
                                            className="mt-3 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isUploading
                                                ? "Uploading photo..."
                                                : "Save new photo"}
                                        </button>
                                    )}
                                </form>

                                {isAllowed && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate("/register");
                                        }}
                                        className="w-full mt-4 flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <FaUserPlus className="text-slate-500" />
                                        Create Parent Account
                                    </button>
                                )}

                                <div className="border-t border-slate-100 mt-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={isLoggingOut}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                                    >
                                        <FaSignOutAlt />

                                        {isLoggingOut
                                            ? "Signing out..."
                                            : "Sign out"}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </>
                )}

            </header>

            <main className="pt-[68px] min-h-screen">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                    <Outlet />
                </div>
            </main>

        </div>
    );
}
