import React, { useState } from 'react';
import { userService } from '../services/api';
import { useToast } from './Toast';

const SettingsModal = ({ isOpen, onClose, userData, onUpdate }) => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [form, setForm] = useState({
    username: userData?.username || '',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    otherNames: userData?.otherNames || '',
    bookingNotifications: userData?.bookingNotifications ?? true,
    flightStatusNotifications: userData?.flightStatusNotifications ?? true,
  });

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await userService.updateUserProfile(form);
      if (res.data.username) {
        localStorage.setItem('username', res.data.username);
      }
      onUpdate(res.data);
      window.dispatchEvent(new Event('userUpdate')); // Notify other components
      showToast('Profile updated successfully!', 'success');
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 'profile', icon: '👤', label: 'Profile Details' },
    { id: 'security', icon: '🔒', label: 'Security' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'preferences', icon: '🎨', label: 'Preferences' },
  ];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2 className="settings-title">⚙️ Account Settings</h2>
          <button className="settings-close" onClick={onClose}>✕</button>
        </div>

        <div className="settings-body">
          {/* Sidebar Menu */}
          <nav className="settings-nav">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`settings-nav-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Content Area */}
          <div className="settings-content">
            {activeSection === 'profile' && (
              <div className="settings-section">
                <h3>Profile Details</h3>
                <p className="settings-hint">Update your personal information and how others see you.</p>

                <div className="settings-field-group">
                  <div className="settings-field">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" value={form.username} onChange={handleChange} placeholder="@yourhandle" />
                  </div>
                </div>

                <div className="settings-field-group two-col">
                  <div className="settings-field">
                    <label htmlFor="firstName">First Name</label>
                    <input id="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Jane" />
                  </div>
                  <div className="settings-field">
                    <label htmlFor="lastName">Last Name</label>
                    <input id="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Doe" />
                  </div>
                </div>

                <div className="settings-field">
                  <label htmlFor="otherNames">Other Names</label>
                  <input id="otherNames" type="text" value={form.otherNames} onChange={handleChange} placeholder="Middle name (optional)" />
                </div>

                <div className="settings-field">
                  <label>Email Address</label>
                  <input type="email" value={userData?.email || ''} disabled className="input-disabled" />
                  <span className="settings-hint">Email cannot be changed. Contact support if needed.</span>
                </div>

                <button className="btn btn-primary settings-save-btn" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="settings-section">
                <h3>Security</h3>
                <p className="settings-hint">Manage your account security settings.</p>
                <div className="settings-info-card">
                  <span className="info-icon">🔐</span>
                  <div>
                    <strong>Multi-Token Auth Active</strong>
                    <p>Your session uses a 5-minute access token and 7-day refresh token for maximum security.</p>
                  </div>
                </div>
                <div className="settings-info-card">
                  <span className="info-icon">📅</span>
                  <div>
                    <strong>Session Duration</strong>
                    <p>You stay logged in for up to 7 days. Tokens refresh automatically in the background.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h3>Notifications</h3>
                <p className="settings-hint">Control how SkyLux communicates with you.</p>
                <div className="settings-toggle-row">
                  <div>
                    <strong>Booking Confirmations</strong>
                    <p>Get notified when your flight is confirmed.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={form.bookingNotifications} onChange={(e) => setForm({...form, bookingNotifications: e.target.checked})} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <div className="settings-toggle-row">
                  <div>
                    <strong>Flight Status Updates</strong>
                    <p>Alerts for delays or gate changes.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={form.flightStatusNotifications} onChange={(e) => setForm({...form, flightStatusNotifications: e.target.checked})} />
                    <span className="slider round"></span>
                  </label>
                </div>
                <button className="btn btn-primary settings-save-btn" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="settings-section">
                <h3>Preferences</h3>
                <p className="settings-hint">Customize your SkyLux experience.</p>
                <div className="settings-toggle-row">
                  <div className="settings-info-card-compact">
                    <span className="info-icon">🌙</span>
                    <div>
                      <strong>Dark Mode</strong>
                      <p>Switch to a sophisticated dark theme.</p>
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
