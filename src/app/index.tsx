import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/splash" />;
}
//  LOG  [AxiosError: Request failed with status code 401]
//  ERROR  [Error: Current location is unavailable. Make sure that location services are enabled]