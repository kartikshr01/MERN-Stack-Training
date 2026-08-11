const Authorization = () => {
    return (req,res,next) => {
        if(!role.includes(req.user.role)){
            res.status(401).send({message: "You are not authorized."});
        }
        next();
    }
}

module.exports= Authorization;