"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const handleLinkClick = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <h2>RajJobs</h2>
            </div>

            <nav>
                <ul className="sidebar-nav">
                    <li className="sidebar-section-title">Main</li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''} onClick={handleLinkClick}>
                            📊 Dashboard
                        </Link>
                    </li>

                    <li className="sidebar-section-title">Management</li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/courses" className={isActive('/admin/courses') ? 'active' : ''} onClick={handleLinkClick}>
                            📚 Courses
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/test-series" className={isActive('/admin/test-series') ? 'active' : ''} onClick={handleLinkClick}>
                            📝 Test Series
                        </Link>
                    </li>

                    <li className="sidebar-section-title">Content</li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/exam-details" className={isActive('/admin/exam-details') ? 'active' : ''} onClick={handleLinkClick}>
                            📝 Exam Details
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/banners" className={isActive('/admin/banners') ? 'active' : ''} onClick={handleLinkClick}>
                            🖼️ Banners
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/study-materials" className={isActive('/admin/study-materials') ? 'active' : ''} onClick={handleLinkClick}>
                            📖 Study Materials
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/notifications" className={isActive('/admin/notifications') ? 'active' : ''} onClick={handleLinkClick}>
                            🔔 Notifications
                        </Link>
                    </li>

                    <li className="sidebar-section-title">Settings</li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/moderation" className={isActive('/admin/moderation') ? 'active' : ''} onClick={handleLinkClick}>
                            ⚠️ Moderation
                        </Link>
                    </li>
                    <li className="sidebar-nav-item">
                        <Link href="/admin/settings" className={isActive('/admin/settings') ? 'active' : ''} onClick={handleLinkClick}>
                            ⚙️ Settings
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
