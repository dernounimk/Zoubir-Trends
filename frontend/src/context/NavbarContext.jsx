import { createContext, useContext, useRef, useState } from "react";

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const searchInputRef = useRef(null);

  const openNavbarAndFocusSearch = () => {
    setIsNavbarOpen(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  return (
    <NavbarContext.Provider
      value={{
        isNavbarOpen,
        setIsNavbarOpen,
        searchInputRef,
        openNavbarAndFocusSearch,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => useContext(NavbarContext);