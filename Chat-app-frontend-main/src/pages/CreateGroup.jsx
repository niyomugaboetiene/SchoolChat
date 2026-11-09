
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
    FiUsers,
    FiArrowLeft,
    FiSearch,
    FiCheck,
    FiX,
    FiUserPlus,
    FiLoader,
    FiUsers as FiGroup
} from "react-icons/fi";

export default function CreateGroup() {
    const [groupName, setGroupName] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [myName, setMyName] = useState("");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, usersRes] = await Promise.all([
                    api.get("/api/auth/profile"),
                    api.get("/api/users")
                ]);

                setMyName(profileRes.data.name);
                setAllUsers(usersRes.data);
            } catch (error) {
                console.error("Error fetching group data:", error);

                if (!myName) {
                    navigate("/");
                }
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [navigate]);

    const toggleUserSelection = (username) => {
        setSelectedUsers((prev) =>
            prev.includes(username)
                ? prev.filter((name) => name !== username)
                : [...prev, username]
        );
    };

    const createGroup = async (e) => {
        e.preventDefault();

        if (!groupName.trim() || selectedUsers.length === 0 || loading) {
            return;
        }

        setLoading(true);

        try {
            await api.post("/api/groups", {
                name: groupName.trim(),
                members: [...selectedUsers, myName]
            });

            navigate("/chat");
        } catch (error) {
            console.error("Group creation failed:", error);
            alert(error.response?.data?.message || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    const availableUsers = allUsers.filter(
        (user) =>
            user.name !== myName &&
            user.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 sm:py-14">
            <div className="mx-auto max-w-2xl">
                <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="mb-7 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                >
                    <FiArrowLeft size={17} />
                    Back to Chat
                </button>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <FiGroup size={24} />
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Create a New Group
                        </h1>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Create a group, invite members, and start conversations together.
                        </p>
                    </div>

                    <form onSubmit={createGroup} className="space-y-7 p-6 sm:p-8">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                Group Name
                            </label>

                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter your group name"
                                maxLength={60}
                                disabled={loading}
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
                            />

                            <div className="mt-2 text-right text-xs text-slate-400">
                                {groupName.length}/60
                            </div>
                        </div>

                        <div>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">
                                        Select Group Members
                                    </label>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Choose the people you want to add.
                                    </p>
                                </div>

                                <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                                    {selectedUsers.length} selected
                                </span>
                            </div>

                            <div className="relative mb-3">
                                <FiSearch
                                    size={17}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search members..."
                                    disabled={loading || fetching}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                                {fetching ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <FiLoader className="animate-spin text-indigo-600" size={25} />
                                        <p className="mt-3 text-sm text-slate-500">
                                            Loading members...
                                        </p>
                                    </div>
                                ) : availableUsers.length === 0 ? (
                                    <div className="px-4 py-12 text-center">
                                        <FiUsers size={30} className="mx-auto text-slate-300" />
                                        <p className="mt-3 text-sm font-medium text-slate-600">
                                            No members found
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Try searching with another name.
                                        </p>
                                    </div>
                                ) : (
                                    availableUsers.map((user) => {
                                        const isSelected = selectedUsers.includes(user.name);

                                        return (
                                            <button
                                                type="button"
                                                key={user.name}
                                                onClick={() => toggleUserSelection(user.name)}
                                                disabled={loading}
                                                className={`flex w-full items-center justify-between border-b border-slate-100 px-4 py-3.5 text-left transition last:border-b-0 hover:bg-slate-50 ${
                                                    isSelected ? "bg-indigo-50/60" : "bg-white"
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold uppercase text-slate-600">
                                                        {user.name?.charAt(0) || "U"}
                                                    </div>

                                                    <span className="truncate text-sm font-medium text-slate-800">
                                                        {user.name}
                                                    </span>
                                                </div>

                                                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                                    isSelected
                                                        ? "border-indigo-600 bg-indigo-600 text-white"
                                                        : "border-slate-300 bg-white"
                                                }`}>
                                                    {isSelected && <FiCheck size={13} />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {selectedUsers.length > 0 && (
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Selected members
                                    </p>
                                    <span className="text-xs text-indigo-700">
                                        {selectedUsers.length} people
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {selectedUsers.map((username) => (
                                        <span
                                            key={username}
                                            className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white py-1.5 pl-3 pr-2 text-xs font-medium text-slate-700"
                                        >
                                            {username}
                                            <button
                                                type="button"
                                                onClick={() => toggleUserSelection(username)}
                                                disabled={loading}
                                                className="rounded-full p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                            >
                                                <FiX size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => navigate("/chat")}
                                disabled={loading}
                                className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    !groupName.trim() ||
                                    selectedUsers.length === 0 ||
                                    loading ||
                                    fetching
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <FiLoader size={17} className="animate-spin" />
                                        Creating Group...
                                    </>
                                ) : (
                                    <>
                                        <FiUserPlus size={17} />
                                        Create Group
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
