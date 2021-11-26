const requireUser = (req, res, next) => {
    try {
        if (req.user) {
            next();
        } else {
            res.sendStatus(409);
            next();
        }
    } catch (error) {
        next (error);
    };    
};

module.exports = {
    requireUser
};