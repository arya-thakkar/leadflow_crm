import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import { SheetProvider } from '../../context/SheetContext';
import { Menu } from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SheetProvider>
      <div className="flex h-screen overflow-hidden bg-zinc-950">
        <div className={`fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-250 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:flex`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-md transition-colors"
            >
              <Menu size={20} />
            </button>
            <span className="text-zinc-100 font-semibold text-sm tracking-tight">LeadFlow</span>
            <div className="w-8" />
          </header>
          
          <Outlet />
        </main>
      </div>
    </SheetProvider>
  );
}
