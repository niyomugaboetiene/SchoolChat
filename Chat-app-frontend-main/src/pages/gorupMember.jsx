
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useTranslation } from "react-i18next";
import {
    FiArrowLeft,
    FiUsers,
    FiUserPlus,
    FiSearch,
    FiCheck,
    FiX,
    FiTrash2,
    FiLoader,
    FiShield,
    FiUser,
    FiPlus
} from "react-icons/fi";

export default function GroupMember() {
    const { g_id } = useParams();
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [groupInfo, setGroupInfo] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [search, setSearch] = useState("");
    const [addingMembers, setAddingMembers] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(false);
    const [removingUserId, setRemovingUserId] = useState(null);

    const { t } = useTranslation();

    useEffect(() => {
        fetchMembers();
        fetchGroupInfo();
        fetchCurrentUser();
    }, [g_id]);

    const fetchGroupInfo = async () => {
        try {
            const res = await api.get(`/api/groups/${g_id}`);
            setGroupInfo(res.data);
        } catch (error) {
            console.error("Failed to fetch group info", error);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await api.get("/api/groups/me");
            setCurrentUserId(res.data.id);
        } catch (error) {
            console.error("Failed to fetch user", error);
        }
    };

    const fetchMembers = async () => {
        try {
            const res = await api.get(`/api/groups/group_members/${g_id}`);
            setMembers(res.data);
            setError(null);
        } catch (err) {
            setError("Failed to load group members.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableUsers = async () => {
        setFetchingUsers(true);

        try {
            const membersResponse = await api.get(
                `/api/groups/group_members/${g_id}`
            );

            const currentMembers = membersResponse.data;

            const userResponse = await api.get("/api/users");
            const allUsers = userResponse.data;

            const nonMembers = allUsers.filter(
                (user) =>
                    !currentMembers.some(
                        (member) =>
                            member.user_id === user.user_id ||
                            member.phone === user.phone
                    )
            );

            setAvailableUsers(nonMembers);
        } catch (err) {
            console.error("Failed to load users:", err);
        } finally {
            setFetchingUsers(false);
        }
    };

    const handleRemoveMember = async (user_id) => {
        const confirmed = window.confirm(
            "Are you sure you want to remove this member?"
        );

        if (!confirmed) return;

        setRemovingUserId(user_id);

        try {
            await api.delete(
                `/api/groups/group_members/${g_id}/${user_id}`
            );

            await fetchMembers();
        } catch (err) {
            console.error("Failed to remove member", err);
            alert(err.response?.data?.message || "Failed to remove member");
        } finally {
            setRemovingUserId(null);
        }
    };

    const handleCheckBoxChange = (phone) => {
        setSelectedUserIds((prev) =>
            prev.includes(phone)
                ? prev.filter((p) => p !== phone)
                : [...prev, phone]
        );
    };

    const handleAddMember = async () => {
        if (selectedUserIds.length === 0 || addingMembers) return;

        try {
            setAddingMembers(true);

            const currentMemberPhones = members.map((m) => m.phone);

            const duplicates = selectedUserIds.filter((phone) =>
                currentMemberPhones.includes(phone)
            );

            if (duplicates.length > 0) {
                alert(
                    `These users are already members: ${duplicates.join(", ")}`
                );
                return;
            }

            for (const phone of selectedUserIds) {
                await api.post(
                    `/api/groups/group_members/${g_id}`,
                    { phone }
                );
            }

            await fetchMembers();
            setShowAddForm(false);
            setSelectedUserIds([]);
            setSearch("");
        } catch (err) {
            console.error("Failed to add member.", err);

            if (
                err.response?.data?.error ===
                "User is already a member of this group"
            ) {
                alert("One or more selected users are already members");
            } else {
                alert("Failed to add members");
            }
        } finally {
            setAddingMembers(false);
        }
    };

    const openAddForm = async () => {
        setShowAddForm(true);
        setSelectedUserIds([]);
        setSearch("");
        await fetchAvailableUsers();
    };

    const filteredUsers = availableUsers.filter(
        (user) =>
            user.name?.toLowerCase().includes(search.toLowerCase()) ||
            user.phone?.includes(search)
    );

    const isAdmin = groupInfo?.created_by === currentUserId;

    if (loading || !groupInfo) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center">
                    <FiLoader
                        size={30}
                        className="animate-spin text-indigo-600"
                    />
                    <p className="mt-3 text-sm text-slate-500">
                        Loading group members...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <button
                    type="button"
                    onClick={() => navigate("/chat")}
                    className="mb-7 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                >
                    <FiArrowLeft size={17} />
                    {t("BackToChat")}
                </button>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-6 py-7 sm:px-8">
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                            <div>
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <FiUsers size={24} />
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {t("GroupMembers")}
                                </h1>

                                <p className="mt-2 text-sm text-slate-500">
                                    Manage the people in your group.
                                </p>
                            </div>

                            <div className="flex h-fit items-center gap-2 rounded-xl bg-slate-100 px-4 py-3">
                                <FiUsers className="text-indigo-600" size={19} />
                                <span className="text-lg font-bold text-slate-800">
                                    {members.length}
                                </span>
                                <span className="text-xs font-medium text-slate-500">
                                    Members
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-base font-bold text-slate-800">
                                    {t("GroupMembers")}
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    View and manage group participants.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openAddForm}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                                <FiUserPlus size={17} />
                                {t("AddMember")}
                            </button>
                        </div>

                        {showAddForm && (
                            <div className="mb-8 overflow-hidden rounded-xl border border-indigo-100 bg-slate-50">
                                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {t("SelectUsersToAdd")}
                                        </h3>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Select people you want to add to this group.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setSelectedUserIds([]);
                                        }}
                                        disabled={addingMembers}
                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                                    >
                                        <FiX size={19} />
                                    </button>
                                </div>

                                <div className="p-5">
                                    <div className="relative mb-4">
                                        <FiSearch
                                            size={17}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            placeholder="Search by name or phone..."
                                            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                                        />
                                    </div>

                                    {fetchingUsers ? (
                                        <div className="flex flex-col items-center py-10">
                                            <FiLoader
                                                size={24}
                                                className="animate-spin text-indigo-600"
                                            />
                                            <p className="mt-3 text-sm text-slate-500">
                                                Loading available users...
                                            </p>
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-slate-200 bg-white py-10 text-center">
                                            <FiUsers
                                                size={28}
                                                className="mx-auto text-slate-300"
                                            />
                                            <p className="mt-3 text-sm font-medium text-slate-600">
                                                {t("NoAvailableUsersToAdd")}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="max-h-64 space-y-1 overflow-y-auto">
                                            {filteredUsers.map((user) => {
                                                const selected =
                                                    selectedUserIds.includes(
                                                        user.phone
                                                    );

                                                return (
                                                    <label
                                                        key={user.phone}
                                                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                                                            selected
                                                                ? "border-indigo-200 bg-indigo-50"
                                                                : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        <div className="flex min-w-0 items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold uppercase text-slate-600">
                                                                {user.name?.charAt(0) || "U"}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                                    {user.name}
                                                                </p>
                                                                <p className="mt-0.5 text-xs text-slate-500">
                                                                    {user.phone}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <input
                                                            type="checkbox"
                                                            checked={selected}
                                                            onChange={() =>
                                                                handleCheckBoxChange(
                                                                    user.phone
                                                                )
                                                            }
                                                            disabled={addingMembers}
                                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {selectedUserIds.length > 0 && (
                                        <div className="mt-4 rounded-lg border border-indigo-100 bg-white p-3">
                                            <p className="mb-2 text-xs font-semibold text-slate-600">
                                                {selectedUserIds.length} selected
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {selectedUserIds.map((phone) => {
                                                    const user =
                                                        availableUsers.find(
                                                            (u) => u.phone === phone
                                                        );

                                                    return (
                                                        <span
                                                            key={phone}
                                                            className="inline-flex items-center gap-2 rounded-full bg-indigo-50 py-1.5 pl-3 pr-2 text-xs font-medium text-indigo-700"
                                                        >
                                                            {user?.name || phone}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleCheckBoxChange(
                                                                        phone
                                                                    )
                                                                }
                                                                disabled={addingMembers}
                                                                className="rounded-full hover:text-red-500"
                                                            >
                                                                <FiX size={13} />
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowAddForm(false);
                                                setSelectedUserIds([]);
                                            }}
                                            disabled={addingMembers}
                                            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                                        >
                                            {t("Cancel")}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleAddMember}
                                            disabled={
                                                selectedUserIds.length === 0 ||
                                                addingMembers ||
                                                fetchingUsers
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {addingMembers ? (
                                                <>
                                                    <FiLoader
                                                        size={16}
                                                        className="animate-spin"
                                                    />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <FiPlus size={17} />
                                                    {t("Add")}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                {error}
                                <button
                                    type="button"
                                    onClick={fetchMembers}
                                    className="ml-2 font-semibold underline"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 py-14 text-center">
                                <FiUsers
                                    size={34}
                                    className="mx-auto text-slate-300"
                                />
                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                    {t("NoMembers")}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-xl border border-slate-200">
                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Group participants
                                    </p>
                                </div>

                                <ul className="divide-y divide-slate-100">
                                    {members.map((member) => {
                                        const isGroupAdmin =
                                            member.user_id === groupInfo?.created_by;

                                        const canRemove =
                                            isAdmin &&
                                            member.user_id !== currentUserId;

                                        return (
                                            <li
                                                key={member.user_id}
                                                className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-slate-50 sm:px-5"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${
                                                        isGroupAdmin
                                                            ? "bg-indigo-100 text-indigo-700"
                                                            : "bg-slate-100 text-slate-600"
                                                    }`}>
                                                        {member.name?.charAt(0) || "U"}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                                {member.name}
                                                            </p>

                                                            {isGroupAdmin && (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-700">
                                                                    <FiShield size={11} />
                                                                    {t("Admin")}
                                                                </span>
                                                            )}

                                                            {member.user_id === currentUserId && (
                                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {member.phone}
                                                        </p>
                                                    </div>
                                                </div>

                                                {canRemove && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member.user_id
                                                            )
                                                        }
                                                        disabled={
                                                            removingUserId ===
                                                            member.user_id
                                                        }
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {removingUserId === member.user_id ? (
                                                            <FiLoader
                                                                size={15}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <FiTrash2 size={15} />
                                                        )}
                                                        <span className="hidden sm:inline">
                                                            {t("Remove")}
                                                        </span>
                                                    </button>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
