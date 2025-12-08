// middleware/authMiddleware.js
import { verifySessionAndRole } from "@/libs/functions";

/**
 * Role-based API route protection middleware
 * @param {string} [requiredRole] - Role required to access the route
 * @returns {Function} - Middleware function
 */
export function withAuth(requiredRole) {
  return async (req) => {
    try {
      const { user } = await verifySessionAndRole(req, requiredRole);
      
      // Attach user to request for downstream handlers
      req.user = user;
      
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error.message,
          status: error.message.includes("Unauthorized") ? 403 : 401
        }),
        { 
          status: error.message.includes("Unauthorized") ? 403 : 401 
        }
      );
    }
  };
}