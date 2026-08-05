function authorization(req, res, next) {
    let token = 123;
    let isAuthorized = token === 123;

    if (!isAuthorized) {
        return res.status(401).send({
            message: "NOT AUTHORIZED"
        });
    }

    next();
}

module.exports = authorization;