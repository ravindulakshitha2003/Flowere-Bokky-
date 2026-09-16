import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    id: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    type: {
        type: String,
        required: true
    },

    description: {
        type: String
    },

    colors: {
        type: [String]
    },

    rating: {
        type: Number,
        default: 0
    },

    reviewCount: {
        type: Number,
        default: 0
    },

    occasions: {
        type: [String]
    },

    quality: {
        type: String
    },

    weight: {
        type: String
    },

    packingMaterial: {
        type: String
    },

    packingCost: {
        type: Number
    },

    wrappingOptions: {
        type: [String]
    },

    isOffer: {
        type: Boolean,
        default: false
    },

    offerDiscount: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    images: {
        type: [String]
    },

    flowers: {
        type: [String]
    },

    dimensions: {
        height: String,
        width: String
    },
     sizes: {
        S: {
            flowers: {
                type: Number
            },
            price: {
                type: Number
            },
            stock: {
                type: Number
            }
        },

        M: {
            flowers: {
                type: Number
            },
            price: {
                type: Number
            },
            stock: {
                type: Number
            }
        },

        L: {
            flowers: {
                type: Number
            },
            price: {
                type: Number
            },
            stock: {
                type: Number
            }
        }
    }

});

const Product =  mongoose.model("product",productSchema)

export default Product;