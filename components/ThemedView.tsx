import { useThemeColor } from '@/hooks/useThemeColor';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({ style, lightColor, darkColor, className, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (<View 
  style={[{ backgroundColor }, style]} 
  className={className} 
  {...otherProps} 
  />
  );
}
