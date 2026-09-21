import { supabaseAdmin } from '../config/supabase.js';

/**
 * Supabase JWT Authentication Middleware.
 * Extracts token from Authorization header and verifies with Supabase Auth.
 * Injects req.user and req.token upon successful verification.
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    // Support demo mode tokens seamlessly during testing/demo sessions
    if (token === 'demo-token' || token.startsWith('demo-')) {
      req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'demo@koko.ai' };
      req.token = token;
      return next();
    }

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error?.message || 'Authentication required',
        },
      });
    }

    // Attach verified user and token to request object
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }
}
