import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { MessageCircleIcon, XIcon, ChevronDownIcon } from 'lucide-react';

export const CollapsibleChat: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50 }}>
      {open ? (
        <div className="shadow-2xl rounded-xl bg-white w-80 max-w-full flex flex-col border border-gray-300">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 rounded-t-xl">
            <span className="font-semibold text-gray-700 text-sm">Chat Assistant</span>
            <div className="flex items-center gap-1">
              <button
                aria-label="Collapse chat"
                className="hover:bg-gray-200 rounded-full p-1 transition text-black"
                onClick={() => setOpen(false)}
              >
                <ChevronDownIcon size={20} />
              </button>
              <button
                aria-label="Close chat"
                className="hover:bg-gray-200 rounded-full p-1 transition text-black"
                onClick={() => setOpen(false)}
              >
                <XIcon size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: '500px' }}>
            <ChatInterface />
          </div>
        </div>
      ) : (
        <button
          aria-label="Open chat"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onClick={() => setOpen(true)}
        >
          <MessageCircleIcon size={28} />
        </button>
      )}
    </div>
  );
};

export default CollapsibleChat;
