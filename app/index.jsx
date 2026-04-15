import { Redirect } from 'expo-router';
import { useAuth } from '../components/AuthContext';

export default function Index() {
  const { isLoggedIn } = useAuth();
  
  // If not logged in, redirect to login screen
  // If already logged in, redirect to the dashboard (tabs)
  if (isLoggedIn) {
    return <Redirect href="/(tabs)" />;
  }
  
  return <Redirect href="/login" />;
}
