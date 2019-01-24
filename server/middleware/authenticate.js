const { User } = require('./../models/user')

const authenticate = (req, res, next) => {
    const token = req.header('x-auth');
    User.findByToken(token).then((user) => {
        console.log("user found:", user);
        if (!user) {
            return Promise.reject("User not found");
        }
        
        req.user = user; //setting user in the request
        req.token = token;
        console.log("user: ", req.user);
        next();
    }).catch((e) => {
        console.log("error:", e);
        res.status(401).send(e);
    });
};

module.exports = { authenticate };