import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '@/constants/colors';
import { theme } from '@/constants/theme';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 40,
  style,
}) => {
  const getInitials = () => {
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textSize = {
    fontSize: size * 0.4,
  };

  return (
    <View style={[styles.container, avatarStyle, style]}>
      {source ? (
        <Image
          source={{ uri: source }}
          style={avatarStyle}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <Text style={[styles.initials, textSize]}>{getInitials()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: colors.text,
    fontWeight: '600',
  },
});