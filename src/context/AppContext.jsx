import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [profile, setProfile] = useState({
    name:       'Alex Johnson',
    height:     175,
    weight:     72,
    injuryType: 'Post-ACL Reconstruction',
  });

  const [settings, setSettings] = useState({
    assistance:  50,
    sensitivity: 70,
  });

  const [contacts, setContacts] = useState([
    { id: '1', name: 'Sarah Johnson', role: 'Daughter • Caregiver' },
    { id: '2', name: 'Dr. Smith',     role: 'Physiotherapist' },
  ]);

  const [rehabGoals, setRehabGoals] = useState([
    { id: 'g1', text: 'Morning Walk (15 mins)',    completed: true,  active: false },
    { id: 'g2', text: 'Flexion Exercises (3 sets)', completed: false, active: true  },
    { id: 'g3', text: 'Evening Wear (2 hours)',    completed: false, active: false },
  ]);

  const login  = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, logout,
      profile,  setProfile,
      settings, setSettings,
      contacts, setContacts,
      rehabGoals, setRehabGoals,
    }}>
      {children}
    </AppContext.Provider>
  );
};
