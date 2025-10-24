import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/Prisma";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import { imagekit } from "../../../../packages/libs/imageKit";

// get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(404).json({ message: "Categories not found" });
    }

    res.status(200).json({
      categories: config.categories,
      subCategories: config.subCategories,
    });
  } catch (error) {
    return next(error);
  }
};

// create a discount promo code
export const createPromoCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;
    if (!public_name || !discountType || !discountValue || !discountCode) {
      return next(new ValidationError("Tous les champs sont requis"));
    }

    // verifying if the promo code does exist
    const existingPromoCode = await prisma.code_promo.findUnique({
      where: { discountCode },
    });
    if (existingPromoCode) {
      return next(
        new ValidationError(
          "Ce code promo existe déjà. Veuillez en utiliser un autre."
        )
      );
    }

    // create a discount code or promo-code
    const createDiscountCode = await prisma.code_promo.create({
      data: {
        public_name,
        discountType,
        discountValue: parseFloat(discountValue),
        discountCode,
        sellerId: req.seller.id,
      },
    });
    return res.status(201).json({
      success: true,
      message: "Code promo crée avec succèss",
      createDiscountCode,
    });
  } catch (error) {
    return next(error);
  }
};

// get discount promo code
export const getPromoCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.seller);
    const code_promo = await prisma.code_promo.findMany({
      where: { sellerId: req.seller.id },
    });

    res.status(200).json({
      success: true,
      code_promo,
    });
  } catch (error) {
    return next(error);
  }
};

// delete a discount promo code
export const deletePromoCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    // first check if the promo code exist
    const existingPromoCode = await prisma.code_promo.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });
    if (!existingPromoCode) {
      return next(new ValidationError("Code promo introuvable"));
    }
    if (existingPromoCode.sellerId !== sellerId) {
      return next(new ValidationError("Access no autorisé"));
    }

    await prisma.code_promo.delete({ where: { id } });

    res.status(200).json({
      message: "Code promo supprimer avec succèss",
    });
  } catch (error) {
    return next(error);
  }
};

// upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;

    const response = await imagekit.upload({
      file: fileName,
      fileName: `produit-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      file_url: response.url,
      fileName: response.fileId,
    });
  } catch (error) {
    return next(error);
  }
};

// delete product image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(200).json({
      success: true,
      response,
    });
  } catch (error) {
    return next(error);
  }
};

// create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      tag,
      warranty,
      slug,
      brand,
      category,
      subCategory,
      video_url,
      sizes = [],
      promoCodes = [],
      stock,
      sale_price,
      regular_price,
      images = [],
    } = req.body;

    const requiredFields = [
      "title",
      "short_description",
      "detailed_description",
      "slug",
      "brand",
      "category",
      "subCategory",
      "stock",
      "regular_price",
      "images",
    ];

    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return next(
        new ValidationError(`Champs manquants : ${missingFields.join(", ")}`)
      );
    }

    if (!req.seller.id) {
      return next(
        new AuthError("Seul les vendeur sont authorize a creer un produit")
      );
    }

    //slug checking
    const existingSlug = await prisma.products.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return next(
        new ValidationError(
          "Ce slug existe déjà ! Veuillez en choisir un autre."
        )
      );
    }

    // CReate a new product
    const createNewProduct = await prisma.products.create({
      data: {
        shopId: req.seller?.shop?.id,
        title,
        short_description,
        detailed_description,
        tag: Array.isArray(tag) ? tag : tag.split(","),
        warranty,
        slug,
        brand,
        category,
        subCategory,
        video_url,
        sizes: sizes || [],
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        code_promo: promoCodes.map((codeId: string) => codeId),
        images: {
          create: images
            .filter((img: any) => img && img.fileId && img.file_url)
            .map((img: any) => ({
              file_id: img.fileId,
              url: img.file_url,
            })),
        },
      },
      include: { images: true },
    });

    res.status(201).json({
      success: true,
      createNewProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// get all seller products
export const getBoutiqueProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: { shopId: req?.seller?.shop?.id },
      include: { images: true },
    });

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return next(error);
  }
};

// delete products
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req?.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true },
    });

    if (!product) {
      return next(new ValidationError("Produit non trouvé"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Action non autorisée"));
    }

    // 🔥 Suppression directe du produit
    await prisma.products.delete({
      where: { id: productId },
    });

    return res.status(200).json({
      message: "Produit supprimé avec succès.",
    });
  } catch (error) {
    return next(error);
  }
};
