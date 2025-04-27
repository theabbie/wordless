import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface MentionDropdownProps {
  query: string;
  position: { x: number; y: number };
  onSelect: (user: User) => void;
  onClose: () => void;
}

const dummyUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: 'https://ui-avatars.com/api/?name=John+Doe' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson' },
];

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  query,
  position,
  onSelect,
  onClose,
}) => {
  const [results, setResults] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fuse = new Fuse(dummyUsers, {
      keys: ['name', 'email'],
      threshold: 0.3,
    });

    const searchResults = fuse.search(query).map(result => result.item);
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [results, selectedIndex, onSelect, onClose]);

  if (results.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
      style={{
        top: `${position.y + 20}px`,
        left: `${position.x}px`,
        minWidth: '200px',
      }}
    >
      {results.map((user, index) => (
        <div
          key={user.id}
          className={`flex items-center p-2 cursor-pointer ${
            index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => onSelect(user)}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full mr-2"
          />
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ))}
    </div>
  );
}; 