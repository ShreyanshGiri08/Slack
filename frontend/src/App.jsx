import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ThreadDrawer } from './components/ThreadDrawer';
import { SearchModal } from './components/SearchModal';
import { UserProfileModal } from './components/UserProfileModal';

function WorkspaceLayout() {
  const { user } = useAuth();
  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [targetProfileUser, setTargetProfileUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeDmUser, setActiveDmUser] = useState(null);

  if (!user) {
    return <LandingPage />;
  }

  const handleOpenUserProfile = (userToView) => {
    setTargetProfileUser(userToView);
    setIsProfileOpen(true);
  };

  const handleStartDm = (targetUser) => {
    setActiveDmUser(targetUser);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slack-darkBg text-gray-900 dark:text-gray-100">
      {/* Collapsible Sidebar */}
      <Sidebar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => handleOpenUserProfile(user)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeDmUser={activeDmUser}
        onSelectDmUser={(dmUser) => setActiveDmUser(dmUser)}
      />

      {/* Main Channel or DM Chat Area */}
      <ChatArea
        activeDmUser={activeDmUser}
        onOpenThread={(msg) => setActiveThreadMessage(msg)}
        onSelectUserForProfile={(profileUser) => handleOpenUserProfile(profileUser)}
      />

      {/* Sliding Thread Drawer */}
      <ThreadDrawer
        parentMessage={activeThreadMessage}
        onClose={() => setActiveThreadMessage(null)}
      />

      {/* Workspace Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        targetUser={targetProfileUser}
        onClose={() => {
          setIsProfileOpen(false);
          setTargetProfileUser(null);
        }}
        onStartDm={handleStartDm}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceLayout />
    </AuthProvider>
  );
}
