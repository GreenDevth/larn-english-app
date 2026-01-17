import React, { useState } from 'react';

const SettingsMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`settings-menu ${isOpen ? 'open' : ''}`}>
      <div className="settings-icon" onClick={toggleMenu}>
        ⚙️
      </div>
      {isOpen && (
        <div className="settings-list">
          <ul>
            <li>Option 1</li>
            <li>Option 2</li>
            <li>Option 3</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SettingsMenu;