-- CreateTable
CREATE TABLE `catalog_categories` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `headline` TEXT NULL,
    `description` TEXT NULL,
    `hero_image` VARCHAR(191) NULL,
    `hero_alt` VARCHAR(191) NULL,
    `seo_title` VARCHAR(191) NULL,
    `seo_description` VARCHAR(191) NULL,
    `position` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `catalog_categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_highlights` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `category_id` VARCHAR(191) NOT NULL,
    `text` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `category_highlights_category_id_idx`(`category_id`),
    CONSTRAINT `category_highlights_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `summary` TEXT NULL,
    `description` TEXT NULL,
    `designer` VARCHAR(191) NULL,
    `dimensions` VARCHAR(191) NULL,
    `light_source` VARCHAR(191) NULL,
    `lead_time` VARCHAR(191) NULL,
    `warranty` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `products_slug_key`(`slug`),
    INDEX `products_category_id_idx`(`category_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `catalog_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_media` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(191) NOT NULL,
    `position` INT NOT NULL,
    `src` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    UNIQUE INDEX `product_media_product_id_position_key`(`product_id`, `position`),
    INDEX `product_media_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `product_media_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_materials` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    INDEX `product_materials_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `product_materials_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_finish_options` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    INDEX `product_finish_options_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `product_finish_options_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_customizations` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    INDEX `product_customizations_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `product_customizations_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_assets` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `product_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    INDEX `product_assets_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`),
    CONSTRAINT `product_assets_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `admin_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
