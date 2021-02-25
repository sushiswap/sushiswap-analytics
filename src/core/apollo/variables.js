import { makeVar } from "@apollo/client";

const getDarkModeVar = () => {
  if (typeof localStorage !== "undefined") {
    const isDarkMode = localStorage.getItem("darkMode");

    // Set dark mode by default
    if (isDarkMode === null) {
      document.documentElement.classList.add(["dark-theme"]);
      document.documentElement.style.color = "#FFFFFF";
      localStorage.setItem("darkMode", "true")
      return true;
    }

    return isDarkMode === "true";
  }
  
  return false;
};

export const darkModeVar = makeVar(getDarkModeVar());
