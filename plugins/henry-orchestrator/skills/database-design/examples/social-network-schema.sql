-- Social Network Database Schema
-- Complete schema for a social network with users, posts, comments, likes, and follows

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(500),
    cover_photo_url VARCHAR(500),
    location VARCHAR(100),
    website VARCHAR(255),
    date_of_birth DATE,
    is_verified BOOLEAN DEFAULT false,
    is_private BOOLEAN DEFAULT false,
    last_seen_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- User Follows (self-referencing many-to-many)
CREATE TABLE follows (
    follower_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id != followee_id)
);

CREATE INDEX idx_follows_follower_id ON follows(follower_id);
CREATE INDEX idx_follows_followee_id ON follows(followee_id);
CREATE INDEX idx_follows_created_at ON follows(created_at DESC);

-- Follow Requests (for private accounts)
CREATE TABLE follow_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requestee_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    UNIQUE (requester_id, requestee_id),
    CHECK (requester_id != requestee_id)
);

CREATE INDEX idx_follow_requests_requestee_id ON follow_requests(requestee_id) WHERE status = 'pending';

-- Blocked Users
CREATE TABLE blocks (
    blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id),
    CHECK (blocker_id != blocked_id)
);

CREATE INDEX idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_id ON blocks(blocked_id);

-- Posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],  -- Array of image/video URLs
    location VARCHAR(255),
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_visibility ON posts(visibility);

-- Post Likes
CREATE TABLE post_likes (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX idx_post_likes_created_at ON post_likes(created_at DESC);

-- Comments
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,  -- For threaded replies
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Comment Likes
CREATE TABLE comment_likes (
    comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (comment_id, user_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- Hashtags
CREATE TABLE hashtags (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(100) UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_post_count ON hashtags(post_count DESC);

-- Post Hashtags (many-to-many)
CREATE TABLE post_hashtags (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id INTEGER NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id);

-- User Mentions in Posts
CREATE TABLE post_mentions (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX idx_post_mentions_user_id ON post_mentions(user_id);

-- Saved Posts (bookmarks)
CREATE TABLE saved_posts (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_created_at ON saved_posts(created_at DESC);

-- Direct Messages
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation Participants
CREATE TABLE conversation_participants (
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

-- Messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[],
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Notifications
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    actor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- Who triggered the notification
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN
        ('follow', 'follow_request', 'like', 'comment', 'mention', 'message')),
    entity_type VARCHAR(50) CHECK (entity_type IN ('post', 'comment', 'message')),
    entity_id INTEGER,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Stories (24-hour temporary posts)
CREATE TABLE stories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_url VARCHAR(500) NOT NULL,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')),
    caption TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_expires_at ON stories(expires_at);

-- Story Views
CREATE TABLE story_views (
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (story_id, user_id)
);

CREATE INDEX idx_story_views_story_id ON story_views(story_id);
CREATE INDEX idx_story_views_user_id ON story_views(user_id);

-- Reports (for content moderation)
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) CHECK (entity_type IN ('user', 'post', 'comment', 'message')),
    entity_id INTEGER,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Useful Views

-- User Statistics
CREATE VIEW user_stats AS
SELECT
    u.id,
    u.username,
    COUNT(DISTINCT p.id) as post_count,
    COUNT(DISTINCT pl.post_id) as likes_given,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT f1.followee_id) as following_count,
    COUNT(DISTINCT f2.follower_id) as followers_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN post_likes pl ON u.id = pl.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN follows f1 ON u.id = f1.follower_id
LEFT JOIN follows f2 ON u.id = f2.followee_id
GROUP BY u.id, u.username;

-- Post with Engagement
CREATE VIEW posts_with_engagement AS
SELECT
    p.id,
    p.user_id,
    p.content,
    p.created_at,
    u.username,
    u.display_name,
    u.avatar_url,
    COUNT(DISTINCT pl.user_id) as like_count,
    COUNT(DISTINCT c.id) as comment_count,
    COUNT(DISTINCT s.user_id) as save_count
FROM posts p
JOIN users u ON p.user_id = u.id
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN comments c ON p.id = c.post_id
LEFT JOIN saved_posts s ON p.id = s.post_id
GROUP BY p.id, u.username, u.display_name, u.avatar_url;

-- User Feed (posts from followed users)
CREATE OR REPLACE FUNCTION get_user_feed(target_user_id INTEGER, page_size INTEGER DEFAULT 20, page_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    post_id INTEGER,
    author_username VARCHAR(50),
    author_display_name VARCHAR(100),
    author_avatar_url VARCHAR(500),
    content TEXT,
    media_urls TEXT[],
    like_count BIGINT,
    comment_count BIGINT,
    is_liked BOOLEAN,
    is_saved BOOLEAN,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        u.username,
        u.display_name,
        u.avatar_url,
        p.content,
        p.media_urls,
        COUNT(DISTINCT pl.user_id) as like_count,
        COUNT(DISTINCT c.id) as comment_count,
        EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = target_user_id) as is_liked,
        EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = target_user_id) as is_saved,
        p.created_at
    FROM posts p
    JOIN users u ON p.user_id = u.id
    JOIN follows f ON p.user_id = f.followee_id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE f.follower_id = target_user_id
        AND p.visibility IN ('public', 'followers')
    GROUP BY p.id, u.username, u.display_name, u.avatar_url
    ORDER BY p.created_at DESC
    LIMIT page_size OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;

-- Triggers

-- Update post/comment updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER posts_update_updated_at BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER comments_update_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_update_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update hashtag post count
CREATE OR REPLACE FUNCTION update_hashtag_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE hashtags SET post_count = post_count + 1 WHERE id = NEW.hashtag_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hashtags SET post_count = post_count - 1 WHERE id = OLD.hashtag_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hashtag_count_trigger
AFTER INSERT OR DELETE ON post_hashtags
FOR EACH ROW EXECUTE FUNCTION update_hashtag_count();

-- Create notification on new follow
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (user_id, actor_id, notification_type)
    VALUES (NEW.followee_id, NEW.follower_id, 'follow');
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_follow_trigger
AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION notify_on_follow();

-- Create notification on new post like
CREATE OR REPLACE FUNCTION notify_on_post_like()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id INTEGER;
BEGIN
    SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
    IF post_owner_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, actor_id, notification_type, entity_type, entity_id)
        VALUES (post_owner_id, NEW.user_id, 'like', 'post', NEW.post_id);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_post_like_trigger
AFTER INSERT ON post_likes
FOR EACH ROW EXECUTE FUNCTION notify_on_post_like();

-- Sample Data

INSERT INTO users (username, email, password_hash, display_name, bio, is_verified) VALUES
('alice', 'alice@example.com', '$2a$10$...', 'Alice Johnson', 'Photography enthusiast 📷', true),
('bob', 'bob@example.com', '$2a$10$...', 'Bob Smith', 'Developer | Coffee addict ☕', false),
('charlie', 'charlie@example.com', '$2a$10$...', 'Charlie Brown', 'Travel blogger ✈️', true);

INSERT INTO follows (follower_id, followee_id) VALUES
(1, 2),
(1, 3),
(2, 1),
(3, 1),
(3, 2);

INSERT INTO posts (user_id, content, visibility) VALUES
(1, 'Just captured this amazing sunset! 🌅', 'public'),
(2, 'Working on a new project. Excited to share soon!', 'public'),
(3, 'Exploring the mountains today 🏔️', 'public');

INSERT INTO hashtags (tag) VALUES
('#photography'),
('#coding'),
('#travel');
