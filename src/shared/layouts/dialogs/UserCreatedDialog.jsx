import React from "react";
import { UserPlus, Mail, Phone, Info, User, KeyRound } from "lucide-react";
import DialogShell from "./DialogShell";
import { InfoField, Pill, DialogButton, Banner } from "./primitives";

const STATUS_TONE = {
  Active: "green",
  Inactive: "gray",
  Suspended: "red",
  Pending: "amber",
};

const UserCreatedDialog = ({
  isOpen,
  onClose,
  user = {},
  loading = false,
  onViewUser,
  onAddAnotherUser,
}) => {
  if (!isOpen) return null;

  const initials = (user.name || "?")
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DialogShell
      isOpen={isOpen}
      onClose={onClose}
      icon={UserPlus}
      iconBg="bg-indigo-100"
      iconFg="text-indigo-600"
      titleColor="text-indigo-600"
      title="User Created"
      subtitle="A new user has been created and account is active."
      maxWidth="max-w-[760px]"
      footerLeft={<DialogButton onClick={onClose}>Close</DialogButton>}
      footerRight={
        <>
          <DialogButton icon={User} variant="outline" onClick={onViewUser}>View User</DialogButton>
          <DialogButton icon={UserPlus} variant="primary" onClick={onAddAnotherUser}>Add Another User</DialogButton>
        </>
      }
    >
      {/* Profile card */}
      <div className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-xl px-4 py-4">
        <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-[16px] font-bold text-indigo-600">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15.5px] font-bold text-[#1E2740]">{user.name}</span>
            <Pill tone={STATUS_TONE[user.status] || "green"}>{user.status || "Active"}</Pill>
          </div>
          <div className="text-[12.5px] text-indigo-600 font-semibold mt-0.5">{user.role}</div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2.5">
            {user.email && (
              <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                <Mail size={13} className="text-gray-400" />
                {user.email}
              </span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
                <Phone size={13} className="text-gray-400" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-gray-500">
          Loading user details...
        </div>
      ) : (
        <>
          {/* User details */}
          <div className="mt-5">
            <div className="text-[13.5px] font-bold text-[#1E2740] mb-3">
              User Details
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
              <InfoField
                label="User ID"
                value={user?.id ?? "—"}
              />

              <InfoField
                label="Name"
                value={user?.name ?? "—"}
              />

              <InfoField
                label="Email"
                value={user?.email ?? "—"}
              />

              <InfoField
                label="Phone"
                value={user?.phone ?? "—"}
              />

              <InfoField
                label="Role"
                value={
                  user?.roles?.length
                    ? user.roles
                      .map((role) =>
                        role.name
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )
                      )
                      .join(", ")
                    : "—"
                }
              />

              <InfoField
                label="Status"
                value={
                  <Pill
                    tone={
                      user?.status === "active"
                        ? "green"
                        : "gray"
                    }
                  >
                    {user?.status
                      ? user.status.charAt(0).toUpperCase() +
                      user.status.slice(1)
                      : "—"}
                  </Pill>
                }
              />

              <InfoField
                label="Date Created"
                value={
                  user?.created_at
                    ? new Date(
                      user.created_at
                    ).toLocaleString()
                    : "—"
                }
              />

              <InfoField
                label="Last Updated"
                value={
                  user?.updated_at
                    ? new Date(
                      user.updated_at
                    ).toLocaleString()
                    : "—"
                }
              />
            </div>
          </div>
        </>
      )}
      
      <Banner tone="blue" className="mt-5 flex items-center gap-2.5">
        <Info size={15} className="flex-shrink-0" />
        <span>An email has been sent to the user with login credentials and instructions to access the system.</span>
      </Banner>
    </DialogShell>
  );
};

export default UserCreatedDialog;
