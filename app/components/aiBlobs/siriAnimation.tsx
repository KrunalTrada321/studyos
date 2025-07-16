import LottieView from 'lottie-react-native';
import React from 'react';
import { Dimensions, ViewStyle } from 'react-native';

interface SiriLottieProps {
  size?: number;     // Optional size prop (default to 80% of screen width)
  opacity?: number;  // Optional opacity (default to 1)
}

const { width } = Dimensions.get('window');

const SiriLottie: React.FC<SiriLottieProps> = ({ size = width * 0.8, opacity = 1 }) => {
  const animationStyle: ViewStyle = {
    width: size,
    height: size,
    opacity: opacity,
  };

  return (
    <LottieView
      source={require('../../assets/siri-animation.json')}
      autoPlay
      loop
      style={animationStyle}
    />
  );
};

export default SiriLottie;
