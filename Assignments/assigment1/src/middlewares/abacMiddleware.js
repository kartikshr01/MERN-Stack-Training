const policies = require("../config/policies");
const { ProductModel } = require("../model");

const loadProduct = async (req,res,next) => {
    const productData = await ProductModel.findById(req.param.id);

    if(!productData){
        return res.send("product not found");
    };
    res.product = productData;
    next();
}

const abacMiddleware = (action) => (req,res,next) => {
    const rules = policies[action];
    if(!rules){
        return res.status(400).json({
            message: "Action policy not found"
        });
    }
    const attributesObject = {
        user: req.user,
        product: req.product
    };
    
}