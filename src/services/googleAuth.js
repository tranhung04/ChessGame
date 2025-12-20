import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Initialize Google Sign-In
 * Call this once when app starts
 */
export const configureGoogleSignIn = (webClientId) => {
  GoogleSignin.configure({
    webClientId: webClientId,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

/**
 * Sign in with Google
 * @returns {Promise<{success: boolean, user?: object, idToken?: string, error?: string}>}
 */
export const googleSignIn = async () => {
  try {
    // Check if device supports Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Sign in
    const userInfo = await GoogleSignin.signIn();
    
    return {
      success: true,
      user: userInfo.user,
      idToken: userInfo.idToken,
      serverAuthCode: userInfo.serverAuthCode,
    };
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    
    let errorMessage = 'Đăng nhập Google thất bại';
    
    if (error.code === 'SIGN_IN_CANCELLED') {
      errorMessage = 'Đăng nhập bị hủy';
    } else if (error.code === 'IN_PROGRESS') {
      errorMessage = 'Đang xử lý đăng nhập';
    } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      errorMessage = 'Google Play Services không khả dụng';
    }
    
    return {
      success: false,
      error: errorMessage,
      errorCode: error.code,
    };
  }
};

/**
 * Sign out from Google
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const googleSignOut = async () => {
  try {
    await GoogleSignin.signOut();
    return { success: true };
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    return { 
      success: false, 
      error: 'Đăng xuất Google thất bại' 
    };
  }
};

/**
 * Check if user is signed in
 * @returns {Promise<boolean>}
 */
export const isSignedIn = async () => {
  try {
    return await GoogleSignin.isSignedIn();
  } catch (error) {
    console.error('Check signed in error:', error);
    return false;
  }
};

/**
 * Get current user info
 * @returns {Promise<object|null>}
 */
export const getCurrentUser = async () => {
  try {
    const userInfo = await GoogleSignin.signInSilently();
    return userInfo;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};
