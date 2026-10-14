import { Text } from 'react-native';

import useFontStatus from '../hooks/useFontStatus';
import useAppTheme from '../hooks/useAppTheme';
import { textVariants } from '../theme/styles';

/** @param {import('react-native').TextProps & {variant?: keyof typeof textVariants}} props */
export default function AppText({ variant = 'body', style, children, ...props }) {
  const { loaded } = useFontStatus();
  const { resolveStyle } = useAppTheme();

  return (
    <Text {...props} style={[resolveStyle([textVariants[variant], style]), !loaded && { fontFamily: undefined }]}>
      {children}
    </Text>
  );
}
