const Shade = require("../models/shades");
const { uniqueSlug } = require("../config/slug");
const { toImages } = require("../config/uploadCloud");
const { destroyAssets } = require("../config/cloudinary");
const { deleteShadeById } = require("../config/cascade");

class ShadeController {
  // GET /api/shades/by-product/:productId
  async getByProduct(req, res) {
    try {
      const shades = await Shade.find({ product: req.params.productId }).sort({
        _id: 1,
      });
      return res.json({ shades });
    } catch (err) {
      return res.status(500).json({ error: "Failed to load shades" });
    }
  }

  // POST /api/shades (admin, images[])
  async create(req, res) {
    try {
      const { product, name, price, mrp, description, status } = req.body;
      const images = toImages(req.files);
      if (!product || !name || price === undefined) {
        await destroyAssets(images.map((i) => i.publicId));
        return res
          .status(400)
          .json({ error: "Product, name and price are required" });
      }
      const slug = await uniqueSlug(Shade, name);
      const shade = await Shade.create({
        product,
        name,
        slug,
        price,
        mrp,
        description,
        status,
        images,
      });
      return res.json({ success: "Shade created", shade });
    } catch (err) {
      if (req.files) await destroyAssets(req.files.map((f) => f.filename));
      return res.status(500).json({ error: "Failed to create shade" });
    }
  }

  // PUT /api/shades/:id (admin) -> updates fields, appends any new images
  async update(req, res) {
    try {
      const { name, price, mrp, description, status } = req.body;
      const shade = await Shade.findById(req.params.id);
      if (!shade) {
        if (req.files) await destroyAssets(req.files.map((f) => f.filename));
        return res.status(404).json({ error: "Shade not found" });
      }
      if (name && name !== shade.name) {
        shade.name = name;
        shade.slug = await uniqueSlug(Shade, name, shade._id);
      }
      if (price !== undefined) shade.price = price;
      if (mrp !== undefined) shade.mrp = mrp;
      if (description !== undefined) shade.description = description;
      if (status !== undefined) shade.status = status;
      if (req.files && req.files.length) shade.images.push(...toImages(req.files));
      await shade.save();
      return res.json({ success: "Shade updated", shade });
    } catch (err) {
      if (req.files) await destroyAssets(req.files.map((f) => f.filename));
      return res.status(500).json({ error: "Failed to update shade" });
    }
  }

  // DELETE /api/shades/:id/image  body: { publicId }
  async removeImage(req, res) {
    try {
      const { publicId } = req.body;
      const shade = await Shade.findById(req.params.id);
      if (!shade) return res.status(404).json({ error: "Shade not found" });
      shade.images = shade.images.filter((i) => i.publicId !== publicId);
      await shade.save();
      await destroyAssets(publicId);
      return res.json({ success: "Image removed", shade });
    } catch (err) {
      return res.status(500).json({ error: "Failed to remove image" });
    }
  }

  // DELETE /api/shades/:id (admin) -> cascades images + reviews
  async remove(req, res) {
    try {
      const exists = await Shade.exists({ _id: req.params.id });
      if (!exists) return res.status(404).json({ error: "Shade not found" });
      await deleteShadeById(req.params.id);
      return res.json({ success: "Shade deleted" });
    } catch (err) {
      return res.status(500).json({ error: "Failed to delete shade" });
    }
  }
}

module.exports = new ShadeController();
