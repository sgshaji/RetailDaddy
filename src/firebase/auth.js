import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, firestore } from './config';

/**
 * Register a new user. The first user who signs up to a shop becomes the admin.
 */
export async function registerUser(email, password, displayName, shopId) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName });

  // Check if shop already exists
  const shopRef = doc(firestore, 'shops', shopId);
  const shopSnap = await getDoc(shopRef);

  let role = 'staff';

  if (!shopSnap.exists()) {
    // First user for this shop becomes admin
    role = 'admin';
    await setDoc(shopRef, {
      name: shopId,
      createdBy: user.uid,
      createdAt: serverTimestamp()
    });
  }

  // Create user profile document
  await setDoc(doc(firestore, 'users', user.uid), {
    email,
    displayName,
    shopId,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return { user, role, shopId };
}

/**
 * Sign in an existing user
 */
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const userProfile = await getUserProfile(userCredential.user.uid);
  return { user: userCredential.user, ...userProfile };
}

/**
 * Sign out the current user
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Get user profile from Firestore
 */
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(firestore, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
}

/**
 * Update a user's role (admin only)
 */
export async function updateUserRole(uid, newRole) {
  await setDoc(doc(firestore, 'users', uid), {
    role: newRole,
    updatedAt: serverTimestamp()
  }, { merge: true });
}
