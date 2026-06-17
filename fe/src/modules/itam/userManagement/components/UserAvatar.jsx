import { memo } from "react";

function getInitials(name) {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

const UserAvatar = memo(function UserAvatar({ fullName, username }) {
    const initials = getInitials(fullName || username);

    return <span className="user-avatar">{initials}</span>;
});

export default UserAvatar;