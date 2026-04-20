import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebaseConfig';
import api from '../api/client';
import { useTheme } from './ThemeContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth_state, setAuthState] = useState(() =>
    JSON.parse(localStorage.getItem('liyamu-auth') || 'null')
  );
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setTheme } = useTheme();

  // Persist platform auth to localStorage
  useEffect(() => {
    if (auth_state) {
      localStorage.setItem('liyamu-auth', JSON.stringify(auth_state));
    } else {
      localStorage.removeItem('liyamu-auth');
    }
  }, [auth_state]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Register with email/password.
   * 1. Creates Firebase Auth user
   * 2. Sends firebaseUid to backend for MongoDB + Firestore doc creation
   */
  const register = async (payload) => {
    setLoading(true);
    try {
      const { name, email, password, role } = payload;

      // Step 1: Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = credential.user;

      // Step 2: Set display name in Firebase
      await updateProfile(fbUser, { displayName: name });

      // Step 3: Register in backend (MongoDB + Firestore user doc)
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        firebaseUid: fbUser.uid,
      });

      setAuthState(data);
      return data;
    } catch (err) {
      // If backend fails, remove the Firebase user to keep them in sync
      if (auth.currentUser) {
        await auth.currentUser.delete().catch(() => {});
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login with email/password.
   * 1. Signs in to Firebase Auth
   * 2. Authenticates with backend (MongoDB password check + JWT)
   */
  const login = async (payload) => {
    setLoading(true);
    try {
      const { email, password } = payload;

      // Step 1: Firebase sign-in
      await signInWithEmailAndPassword(auth, email, password);

      // Step 2: Backend login (existing JWT flow)
      const { data } = await api.post('/auth/login', { email, password });
      setAuthState(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Google OAuth login via Firebase popup.
   * Falls back to backend social-login endpoint.
   */
  const googleLogin = async (role = 'reader') => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      const { data } = await api.post('/auth/social-login', {
        name: fbUser.displayName,
        email: fbUser.email,
        provider: 'google',
        role,
        firebaseUid: fbUser.uid,
      });

      setAuthState(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Legacy social login (keep backward compat with existing AuthPage)
   */
  const socialLogin = async (payload) => {
    const { data } = await api.post('/auth/social-login', payload);
    setAuthState(data);
    return data;
  };

  /**
   * Logout from both Firebase and platform
   */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore sign-out errors
    }
    setAuthState(null);
    setFirebaseUser(null);
  };

  /**
   * Fetch user role from Firestore (useful for real-time role checks)
   */
  const getFirestoreRole = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) return snap.data().role;
    } catch {
      // silently fail if Firestore not available
    }
    return null;
  };

  const value = useMemo(
    () => ({
      auth: auth_state,
      setAuth: setAuthState,
      firebaseUser,
      login,
      register,
      socialLogin,
      googleLogin,
      logout,
      getFirestoreRole,
      loading,
    }),
    [auth_state, firebaseUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
