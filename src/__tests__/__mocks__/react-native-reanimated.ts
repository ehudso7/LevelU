export default {
  useSharedValue: (initial: any) => ({ value: initial }),
  useAnimatedStyle: (fn: any) => fn(),
  withTiming: (v: any) => v,
  withSpring: (v: any) => v,
};
