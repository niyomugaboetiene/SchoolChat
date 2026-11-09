
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {
    FaSearch,
    FaPaperPlane,
    FaPlus,
    FaUsers,
    FaComments,
    FaEllipsisH,
    FaArrowLeft,
    FaCheck,
    FaTimes,
    FaSignOutAlt,
    FaUserCircle
} from "react-icons/fa";

import api from "../api";
import { useTranslation } from "react-i18next";

// --------------------------------------------------
// BACKEND AND SOCKET CONFIGURATION
// --------------------------------------------------

const configuredBase =
    api.defaults.baseURL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000";

const API_ORIGIN = configuredBase.startsWith("http")
    ? configuredBase.replace(/\/api\/?$/, "")
    : window.location.origin;

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || API_ORIGIN;

const socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true
});

const getImageUrl = (image, isGroup = false) => {
    if (!image) return null;

    if (image.startsWith("http")) return image;

    if (isGroup) {
        return `${API_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`;
    }

    return `${API_ORIGIN}/uploads/${image}`;
};

const formatTimeStamp = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "?";
};

// --------------------------------------------------
// AVATAR COMPONENT
// --------------------------------------------------

function Avatar({
    name,
    image,
    online = false,
    size = "md",
    group = false
}) {
    const sizes = {
        sm: "w-9 h-9 text-sm",
        md: "w-11 h-11 text-base",
        lg: "w-12 h-12 text-lg"
    };

    return (
        <div className="relative shrink-0">
            {image ? (
                <img
                    src={getImageUrl(image, group)}
                    alt={name || "Profile"}
                    className={`${sizes[size]} rounded-full object-cover border border-slate-200`}
                />
            ) : (
                <div className={`${sizes[size]} rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-semibold border border-slate-200`}>
                    {getInitial(name)}
                </div>
            )}

            {online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            )}
        </div>
    );
}

// --------------------------------------------------
// MAIN CHAT COMPONENT
// --------------------------------------------------

export default function Chat() {
    const [myName, setMyName] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [group, setGroup] = useState([]);
    const [groupMessages, setGroupMessages] = useState([]);

    const [myProfileImage, setMyProfileImage] = useState(null);
    const [userId, setUserId] = useState(null);

    const [unreadCount, setUnreadCount] = useState({});
    const [userInfo, setUserInfo] = useState({});
    const [lastMessage, setLastMessage] = useState({});

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const [showMobileChat, setShowMobileChat] = useState(false);
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [showDeleteMenuForGroup, setShowDeleteMenuForGroup] = useState(null);

    const [errorMessage, setErrorMessage] = useState("");

    const messagesContainerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);

    const navigate = useNavigate();
    const { t } = useTranslation();

    // --------------------------------------------------
    // CURRENT USER PROFILE
    // --------------------------------------------------

    useEffect(() => {
        let active = true;

        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/auth/profile");

                if (!active) return;

                setMyName(res.data.name);
                setUserId(res.data.id);
                setMyProfileImage(res.data.profile_image);

            } catch (error) {
                console.error("Failed to load profile:", error);
                if (active) navigate("/");
            }
        };

        fetchProfile();

        return () => {
            active = false;
        };
    }, [navigate]);

    // --------------------------------------------------
    // LOAD USERS
    // --------------------------------------------------

    useEffect(() => {
        if (!myName) return;

        let active = true;

        const fetchUsers = async () => {
            setIsLoadingUsers(true);

            try {
                const res = await api.get("/api/users");

                if (active) {
                    setAllUsers(
                        res.data.filter(user => user.name !== myName)
                    );
                }

            } catch (error) {
                console.error("Failed to fetch users:", error);
            } finally {
                if (active) setIsLoadingUsers(false);
            }
        };

        fetchUsers();

        return () => {
            active = false;
        };
    }, [myName]);

    // --------------------------------------------------
    // LOAD GROUPS
    // --------------------------------------------------

    useEffect(() => {
        if (!myName) return;

        let active = true;

        const fetchGroups = async () => {
            try {
                const res = await api.get("/api/groups/my");

                if (active) setGroup(res.data);

            } catch (error) {
                console.error("Failed to fetch groups:", error);
            }
        };

        fetchGroups();

        return () => {
            active = false;
        };
    }, [myName]);

    // --------------------------------------------------
    // LOAD CONVERSATION PREVIEWS
    // --------------------------------------------------

    useEffect(() => {
        if (!myName) return;

        let active = true;

        const fetchConversations = async () => {
            try {
                const res = await api.get("/api/messages/conversations");

                if (!active) return;

                const map = {};

                res.data.forEach(msg => {
                    map[msg.friend_name] = msg;
                });

                setLastMessage(map);

            } catch (error) {
                console.error("Failed to load conversations:", error);
            }
        };

        fetchConversations();

        return () => {
            active = false;
        };
    }, [myName]);

    // --------------------------------------------------
    // LOAD CURRENT USER INFORMATION
    // --------------------------------------------------

    useEffect(() => {
        if (!myName) return;

        let active = true;

        const fetchUserInfo = async () => {
            try {
                const res = await api.get("/api/messages/userInfo");

                if (active) setUserInfo(res.data);

            } catch (error) {
                console.error("Failed to load user information:", error);
            }
        };

        fetchUserInfo();

        return () => {
            active = false;
        };
    }, [myName]);

    // --------------------------------------------------
    // ONLINE USERS
    // --------------------------------------------------

    useEffect(() => {
        if (!myName) return;

        const handleUserList = (list) => {
            setOnlineUsers(list);
        };

        socket.emit("login", myName);

        socket.on("userList", handleUserList);

        return () => {
            socket.off("userList", handleUserList);
        };
    }, [myName]);

    // --------------------------------------------------
    // UNREAD MESSAGE COUNTS
    // --------------------------------------------------

    useEffect(() => {
        if (!userId || !allUsers.length) return;

        let active = true;

        const fetchUnreadCounts = async () => {
            try {
                const res = await api.get("/api/messages/unread");

                const countsMap = {};

                for (const item of res.data) {
                    const user = allUsers.find(
                        u => u.user_id === item.sender_id
                    );

                    if (user) {
                        countsMap[user.name] = item.unread_count;
                    }
                }

                if (active) setUnreadCount(countsMap);

            } catch (error) {
                console.error("Failed to fetch unread counts:", error);
            }
        };

        fetchUnreadCounts();

        const interval = setInterval(fetchUnreadCounts, 10000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [userId, allUsers]);

    // --------------------------------------------------
    // MARK PRIVATE MESSAGES AS READ
    // --------------------------------------------------

    useEffect(() => {
        if (!selectedUser || !myName) return;

        const currentUser = selectedUser;

        setUnreadCount(prev => {
            const updated = { ...prev };
            delete updated[currentUser];
            return updated;
        });

        const markRead = async () => {
            try {
                await api.patch("/api/messages/mark-read", {
                    sender: currentUser,
                    receiver: myName
                });

            } catch (error) {
                console.error("Failed to mark messages as read:", error);

                setUnreadCount(prev => ({
                    ...prev,
                    [currentUser]: prev[currentUser] || 1
                }));
            }
        };

        markRead();
    }, [selectedUser, myName]);

    // --------------------------------------------------
    // LOAD PRIVATE MESSAGES
    // --------------------------------------------------

    useEffect(() => {
        if (!selectedUser || !myName) return;

        let active = true;

        setMessages([]);
        setIsLoadingMessages(true);
        setErrorMessage("");

        const fetchMessages = async () => {
            try {
                const res = await api.get(
                    `/api/messages/${encodeURIComponent(myName)}/${encodeURIComponent(selectedUser)}`
                );

                if (active) setMessages(res.data);

            } catch (error) {
                console.error("Failed to fetch private messages:", error);

                if (active) {
                    setErrorMessage("Unable to load this conversation.");
                }
            } finally {
                if (active) setIsLoadingMessages(false);
            }
        };

        fetchMessages();

        return () => {
            active = false;
        };
    }, [selectedUser, myName]);

    // --------------------------------------------------
    // LOAD GROUP MESSAGES
    // --------------------------------------------------

    useEffect(() => {
        if (!selectedGroup) return;

        let active = true;

        setGroupMessages([]);
        setIsLoadingMessages(true);
        setErrorMessage("");

        const fetchGroupMessages = async () => {
            try {
                const res = await api.get(
                    `/api/groups/group-messages/${selectedGroup.g_id}`
                );

                if (active) setGroupMessages(res.data);

            } catch (error) {
                console.error("Failed to fetch group messages:", error);

                if (active) {
                    setErrorMessage("Unable to load group messages.");
                }
            } finally {
                if (active) setIsLoadingMessages(false);
            }
        };

        fetchGroupMessages();

        return () => {
            active = false;
        };
    }, [selectedGroup]);

    // --------------------------------------------------
    // JOIN GROUP ROOM
    // --------------------------------------------------

    useEffect(() => {
        if (!selectedGroup?.g_id) return;

        socket.emit("joinGroup", selectedGroup.g_id);

    }, [selectedGroup]);

    // --------------------------------------------------
    // PRIVATE REAL-TIME MESSAGES
    // --------------------------------------------------

    useEffect(() => {
        const handlePrivateMessage = ({
            from,
            message: content,
            timestamp,
            m_id
        }) => {
            if (from !== selectedUser && from !== myName) return;

            setMessages(prev => {
                const alreadyExists = prev.some(
                    msg => String(msg.m_id) === String(m_id)
                );

                if (alreadyExists) return prev;

                // Reconcile a temporary optimistic message if the
                // sender receives their own Socket.IO event.
                if (from === myName) {
                    const tempIndex = prev.findIndex(
                        msg => msg.isOwn && msg.pending && msg.content === content
                    );

                    if (tempIndex !== -1) {
                        return prev.map((msg, index) =>
                            index === tempIndex
                                ? {
                                    ...msg,
                                    m_id,
                                    created_at: timestamp,
                                    pending: false
                                }
                                : msg
                        );
                    }
                }

                return [
                    ...prev,
                    {
                        sender_name: from,
                        content,
                        created_at: timestamp,
                        m_id,
                        isOwn: from === myName
                    }
                ];
            });

            if (from !== myName) {
                setLastMessage(prev => ({
                    ...prev,
                    [from]: {
                        friend_name: from,
                        content
                    }
                }));
            }
        };

        socket.on("privateMessage", handlePrivateMessage);

        return () => {
            socket.off("privateMessage", handlePrivateMessage);
        };
    }, [myName, selectedUser]);

    // --------------------------------------------------
    // GROUP REAL-TIME MESSAGES
    // --------------------------------------------------

    useEffect(() => {
        const handleNewGroupMessage = (msg) => {
            if (!selectedGroup || msg.g_id !== selectedGroup.g_id) return;

            setGroupMessages(prev => {
                const exists = prev.some(
                    item => String(item.id) === String(msg.id)
                );

                if (exists) return prev;

                return [...prev, msg];
            });
        };

        socket.on("newGroupMessage", handleNewGroupMessage);

        return () => {
            socket.off("newGroupMessage", handleNewGroupMessage);
        };
    }, [selectedGroup]);

    // --------------------------------------------------
    // DELETE MESSAGE SOCKET EVENTS
    // --------------------------------------------------

    useEffect(() => {
        const handlePrivateDeleted = ({ m_id }) => {
            setMessages(prev =>
                prev.filter(msg => String(msg.m_id) !== String(m_id))
            );
        };

        const handleGroupDeleted = ({ id }) => {
            setGroupMessages(prev =>
                prev.map(msg =>
                    String(msg.id) === String(id)
                        ? { ...msg, is_deleted: true }
                        : msg
                )
            );
        };

        socket.on("privateMessageDeleted", handlePrivateDeleted);
        socket.on("groupMessageDeleted", handleGroupDeleted);

        return () => {
            socket.off("privateMessageDeleted", handlePrivateDeleted);
            socket.off("groupMessageDeleted", handleGroupDeleted);
        };
    }, []);

    // --------------------------------------------------
    // AUTO SCROLL
    // --------------------------------------------------

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }, [messages, groupMessages, isLoadingMessages]);

    // --------------------------------------------------
    // SEND PRIVATE MESSAGE
    // --------------------------------------------------

    const sendMessage = async () => {
        const content = message.trim();

        if (!selectedUser || !content || !myName || isSending) return;

        const tempId = `temp-${Date.now()}`;

        const tempMessage = {
            sender_name: myName,
            content,
            created_at: new Date().toISOString(),
            m_id: tempId,
            isOwn: true,
            pending: true
        };

        setMessages(prev => [...prev, tempMessage]);
        setMessage("");
        setIsSending(true);
        setErrorMessage("");

        try {
            const res = await api.post("/api/messages", {
                sender: myName,
                receiver: selectedUser,
                content
            });

            const savedMessage = res.data;

            setMessages(prev =>
                prev.map(msg =>
                    msg.m_id === tempId
                        ? {
                            ...savedMessage,
                            isOwn: true,
                            pending: false
                        }
                        : msg
                )
            );

            setLastMessage(prev => ({
                ...prev,
                [selectedUser]: {
                    friend_name: selectedUser,
                    sender_id: userInfo.user_id,
                    content
                }
            }));

            socket.emit("privateMessage", {
                to: selectedUser,
                from: myName,
                message: savedMessage.content,
                m_id: savedMessage.m_id,
                timestamp: savedMessage.created_at
            });

        } catch (error) {
            setMessages(prev =>
                prev.filter(msg => msg.m_id !== tempId)
            );

            console.error("Failed to send private message:", error);
            setErrorMessage("Message could not be sent. Please try again.");

        } finally {
            setIsSending(false);
            messageInputRef.current?.focus();
        }
    };

    // --------------------------------------------------
    // SEND GROUP MESSAGE
    // --------------------------------------------------

    const sendGroupChatMessage = async () => {
        const content = message.trim();

        if (!selectedGroup || !content || !myName || isSending) return;

        setIsSending(true);
        setMessage("");
        setErrorMessage("");

        try {
            const res = await api.post(
                `/api/groups/${selectedGroup.g_id}/messages`,
                {
                    content,
                    type: "text"
                }
            );

            const savedGroupMessage = res.data;

            setGroupMessages(prev => {
                const exists = prev.some(
                    item => String(item.id) === String(savedGroupMessage.id)
                );

                if (exists) return prev;

                return [
                    ...prev,
                    {
                        ...savedGroupMessage,
                        sender_name: myName,
                        user_id: userId
                    }
                ];
            });

            socket.emit("groupMessage", {
                ...savedGroupMessage
            });

        } catch (error) {
            console.error("Failed to send group message:", error);
            setMessage(content);
            setErrorMessage("Message could not be sent. Please try again.");

        } finally {
            setIsSending(false);
            messageInputRef.current?.focus();
        }
    };

    // --------------------------------------------------
    // DELETE PRIVATE MESSAGE
    // --------------------------------------------------

    const handleDeletePrivateMessage = async (m_id) => {
        if (!window.confirm("Delete this message?")) return;

        try {
            await api.delete(`/api/messages/${m_id}`);

            socket.emit("deletePrivateMessage", { m_id });

            setMessages(prev =>
                prev.filter(msg => String(msg.m_id) !== String(m_id))
            );

        } catch (error) {
            console.error("Delete failed:", error);
            alert("Unable to delete this message.");
        }
    };

    // --------------------------------------------------
    // DELETE GROUP MESSAGE
    // --------------------------------------------------

    const handleDeleteGroupMessage = async (id) => {
        if (!id) return;

        if (!window.confirm("Delete this message?")) return;

        try {
            await api.delete(`/api/groups/group-messages/${id}`);

            socket.emit("deleteGroupMessage", { id });

            setGroupMessages(prev =>
                prev.map(msg =>
                    String(msg.id) === String(id)
                        ? { ...msg, is_deleted: true }
                        : msg
                )
            );

        } catch (error) {
            console.error("Failed to delete group message:", error);

            alert(
                error.response?.data?.message ||
                "Unable to delete this message."
            );
        }
    };

    // --------------------------------------------------
    // LEAVE GROUP
    // --------------------------------------------------

    const handleLeaveGroup = async (groupItem) => {
        if (!window.confirm(`Leave ${groupItem.group_name}?`)) return;

        try {
            await api.delete(`/api/groups/leave/${groupItem.g_id}`);

            setGroup(prev =>
                prev.filter(item => item.g_id !== groupItem.g_id)
            );

            if (selectedGroup?.g_id === groupItem.g_id) {
                setSelectedGroup(null);
                setGroupMessages([]);
                setShowMobileChat(false);
            }

            setShowDeleteMenuForGroup(null);

        } catch (error) {
            console.error("Failed to leave group:", error);
            alert("Unable to leave the group.");
        }
    };

    // --------------------------------------------------
    // DELETE GROUP
    // --------------------------------------------------

    const handleDeleteGroup = async () => {
        if (!selectedGroup) return;

        if (!window.confirm("Are you sure you want to delete this group?")) {
            return;
        }

        try {
            await api.patch(
                `/api/groups/${selectedGroup.g_id}/soft-delete`
            );

            setGroup(prev =>
                prev.filter(g => g.g_id !== selectedGroup.g_id)
            );

            setSelectedGroup(null);
            setGroupMessages([]);
            setShowDeleteMenu(false);
            setShowMobileChat(false);

        } catch (error) {
            console.error("Failed to delete group:", error);
            alert("Failed to delete group.");
        }
    };

    // --------------------------------------------------
    // SELECT CONVERSATION
    // --------------------------------------------------

    const openPrivateChat = (user) => {
        setSelectedGroup(null);
        setSelectedUser(user.name);
        setShowMobileChat(true);
        setErrorMessage("");
        setShowDeleteMenu(false);
    };

    const openGroupChat = (groupItem) => {
        setSelectedUser(null);
        setSelectedGroup(groupItem);
        setShowMobileChat(true);
        setErrorMessage("");
        setShowDeleteMenu(false);
    };

    const goBackToConversations = () => {
        setShowMobileChat(false);
        setShowDeleteMenu(false);
    };

    // --------------------------------------------------
    // SEARCH AND FILTER
    // --------------------------------------------------

    const filteredUsers = allUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGroups = group.filter(groupItem =>
        groupItem.group_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isSelectedUserOnline = (name) => {
        const user = allUsers.find(item => item.name === name);

        return Boolean(
            user &&
            onlineUsers.includes(String(user.user_id))
        );
    };

    const currentMessages = selectedGroup
        ? groupMessages
        : messages;

    const currentTitle = selectedGroup
        ? selectedGroup.group_name
        : selectedUser;

    const currentUser = selectedUser
        ? allUsers.find(user => user.name === selectedUser)
        : null;

    const currentImage = selectedGroup
        ? selectedGroup.group_photo
        : currentUser?.profile_image;

    const currentOnline = selectedUser
        ? isSelectedUserOnline(selectedUser)
        : false;

    // --------------------------------------------------
    // MESSAGE FORM SUBMIT
    // --------------------------------------------------

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedGroup) {
            sendGroupChatMessage();
        } else {
            sendMessage();
        }
    };

    // --------------------------------------------------
    // MESSAGE SKELETON
    // --------------------------------------------------

    const MessageSkeleton = () => (
        <div className="space-y-6 p-5">
            <div className="flex justify-start">
                <div className="w-52 space-y-2">
                    <div className="h-14 rounded-xl bg-slate-200 animate-pulse" />
                    <div className="h-2 w-16 bg-slate-200 rounded animate-pulse" />
                </div>
            </div>

            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="h-16 rounded-xl bg-blue-100 animate-pulse" />
                    <div className="h-2 w-16 ml-auto bg-slate-200 rounded animate-pulse" />
                </div>
            </div>

            <div className="flex justify-start">
                <div className="w-44 h-12 rounded-xl bg-slate-200 animate-pulse" />
            </div>
        </div>
    );

    // --------------------------------------------------
    // MAIN INTERFACE
    // --------------------------------------------------

    return (
        <div className="h-[calc(100dvh-116px)] min-h-[500px] max-h-[1000px] flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

            {/* ==========================================
                LEFT SIDEBAR
            ========================================== */}

            <aside
                className={`
                    w-full md:w-[320px] lg:w-[350px]
                    shrink-0 border-r border-slate-200
                    flex flex-col bg-white
                    ${showMobileChat ? "hidden md:flex" : "flex"}
                `}
            >

                {/* Sidebar header */}
                <div className="p-5 border-b border-slate-200">

                    <div className="flex justify-between items-center mb-5">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {t("Messages")}
                            </h1>

                            <p className="text-xs text-slate-500 mt-1">
                                Your conversations
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/create-group")}
                            title={t("create_group")}
                            className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus className="text-sm" />
                        </button>
                    </div>

                    {/* Current user */}
                    <div className="flex items-center gap-3 mb-5">
                        <Avatar
                            name={myName}
                            image={myProfileImage}
                            online
                            size="md"
                        />

                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                                {myName}
                            </p>

                            <p className="text-xs text-emerald-600">
                                {t("online")}
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search people and groups..."
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all"
                        />

                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                                <FaTimes />
                            </button>
                        )}
                    </div>
                </div>

                {/* Conversation filters */}
                <div className="px-4 pt-3 pb-2 flex gap-2">
                    {[
                        { id: "all", label: "All" },
                        { id: "people", label: "People" },
                        { id: "groups", label: "Groups" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-semibold
                                transition-colors
                                ${
                                    activeTab === tab.id
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Scrollable conversation list */}
                <div className="flex-1 overflow-y-auto">

                    {/* GROUPS */}
                    {(activeTab === "all" || activeTab === "groups") && (
                        <section>
                            <div className="px-5 py-3 flex items-center justify-between bg-white sticky top-0 z-10">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    {t("groups")}
                                </h3>

                                <span className="text-xs text-slate-400">
                                    {filteredGroups.length}
                                </span>
                            </div>

                            {filteredGroups.length === 0 ? (
                                <p className="px-5 pb-4 text-xs text-slate-400">
                                    {t("NoGroupsYet")}
                                </p>
                            ) : (
                                filteredGroups.map(groupItem => {
                                    const active =
                                        selectedGroup?.g_id === groupItem.g_id;

                                    return (
                                        <div
                                            key={groupItem.g_id}
                                            onClick={() => openGroupChat(groupItem)}
                                            className={`
                                                px-4 py-3 flex items-center gap-3
                                                cursor-pointer transition-colors
                                                border-l-[3px]
                                                ${
                                                    active
                                                        ? "bg-blue-50 border-blue-600"
                                                        : "border-transparent hover:bg-slate-50"
                                                }
                                            `}
                                        >
                                            <Avatar
                                                name={groupItem.group_name}
                                                image={groupItem.group_photo}
                                                group
                                            />

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">
                                                    {groupItem.group_name}
                                                </p>

                                                <p className="text-xs text-slate-400 truncate mt-1">
                                                    {t("Createdby")} {groupItem.creator_name}
                                                </p>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();

                                                    setShowDeleteMenuForGroup(
                                                        showDeleteMenuForGroup === groupItem.g_id
                                                            ? null
                                                            : groupItem.g_id
                                                    );
                                                }}
                                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full"
                                                title="Group options"
                                            >
                                                <FaEllipsisH />
                                            </button>

                                            {showDeleteMenuForGroup === groupItem.g_id && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleLeaveGroup(groupItem);
                                                    }}
                                                    className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                                                >
                                                    {t("leaveGroup")}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </section>
                    )}

                    {/* CONTACTS */}
                    {(activeTab === "all" || activeTab === "people") && (
                        <section>
                            <div className="px-5 py-3 flex items-center justify-between bg-white sticky top-0 z-10 border-t border-slate-100">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    {t("contact")}
                                </h3>

                                <span className="text-xs text-slate-400">
                                    {filteredUsers.length}
                                </span>
                            </div>

                            {isLoadingUsers ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3, 4].map(item => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="w-11 h-11 rounded-full bg-slate-200 animate-pulse" />

                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />
                                                <div className="h-2 w-1/2 rounded bg-slate-100 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="px-5 py-8 text-center">
                                    <FaUsers className="mx-auto text-2xl text-slate-300 mb-2" />

                                    <p className="text-sm text-slate-500">
                                        No contacts found.
                                    </p>
                                </div>
                            ) : (
                                filteredUsers.map(user => {
                                    const active =
                                        selectedUser === user.name;

                                    const online =
                                        onlineUsers.includes(String(user.user_id));

                                    const unread =
                                        unreadCount[user.name] || 0;

                                    const preview =
                                        lastMessage[user.name];

                                    return (
                                        <div
                                            key={user.user_id}
                                            onClick={() => openPrivateChat(user)}
                                            className={`
                                                px-4 py-3 flex items-center gap-3
                                                cursor-pointer transition-colors
                                                border-l-[3px]
                                                ${
                                                    active
                                                        ? "bg-blue-50 border-blue-600"
                                                        : "border-transparent hover:bg-slate-50"
                                                }
                                            `}
                                        >
                                            <Avatar
                                                name={user.name}
                                                image={user.profile_image}
                                                online={online}
                                            />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center gap-2">
                                                    <p className={`text-sm truncate ${
                                                        unread
                                                            ? "font-bold text-slate-900"
                                                            : "font-semibold text-slate-700"
                                                    }`}>
                                                        {user.name}
                                                    </p>

                                                    {unread > 0 && (
                                                        <span className="min-w-5 h-5 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                                            {unread > 99 ? "99+" : unread}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className={`text-xs truncate mt-1 ${
                                                    unread
                                                        ? "text-slate-700 font-medium"
                                                        : "text-slate-400"
                                                }`}>
                                                    {preview
                                                        ? preview.sender_id === userInfo.user_id
                                                            ? `You: ${preview.content}`
                                                            : preview.content
                                                        : online
                                                            ? t("online")
                                                            : "No messages yet"
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </section>
                    )}

                </div>

                {/* Sidebar footer */}
                <div className="px-5 py-3 border-t border-slate-200 bg-white">
                    <p className="text-[11px] text-slate-400">
                        School Chat · Your school community
                    </p>
                </div>
            </aside>

            {/* ==========================================
                RIGHT CHAT AREA
            ========================================== */}

            <main className={`
                flex-1 min-w-0 flex flex-col bg-white
                ${showMobileChat ? "flex" : "hidden md:flex"}
            `}>

                {/* SELECTED CONVERSATION */}
                {selectedUser || selectedGroup ? (
                    <>
                        {/* Chat header */}
                        <header className="h-[76px] shrink-0 px-4 sm:px-6 flex items-center justify-between border-b border-slate-200 bg-white">

                            <div className="flex items-center gap-3 min-w-0">

                                <button
                                    onClick={goBackToConversations}
                                    className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                                    title="Back to conversations"
                                >
                                    <FaArrowLeft />
                                </button>

                                <Avatar
                                    name={currentTitle}
                                    image={currentImage}
                                    online={currentOnline}
                                    group={Boolean(selectedGroup)}
                                    size="lg"
                                />

                                <div className="min-w-0">
                                    <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                                        {currentTitle}
                                    </h2>

                                    {selectedUser ? (
                                        <p className={`text-xs mt-1 ${
                                            currentOnline
                                                ? "text-emerald-600"
                                                : "text-slate-400"
                                        }`}>
                                            {currentOnline
                                                ? t("online")
                                                : t("offline")}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 mt-1">
                                            {t("groups")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Header actions */}
                            <div className="flex items-center gap-2">

                                {selectedGroup && (
                                    <>
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/group-members/${selectedGroup.g_id}`
                                                )
                                            }
                                            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                        >
                                            <FaUsers />
                                            {t("ViewMembers")}
                                        </button>

                                        {selectedGroup.created_by === userId && (
                                            <div className="relative">
                                                <button
                                                    onClick={() =>
                                                        setShowDeleteMenu(prev => !prev)
                                                    }
                                                    className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100"
                                                >
                                                    <FaEllipsisH />
                                                </button>

                                                {showDeleteMenu && (
                                                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-30">

                                                        <button
                                                            onClick={() => {
                                                                setShowDeleteMenu(false);
                                                                navigate(
                                                                    `/changeGroupName/${selectedGroup.g_id}`
                                                                );
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
                                                        >
                                                            {t("ChangeGroupName")}
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                setShowDeleteMenu(false);
                                                                navigate(
                                                                    `/changeGroupPhoto/${selectedGroup.g_id}`
                                                                );
                                                            }}
                                                            className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md"
                                                        >
                                                            {t("ChangeGroupPhoto")}
                                                        </button>

                                                        <button
                                                            onClick={handleDeleteGroup}
                                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                                                        >
                                                            {t("DeleteGroup")}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </header>

                        {/* Messages */}
                        <section
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto bg-slate-50/70 px-3 sm:px-6 py-6"
                        >
                            <div className="max-w-4xl mx-auto">

                                {isLoadingMessages ? (
                                    <MessageSkeleton />
                                ) : errorMessage ? (
                                    <div className="py-16 text-center">
                                        <p className="text-sm text-red-500">
                                            {errorMessage}
                                        </p>
                                    </div>
                                ) : currentMessages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
                                            <FaComments className="text-2xl text-slate-400" />
                                        </div>

                                        <h3 className="font-semibold text-slate-800">
                                            No messages yet
                                        </h3>

                                        <p className="text-sm text-slate-400 mt-2 max-w-xs">
                                            Start the conversation. Your messages will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-5">

                                        {currentMessages.map((msg, index) => {
                                            const own =
                                                msg.sender_name === myName ||
                                                msg.isOwn === true;

                                            const deleted =
                                                msg.is_deleted === true;

                                            return (
                                                <div
                                                    key={
                                                        msg.m_id ||
                                                        msg.id ||
                                                        `${msg.created_at}-${index}`
                                                    }
                                                    className={`flex ${
                                                        own
                                                            ? "justify-end"
                                                            : "justify-start"
                                                    }`}
                                                >
                                                    <div className={`group relative max-w-[85%] sm:max-w-[75%] lg:max-w-[65%] ${
                                                        own ? "items-end" : "items-start"
                                                    }`}>

                                                        {/* Sender name */}
                                                        {!own && selectedGroup && (
                                                            <p className="text-[11px] font-semibold text-slate-500 mb-1 ml-2">
                                                                {msg.sender_name}
                                                            </p>
                                                        )}

                                                        <div className={`
                                                            relative px-4 py-3 rounded-2xl
                                                            ${
                                                                own
                                                                    ? "bg-blue-600 text-white rounded-br-md"
                                                                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-md"
                                                            }
                                                        `}>

                                                            <p className={`text-sm leading-6 whitespace-pre-wrap break-words ${
                                                                deleted
                                                                    ? "italic opacity-70"
                                                                    : ""
                                                            }`}>
                                                                {deleted
                                                                    ? "This message was deleted"
                                                                    : msg.content}
                                                            </p>

                                                            <div className={`flex items-center justify-end gap-1.5 mt-1.5 ${
                                                                own
                                                                    ? "text-blue-100"
                                                                    : "text-slate-400"
                                                            }`}>
                                                                <span className="text-[10px]">
                                                                    {formatTimeStamp(msg.created_at)}
                                                                </span>

                                                                {own && (
                                                                    <span className="text-[10px]">
                                                                        {msg.pending
                                                                            ? "Sending..."
                                                                            : <FaCheck />}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Message actions */}
                                                        {own && !deleted && (
                                                            <button
                                                                onClick={() =>
                                                                    selectedGroup
                                                                        ? handleDeleteGroupMessage(msg.id)
                                                                        : handleDeletePrivateMessage(msg.m_id)
                                                                }
                                                                className="absolute -top-3 right-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-white border border-slate-200 text-slate-500 hover:text-red-600 rounded-full w-7 h-7 flex items-center justify-center shadow-sm"
                                                                title="Delete message"
                                                            >
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Error notice */}
                        {errorMessage && !isLoadingMessages && (
                            <div className="px-5 py-2 bg-red-50 border-t border-red-100">
                                <p className="text-xs text-red-600">
                                    {errorMessage}
                                </p>
                            </div>
                        )}

                        {/* Message composer */}
                        <footer className="shrink-0 bg-white border-t border-slate-200 p-3 sm:p-4">

                            <form
                                onSubmit={handleSubmit}
                                className="max-w-4xl mx-auto flex items-end gap-3"
                            >
                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                                    <textarea
                                        ref={messageInputRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" &&
                                                !e.shiftKey &&
                                                !e.nativeEvent.isComposing
                                            ) {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }
                                        }}
                                        placeholder={`Message ${currentTitle}...`}
                                        rows={1}
                                        className="w-full resize-none bg-transparent px-4 py-3 text-sm outline-none text-slate-800 placeholder:text-slate-400 max-h-32"
                                        onInput={(e) => {
                                            e.target.style.height = "auto";
                                            e.target.style.height =
                                                `${Math.min(e.target.scrollHeight, 128)}px`;
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={!message.trim() || isSending}
                                    className="h-11 w-11 shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                                    title={t("send")}
                                >
                                    <FaPaperPlane className="text-sm" />
                                </button>
                            </form>

                            <p className="hidden sm:block max-w-4xl mx-auto text-[10px] text-slate-400 mt-2 px-1">
                                Press Enter to send · Shift + Enter for a new line
                            </p>
                        </footer>
                    </>
                ) : (

                    /* ==================================
                       EMPTY CHAT STATE
                    ================================== */

                    <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 text-center">

                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-6">
                            <FaComments className="text-3xl text-slate-400" />
                        </div>

                        <h2 className="text-xl font-bold text-slate-900">
                            {t("WelcomeToChat")}
                        </h2>

                        <p className="text-sm text-slate-500 mt-2 max-w-sm leading-6">
                            {t("Select")}
                        </p>

                        <button
                            onClick={() => navigate("/create-group")}
                            className="mt-6 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus />
                            {t("create_group")}
                        </button>

                    </div>
                )}

            </main>
        </div>
    );
}
