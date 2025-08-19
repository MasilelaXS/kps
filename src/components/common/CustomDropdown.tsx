import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'solid' | 'bordered' | 'light' | 'flat' | 'faded' | 'shadow';
  onPress?: () => void;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  trigger?: React.ReactNode;
  placement?: 'bottom' | 'top' | 'left' | 'right';
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  items, 
  trigger,
  placement = 'bottom',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'primary':
        return 'text-purple-600 hover:bg-purple-50';
      case 'success':
        return 'text-green-600 hover:bg-green-50';
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50';
      case 'danger':
        return 'text-red-600 hover:bg-red-50';
      default:
        return 'text-gray-700 hover:bg-gray-50';
    }
  };

  const getPlacementClasses = () => {
    switch (placement) {
      case 'top':
        return 'bottom-full mb-2';
      case 'left':
        return 'right-full mr-2';
      case 'right':
        return 'left-full ml-2';
      default:
        return 'top-full mt-2';
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        {trigger || <MoreHorizontal className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className={`absolute z-50 ${getPlacementClasses()} right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1`}>
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                item.onPress?.();
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-3 py-2 text-sm transition-colors ${getColorClasses(item.color)} ${item.className || ''}`}
            >
              {item.icon && <span className="mr-3 flex-shrink-0">{item.icon}</span>}
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
