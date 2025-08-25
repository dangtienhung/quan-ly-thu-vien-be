-- Migration: Thêm indexes cho bảng images để tối ưu performance
-- Date: 2024-01-01
-- Description: Thêm các index cần thiết cho bảng images

-- Index cho slug (đã có unique constraint, nhưng thêm index để tối ưu query)
CREATE INDEX IF NOT EXISTS images_slug_idx ON images (slug);

-- Index cho fileName (đã có unique constraint, nhưng thêm index để tối ưu query)
CREATE INDEX IF NOT EXISTS images_file_name_idx ON images (file_name);

-- Index cho created_at để tối ưu query theo thời gian
CREATE INDEX IF NOT EXISTS images_created_at_idx ON images (created_at);

-- Index cho cloudinary_public_id để tối ưu query
CREATE INDEX IF NOT EXISTS images_cloudinary_public_id_idx ON images (cloudinary_public_id);

-- Index cho mime_type để tối ưu query theo loại file
CREATE INDEX IF NOT EXISTS images_mime_type_idx ON images (mime_type);

-- Index cho file_size để tối ưu query theo kích thước
CREATE INDEX IF NOT EXISTS images_file_size_idx ON images (file_size);

-- Composite index cho slug và created_at để tối ưu query kết hợp
CREATE INDEX IF NOT EXISTS images_slug_created_at_idx ON images (slug, created_at);

-- Composite index cho file_name và created_at để tối ưu query kết hợp
CREATE INDEX IF NOT EXISTS images_file_name_created_at_idx ON images (file_name, created_at);

-- Log migration
INSERT INTO
    migrations (name, executed_at)
VALUES ('add_images_indexes', NOW());