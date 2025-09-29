import React from 'react';
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

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = 280; // Fixed sidebar width from Sidebar.tsx
const isTablet = screenWidth > 768;

const MainLayout: React.FC<MainLayoutProps> = ({ children, activeRoute }) => {
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Sidebar activeRoute={activeRoute} />
      
      {/* Main Content */}
      <View style={[styles.content, { width: screenWidth - SIDEBAR_WIDTH }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    overflow: 'hidden', // Prevent overflow
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    minHeight: '100%',
    overflow: 'hidden', // Prevent content overflow
    paddingHorizontal: isTablet ? 24 : 16, // Responsive padding
    paddingVertical: isTablet ? 24 : 16,
  },
});

export default MainLayout;