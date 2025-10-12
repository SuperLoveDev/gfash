"use client";
import styled from "styled-components";

// Sidebar wrapper
export const SidebarWrapper = styled.div<{ collapsed?: boolean }>`
  background-color: var(--background);
  transition: transform 0.2s ease;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  width: 16rem;
  flex-shrink: 0;
  z-index: 202;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  flex-direction: column;
  padding-top: var(--space-10);
  padding-left: var(--space-6);
  padding-right: var(--space-6);

  transform: translateX(${(props) => (props.collapsed ? "0" : "-100%")});

  ::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    transform: translateX(0);
    position: static;
    display: flex;
    height: 100vh;
  }
`;

// Overlay mobile
export const Overlay = styled.div<{ visible?: boolean }>`
  background-color: rgba(15, 23, 42, 0.3);
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 201;
  transition: opacity 0.3s ease;
  opacity: ${(props) => (props.visible ? 0.8 : 0)};
  pointer-events: ${(props) => (props.visible ? "auto" : "none")};

  @media (min-width: 768px) {
    display: none;
  }
`;

// Header component
export const Header = styled.div`
  display: flex;
  gap: var(--space-8);
  align-items: center;
  padding-left: var(--space-10);
  padding-right: var(--space-10);
`;

// Body component
export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  margin-top: var(--space-13);
  padding-left: var(--space-4);
  padding-right: var(--space-4);
`;

// Footer component
export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-12);
  padding-top: var(--space-18);
  padding-bottom: var(--space-8);
  padding-left: var(--space-8);
  padding-right: var(--space-8);

  @media (min-width: 768px) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

// Export sidebar avec sous-composants
export const SideBar = {
  wrapper: SidebarWrapper,
  Header,
  Body,
  Overlay,
  Footer,
};
