import Svg, { Circle, Path } from 'react-native-svg';
import useAppTheme from '../hooks/useAppTheme';

// Geometry from the approved Figma reference, rendered with native SVG primitives.
const iconPaths = {
  play: <Path d="m9 7 8 5-8 5V7Z" />,
  book: <><Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" /><Path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></>,
  chart: <><Path d="M5 20V10" /><Path d="M12 20V4" /><Path d="M19 20v-7" /></>,
  settings: <><Circle cx="12" cy="12" r="3" /><Path d="M19.4 15a1.8 1.8 0 0 0 .36 1.98l.06.06-2.78 2.78-.06-.06A1.8 1.8 0 0 0 15 19.4a1.8 1.8 0 0 0-1.1 1.65V21h-3.8v-.09A1.8 1.8 0 0 0 9 19.4a1.8 1.8 0 0 0-1.98.36l-.06.06-2.78-2.78.06-.06A1.8 1.8 0 0 0 4.6 15a1.8 1.8 0 0 0-1.65-1.1H3v-3.8h.09A1.8 1.8 0 0 0 4.6 9a1.8 1.8 0 0 0-.36-1.98l-.06-.06 2.78-2.78.06.06A1.8 1.8 0 0 0 9 4.6a1.8 1.8 0 0 0 1.1-1.65V3h3.8v.09A1.8 1.8 0 0 0 15 4.6a1.8 1.8 0 0 0 1.98-.36l.06-.06 2.78 2.78-.06.06A1.8 1.8 0 0 0 19.4 9a1.8 1.8 0 0 0 1.65 1.1H21v3.8h-.09A1.8 1.8 0 0 0 19.4 15Z" /></>,
  back: <Path d="m15 18-6-6 6-6" />,
  forward: <Path d="m9 6 6 6-6 6" />,
  bulb: <><Path d="M9 18h6" /><Path d="M10 22h4" /><Path d="M8.1 14.8A6 6 0 1 1 16 14.7c-.7.6-1 1.3-1 2.3H9c0-1-.3-1.6-.9-2.2Z" /></>,
  heart: <Path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
  clock: <><Circle cx="12" cy="12" r="9" /><Path d="M12 7v5l3 2" /></>,
  star: <Path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
  sound: <><Path d="M11 5 6 9H3v6h3l5 4V5Z" /><Path d="M15 9a4 4 0 0 1 0 6" /><Path d="M18 6a8 8 0 0 1 0 12" /></>,
  vibrate: <><Path d="M8 5h8v14H8z" /><Path d="m4 8-2 4 2 4M20 8l2 4-2 4" /></>,
  palette: <><Path d="M12 3a9 9 0 0 0 0 18h1.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1 0-4h3.8A5.2 5.2 0 0 0 21 8.8C21 5.6 17 3 12 3Z" /><Circle cx="7.5" cy="10" r=".8" /><Circle cx="10" cy="6.5" r=".8" /><Circle cx="15" cy="7" r=".8" /></>,
  trash: <><Path d="M4 7h16" /><Path d="M9 3h6l1 4H8l1-4Z" /><Path d="m6 7 1 14h10l1-14M10 11v6M14 11v6" /></>,
  trophy: <><Path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><Path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6" /></>,
  check: <Path d="m5 12 4 4L19 6" />,
  map: <><Path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" /><Path d="M9 3v15M15 6v15" /></>,
  paw: <><Circle cx="8" cy="9" r="2" /><Circle cx="16" cy="9" r="2" /><Circle cx="5.5" cy="14" r="1.7" /><Circle cx="18.5" cy="14" r="1.7" /><Path d="M8 18c0-3 1.8-5 4-5s4 2 4 5c0 2-1.7 3-4 3s-4-1-4-3Z" /></>,
  fruit: <><Path d="M12 8c-5-3-8 1-7 6 1 6 5 8 7 5 2 3 6 1 7-5 1-5-2-9-7-6Z" /><Path d="M12 8c0-3 2-5 5-5M12 7c-2-3-4-3-6-2" /></>,
  food: <><Path d="M5 3v7a3 3 0 0 0 6 0V3M8 3v18M16 3v18M16 3c4 2 4 8 0 10" /></>,
  shuffle: <><Path d="M4 7h3c5 0 5 10 10 10h3" /><Path d="m17 14 3 3-3 3M4 17h3c2 0 3.2-1.5 4.2-3M14 7c1-1 2-2 3-2h3M17 2l3 3-3 3" /></>,
};

/** @param {{name: keyof typeof iconPaths, size?: number, color?: string, strokeWidth?: number}} props */
export default function AppIcon({ name, size = 22, color = '#086B45', strokeWidth = 1.9 }) {
  const { mapColor } = useAppTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={mapColor(color)}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
    >
      {iconPaths[name]}
    </Svg>
  );
}
