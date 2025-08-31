
/**
 * @fileOverview Initializes and exports the Firebase Admin SDK instances.
 */
import { getApps, initializeApp, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// This function safely initializes Firebase Admin, ensuring credentials are
// correctly formatted, especially the multi-line private key.
function initializeFirebaseAdmin(): App {
  const existingApp = getApps().find(app => app.name === '[DEFAULT]');
  if (existingApp) {
    return existingApp;
  }

  const hasCreds = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;
  
  try {
    if (hasCreds) {
      console.log('Initializing Firebase Admin with individual environment variables.');
      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY!).replace(/\\n/g, '\n'),
      };
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      throw new Error("Firebase Admin SDK credentials not found in environment variables.");
    }
  } catch (error: any) {
    console.warn(`Firebase Admin SDK initialization failed: ${error.message}. Using placeholder credentials for local development. Server-side Firebase features will not work unless configured.`);
    
    const placeholderAppName = 'placeholder-app';
    const existingPlaceholderApp = getApps().find(app => app.name === placeholderAppName);
    if(existingPlaceholderApp) {
        return existingPlaceholderApp;
    }
    
    // A structurally valid but non-functional key to prevent parsing errors.
    const placeholderServiceAccount = {
      projectId: "demo-toolifyai",
      clientEmail: "demo@example.com",
      privateKey:
        "-----BEGIN PRIVATE KEY-----\n" +
        "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC3E9A/A/x2\n" +
        "1Z2y2c5d+e4o3X1Z5s5s9w3f8Z3e2a3c7A2e3e4e5f6g7h8i9j0k1l2m3n4o5p6q\n" +
        "7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w\n" +
        "9x/y+z/A+B+C+D+E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X+Y+Z/a+b\n" +
        "c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w+x+y+z/1/2/3/4/5/6\n" +
        "78/9/0/A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R+S+T+U+V+W+X+Y+Z\n" +
        "a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q/r+s+t+u+v+w+x/y+z/A+B+C\n" +
        "D+E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X+Y+Z/a/b/c+d+e+f\n" +
        "g+h+i+j+k+l+m+n/o/p+q/r/s+t+u+v/w+x+y+z/1/2/3/4+5+6+7/8\n" +
        "9/0a/b/c/d/e/f/g/h+i/j/k/l/m/n/o/p/q/r/s/t+u/v/w+x+y+z\n" +
        "A/B/C/D/E/F/G/H+I/J/K/L/M/N/O/P/Q/R+S/T+U+V+W+X/Y+Z/a+b\n" +
        "c+d+e+f+g+h+i+j+k/l/m/n/o/p/q/r/s+t+u+v+w+x+y+z+1+2+3\n" +
        "4+5+6+7+8+9+0+A+B+C+D+E+F+G+H+I+J+K+L+M+N/O+P+Q+R+S+T\n" +
        "U+V+W+X+Y+Z/a/b/c/d/e+f+g+h+i+j/k/l+m+n+o+p+q+r+s+t\n" +
        "u+v+w/x+y+z/1+2+3+4+5+6+7+8+9+0/A+B+C+D+E+F+G+H/I+J\n" +
        "K+L+M/N/O+P/Q+R+S+T+U+V+W+X+Y+Z/a+b+c+d+e+f+g+h+i+j\n" +
        "k+l+m+n/o+p+q+r+s+t+u+v+w+x+y+z/1/2+3+4+5+6+7+8+9+0\n" +
        "a+b/c+d+e+f+g+h+i+j+k+l+m+n+o+p+q/r+s+t+u+v+w+x+y+z\n" +
        "A/B+C/D+E/F/G+H+I+J+K/L/M/N/O+P/Q/R/S+T/U+V/W/X/Y+Z\n" +
        "a+b+c/d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t/u+v+w+x+y+z\n" +
        "1+2+3+4/5+6+7+8+9+0+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o/p\n" +
        "q+r+s+t+u+v+w+x+y+z+A+B+C+D+E+F+G+H+I+J+K+L+M+N+O+P\n" +
        "Q+R+S+T+U+V+W+X+Y+Z/a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p\n" +
        "q+r+s+t+u+v/w+x+y+z/1/2+3+4+5+6+7+8/9+0/a+b+c+d+e+f\n" +
        "g+h+i+j+k+l/m+n+o+p+q+r+s+t+u+v+w+x+y/z/a/b/c/d/e\n" +
        "f/g/h/i/j/k/l/m/n/o/p/q/r/s/t+u/v+w+x+y+z+A+B+C+D\n" +
        "E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X+Y+Z/a/b/c\n" +
        "d/e/f+g/h/i+j/k/l/m/n+o/p/q/r/s/t/u/v+w+x/y+z/1/2\n" +
        "3/4/5/6/7/8/9/0+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r\n" +
        "s+t+u+v+w+x+y+z+A/B+C/D+E/F/G+H+I+J/K+L+M+N+O+P+Q+R\n" +
        "S+T+U+V+W/X+Y/Z/a+b/c+d/e+f+g/h+i+j+k/l+m+n+o+p/q+r\n" +
        "s+t+u+v+w+x+y+z+1+2+3+4+5+6+7+8+9+0+a/b/c/d/e/f/g+h\n" +
        "i/j/k/l/m/n/o/p+q/r/s/t+u/v/w/x/y/z/a+b+c+d+e+f/g+h\n" +
        "i+j+k+l+m+n+o/p+q+r+s+t+u+v+w+x+y+z+A+B+C+D+E+F+G+H\n" +
        "I+J+K+L+M+N+O/P+Q+R+S+T+U+V+W+X+Y+Z+a+b+c+d+e+f+g+h\n" +
        "i+j+k+l+m+n/o+p+q+r+s+t+u+v+w+x+y+z+1+2+3+4+5+6+7+8\n" +
        "9+0+A+B+C+D/E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X\n" +
        "Y+Z/a+b+c+d/e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w+x\n" +
        "y+z/1/2/3/4/5+6+7+8+9+0/a+b+c+d+e+f+g+h+i+j+k+l+m+n\n" +
        "o+p+q+r+s/t+u+v+w+x+y+z/A+B+C+D+E+F+G+H+I+J+K+L+M+N\n" +
        "O+P+Q+R+S+T/U+V+W+X+Y+Z/a+b+c+d+e+f+g+h+i+j+k+l+m+n\n" +
        "o+p+q+r+s+t/u+v+w+x+y+z/1/2/3/4+5+6+7+8+9+0/a+b+c\n" +
        "d+e+f+g+h+i+j+k+l+m+n+o+p+q+r/s+t+u+v+w+x+y+z/a+b+c\n" +
        "d+e+f+g/h+i+j/k+l+m+n/o+p+q+r/s+t+u+v/w+x+y+z+1/2+3\n" +
        "4+5+6+7/8+9/0+A/B/C/D/E/F/G/H/I/J/K/L/M/N/O/P/Q/R+S\n" +
        "T/U/V/W/X/Y/Z/a/b/c/d/e/f/g/h/i/j/k/l/m/n/o/p/q+r/s\n" +
        "t/u/v/w/x/y/z+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p/q+r+s\n" +
        "t+u+v+w+x+y+z/a/b/c/d/e/f/g+h+i+j+k/l+m/n+o/p+q/r+s\n" +
        "t+u+v+w+x+y+z+1+2+3+4+5+6+7+8+9/0/A+B+C+D+E+F+G+H+I\n" +
        "J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X/Y+Z/a+b+c+d+e+f+g+h+i\n" +
        "j+k+l+m+n+o+p+q+r+s+t+u+v+w+x/y+z/1+2+3+4+5+6+7+8+9\n" +
        "0/a+b+c+d+e+f+g+h+i+j+k+l/m+n+o+p+q+r+s+t+u+v+w+x+y\n" +
        "z/A+B+C+D+E+F+G+H+I+J+K+L/M+N+O+P+Q+R+S+T+U+V+W+X+Y\n" +
        "Z/a+b+c+d+e+f+g+h+i+j/k+l+m+n+o+p+q+r+s+t+u+v+w+x\n" +
        "y+z/1/2+3+4+5+6+7+8/9+0+a+b+c+d+e+f+g+h+i+j+k+l+m\n" +
        "n+o+p+q+r+s+t+u+v+w+x/y+z/a/b/c/d/e/f/g/h/i/j/k+l\n" +
        "m/n/o/p/q/r/s/t/u/v/w/x/y+z/a/b/c/d/e/f/g/h/i/j+k\n" +
        "l/m/n/o/p/q/r/s/t/u/v+w/x+y+z/A/B/C/D/E/F/G/H/I/J/K\n" +
        "L/M/N/O/P/Q/R/S/T/U/V/W/X/Y/Z/a/b/c/d/e/f/g/h/i/j+k\n" +
        "l+m/n+o+p+q+r+s+t+u+v+w+x+y+z/1+2/3+4/5+6/7+8+9+0/a\n" +
        "b+c+d+e+f+g+h+i+j+k+l+m+n+o/p+q+r+s+t+u+v+w+x+y+z+A\n" +
        "B+C+D+E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X+Y+Z/a\n" +
        "b+c+d+e+f+g+h+i+j+k+l+m+n+o+p/q+r+s+t+u+v+w+x+y+z/1\n" +
        "2+3+4+5+6+7+8+9+0+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q\n" +
        "r+s+t+u+v+w+x+y+z/A+B+C+D+E+F/G+H+I+J+K+L+M+N+O+P+Q\n" +
        "R+S+T+U+V+W+X+Y+Z/a+b+c+d+e+f+g+h+i/j+k+l+m+n+o+p+q\n" +
        "r+s+t+u+v+w+x+y+z/1/2+3+4+5+6+7+8+9+0/a+b+c+d+e+f+g\n" +
        "h+i+j+k+l+m+n+o+p+q+r+s+t+u+v/w+x+y+z/a+b+c+d+e/f+g\n" +
        "h+i+j+k+l+m+n+o+p+q+r+s+t/u+v+w+x+y+z/1/2+3+4+5+6+7\n" +
        "8+9+0+a+b+c+d+e+f+g+h+i+j+k/l+m+n+o+p+q+r+s+t+u+v+w\n" +
        "x+y+z/a+b+c+d+e+f+g+h+i+j+k+l/m+n+o+p+q+r+s+t+u+v+w\n" +
        "x+y+z+1+2+3+4+5+6+7+8+9+0+A+B+C+D+E+F+G+H+I+J+K+L+M\n" +
        "N+O+P+Q+R+S+T+U+V+W+X+Y+Z/a+b+c+d/e+f+g+h+i+j+k+l+m\n" +
        "n+o+p+q+r+s+t+u+v+w+x+y+z/1/2/3+4/5+6+7+8+9+0+a+b+c\n" +
        "d+e+f+g+h+i+j+k+l+m+n+o+p+q/r+s+t+u+v+w+x+y+z/A+B+C\n" +
        "D+E+F+G+H+I+J+K+L+M+N+O+P+Q+R/S+T+U+V+W+X+Y+Z/a+b+c+d\n" +
        "e+f+g+h+i+j+k+l+m+n+o+p/q+r+s+t+u+v+w+x+y+z+1+2+3+4\n" +
        "5+6+7+8+9+0/a+b+c+d+e+f+g+h+i/j+k+l+m+n+o+p+q+r+s+t\n" +
        "t+u+v+w+x+y+z/A+B+C+D+E+F+G+H+I/J+K+L+M+N+O+P+Q+R+S+T\n" +
        "U+V+W+X+Y+Z/a+b+c+d+e+f+g+h+i+j/k+l+m+n+o+p+q+r+s+t\n" +
        "u+v+w+x+y+z/1/2+3+4+5+6+7+8+9/0+a+b+c+d+e+f+g+h+i+j\n" +
        "k+l+m+n+o+p/q+r+s+t+u+v+w+x+y+z/A/B/C/D/E/F/G/H/I/J\n" +
        "K/L/M/N/O/P/Q/R/S/T/U/V/W/X/Y/Z/a/b/c/d/e/f/g/h/i/j\n" +
        "k/l/m/n/o/p+q/r/s/t/u/v/w/x/y+z+a+b+c+d+e+f+g+h+i+j\n" +
        "k+l+m+n+o+p+q/r+s+t+u+v+w+x+y+z+a/b/c/d/e/f/g+h+i+j\n" +
        "k+l+m+n+o+p/q+r+s+t+u+v+w+x+y+z+1+2+3+4+5+6+7+8+9+0\n" +
        "A+B+C+D+E+F+G/H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X+Y+Z\n" +
        "a+b+c+d+e+f+g/h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w+x+y+z\n" +
        "1+2+3+4+5+6+7/8+9+0+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p\n" +
        "q+r+s+t+u+v/w+x+y+z/a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p\n" +
        "q+r+s+t/u+v+w+x+y+z/1/2+3+4+5+6+7+8+9+0/a+b+c+d+e+f\n" +
        "g+h+i+j/k+l+m+n+o+p+q+r+s+t+u+v+w+x+y+z/A+B+C+D+E+F\n" +
        "G+H+I/J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X+Y+Z/a+b+c+d+e+f\n" +
        "g+h/i+j+k+l+m+n+o+p+q+r+s+t+u+v+w+x+y+z/1/2+3+4+5+6\n" +
        "7/8+9+0+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v\n" +
        "w+x+y+z/A+B+C+D+E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W\n" +
        "X+Y+Z/a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u/v+w\n" +
        "x+y+z/1/2+3+4+5+6+7+8+9+0+a+b+c+d+e+f+g+h+i+j/k+l+m\n" +
        "n+o+p+q+r+s+t+u+v+w+x+y+z/a+b+c+d+e+f+g+h+i/j+k+l+m\n" +
        "n+o+p+q+r+s+t+u+v+w+x+y+z+1+2+3+4+5+6+7+8/9+0+a+b+c\n" +
        "d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w/x+y+z/A+B+C\n" +
        "D+E+F+G+H+I+J+K+L+M+N+O+P+Q+R+S+T+U+V+W+X/Y+Z/a+b+c\n" +
        "d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s+t+u+v+w/x+y+z+1+2+3\n" +
        "4+5+6+7+8+9+0+a+b+c+d+e+f+g+h+i+j+k+l+m+n+o+p+q+r+s\n" +
        "t+u+v+w+x+y+z+CAwEAAQ==\n" +
        "-----END PRIVATE KEY-----",
    };
     return initializeApp({
        credential: cert(placeholderServiceAccount),
        projectId: placeholderServiceAccount.projectId,
    }, placeholderAppName);
  }
}

const adminApp: App = initializeFirebaseAdmin();
const adminDb: Firestore = getFirestore(adminApp);

export { adminApp, adminDb };

    