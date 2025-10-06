// JWT verification for Cognito tokens
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const {
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID,
  COGNITO_REGION = 'us-east-2'
} = process.env;

let verifier = null;

function getVerifier() {
  if (!verifier && COGNITO_USER_POOL_ID && COGNITO_CLIENT_ID) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: COGNITO_USER_POOL_ID,
      tokenUse: 'access',
      clientId: COGNITO_CLIENT_ID,
    });
  }
  return verifier;
}

export async function extractAndVerifyToken(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', statusCode: 401 };
  }

  const token = authHeader.substring(7);
  const v = getVerifier();
  if (!v) {
    console.warn('[WARN] Cognito verification disabled - missing env vars');
    return { user: { sub: 'anonymous' } }; // fallback for dev
  }

  try {
    const payload = await v.verify(token);
    return { user: payload };
  } catch (err) {
    console.error('[AUTH] Token verification failed:', err.message);
    return { error: 'Invalid or expired token', statusCode: 401 };
  }
}
