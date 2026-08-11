const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productName: {
            type: String,
            minLength: 2,
            maxLength: 128,
            required: true,
            trim: true,    
        },
        description: {
            type: String,
            minLength: 2,
            maxLength: 128,
            required: true,
            trim: true,    
        }, 
        price: {
            type: Number,
            min: 0,
            required: true,
            trim: true,   
        },
        category: {
            type: String,
            minLength: 2,
            maxLength: 128,
            enum: ["Electronics", "Clothing", "Beauty proucts", "Cleaning Products", "Kitchen Products"],
            required: true,
            trim: true,    
        },
        SKU: {
            type: Number,
            required: true,
            trim: true,  
            unique: true,  
        },
    },
    {
        timestamps: true,
        strict: true
    }
);

productSchema.index({category:1});

const ProductModel = mongoose.model("Products", productSchema);

module.exports = ProductModel;