import React from 'react';

const Mock = ({ children }) => React.createElement('div', null, children);

export const ResponsiveContainer = Mock;
export const BarChart = Mock;
export const LineChart = Mock;
export const PieChart = Mock;
export const RadarChart = Mock;
export const AreaChart = Mock;

export const XAxis = () => null;
export const YAxis = () => null;
export const Tooltip = () => null;
export const Bar = () => null;
export const Line = () => null;
export const Pie = () => null;
export const Cell = () => null;
export const Legend = () => null;
export const Radar = () => null;
export const PolarGrid = () => null;
export const PolarAngleAxis = () => null;
export const PolarRadiusAxis = () => null;
export const CartesianGrid = () => null;
export const Area = () => null;

export default {
  ResponsiveContainer,
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Line,
  Pie,
  Cell,
  Legend,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  Area,
};
