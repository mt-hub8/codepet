type IconProps = { size?: number; className?: string };

export function IconPaw({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="12" cy="17" rx="4.5" ry="3.5" />
      <circle cx="7" cy="10" r="2.2" />
      <circle cx="12" cy="8" r="2.2" />
      <circle cx="17" cy="10" r="2.2" />
      <circle cx="9.5" cy="5.5" r="1.8" />
      <circle cx="14.5" cy="5.5" r="1.8" />
    </svg>
  );
}

export function IconChevronRight({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStar({ size = 12, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 3.5 14.1 9l5.4.4-4.1 3.4 1.3 5.3L12 15.8 7.3 18.1l1.3-5.3-4.1-3.4 5.4-.4L12 3.5Z" />
    </svg>
  );
}

export function ReminderCardIcon({ kind, size = 22 }: { kind: "calendar" | "folder" | "study"; size?: number }) {
  if (kind === "folder") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 7.5A2 2 0 0 1 6 5.5h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "study") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 18h6M10 21h4M12 3a5 5 0 0 0-3 9.2V16h6v-3.8A5 5 0 0 0 12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5V7M16 3.5V7M4 10h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function RoleCardIcon({ accent }: { accent: "green" | "blue" | "amber" | "mint" }) {
  if (accent === "blue") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (accent === "amber") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 3 14 9h6l-5 4 2 7-5-3.5L7 20l2-7-5-4h6l2-6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    );
  }
  if (accent === "mint") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M12 20s-6.5-4.2-6.5-9.2C5.5 7.5 8.4 5 12 5s6.5 2.5 6.5 5.8C18.5 15.8 12 20 12 20Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m8 8 2 2-2 2M14 8l2 2-2 2M10 16h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function TaskStatusIcon({ status }: { status: "succeeded" | "failed" | "needs_user_input" | "running" | "pending" | "cancelled" | "no_output_timeout" }) {
  if (status === "succeeded") {
    return (
      <span className="home-task-status-icon home-task-status-icon--success" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="m6 12.5 3.5 3.5L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  if (status === "failed" || status === "no_output_timeout") {
    return (
      <span className="home-task-status-icon home-task-status-icon--danger" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  return (
    <span className="home-task-status-icon home-task-status-icon--amber" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 8v4l2.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}
