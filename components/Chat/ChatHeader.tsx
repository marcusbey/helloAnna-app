import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Avatar } from '@/components/UI/Avatar';

export const ChatHeader: React.FC = () => {
  const handleBackPress = () => {
    router.push('/(tabs)/settings');
  };

  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.background} 
        translucent={false}
      />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          {/* Anna's Avatar */}
          <View style={styles.leftSection}>
            <Avatar 
              source="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
              size={40}
              style={styles.avatar}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name}>Anna</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </View>

          {/* Back Arrow Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    ...theme.shadows.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: theme.spacing.sm,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '500',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
});
