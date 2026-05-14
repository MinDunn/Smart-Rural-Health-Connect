import { Stack } from "expo-router";
import "./globals.css";
import "./../i18n/index";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
