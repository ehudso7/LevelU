import React from 'react';

const View = (props: any) => React.createElement('View', props);
const Text = (props: any) => React.createElement('Text', props);
const TouchableOpacity = (props: any) => React.createElement('TouchableOpacity', props);
const Pressable = (props: any) => React.createElement('Pressable', props);
const TextInput = (props: any) => React.createElement('TextInput', props);
const ScrollView = (props: any) => React.createElement('ScrollView', props);
const FlatList = (props: any) => React.createElement('FlatList', props);
const ActivityIndicator = (props: any) => React.createElement('ActivityIndicator', props);
const Image = (props: any) => React.createElement('Image', props);
const RefreshControl = (props: any) => React.createElement('RefreshControl', props);
const StyleSheet = {
  create: (styles: any) => styles,
  flatten: (style: any) => style,
};
const Platform = { OS: 'ios', select: (obj: any) => obj.ios ?? obj.default };
const Dimensions = { get: () => ({ width: 375, height: 812 }) };
const Animated = {
  View,
  Text,
  Value: class { constructor(v: number) {} },
  timing: () => ({ start: (cb?: any) => cb?.() }),
  spring: () => ({ start: (cb?: any) => cb?.() }),
  parallel: (anims: any[]) => ({ start: (cb?: any) => cb?.() }),
  sequence: (anims: any[]) => ({ start: (cb?: any) => cb?.() }),
};
const Alert = { alert: () => {} };
const Linking = { openURL: () => Promise.resolve() };
const Keyboard = { dismiss: () => {} };

export {
  View, Text, TouchableOpacity, Pressable, TextInput, ScrollView, FlatList,
  ActivityIndicator, Image, RefreshControl, StyleSheet, Platform, Dimensions,
  Animated, Alert, Linking, Keyboard,
};

export default {
  View, Text, TouchableOpacity, Pressable, TextInput, ScrollView, FlatList,
  ActivityIndicator, Image, RefreshControl, StyleSheet, Platform, Dimensions,
  Animated, Alert, Linking, Keyboard,
};
