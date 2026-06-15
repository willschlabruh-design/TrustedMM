-- Create tables based on Prisma schema
-- Execute this in Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  name TEXT,
  "avatarUrl" TEXT,
  role TEXT DEFAULT 'USER',
  verified BOOLEAN DEFAULT false,
  "twoFA" BOOLEAN DEFAULT false,
  "twoFASecret" TEXT,
  rating FLOAT DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade table
CREATE TABLE IF NOT EXISTS "Trade" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  platform TEXT,
  value FLOAT DEFAULT 0,
  status TEXT DEFAULT 'WAITING_FOR_MIDDLEMEN',
  "buyerId" TEXT,
  "sellerId" TEXT,
  "middlemanId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("buyerId") REFERENCES "User"(id),
  FOREIGN KEY ("sellerId") REFERENCES "User"(id),
  FOREIGN KEY ("middlemanId") REFERENCES "User"(id)
);

CREATE INDEX IF NOT EXISTS "Trade_status_idx" ON "Trade"(status);

-- Message table
CREATE TABLE IF NOT EXISTS "Message" (
  id TEXT PRIMARY KEY,
  "tradeId" TEXT,
  "roomId" TEXT,
  "senderId" TEXT NOT NULL,
  body TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("tradeId") REFERENCES "Trade"(id),
  FOREIGN KEY ("roomId") REFERENCES "Room"(id),
  FOREIGN KEY ("senderId") REFERENCES "User"(id)
);

-- Room table
CREATE TABLE IF NOT EXISTS "Room" (
  id TEXT PRIMARY KEY,
  "tradeId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("tradeId") REFERENCES "Trade"(id)
);

-- RoomMember table
CREATE TABLE IF NOT EXISTS "RoomMember" (
  id TEXT PRIMARY KEY,
  "roomId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "joinedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("roomId") REFERENCES "Room"(id),
  FOREIGN KEY ("userId") REFERENCES "User"(id),
  UNIQUE("roomId", "userId")
);

-- Review table
CREATE TABLE IF NOT EXISTS "Review" (
  id TEXT PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "tradeId" TEXT,
  rating INTEGER NOT NULL,
  text TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("authorId") REFERENCES "User"(id),
  FOREIGN KEY ("tradeId") REFERENCES "Trade"(id)
);

-- Notification table
CREATE TABLE IF NOT EXISTS "Notification" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  type TEXT NOT NULL,
  payload TEXT,
  read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  token TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

CREATE INDEX IF NOT EXISTS "Session_token_idx" ON "Session"(token);

-- File table
CREATE TABLE IF NOT EXISTS "File" (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INTEGER NOT NULL,
  mime TEXT NOT NULL,
  "uploadedById" TEXT,
  "tradeId" TEXT,
  "messageId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("uploadedById") REFERENCES "User"(id),
  FOREIGN KEY ("tradeId") REFERENCES "Trade"(id),
  FOREIGN KEY ("messageId") REFERENCES "Message"(id)
);

-- Dispute table
CREATE TABLE IF NOT EXISTS "Dispute" (
  id TEXT PRIMARY KEY,
  "tradeId" TEXT NOT NULL,
  "openedById" TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN',
  reason TEXT NOT NULL,
  resolution TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("tradeId") REFERENCES "Trade"(id),
  FOREIGN KEY ("openedById") REFERENCES "User"(id)
);

-- StaffApplication table
CREATE TABLE IF NOT EXISTS "StaffApplication" (
  id TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  bio TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Log table
CREATE TABLE IF NOT EXISTS "Log" (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  meta TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
  id TEXT PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

CREATE INDEX IF NOT EXISTS "VerificationToken_token_idx" ON "VerificationToken"(token);
