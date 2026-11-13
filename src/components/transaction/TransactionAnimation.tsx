import { styles } from './TransactionAnimation.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, View } from 'react-native';

export function TransactionAnimation({ label, complete = false }: { label: string; complete?: boolean }) {
  const { colors } = useTheme();
  const [progress] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(true);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduceMotion(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    progress.setValue(0);
    if (reduceMotion) return;
    const animation = complete
      ? Animated.timing(progress, { toValue: 1, duration: 450, useNativeDriver: true })
      : Animated.loop(Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 700, useNativeDriver: true, isInteraction: false }),
        Animated.timing(progress, { toValue: 0, duration: 700, useNativeDriver: true, isInteraction: false }),
      ]));
    animation.start();
    return () => animation.stop();
  }, [complete, progress, reduceMotion]);
  return <View accessibilityLiveRegion="polite" style={styles.container}>
    <Animated.View style={styles.bubble(colors, reduceMotion, progress)}>
      <Text style={styles.symbol(colors)}>{complete ? '\u2713' : '\u20B9'}</Text>
    </Animated.View>
    <Text style={styles.title(colors)}>{label}</Text>
    {!complete && <Text style={styles.hint(colors)}>Waiting for confirmation. Please do not submit again.</Text>}
  </View>;
}
