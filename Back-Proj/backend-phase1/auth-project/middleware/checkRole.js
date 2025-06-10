const checkRole = (requiredRole) => {
    return (req, res, next) => {
        // Check if user object exists
        if (!req.user) {
            return res.status(401).json({message: "Authentication required."});
        }
        console.log("User role ", req.user.role);
        console.log("Required role ", requiredRole);
        // Check if role matches the required role
        if(req.user.role !== requiredRole) {
            return res.status(403).json({
                message: "You are not authorized to access this resource",
                userRole: req.user.role,
                requiredRole: requiredRole
            });
        }
        next();
    }
}

module.exports = { checkRole };