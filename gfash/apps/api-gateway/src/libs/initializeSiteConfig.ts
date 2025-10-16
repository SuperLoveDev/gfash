import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const initializeSiteConfig = async () => {
  try {
    const existingConfig = await prisma.site_config.findFirst();
    if (!existingConfig) {
      await prisma.site_config.create({
        data: {
          categories: [
            "Electronics",
            "Fashion",
            "Maison & Cuisine",
            "Sport & Fitness",
          ],
          subCategories: {
            Electronics: ["Mobiles", "Laptops", "Accessoires", "Gaming"],
            Fashion: ["Hommes", "Femmes", "kids", "Footwear"],
            "Maison & Cuisine": [
              "Decors",
              "Meubles",
              "Appareils électroménagers",
            ],
            "Sport & Fitness": [
              "Équipement de gym",
              "Sports de plein air",
              "Objets connectés ",
            ],
          },
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
};

export default initializeSiteConfig;
