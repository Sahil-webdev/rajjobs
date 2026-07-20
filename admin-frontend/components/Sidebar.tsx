"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

// ── Props Interface ────────────────────────────────────────────────────────────
interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    onCollapseToggle?: () => void;
    isCollapsed?: boolean;
    handleLogout?: () => void;
    admin?: { email: string; name?: string; role?: string } | null;
}

// ── SVG Icon Components ────────────────────────────────────────────────────────
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
    </svg>
);

const CoursesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

const TestSeriesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75 2.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 12.408l1.5 1.5 3-3m-9.728-10.1l1.5-1.5 3 3m-4.5 7.5L5.25 12l3-3m-6.75 9.75V6.108c0-1.135.845-2.098 1.976-2.192a48.424 48.424 0 011.123-.08" />
    </svg>
);

const EnquiriesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

const ExamDetailsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const NotificationsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869L9.594 3.94zM12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);

// ── Sidebar Component ──────────────────────────────────────────────────────────
export default function Sidebar({
    isOpen = false,
    onClose,
    onCollapseToggle,
    isCollapsed = false,
    handleLogout,
    admin = null
}: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            {/* Logo Section */}
            <div className="sidebar-brand">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    {/* Actual RajJobs Logo */}
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: 'transparent'
                    }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo2.png"
                            alt="RajJobs Logo"
                            style={{ width: '56px', height: '56px', objectFit: 'contain', display: 'block' }}
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="sidebar-brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: 800,
                                color: 'var(--text)',
                                margin: 0,
                                letterSpacing: '-0.5px',
                                lineHeight: '1.2'
                            }}>
                                RajJobs
                            </h2>
                            <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1.2px', textTransform: 'uppercase', opacity: 0.7 }}>
                                Admin Portal
                            </span>
                        </div>
                    )}
                </div>

                {/* Desktop Collapse Arrow Button */}
                {!isCollapsed && onCollapseToggle && (
                    <button
                        onClick={onCollapseToggle}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            transition: 'color 0.2s, background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--primary)';
                            e.currentTarget.style.backgroundColor = 'var(--sidebar-item-active-bg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                        }}
                        title="Collapse Sidebar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Navigation List */}
            <nav>
                <ul className="sidebar-nav">
                    <li className="sidebar-section-title">Main</li>

                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/dashboard"
                            className={isActive('/admin/dashboard') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="Dashboard"
                            aria-current={isActive('/admin/dashboard') ? 'page' : undefined}
                        >
                            <DashboardIcon />
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li className="sidebar-section-title">Management</li>

                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/courses"
                            className={isActive('/admin/courses') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="Courses"
                            aria-current={isActive('/admin/courses') ? 'page' : undefined}
                        >
                            <CoursesIcon />
                            <span>Courses</span>
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/test-series"
                            className={isActive('/admin/test-series') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="Test Series"
                            aria-current={isActive('/admin/test-series') ? 'page' : undefined}
                        >
                            <TestSeriesIcon />
                            <span>Test Series</span>
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/enquiries"
                            className={isActive('/admin/enquiries') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="Enquiries"
                            aria-current={isActive('/admin/enquiries') ? 'page' : undefined}
                        >
                            <EnquiriesIcon />
                            <span>Enquiries</span>
                        </Link>
                    </li>

                    <li className="sidebar-section-title">Content</li>

                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/exam-details"
                            className={isActive('/admin/exam-details') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="Exam Details"
                            aria-current={isActive('/admin/exam-details') ? 'page' : undefined}
                        >
                            <ExamDetailsIcon />
                            <span>Exam Details</span>
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/notifications"
                            className={isActive('/admin/notifications') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="Notifications"
                            aria-current={isActive('/admin/notifications') ? 'page' : undefined}
                        >
                            <NotificationsIcon />
                            <span>Notifications</span>
                        </Link>
                    </li>

                    <li className="sidebar-section-title">Settings</li>

                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/profile"
                            className={isActive('/admin/profile') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="My Profile"
                            aria-current={isActive('/admin/profile') ? 'page' : undefined}
                        >
                            <ProfileIcon />
                            <span>My Profile</span>
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link
                            href="/admin/settings"
                            className={isActive('/admin/settings') ? 'active' : ''}
                            onClick={handleLinkClick}
                            data-tooltip="Settings"
                            aria-current={isActive('/admin/settings') ? 'page' : undefined}
                        >
                            <SettingsIcon />
                            <span>Settings</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Profile Avatar Card inside Sidebar (Expanded/Collapsed) */}
            {admin && (
                isCollapsed ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0', borderTop: '1px solid var(--sidebar-border)' }}>
                        <div
                            data-tooltip={`${admin.name || admin.email} (${admin.role || 'Admin'})`}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary-light)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                border: '1px solid var(--sidebar-border)',
                                cursor: 'pointer'
                            }}
                        >
                            {(admin.name || admin.email || 'A')[0].toUpperCase()}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        padding: '12px 20px',
                        borderTop: '1px solid var(--sidebar-border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '14px',
                            border: '1px solid var(--sidebar-border)'
                        }}>
                            {(admin.name || admin.email || 'A')[0].toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {admin.name || admin.email}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {admin.role || 'Administrator'}
                            </span>
                        </div>
                    </div>
                )
            )}

            {/* Relocated Logout Action Button */}
            {handleLogout && (
                <div className="sidebar-logout-container">
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        data-tooltip="Logout"
                        aria-label="Logout"
                    >
                        <LogoutIcon />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
}
