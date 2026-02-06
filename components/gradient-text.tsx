import React, { useState, useMemo } from "react";
import { Text, View, StyleSheet, TextStyle, LayoutChangeEvent } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import { Fonts } from "../constants/theme";

interface GradientTextProps {
  children: string;
  style?: TextStyle;
}

function GradientTextComponent({ children, style }: GradientTextProps) {
  const [textHeight, setTextHeight] = useState<number | null>(null);
  
  // On récupère la taille du texte (par défaut 20)
  const fontSize = style?.fontSize || 20;
  const lineHeight = style?.lineHeight || fontSize * 1.4;
  
  const handleTextLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (height > 0 && textHeight !== height) {
      setTextHeight(height);
    }
  };
  
  // Hauteur calculée : utiliser la hauteur mesurée ou une estimation (memoized)
  const containerHeight = useMemo(() => {
    return textHeight || Math.max(lineHeight, fontSize * 1.5);
  }, [textHeight, lineHeight, fontSize]);
  
  return (
    <View style={styles.outerContainer}>
      {/* Texte invisible pour mesurer la hauteur */}
      <Text
        style={[
          style,
          {
            position: 'absolute',
            opacity: 0,
            fontFamily: style?.fontStyle === 'italic' ? Fonts.serif.regularItalic : Fonts.serif.regular,
            fontStyle: style?.fontStyle,
            textAlign: style?.textAlign || 'center',
            paddingHorizontal: style?.paddingHorizontal || 20,
          }
        ]}
        onLayout={handleTextLayout}
        numberOfLines={0}
      >
        {children}
      </Text>
      
      <MaskedView
        style={{ 
          height: containerHeight, 
          width: '100%',
          minHeight: fontSize * 1.5,
        }}
        maskElement={
          <View style={{ paddingHorizontal: style?.paddingHorizontal || 20 }}>
            <Text 
              style={[
                style, 
                { 
                  backgroundColor: "transparent", 
                  fontFamily: Fonts.serif.regular,
                  fontStyle: style?.fontStyle,
                  textAlign: style?.textAlign || 'center',
                }
              ]}
              numberOfLines={0}
            >
              {children}
            </Text>
          </View>
        }
      >
        <LinearGradient
          colors={['#027A54', '#027786']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        >
          {/* Texte invisible pour forcer la largeur */}
          <View style={{ paddingHorizontal: style?.paddingHorizontal || 20 }}>
            <Text 
              style={[
                style, 
                { 
                  opacity: 0, 
                  fontFamily: Fonts.serif.regular,
                  fontStyle: style?.fontStyle,
                  textAlign: style?.textAlign || 'center',
                }
              ]}
              numberOfLines={0}
            >
              {children}
            </Text>
          </View>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center', // Centre le texte horizontalement
    justifyContent: 'center',
    width: '100%',
  }
});

// Memoize le composant pour éviter les re-renders inutiles
export default React.memo(GradientTextComponent);