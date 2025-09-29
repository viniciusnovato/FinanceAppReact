import React from 'react';
import { View, Platform } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';

interface ChartWrapperProps {
  children: React.ReactNode;
  style?: any;
}

// Wrapper que resolve problemas de compatibilidade com React Native Web
const ChartWrapper: React.FC<ChartWrapperProps> = ({ children, style }) => {
  // Para web, removemos propriedades CSS problemáticas que podem causar erros de DOM
  const cleanStyle = Platform.OS === 'web' && style ? (() => {
    const cleaned = { ...style };
    
    // Remove propriedades CSS com hífen que causam erros no React Native Web
    delete cleaned['transform-origin'];
    delete cleaned['background-color'];
    delete cleaned['border-radius'];
    delete cleaned['font-size'];
    delete cleaned['font-weight'];
    delete cleaned['text-align'];
    delete cleaned['margin-top'];
    delete cleaned['margin-bottom'];
    delete cleaned['padding-top'];
    delete cleaned['padding-bottom'];
    
    // Remove propriedades que podem causar problemas no web
    cleaned.transform = undefined;
    cleaned.transformOrigin = undefined;
    
    return cleaned;
  })() : style;

  const webStyle = Platform.OS === 'web' ? {
    overflow: 'hidden',
  } : {};

  return (
    <View style={[cleanStyle, webStyle]}>
      {children}
    </View>
  );
};

interface SafeLineChartProps {
  data: any;
  width: number;
  height: number;
  chartConfig: any;
  bezier?: boolean;
  style?: any;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  withVerticalLines?: boolean;
  withHorizontalLines?: boolean;
  fromZero?: boolean;
}

// LineChart seguro para React Native Web
export const SafeLineChart: React.FC<SafeLineChartProps> = (props) => {
  const { style, ...chartProps } = props;
  
  // Para web, removemos propriedades CSS problemáticas que podem causar erros de DOM
  const cleanStyle = Platform.OS === 'web' && style ? (() => {
    const cleaned = { ...style };
    
    // Remove propriedades CSS com hífen que causam erros no React Native Web
    delete cleaned['transform-origin'];
    delete cleaned['background-color'];
    delete cleaned['border-radius'];
    delete cleaned['font-size'];
    delete cleaned['font-weight'];
    delete cleaned['text-align'];
    delete cleaned['margin-top'];
    delete cleaned['margin-bottom'];
    delete cleaned['padding-top'];
    delete cleaned['padding-bottom'];
    
    // Remove propriedades que podem causar problemas no web
    cleaned.transform = undefined;
    cleaned.transformOrigin = undefined;
    
    return cleaned;
  })() : style;

  return (
    <ChartWrapper style={cleanStyle}>
      <LineChart {...chartProps} style={cleanStyle} />
    </ChartWrapper>
  );
};

interface SafeBarChartProps {
  data: any;
  width: number;
  height: number;
  yAxisLabel: string;
  yAxisSuffix: string;
  chartConfig: any;
  style?: any;
  withInnerLines?: boolean;
  fromZero?: boolean;
  showBarTops?: boolean;
  showValuesOnTopOfBars?: boolean;
}

// BarChart seguro para React Native Web
export const SafeBarChart: React.FC<SafeBarChartProps> = (props) => {
  const { style, ...chartProps } = props;
  
  // Para web, removemos propriedades CSS problemáticas que podem causar erros de DOM
  const cleanStyle = Platform.OS === 'web' && style ? (() => {
    const cleaned = { ...style };
    
    // Remove propriedades CSS com hífen que causam erros no React Native Web
    delete cleaned['transform-origin'];
    delete cleaned['background-color'];
    delete cleaned['border-radius'];
    delete cleaned['font-size'];
    delete cleaned['font-weight'];
    delete cleaned['text-align'];
    delete cleaned['margin-top'];
    delete cleaned['margin-bottom'];
    delete cleaned['padding-top'];
    delete cleaned['padding-bottom'];
    
    // Remove propriedades que podem causar problemas no web
    cleaned.transform = undefined;
    cleaned.transformOrigin = undefined;
    
    return cleaned;
  })() : style;

  return (
    <ChartWrapper style={cleanStyle}>
      <BarChart {...chartProps} style={cleanStyle} />
    </ChartWrapper>
  );
};

export default ChartWrapper;