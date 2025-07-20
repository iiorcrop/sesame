import React from 'react';

const Footer = () => {
  // const { speakText } = useAccessibility();

  // const announceAccessibility = () => {
  //   speakText("Accessibility information");
  // };

  return (
    <footer className="w-full bg-gradient-to-r from-green-50 via-green300 to-green-100 border-t border-green-200 shadow-inner py-4 ">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-2">
        <span className="text-green-900 font-semibold text-sm md:text-base">
          © {new Date().getFullYear()} ICAR-IIOR. All rights reserved.
        </span>
        <span className="text-xs text-green-700">
          Designed & Developed by IIOR IT Team
        </span>
      </div>
    </footer>
  );
};

export default Footer;