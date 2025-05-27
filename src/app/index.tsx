import { Platform, StatusBar, useColorScheme } from 'react-native';
import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';

export default function Index() {
  const colorScheme = useColorScheme();
  const backgroundColor = colorScheme === 'dark' ? '#1a1a1a' : '#D9D9D9';

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(backgroundColor).catch(console.warn);

    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(backgroundColor).catch(console.warn);
      NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark').catch(console.warn);
    }
  }, [backgroundColor, colorScheme]);

  return (
    <>
      <StatusBar
        backgroundColor={backgroundColor}
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Redirect href="/splash" />
    </>
  );
}
