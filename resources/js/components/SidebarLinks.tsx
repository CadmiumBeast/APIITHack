import React from "react";

interface SidebarLinkProps {
  label: string;
  href: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ label, href }) => {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded hover:bg-[#00b2a7] hover:text-white transition"
    >
      {label}
    </a>
  );
};

export default SidebarLink;
