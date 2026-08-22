import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ThreadDrawer } from './components/ThreadDrawer';
import { SearchModal } from './components/SearchModal';
import { UserProfileModal } from './components/UserProfileModal';

function WorkspaceLayout() {
  const { user } = useAuth();

  // ✅ FIX 2: Persist workspace view in localStorage — survives page reload
  const [showWorkspace, setShowWorkspace] = useState(() => {
    return localStorage.getItem('mini_slack_in_workspace') === 'true';
  });

  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [targetProfileUser, setTargetProfileUser] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeDmUser, setActiveDmUser] = useState(null);

  const enterWorkspace = () => {
    localStorage.setItem('mini_slack_in_workspace', 'true');
    setShowWorkspace(true);
  };

  const exitWorkspace = () => {
    localStorage.setItem('mini_slack_in_workspace', 'false');
    setShowWorkspace(false);
  };

  // When user logs out, reset workspace view and clear persistence
  React.useEffect(() => {
    if (!user) {
      localStorage.setItem('mini_slack_in_workspace', 'false');
      setShowWorkspace(false);
    }
  }, [user]);

  if (!user || !showWorkspace) {
    return <LandingPage onEnterWorkspace={enterWorkspace} />;
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
        onGoHome={exitWorkspace}
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
