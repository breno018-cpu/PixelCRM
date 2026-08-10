-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "pushName" TEXT,
    "phone" TEXT NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageText" TEXT,
    "lastMessageTime" DATETIME,
    "funnelStage" TEXT NOT NULL DEFAULT 'LEAD',
    "tags" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "avatarUrl" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Chat" ("avatarUrl", "createdAt", "funnelStage", "id", "lastMessageText", "lastMessageTime", "name", "notes", "phone", "pushName", "tags", "unreadCount", "updatedAt") SELECT "avatarUrl", "createdAt", "funnelStage", "id", "lastMessageText", "lastMessageTime", "name", "notes", "phone", "pushName", "tags", "unreadCount", "updatedAt" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
