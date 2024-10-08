const jwt = require("jsonwebtoken");
const JWT_SECREAT = "ilovemia";

function auth(req,res,next) {
    const { token } = req.headers;
    try {
        const decoded = jwt.verify(token,JWT_SECREAT);
        if(decoded){
            req.userId = decoded.id;
            next();
        }
    } catch (error) {
        return res.status(403).json({msg : "Invalid Session, Please login"});
    }
}


module.exports = {
    auth,
    JWT_SECREAT
}