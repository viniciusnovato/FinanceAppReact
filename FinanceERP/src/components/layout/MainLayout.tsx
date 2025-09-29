import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

const SIDEBAR_WIDTH = 280; // Fixed sidebar width from Sidebar.tsx

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeRoute }) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const contentWidth = screenWidth - SIDEBAR_WIDTH;

  return (
    <View style={styles.container}>
      {/* Sidebar - Posicionamento absoluto para independência total */}
      <View style={styles.sidebarContainer}>
        <Sidebar activeRoute={activeRoute} />
      </View>
      
      {/* Main Content - Posicionamento absoluto independente do sidebar */}
      <View style={[styles.content, { width: contentWidth, left: SIDEBAR_WIDTH }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    position: 'relative', // Container relativo para posicionamento absoluto dos filhos
  },
  sidebarContainer: {
    position: 'absolute', // Posicionamento absoluto para independência
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: '100%',
    zIndex: 10, // Z-index para garantir que fique acima do conteúdo se necessário
    backgroundColor: '#1E293B', // Cor de fundo para evitar transparência
  },
  content: {
    position: 'absolute', // Posicionamento absoluto para independência
    top: 0,
    height: '100%',
    backgroundColor: '#F8F9FA',
    overflow: 'scroll', // Enable scroll for main content
  },
});

export default MainLayout;