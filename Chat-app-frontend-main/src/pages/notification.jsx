
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
    FiBell,
    FiUser,
    FiFileText,
    FiClock,
    FiCheckCircle,
    FiArrowLeft,
    FiLoader
} from "react-icons/fi";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
    withCredentials: true
});

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/api/notifications", {
            withCredentials: true
        })
            .then(res => setNotifications(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handleNotification = (notif) => {
            setNotifications(prev => [
                notif,
                ...prev.filter(n => n.id !== notif.id)
            ]);
        };

        socket.on("notification", handleNotification);

        return () => {
            socket.off("notification", handleNotification);
        };
    }, []);

    const unreadCount = notifications.filter(
        n => !n.is_read
    ).length;

    const filteredNotifications = notifications.filter(n => {
        if (filter === "unread") return !n.is_read;
        if (filter === "read") return !!n.is_read;
        return true;
    });

    const handleClick = async (notification) => {
        if (processingId === notification.id) return;

        setProcessingId(notification.id);

        try {
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id
                        ? { ...n, is_read: 1 }
                        : n
                )
            );

            await api.put(
                `/api/notifications/${notification.id}/read`,
                {},
                { withCredentials: true }
            );

            switch (notification.type) {
                case "profile_update":
                    navigate(`/user/${notification.sender_id}`);
                    break;

                case "New post":
                    navigate(`/post/${notification.content}`);
                    break;

                default: {
                    const response = await api.post(
                        `/api/notification/${notification.id}/action`,
                        {},
                        { withCredentials: true }
                    );

                    navigate(response.data.redirectTo, {
                        state: response.data.state
                    });
                }
            }
        } catch (error) {
            console.error("Error handling notification", error);

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notification.id
                        ? { ...n, is_read: 0 }
                        : n
                )
            );
        } finally {
            setProcessingId(null);
        }
    };

    const formatTime = (date) => {
        const notificationDate = new Date(date);

        if (Number.isNaN(notificationDate.getTime())) return "";

        return notificationDate.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getNotificationMessage = (notification) => {
        if (notification.type === "profile_update") {
            return "updated their profile picture";
        }

        if (notification.type === "New post") {
            return "shared a new post";
        }

        return notification.content;
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">

                <div className="mb-7 flex items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
                        >
                            <FiArrowLeft />
                            Back
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                                <FiBell size={23} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Notifications
                                </h1>
                                <p className="mt-1 text-sm text-slate-500">
                                    Stay updated with your latest activity.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden rounded-xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm sm:block">
                        <p className="text-2xl font-bold text-slate-900">
                            {unreadCount}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                            Unread
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold text-slate-900">
                                Your activity
                            </h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {notifications.length} total notifications
                            </p>
                        </div>

                        <div className="flex rounded-xl bg-slate-100 p-1">
                            {[
                                { value: "all", label: "All" },
                                { value: "unread", label: "Unread" },
                                { value: "read", label: "Read" }
                            ].map(item => (
                                <button
                                    key={item.value}
                                    onClick={() => setFilter(item.value)}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                        filter === item.value
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <FiLoader className="animate-spin text-indigo-600" size={28} />
                            <p className="mt-3 text-sm text-slate-500">
                                Loading notifications...
                            </p>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center px-5 py-20 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                <FiBell size={28} />
                            </div>

                            <h3 className="mt-5 font-semibold text-slate-800">
                                {filter === "unread"
                                    ? "You're all caught up!"
                                    : filter === "read"
                                    ? "No read notifications"
                                    : "No notifications yet"}
                            </h3>

                            <p className="mt-2 max-w-xs text-sm text-slate-500">
                                {filter === "unread"
                                    ? "You don't have any unread notifications right now."
                                    : "When someone interacts with you, their activity will appear here."}
                            </p>
                        </div>
                    ) : (
                        <div>
                            {filteredNotifications.map(n => (
                                <button
                                    key={n.id}
                                    type="button"
                                    disabled={processingId === n.id}
                                    onClick={() => handleClick(n)}
                                    className={`group flex w-full items-start gap-4 border-b border-slate-100 px-5 py-5 text-left transition last:border-b-0 hover:bg-slate-50 disabled:cursor-wait ${
                                        !n.is_read ? "bg-indigo-50/40" : "bg-white"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        {n.sender_profile_image ? (
                                            <img
                                                src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${n.sender_profile_image}`}
                                                alt={n.sender_name || "User"}
                                                className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                                                {n.sender_name
                                                    ? n.sender_name.charAt(0).toUpperCase()
                                                    : <FiUser size={20} />}
                                            </div>
                                        )}

                                        {!n.is_read && (
                                            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="text-sm font-bold capitalize text-slate-900">
                                                {n.sender_name || "Someone"}
                                            </span>

                                            {!n.is_read && (
                                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700">
                                                    New
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            {getNotificationMessage(n)}
                                        </p>

                                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                            <FiClock size={13} />
                                            <span>{formatTime(n.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center self-center">
                                        {processingId === n.id ? (
                                            <FiLoader className="animate-spin text-indigo-600" size={18} />
                                        ) : n.is_read ? (
                                            <FiCheckCircle
                                                className="text-slate-300"
                                                size={18}
                                            />
                                        ) : (
                                            <span className="h-2 w-2 rounded-full bg-indigo-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
                        <p className="text-center text-xs text-slate-400">
                            You're viewing your notification activity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
