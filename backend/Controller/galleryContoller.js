
import galleryimage from "../models/galleryimage.js";

export async function addgalleryimage (req,res ){
     const imageDate = req.body;
     console.log(req.body)
    
        if (!imageDate) {
            return res.status(400).json({
                message: "image data is required"
            });
        }
    
        try {
    
            const newimage = new galleryimage(imageDate);
    
            const savednewimage = await newimage.save();
    
            res.status(201).json({
                message: "image updated successfully",
                image: savednewimage
            });
    
        } catch (error) {
    
            res.status(500).json({
                message: "Failed to create product",
                error: error.message
            });
    
        }
    
}

export async function getimages(req,res) {
    try {

       

        const allimage= await galleryimage.find()

        res.status(200).json({
             allimage
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to get product",
            error: error.message
        });

    }
}
