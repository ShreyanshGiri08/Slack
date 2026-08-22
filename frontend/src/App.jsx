import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ThreadDrawer } from './components/ThreadDrawer';
import { SearchModal } from './components/SearchModal';
import { UserProfileModal } from './components/UserProfileModal';

function WorkspaceLayout() {
  const [activeThreadMessage, setActiveThreadMessage] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-slack-darkBg text-gray-900 dark:text-gray-100">
      {/* Navigation Sidebar */}
      <Sidebar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Channel Chat Area */}
      <ChatArea
        onOpenThread={(msg) => setActiveThreadMessage(msg)}
      />

      {/* Sliding Thread Side Drawer */}
      <ThreadDrawer
        parentMessage={activeThreadMessage}
        onClose={() => setActiveThreadMessage(null)}
      />

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
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
