import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onLogout: () => void;
}

function Sidebar({ isOpen, onClose, userName, onLogout }: SidebarProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    if (openSection === section) {
      setOpenSection(null);
    } else {
      setOpenSection(section);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose} />

      <div className="sidebar-panel">
        <div className="sidebar-header">
          <button onClick={onClose} className="close-sidebar">
            ✕
          </button>
        </div>

        {/* Top Logo & User Name */}
        <div className="sidebar-user">
          <div className="sidebar-logo">
            <span>📰</span>
          </div>
          <h3 className="sidebar-username">{userName}</h3>
        </div>

        {/* About Us Section */}
        <div className="sidebar-menu-item">
          <div
            className="sidebar-menu-title"
            onClick={() => toggleSection('about')}
          >
            📖 About Us
            <span
              className={`dropdown-icon ${
                openSection === 'about' ? 'open' : ''
              }`}
            >
              ▼
            </span>
          </div>
          {openSection === 'about' && (
            <div className="sidebar-menu-content">
              Nimach Hub is your trusted news source bringing you the latest
              updates, stories, and information from Nimach and around the
              world. We are committed to delivering accurate and timely news.
            </div>
          )}
        </div>

        {/* Privacy Policy Section */}
        <div className="sidebar-menu-item">
          <div
            className="sidebar-menu-title"
            onClick={() => toggleSection('privacy')}
          >
            🔒 Privacy Policy
            <span
              className={`dropdown-icon ${
                openSection === 'privacy' ? 'open' : ''
              }`}
            >
              ▼
            </span>
          </div>
          {openSection === 'privacy' && (
            <div className="sidebar-menu-content">
              Your privacy matters to us. We collect only your name and contact
              information to personalize your news experience. We do not share
              your data with third parties. You can request account deletion
              anytime.
            </div>
          )}
        </div>

        {/* Contact Us Section */}
        <div className="sidebar-menu-item">
          <div
            className="sidebar-menu-title"
            onClick={() => toggleSection('contact')}
          >
            📞 Contact Us
            <span
              className={`dropdown-icon ${
                openSection === 'contact' ? 'open' : ''
              }`}
            >
              ▼
            </span>
          </div>
          {openSection === 'contact' && (
            <div className="sidebar-menu-content">
              Email: support@nimachhub.com
              <br />
              Phone: +91 XXXXXXXXXX
              <br />
              Address: Nimach, Madhya Pradesh, India
            </div>
          )}
        </div>

        <button onClick={onLogout} className="sidebar-logout-btn">
          🚪 Logout
        </button>
      </div>
    </>
  );
}

export default Sidebar;
