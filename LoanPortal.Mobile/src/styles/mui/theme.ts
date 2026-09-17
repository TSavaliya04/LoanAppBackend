import { Roboto } from "next/font/google";
import { createTheme } from "@mui/material/styles";
import localFont from "next/font/local";

export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

const Gilroy = localFont({
  src: [
    { path: '../../../public/fonts/Gilroy-Black.ttf', weight: '900', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-BlackItalic.ttf', weight: '900', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-Bold.ttf', weight: '700', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-BoldItalic.ttf', weight: '700', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-ExtraBold.ttf', weight: '800', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-ExtraBoldItalic.ttf', weight: '800', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-Heavy.ttf', weight: '900', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-HeavyItalic.ttf', weight: '900', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-Light.ttf', weight: '300', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-LightItalic.ttf', weight: '300', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-MediumItalic.ttf', weight: '500', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-RegularItalic.ttf', weight: '400', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-SemiBoldItalic.ttf', weight: '600', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-Thin.ttf', weight: '100', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-ThinItalic.ttf', weight: '100', style: 'italic' },
    { path: '../../../public/fonts/Gilroy-UltraLight.ttf', weight: '200', style: 'normal' },
    { path: '../../../public/fonts/Gilroy-UltraLightItalic.ttf', weight: '200', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-gilroy',
});

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#7444F5", // Grape Purple
    },
    secondary: {
      main: "#FDE9C9", // Grape Purple
    },
    text: {
      primary: "#1E1E1E", // Slate Black
      secondary: "#1E1E1E80", // Pepper Black
    },
    background: {
      default: "#FFEECC", // Brioche Beige
      paper: "#FFFFFF", // White
    },
    error: {
      main: "#FC3A27", // Tomato Red
    },
    action: {
      hover: "#DCDCDC", // Smoke Grey
      selected: "#F0F0F0",
    },
    common: {
      black: "#0E0E0E", // Slate Black
      white: "#FFFFFF", // White
    },
  },
  typography: {
    fontFamily: [Gilroy.style.fontFamily, roboto.style.fontFamily].join(","),
    body1: { fontWeight: "500" },
    subtitle1: { fontSize: "12px", color: "#414141", lineHeight: "16px" },
    subtitle2: { fontSize: "16px", color: "#414141", fontWeight: "bold" },
  },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: "rgba(32, 38, 58, 0.72)",
        },
      },
      variants: [
        {
          props: { variant: "body2" },
          style: { color: "#118AE0", fontSize: "14px", fontWeight: "400" },
        },
      ],
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
      variants: [
        {
          props: { variant: "contained" },
          style: { color: "#fff", fontSize: "14px", fontWeight: "400", textTransform: 'none', },
        },
      ],
    },
    MuiAvatar: {
      variants: [
        {
          props: { variant: "rounded" },
          style: { borderRadius: 8 },
        },
      ],
    },
    MuiAlert: {
      variants: [
        {
          props: { severity: "success" },
          style: {
            color: "white",
            backgroundColor: "#21BE5A",
          },
        },
        {
          props: { severity: "error" },
          style: {
            color: "white",
            backgroundColor: "#F44336",
          },
        },
      ],
    },
  },
});

export default theme;
