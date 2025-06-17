import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, LogOut } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';
import { Card } from '@/components/UI/Card';
import { Avatar } from '@/components/UI/Avatar';
import { useAppStore } from '@/stores/appStore';
import { useGmail } from '@/hooks/useGmail';

export const SettingsScreen: React.FC = () => {
  const { user, updateUserPreference } = useAppStore();
  const { isGmailConnected, connectGmail, disconnectGmail } = useGmail();
  
  if (!user) return null;
  
  const handleToggleNotifications = (value: boolean) => {
    updateUserPreference('notificationsEnabled', value);
  };
  
  const handleToggleVoice = (value: boolean) => {
    updateUserPreference('voiceEnabled', value);
  };
  
  const handleToggleDarkMode = (value: boolean) => {
    updateUserPreference('darkMode', value);
  };
  
  const handleGmailConnection = async () => {
    if (isGmailConnected) {
      await disconnectGmail();
    } else {
      await connectGmail();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container}>
        <View style={styles.profileSection}>
          <Avatar
            source={user.avatar}
            name={user.name}
            size={80}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <Card variant="outlined" style={styles.card}>
            <TouchableOpacity style={styles.settingItem} onPress={handleGmailConnection}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Gmail Connection</Text>
                <Text style={styles.settingDescription}>
                  {isGmailConnected ? "Connected" : "Not connected"}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.gray[400]} />
            </TouchableOpacity>
          </Card>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <Card variant="outlined" style={styles.card}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive alerts for important emails
                </Text>
              </View>
              <Switch
                value={user.preferences.notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Voice Interaction</Text>
                <Text style={styles.settingDescription}>
                  Enable voice commands and responses
                </Text>
              </View>
              <Switch
                value={user.preferences.voiceEnabled}
                onValueChange={handleToggleVoice}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Switch between light and dark theme
                </Text>
              </View>
              <Switch
                value={user.preferences.darkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </Card>
        </View>
        
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatar: {
    marginBottom: theme.spacing.md,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: theme.spacing.xs,
  },
  userEmail: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.md,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.error,
    marginLeft: theme.spacing.sm,
  },
});