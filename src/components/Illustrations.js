import { useId } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop, Text } from 'react-native-svg';

import useFontStatus from '../hooks/useFontStatus';
import useAppTheme from '../hooks/useAppTheme';

export function GameLogo({ size = 48 }) {
  const gradientId = `logo-${useId().replace(/:/g, '')}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 52 52" accessible={false}>
      <Defs>
        <LinearGradient id={gradientId} x1="8" y1="5" x2="44" y2="47">
          <Stop stopColor="#43B85A" />
          <Stop offset="1" stopColor="#176B36" />
        </LinearGradient>
      </Defs>
      <Rect x="2" y="2" width="48" height="48" rx="16" fill={`url(#${gradientId})`} />
      <Path d="M14 38h24M18 38V13h15M33 13v7" fill="none" stroke="white" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="33" cy="25" r="5" fill="none" stroke="#DDF5DF" strokeWidth="2.8" />
      <Path d="M33 30v7m0-4-4 3m4-3 4 3" fill="none" stroke="#DDF5DF" strokeWidth="2.8" strokeLinecap="round" />
      <Circle cx="14" cy="13" r="2.2" fill="#F7D34A" />
    </Svg>
  );
}

/** @param {{width?: number | string, height?: number}} props */
export function PremiumGameArt({ width = '100%', height = 220 }) {
  const { loaded } = useFontStatus();
  const { dark } = useAppTheme();
  const id = useId().replace(/:/g, '');
  const skyId = `sky-${id}`;
  const woodId = `wood-${id}`;

  return (
    <Svg width={width} height={height} viewBox="0 0 340 208" accessible={false}>
      <Defs>
        <LinearGradient id={skyId} x1="60" y1="10" x2="260" y2="190">
          <Stop stopColor={dark ? '#274B35' : '#F1FFF1'} />
          <Stop offset="1" stopColor={dark ? '#3E6846' : '#B7E2BB'} />
        </LinearGradient>
        <LinearGradient id={woodId} x1="0" y1="0" x2="1" y2="1">
          <Stop stopColor="#9A724B" />
          <Stop offset="1" stopColor="#68462F" />
        </LinearGradient>
      </Defs>
      <Path d="M23 170c27-42 55-50 84-25 26-52 78-64 112-18 28-22 62-7 89 43H23Z" fill={`url(#${skyId})`} />
      <Path d="M18 171c31-14 52-11 72 2 31-27 74-30 104-2 35-21 73-18 128 7" fill="none" stroke="#82C88A" strokeWidth="3" strokeLinecap="round" />
      <G opacity=".48" fill="none" stroke="#65B46F" strokeWidth="1.5">
        <Path d="M271 43c15 8 23 22 24 40M277 58c9-2 16-6 20-12M286 72c-8-2-14-6-18-12" />
        <Path d="M49 75c8-15 20-24 36-27M62 61c-1-7-3-12-8-17M72 54c5 1 11 0 17-4" />
      </G>
      <Ellipse cx="174" cy="182" rx="108" ry="13" fill="#217B3A" opacity=".12" />
      {/* Soft shadow approximation: native paths replace the web SVG blur filter. */}
      {[28, 22, 16].map(strokeWidth => (
        <G key={strokeWidth} transform="translate(0 6)" fill="none" stroke="#175E2A" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" opacity=".022">
          <Path d="M83 170V37h112M83 68l31-31M195 37v28M66 171h51" />
          <Circle cx="195" cy="86" r="20" />
          <Path d="M195 106v43m0-31-23 18m23-18 23 18m-23 13-19 27m19-27 19 27" />
        </G>
      ))}
      <Path d="M83 170V37h112M83 68l31-31M195 37v28" fill="none" stroke={`url(#${woodId})`} strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M66 171h51" stroke="#68462F" strokeWidth="11" strokeLinecap="round" />
      <Path d="M195 37v30" stroke="#31563B" strokeWidth="3" strokeLinecap="round" />
      <G transform="translate(195 86)">
        <Circle r="20" fill="#FFFDF6" stroke="#246F38" strokeWidth="4" />
        <Path d="M-7-3h3m8 0h3M-8 8c5 4 11 4 16 0" fill="none" stroke="#246F38" strokeWidth="2.4" strokeLinecap="round" />
        <Path d="M0 20v43M0 32l-23 18M0 32l23 18M0 63l-19 27M0 63l19 27" fill="none" stroke={dark ? '#8ADD93' : '#246F38'} strokeWidth="5" strokeLinecap="round" />
        <Path d="M-15-18c9-8 22-5 29 2" fill="none" stroke="#F7D34A" strokeWidth="5" strokeLinecap="round" />
      </G>
      <G transform="translate(247 104) rotate(7)">
        {[8, 5, 2].map(spread => (
          <Rect key={spread} x={-spread / 2} y={5 - spread / 2} width={59 + spread} height={48 + spread} rx={14 + spread / 2} fill="#175E2A" opacity=".022" />
        ))}
        <Rect width="59" height="48" rx="14" fill="white" />
        <Path d="M0 31h59" stroke="#F4CE38" strokeWidth="4" />
        <Path d="M0 38h59" stroke="#2E77B7" strokeWidth="4" />
        <Path d="M0 45h59" stroke="#C94747" strokeWidth="4" />
        <Text x="29.5" y="25" textAnchor="middle" fill="#26783C" fontFamily={loaded ? 'Manrope_800ExtraBold' : undefined} fontSize="18">A?</Text>
      </G>
      <Path d="M36 166c3-20 14-33 33-38-1 19-12 32-33 38Zm270 7c-2-18-12-30-29-35 1 18 10 30 29 35Z" fill="#5AB867" />
      <Path d="M36 166c12-12 21-21 33-38m237 45c-8-13-18-25-29-35" fill="none" stroke="#27793C" strokeWidth="2" />
    </Svg>
  );
}

/** This is a presentation component; it does not calculate attempts or game results. */
export function GameHangman({ errors = 0, width = 210, height = 185 }) {
  const { dark } = useAppTheme();
  return (
    <Svg width={width} height={height} viewBox="0 0 220 190" accessible={false}>
      <G fill="none" stroke={dark ? '#8ADD93' : '#126C43'} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M28 176h165M54 176V18h102M54 50l32-32M156 18v36" stroke={dark ? '#C99B72' : '#765238'} strokeWidth="9" />
        {errors >= 1 && <Circle cx="156" cy="72" r="19" />}
        {errors >= 2 && <Path d="M156 91v45" />}
        {errors >= 3 && <Path d="m156 104-27 20" />}
        {errors >= 4 && <Path d="m156 104 27 20" />}
        {errors >= 5 && <Path d="m156 136-22 32" />}
        {errors >= 6 && <Path d="m156 136 22 32" />}
        {errors > 0 && <Path d="M149 69h2m10 0h2m-12 10c4-3 8-3 12 0" stroke="#D05050" strokeWidth="2.4" />}
        <Path d="M19 177c34-8 63-7 88 0 30-10 61-9 94 1" stroke="#71BE87" strokeWidth="3" />
      </G>
    </Svg>
  );
}

export function VictoryConfetti() {
  return (
    <Svg width="100%" height={215} viewBox="0 0 390 215" accessible={false}>
      <Rect x="35" y="75" width="7" height="13" rx="2" fill="#4CAF50" rotation="25" origin="38.5,81.5" />
      <Rect x="344" y="105" width="7" height="13" rx="2" fill="#F2BE45" rotation="-20" origin="347.5,111.5" />
      <Rect x="75" y="180" width="7" height="13" rx="2" fill="#A5D6A7" />
      <Rect x="301" y="52" width="7" height="13" rx="2" fill="#2E7D32" />
      <Rect x="112" y="40" width="7" height="13" rx="2" fill="#F2BE45" rotation="50" origin="115.5,46.5" />
      <Rect x="263" y="195" width="7" height="13" rx="2" fill="#4CAF50" rotation="50" origin="266.5,201.5" />
    </Svg>
  );
}
