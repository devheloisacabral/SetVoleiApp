import { View, StyleSheet } from 'react-native';
import SidebarLayout from '../../src/components/SidebarLayout';

export default function HomeScreen() {
  return (
    <SidebarLayout>
      <View style={styles.container} />
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
});
