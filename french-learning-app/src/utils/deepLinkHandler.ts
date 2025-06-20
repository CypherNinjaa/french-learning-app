// Deep link handler for email verification and password reset
import * as Linking from 'expo-linking';
import { NavigationContainerRef } from '@react-navigation/native';

export class DeepLinkHandler {
  private navigationRef: NavigationContainerRef<any> | null = null;

  setNavigationRef(ref: NavigationContainerRef<any>) {
    this.navigationRef = ref;
  }
  initialize() {
    // Handle app opened from deep link
    Linking.getInitialURL().then((url: string | null) => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle deep links when app is already open
    const subscription = Linking.addEventListener('url', ({ url }: { url: string }) => {
      this.handleDeepLink(url);
    });

    return subscription;
  }

  private handleDeepLink(url: string) {
    console.log('📱 Deep link received:', url);

    if (!this.navigationRef) {
      console.warn('Navigation ref not set');
      return;
    }

    const parsedUrl = Linking.parse(url);
    const { hostname, path, queryParams } = parsedUrl;

    console.log('📱 Parsed URL:', { hostname, path, queryParams });

    switch (hostname) {
      case 'email-verification':
        this.handleEmailVerification(queryParams);
        break;
      case 'reset-password':
        this.handlePasswordReset(queryParams);
        break;
      default:
        console.log('📱 Unhandled deep link:', hostname);
    }
  }
  private handleEmailVerification(params: any) {
    console.log('✅ Handling email verification:', params);
    
    // Navigate to email verification screen with token and type
    this.navigationRef?.navigate('EmailVerification', {
      token: params.token,
      type: params.type
    });
  }

  private handlePasswordReset(params: any) {
    console.log('🔐 Handling password reset:', params);
    
    // Navigate to reset password screen with token and type
    this.navigationRef?.navigate('ResetPassword', {
      token: params.token,
      type: params.type
    });
  }
}

export const deepLinkHandler = new DeepLinkHandler();
