-- Migration: Create Reading History Tables
-- Description: Tạo bảng để theo dõi lịch sử đọc sách ebook của người dùng
-- Date: 2024-01-01

-- Tạo bảng reading_history (lịch sử đọc tổng quan)
CREATE TABLE IF NOT EXISTS reading_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reader_id UUID NOT NULL,
    book_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'reading' CHECK (status IN ('reading', 'completed', 'paused', 'abandoned')),
    current_page INTEGER NOT NULL DEFAULT 1 CHECK (current_page > 0),
    total_reading_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (total_reading_time_seconds >= 0),
    last_read_at TIMESTAMP,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Foreign key constraints
CONSTRAINT fk_reading_history_reader FOREIGN KEY (reader_id) REFERENCES readers (id) ON DELETE CASCADE,
CONSTRAINT fk_reading_history_book FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,

-- Unique constraint: một reader chỉ có một lịch sử đọc cho một book
CONSTRAINT uk_reading_history_reader_book UNIQUE (reader_id, book_id)
);

-- Tạo bảng reading_sessions (sessions đọc chi tiết)
CREATE TABLE IF NOT EXISTS reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reader_id UUID NOT NULL,
    book_id UUID NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    start_page INTEGER NOT NULL DEFAULT 1 CHECK (start_page > 0),
    end_page INTEGER NOT NULL DEFAULT 1 CHECK (end_page > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    device VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- Foreign key constraints
CONSTRAINT fk_reading_sessions_reader FOREIGN KEY (reader_id) REFERENCES readers(id) ON DELETE CASCADE,
    CONSTRAINT fk_reading_sessions_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- Tạo indexes để tối ưu performance
CREATE INDEX IF NOT EXISTS idx_reading_history_reader_id ON reading_history (reader_id);

CREATE INDEX IF NOT EXISTS idx_reading_history_book_id ON reading_history (book_id);

CREATE INDEX IF NOT EXISTS idx_reading_history_status ON reading_history (status);

CREATE INDEX IF NOT EXISTS idx_reading_history_last_read_at ON reading_history (last_read_at);

CREATE INDEX IF NOT EXISTS idx_reading_history_reader_book ON reading_history (reader_id, book_id);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_reader_id ON reading_sessions (reader_id);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions (book_id);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_started_at ON reading_sessions (started_at);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_status ON reading_sessions (status);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reading_history_updated_at
    BEFORE UPDATE ON reading_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_sessions_updated_at
    BEFORE UPDATE ON reading_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Thêm comment cho các bảng
COMMENT ON
TABLE reading_history IS 'Lịch sử đọc sách ebook của người dùng';

COMMENT ON
TABLE reading_sessions IS 'Chi tiết các phiên đọc sách của người dùng';

-- Thêm comment cho các cột quan trọng
COMMENT ON COLUMN reading_history.status IS 'Trạng thái đọc: reading (đang đọc), completed (hoàn thành), paused (tạm dừng), abandoned (bỏ dở)';

COMMENT ON COLUMN reading_history.current_page IS 'Trang hiện tại đang đọc';

COMMENT ON COLUMN reading_history.total_reading_time_seconds IS 'Tổng thời gian đọc (tính bằng giây)';

COMMENT ON COLUMN reading_history.last_read_at IS 'Thời gian đọc cuối cùng';

COMMENT ON COLUMN reading_sessions.duration_seconds IS 'Thời lượng session đọc (tính bằng giây)';

COMMENT ON COLUMN reading_sessions.start_page IS 'Trang bắt đầu đọc trong session này';

COMMENT ON COLUMN reading_sessions.end_page IS 'Trang kết thúc đọc trong session này';

COMMENT ON COLUMN reading_sessions.device IS 'Thiết bị sử dụng để đọc (mobile, desktop, tablet)';