import React, { createContext, useContext, useEffect, useState } from 'react'

const SidebarContext = createContext({
  isSidebarOpen: true,
  toggleSidebar: () => {},
})

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  // Añade o quita la clase global al <body>
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isSidebarOpen) {
        document.body.classList.add('sidebar-hidden')
      } else {
        document.body.classList.remove('sidebar-hidden')
      }
    }
  }, [isSidebarOpen])

  return <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)
