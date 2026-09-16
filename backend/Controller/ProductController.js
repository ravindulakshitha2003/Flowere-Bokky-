import Product from "../models/product.js";

export async function createProduct(req, res) {

    const product = req.body;

    if (!product) {
        return res.status(400).json({
            message: "Product data is required"
        });
    }

    try {

        const newProduct = new Product(product);

        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: "Product created successfully",
            product: savedProduct
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });

    }
}

export async function getproduct(req,res) {
    try {

       

        const allproduct = await Product.find()

        res.status(200).json({
             allproduct
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to get product",
            error: error.message
        });

    }
}



export async function getProductById(req,res){
    try{
        const product = await Product.findOne({
            id : req.params.productId
        })
        if(product == null){
            res.status(404).json({
                message : "Product not found"
            })
        }else{
            console.log(product);
            res.status(200).json({
               product
            })

        }
    }catch(error){
        res.status(500).json({
            message: "Error fetching product",
        });
    }
}