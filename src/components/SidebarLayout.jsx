import { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Text,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

export default function SidebarLayout({ children, title = 'SET Vôlei' }) {
  const [visible, setVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  function openSidebar() {
    setVisible(true);
    Animated.timing(translateX, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }

  function closeSidebar() {
    Animated.timing(translateX, {
      toValue: -DRAWER_WIDTH,
      duration: 240,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={openSidebar}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>{children}</View>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View style={styles.overlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={closeSidebar}
            activeOpacity={1}
          >
            <View style={styles.backdrop} />
          </TouchableOpacity>

          <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            <Sidebar onClose={closeSidebar} />
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  menuButton: {
    width: 40,
    alignItems: 'center',
  },
  menuIcon: {
    color: '#FACC15',
    fontSize: 22,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#0F172A',
  },
});
