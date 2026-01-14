import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

type Props = {
  text: string;
  selected: boolean;
  onPress: () => void;
};

const FloatingBubble: React.FC<Props> = ({
  text,
  selected,
  onPress,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: Math.random() * 30 - 15,
          duration: 6000 + Math.random() * 4000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: Math.random() * 30 - 15,
          duration: 6000 + Math.random() * 4000,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bubble,
        selected && styles.active,
        {
          transform: [{ translateX }, { translateY }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Text
          style={[
            styles.text,
            selected && styles.textActive,
          ]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingBubble;

const styles = StyleSheet.create({
    bubblesContainer: {
      flex: 1,
      paddingHorizontal: 20,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    bubble: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.4)',
      margin: 8,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
  
    active: {
      backgroundColor: '#FFFFFF',
    },
  
    text: {
      color: '#FFFFFF',
      fontSize: 14,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  
    textActive: {
      color: '#0F6B1A',
      fontWeight: '500',
    },
  });
  