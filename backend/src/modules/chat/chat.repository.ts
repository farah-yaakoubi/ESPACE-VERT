import { prisma } from "../../lib/prisma";
import { deleteUploadedFile } from "../../lib/fileUtils";
import { mergePermissions } from "../../lib/permissions";

type SendPayload = {
  contenu: string;
  type_message: "texte" | "fichier" | "image" | "pdf";
  fichier_url?: string;
  fichier_nom?: string;
  fichier_size?: number;
};

type CreateGroupPayload = {
  nom: string;
  description?: string | null;
  member_ids: number[];
};

type AdminAccessRecord = {
  id_admin: number;
  nom: string;
  email: string;
  avatar: string | null;
  actif: boolean;
  id_role: number;
  permissions: unknown;
  role: { permissions: unknown } | null;
};

type ChatAdminSummary = {
  id_admin: number;
  nom: string;
  email: string;
  avatar: string | null;
};

type ThumbAdminSummary = {
  id_admin: number;
  nom: string;
  avatar: string | null;
};

type DirectMessageRecord = {
  id_msg: number;
  id_from: number;
  id_to: number;
  contenu: string;
  type_message: string;
  fichier_url: string | null;
  fichier_nom: string | null;
  fichier_size: number | null;
  thumbs: unknown;
  lu: boolean;
  edited_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
  created_at: Date;
  emetteur: { id_admin: number; nom: string; avatar: string | null };
  recepteur: { id_admin: number; nom: string; avatar: string | null };
};

type GroupRow = {
  id_group: number;
  nom: string;
  description: string | null;
  created_by: number;
  actif: number;
  created_at: Date;
  updated_at: Date;
  last_read_at?: Date | null;
};

type GroupMemberRow = {
  id_group: number;
  id_admin: number;
  nom: string;
  email: string;
  avatar: string | null;
  last_read_at: Date | null;
};

type GroupMessageRow = {
  id_msg: number;
  id_group: number;
  group_name: string;
  id_from: number;
  contenu: string;
  type_message: string;
  fichier_url: string | null;
  fichier_nom: string | null;
  fichier_size: number | null;
  thumbs: unknown;
  edited_at: Date | null;
  deleted_at: Date | null;
  deleted_by: number | null;
  created_at: Date;
  emetteur_id: number;
  emetteur_nom: string;
  emetteur_avatar: string | null;
};

type ShowColumnRow = { Field: string };
type ShowIndexRow = { Key_name: string };
type CountRow = { total: bigint | number };
type IdRow = { id: bigint | number };

const CHAT_HIDDEN_PERMISSION = "chat.hidden";

const DIRECT_MSG_SELECT = {
  id_msg: true,
  id_from: true,
  id_to: true,
  contenu: true,
  type_message: true,
  fichier_url: true,
  fichier_nom: true,
  fichier_size: true,
  thumbs: true,
  lu: true,
  edited_at: true,
  deleted_at: true,
  deleted_by: true,
  created_at: true,
  emetteur: { select: { id_admin: true, nom: true, avatar: true } },
  recepteur: { select: { id_admin: true, nom: true, avatar: true } },
} as const;

let ensureChatSchemaPromise: Promise<void> | null = null;

function normalizeThumbs(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return normalizeThumbs(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

function toNumber(value: bigint | number | null | undefined) {
  if (value === null || value === undefined) return 0;
  return typeof value === "bigint" ? Number(value) : value;
}

function uniqueIds(ids: number[]) {
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
}

function isChatHidden(admin: Pick<AdminAccessRecord, "id_role" | "permissions" | "role">) {
  if (admin.id_role === 1) return false;
  return mergePermissions(admin.role?.permissions, admin.permissions).includes(CHAT_HIDDEN_PERMISSION);
}

async function getAdminAccessRecord(id_admin: number) {
  return prisma.admin.findUnique({
    where: { id_admin },
    select: {
      id_admin: true,
      nom: true,
      email: true,
      avatar: true,
      actif: true,
      id_role: true,
      permissions: true,
      role: { select: { permissions: true } },
    },
  }) as Promise<AdminAccessRecord | null>;
}

async function ensureChatInfrastructure() {
  if (ensureChatSchemaPromise) return ensureChatSchemaPromise;

  ensureChatSchemaPromise = (async () => {
    const directColumns = await prisma.$queryRawUnsafe<ShowColumnRow[]>(
      "SHOW COLUMNS FROM `chat_messages`"
    );
    const directColumnNames = new Set(directColumns.map((column) => column.Field));

    const directAlterations: string[] = [];
    if (!directColumnNames.has("thumbs")) {
      directAlterations.push("ADD COLUMN `thumbs` JSON NOT NULL DEFAULT ('[]')");
    }
    if (!directColumnNames.has("edited_at")) {
      directAlterations.push("ADD COLUMN `edited_at` DATETIME(3) NULL");
    }
    if (!directColumnNames.has("deleted_at")) {
      directAlterations.push("ADD COLUMN `deleted_at` DATETIME(3) NULL");
    }
    if (!directColumnNames.has("deleted_by")) {
      directAlterations.push("ADD COLUMN `deleted_by` INTEGER NULL");
    }

    if (directAlterations.length > 0) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE \`chat_messages\` ${directAlterations.join(", ")}`
      );
    }

    const directIndexes = await prisma.$queryRawUnsafe<ShowIndexRow[]>(
      "SHOW INDEX FROM `chat_messages` WHERE `Key_name` = 'chat_messages_deleted_at_idx'"
    );
    if (directIndexes.length === 0) {
      await prisma.$executeRawUnsafe(
        "CREATE INDEX `chat_messages_deleted_at_idx` ON `chat_messages`(`deleted_at`)"
      );
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`chat_groups\` (
        \`id_group\` INTEGER NOT NULL AUTO_INCREMENT,
        \`nom\` VARCHAR(160) NOT NULL,
        \`description\` VARCHAR(255) NULL,
        \`created_by\` INTEGER NOT NULL,
        \`actif\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updated_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id_group\`),
        INDEX \`chat_groups_created_by_idx\` (\`created_by\`),
        CONSTRAINT \`chat_groups_created_by_fkey\`
          FOREIGN KEY (\`created_by\`) REFERENCES \`admins\`(\`id_admin\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`chat_group_members\` (
        \`id_member\` INTEGER NOT NULL AUTO_INCREMENT,
        \`id_group\` INTEGER NOT NULL,
        \`id_admin\` INTEGER NOT NULL,
        \`joined_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`last_read_at\` DATETIME(3) NULL,
        PRIMARY KEY (\`id_member\`),
        UNIQUE INDEX \`chat_group_members_group_admin_key\` (\`id_group\`, \`id_admin\`),
        INDEX \`chat_group_members_admin_idx\` (\`id_admin\`),
        CONSTRAINT \`chat_group_members_group_fkey\`
          FOREIGN KEY (\`id_group\`) REFERENCES \`chat_groups\`(\`id_group\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`chat_group_members_admin_fkey\`
          FOREIGN KEY (\`id_admin\`) REFERENCES \`admins\`(\`id_admin\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`chat_group_messages\` (
        \`id_group_msg\` INTEGER NOT NULL AUTO_INCREMENT,
        \`id_group\` INTEGER NOT NULL,
        \`id_from\` INTEGER NOT NULL,
        \`contenu\` TEXT NOT NULL,
        \`type_message\` VARCHAR(20) NOT NULL DEFAULT 'texte',
        \`fichier_url\` VARCHAR(500) NULL,
        \`fichier_nom\` VARCHAR(255) NULL,
        \`fichier_size\` INTEGER NULL,
        \`thumbs\` JSON NOT NULL DEFAULT ('[]'),
        \`edited_at\` DATETIME(3) NULL,
        \`deleted_at\` DATETIME(3) NULL,
        \`deleted_by\` INTEGER NULL,
        \`created_at\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id_group_msg\`),
        INDEX \`chat_group_messages_group_idx\` (\`id_group\`),
        INDEX \`chat_group_messages_from_idx\` (\`id_from\`),
        INDEX \`chat_group_messages_deleted_at_idx\` (\`deleted_at\`),
        INDEX \`chat_group_messages_created_at_idx\` (\`created_at\`),
        CONSTRAINT \`chat_group_messages_group_fkey\`
          FOREIGN KEY (\`id_group\`) REFERENCES \`chat_groups\`(\`id_group\`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`chat_group_messages_from_fkey\`
          FOREIGN KEY (\`id_from\`) REFERENCES \`admins\`(\`id_admin\`) ON DELETE CASCADE ON UPDATE CASCADE
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    const groupMemberColumns = await prisma.$queryRawUnsafe<ShowColumnRow[]>(
      "SHOW COLUMNS FROM `chat_group_members`"
    );
    const groupMemberColumnNames = new Set(groupMemberColumns.map((column) => column.Field));
    if (!groupMemberColumnNames.has("last_read_at")) {
      await prisma.$executeRawUnsafe(
        "ALTER TABLE `chat_group_members` ADD COLUMN `last_read_at` DATETIME(3) NULL"
      );
    }
  })().catch((error) => {
    ensureChatSchemaPromise = null;
    throw error;
  });

  return ensureChatSchemaPromise;
}

async function hydrateThumbAdmins(messages: Array<{ thumbs: unknown }>) {
  const thumbIds = uniqueIds(messages.flatMap((message) => normalizeThumbs(message.thumbs)));
  if (thumbIds.length === 0) return new Map<number, ThumbAdminSummary>();

  const admins = await prisma.admin.findMany({
    where: { id_admin: { in: thumbIds } },
    select: { id_admin: true, nom: true, avatar: true },
  });

  return new Map(
    admins.map((admin) => [
      admin.id_admin,
      { id_admin: admin.id_admin, nom: admin.nom, avatar: admin.avatar ?? null },
    ])
  );
}

async function mapDirectMessage(message: DirectMessageRecord | null) {
  if (!message) return null;

  const thumbAdmins = await hydrateThumbAdmins([message]);
  const thumbs = normalizeThumbs(message.thumbs);

  return {
    ...message,
    thumbs,
    thumb_admins: thumbs
      .map((id_admin) => thumbAdmins.get(id_admin))
      .filter((admin): admin is ThumbAdminSummary => Boolean(admin)),
    scope: "direct" as const,
    id_group: null,
    group_name: null,
  };
}

async function mapDirectMessages(messages: DirectMessageRecord[]) {
  const thumbAdmins = await hydrateThumbAdmins(messages);

  return messages.map((message) => {
    const thumbs = normalizeThumbs(message.thumbs);
    return {
      ...message,
      thumbs,
      thumb_admins: thumbs
        .map((id_admin) => thumbAdmins.get(id_admin))
        .filter((admin): admin is ThumbAdminSummary => Boolean(admin)),
      scope: "direct" as const,
      id_group: null,
      group_name: null,
    };
  });
}

async function mapGroupMessage(message: GroupMessageRow | null) {
  if (!message) return null;

  const thumbAdmins = await hydrateThumbAdmins([message]);
  const thumbs = normalizeThumbs(message.thumbs);

  return {
    id_msg: message.id_msg,
    id_group: message.id_group,
    id_from: message.id_from,
    id_to: null,
    contenu: message.contenu,
    type_message: message.type_message,
    fichier_url: message.fichier_url,
    fichier_nom: message.fichier_nom,
    fichier_size: message.fichier_size,
    thumbs,
    thumb_admins: thumbs
      .map((id_admin) => thumbAdmins.get(id_admin))
      .filter((admin): admin is ThumbAdminSummary => Boolean(admin)),
    lu: true,
    edited_at: message.edited_at,
    deleted_at: message.deleted_at,
    deleted_by: message.deleted_by,
    created_at: message.created_at,
    scope: "group" as const,
    group_name: message.group_name,
    emetteur: {
      id_admin: message.emetteur_id,
      nom: message.emetteur_nom,
      avatar: message.emetteur_avatar,
    },
    recepteur: null,
  };
}

async function mapGroupMessages(messages: GroupMessageRow[]) {
  const thumbAdmins = await hydrateThumbAdmins(messages);

  return messages.map((message) => {
    const thumbs = normalizeThumbs(message.thumbs);

    return {
      id_msg: message.id_msg,
      id_group: message.id_group,
      id_from: message.id_from,
      id_to: null,
      contenu: message.contenu,
      type_message: message.type_message,
      fichier_url: message.fichier_url,
      fichier_nom: message.fichier_nom,
      fichier_size: message.fichier_size,
      thumbs,
      thumb_admins: thumbs
        .map((id_admin) => thumbAdmins.get(id_admin))
        .filter((admin): admin is ThumbAdminSummary => Boolean(admin)),
      lu: true,
      edited_at: message.edited_at,
      deleted_at: message.deleted_at,
      deleted_by: message.deleted_by,
      created_at: message.created_at,
      scope: "group" as const,
      group_name: message.group_name,
      emetteur: {
        id_admin: message.emetteur_id,
        nom: message.emetteur_nom,
        avatar: message.emetteur_avatar,
      },
      recepteur: null,
    };
  });
}

async function getVisibleAdmins(excludeId?: number) {
  const admins = await prisma.admin.findMany({
    where: {
      actif: true,
      ...(excludeId ? { NOT: { id_admin: excludeId } } : {}),
    },
    select: {
      id_admin: true,
      nom: true,
      email: true,
      avatar: true,
      id_role: true,
      permissions: true,
      role: { select: { permissions: true } },
    },
  });

  return admins
    .filter((admin) => !isChatHidden(admin as AdminAccessRecord))
    .map((admin) => ({
      id_admin: admin.id_admin,
      nom: admin.nom,
      email: admin.email,
      avatar: admin.avatar ?? null,
    }));
}

async function getGroupMembers(id_group: number) {
  return prisma.$queryRawUnsafe<GroupMemberRow[]>(
    `
      SELECT
        gm.id_group,
        gm.id_admin,
        a.nom,
        a.email,
        a.avatar,
        gm.last_read_at
      FROM chat_group_members gm
      INNER JOIN admins a ON a.id_admin = gm.id_admin
      WHERE gm.id_group = ?
      ORDER BY a.nom ASC
    `,
    id_group
  );
}

async function getGroupMessageById(id_msg: number) {
  const rows = await prisma.$queryRawUnsafe<GroupMessageRow[]>(
    `
      SELECT
        gm.id_group_msg AS id_msg,
        gm.id_group,
        g.nom AS group_name,
        gm.id_from,
        gm.contenu,
        gm.type_message,
        gm.fichier_url,
        gm.fichier_nom,
        gm.fichier_size,
        gm.thumbs,
        gm.edited_at,
        gm.deleted_at,
        gm.deleted_by,
        gm.created_at,
        a.id_admin AS emetteur_id,
        a.nom AS emetteur_nom,
        a.avatar AS emetteur_avatar
      FROM chat_group_messages gm
      INNER JOIN chat_groups g ON g.id_group = gm.id_group
      INNER JOIN admins a ON a.id_admin = gm.id_from
      WHERE gm.id_group_msg = ?
      LIMIT 1
    `,
    id_msg
  );

  return rows[0] ?? null;
}

async function getGroupConversationForMember(id_admin: number, id_group: number) {
  const rows = await prisma.$queryRawUnsafe<GroupRow[]>(
    `
      SELECT
        g.id_group,
        g.nom,
        g.description,
        g.created_by,
        g.actif,
        g.created_at,
        g.updated_at,
        gm.last_read_at
      FROM chat_groups g
      INNER JOIN chat_group_members gm ON gm.id_group = g.id_group
      WHERE g.id_group = ? AND gm.id_admin = ? AND g.actif = 1
      LIMIT 1
    `,
    id_group,
    id_admin
  );

  const group = rows[0];
  if (!group) throw { status: 404, message: "Groupe introuvable" };

  const [members, lastRows, unreadRows] = await Promise.all([
    getGroupMembers(group.id_group),
    prisma.$queryRawUnsafe<GroupMessageRow[]>(
      `
        SELECT
          gm.id_group_msg AS id_msg,
          gm.id_group,
          g.nom AS group_name,
          gm.id_from,
          gm.contenu,
          gm.type_message,
          gm.fichier_url,
          gm.fichier_nom,
          gm.fichier_size,
          gm.thumbs,
          gm.edited_at,
          gm.deleted_at,
          gm.deleted_by,
          gm.created_at,
          a.id_admin AS emetteur_id,
          a.nom AS emetteur_nom,
          a.avatar AS emetteur_avatar
        FROM chat_group_messages gm
        INNER JOIN chat_groups g ON g.id_group = gm.id_group
        INNER JOIN admins a ON a.id_admin = gm.id_from
        WHERE gm.id_group = ?
        ORDER BY gm.created_at DESC, gm.id_group_msg DESC
        LIMIT 1
      `,
      group.id_group
    ),
    prisma.$queryRawUnsafe<CountRow[]>(
      `
        SELECT COUNT(*) AS total
        FROM chat_group_messages gm
        WHERE gm.id_group = ?
          AND gm.id_from <> ?
          AND (? IS NULL OR gm.created_at > ?)
      `,
      group.id_group,
      id_admin,
      group.last_read_at,
      group.last_read_at
    ),
  ]);

  const last_message = await mapGroupMessage(lastRows[0] ?? null);

  return {
    id_group: group.id_group,
    nom: group.nom,
    description: group.description,
    created_by: group.created_by,
    created_at: group.created_at,
    updated_at: group.updated_at,
    last_message,
    unread: toNumber(unreadRows[0]?.total),
    members: members.map((member) => ({
      id_admin: member.id_admin,
      nom: member.nom,
      email: member.email,
      avatar: member.avatar,
    })),
  };
}

export const chatRepository = {
  async assertChatEnabled(id_admin: number) {
    await ensureChatInfrastructure();

    const admin = await getAdminAccessRecord(id_admin);
    if (!admin || !admin.actif) {
      throw { status: 403, message: "Compte administrateur inactif ou introuvable" };
    }
    if (isChatHidden(admin)) {
      throw { status: 403, message: "La messagerie interne est masquée pour cet administrateur" };
    }

    return admin;
  },

  async availableAdmins(id_admin: number) {
    await this.assertChatEnabled(id_admin);
    return getVisibleAdmins(id_admin);
  },

  async ensureRecipientForSend(id_from: number, id_to: number) {
    await this.assertChatEnabled(id_from);

    if (id_from === id_to) {
      throw { status: 400, message: "Vous ne pouvez pas vous envoyer un message à vous-même" };
    }

    const availableAdmins = await getVisibleAdmins(id_from);
    const target = availableAdmins.find((admin) => admin.id_admin === id_to);

    if (!target) {
      throw { status: 404, message: "Administrateur destinataire introuvable ou masqué" };
    }

    return target;
  },

  async ensureConversationAccess(id_admin: number, id_other: number) {
    await this.assertChatEnabled(id_admin);

    if (id_admin === id_other) {
      throw { status: 400, message: "Conversation invalide" };
    }

    const availableAdmins = await getVisibleAdmins(id_admin);
    const target = availableAdmins.find((admin) => admin.id_admin === id_other);

    if (!target) {
      throw { status: 404, message: "Administrateur introuvable ou masqué" };
    }

    return target;
  },

  async getConversations(id_admin: number) {
    await this.assertChatEnabled(id_admin);

    const [visibleAdmins, relatedMessages] = await Promise.all([
      getVisibleAdmins(id_admin),
      prisma.chatMessage.findMany({
        where: {
          OR: [{ id_from: id_admin }, { id_to: id_admin }],
        },
        select: { id_from: true, id_to: true },
        orderBy: { created_at: "desc" },
      }),
    ]);

    const relatedIds = uniqueIds(
      relatedMessages.map((message) => (message.id_from === id_admin ? message.id_to : message.id_from))
    );

    const adminMap = new Map<number, ChatAdminSummary>();
    visibleAdmins.forEach((admin) => adminMap.set(admin.id_admin, admin));
    relatedIds.forEach((id_other) => {
      const existing = visibleAdmins.find((admin) => admin.id_admin === id_other);
      if (existing) adminMap.set(id_other, existing);
    });

    const conversations = await Promise.all(
      [...adminMap.values()].map(async (admin) => {
        const lastMessage = await prisma.chatMessage.findFirst({
          where: {
            OR: [
              { id_from: id_admin, id_to: admin.id_admin },
              { id_from: admin.id_admin, id_to: id_admin },
            ],
          },
          orderBy: { created_at: "desc" },
          select: DIRECT_MSG_SELECT,
        });

        const unread = await prisma.chatMessage.count({
          where: { id_from: admin.id_admin, id_to: id_admin, lu: false },
        });

        return {
          admin,
          last_message: await mapDirectMessage(lastMessage as DirectMessageRecord | null),
          unread,
        };
      })
    );

    return conversations.sort((a, b) => {
      const timeA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
      const timeB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
      return timeB - timeA;
    });
  },

  async getGroups(id_admin: number) {
    await this.assertChatEnabled(id_admin);

    const groups = await prisma.$queryRawUnsafe<GroupRow[]>(
      `
        SELECT
          g.id_group,
          g.nom,
          g.description,
          g.created_by,
          g.actif,
          g.created_at,
          g.updated_at,
          gm.last_read_at
        FROM chat_groups g
        INNER JOIN chat_group_members gm ON gm.id_group = g.id_group
        WHERE gm.id_admin = ? AND g.actif = 1
        ORDER BY g.updated_at DESC, g.id_group DESC
      `,
      id_admin
    );

    return Promise.all(groups.map((group) => getGroupConversationForMember(id_admin, group.id_group)));
  },

  async getMessages(id_admin: number, id_other: number, page = 1, limit = 50) {
    await this.ensureConversationAccess(id_admin, id_other);

    const where = {
      OR: [
        { id_from: id_admin, id_to: id_other },
        { id_from: id_other, id_to: id_admin },
      ],
    };

    const [total, messages] = await Promise.all([
      prisma.chatMessage.count({ where }),
      prisma.chatMessage.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: DIRECT_MSG_SELECT,
      }),
    ]);

    await prisma.chatMessage.updateMany({
      where: { id_from: id_other, id_to: id_admin, lu: false },
      data: { lu: true },
    });

    return {
      messages: await mapDirectMessages(messages.reverse() as DirectMessageRecord[]),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  async getGroupMessages(id_admin: number, id_group: number, page = 1, limit = 50) {
    await this.assertChatEnabled(id_admin);
    await getGroupConversationForMember(id_admin, id_group);

    const [countRows, messages] = await Promise.all([
      prisma.$queryRawUnsafe<CountRow[]>(
        "SELECT COUNT(*) AS total FROM chat_group_messages WHERE id_group = ?",
        id_group
      ),
      prisma.$queryRawUnsafe<GroupMessageRow[]>(
        `
          SELECT
            gm.id_group_msg AS id_msg,
            gm.id_group,
            g.nom AS group_name,
            gm.id_from,
            gm.contenu,
            gm.type_message,
            gm.fichier_url,
            gm.fichier_nom,
            gm.fichier_size,
            gm.thumbs,
            gm.edited_at,
            gm.deleted_at,
            gm.deleted_by,
            gm.created_at,
            a.id_admin AS emetteur_id,
            a.nom AS emetteur_nom,
            a.avatar AS emetteur_avatar
          FROM chat_group_messages gm
          INNER JOIN chat_groups g ON g.id_group = gm.id_group
          INNER JOIN admins a ON a.id_admin = gm.id_from
          WHERE gm.id_group = ?
          ORDER BY gm.created_at DESC, gm.id_group_msg DESC
          LIMIT ? OFFSET ?
        `,
        id_group,
        limit,
        (page - 1) * limit
      ),
    ]);

    await prisma.$executeRawUnsafe(
      "UPDATE chat_group_members SET last_read_at = CURRENT_TIMESTAMP(3) WHERE id_group = ? AND id_admin = ?",
      id_group,
      id_admin
    );

    const total = toNumber(countRows[0]?.total);

    return {
      messages: await mapGroupMessages(messages.reverse()),
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  async send(id_from: number, id_to: number, payload: SendPayload) {
    await ensureChatInfrastructure();
    await this.ensureRecipientForSend(id_from, id_to);

    const message = await prisma.chatMessage.create({
      data: {
        id_from,
        id_to,
        contenu: payload.contenu.substring(0, 4000),
        type_message: payload.type_message,
        fichier_url: payload.fichier_url ?? null,
        fichier_nom: payload.fichier_nom ?? null,
        fichier_size: payload.fichier_size ?? null,
      },
      select: DIRECT_MSG_SELECT,
    });

    return mapDirectMessage(message as DirectMessageRecord);
  },

  async createGroup(id_admin: number, payload: CreateGroupPayload) {
    await this.assertChatEnabled(id_admin);

    const memberIds = uniqueIds([...payload.member_ids, id_admin]);
    if (memberIds.length < 2) {
      throw { status: 400, message: "Un groupe doit contenir au moins deux administrateurs" };
    }

    const availableAdmins = await getVisibleAdmins();
    const availableIds = new Set(availableAdmins.map((admin) => admin.id_admin));

    if (!memberIds.every((memberId) => availableIds.has(memberId))) {
      throw { status: 400, message: "Un ou plusieurs administrateurs sélectionnés sont inactifs ou masqués" };
    }

    const id_group = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `
          INSERT INTO chat_groups (nom, description, created_by, actif, created_at, updated_at)
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
        `,
        payload.nom.trim(),
        payload.description?.trim() || null,
        id_admin
      );

      const inserted = await tx.$queryRawUnsafe<IdRow[]>("SELECT LAST_INSERT_ID() AS id");
      const groupId = toNumber(inserted[0]?.id);

      for (const memberId of memberIds) {
        await tx.$executeRawUnsafe(
          `
            INSERT INTO chat_group_members (id_group, id_admin, joined_at, last_read_at)
            VALUES (?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))
          `,
          groupId,
          memberId
        );
      }

      return groupId;
    });

    return getGroupConversationForMember(id_admin, id_group);
  },

  async sendGroupMessage(id_admin: number, id_group: number, payload: SendPayload) {
    await this.assertChatEnabled(id_admin);
    await getGroupConversationForMember(id_admin, id_group);

    const id_msg = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `
          INSERT INTO chat_group_messages (
            id_group, id_from, contenu, type_message, fichier_url, fichier_nom, fichier_size, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3))
        `,
        id_group,
        id_admin,
        payload.contenu.substring(0, 4000),
        payload.type_message,
        payload.fichier_url ?? null,
        payload.fichier_nom ?? null,
        payload.fichier_size ?? null
      );

      await tx.$executeRawUnsafe(
        "UPDATE chat_groups SET updated_at = CURRENT_TIMESTAMP(3) WHERE id_group = ?",
        id_group
      );

      const inserted = await tx.$queryRawUnsafe<IdRow[]>("SELECT LAST_INSERT_ID() AS id");
      return toNumber(inserted[0]?.id);
    });

    const message = await getGroupMessageById(id_msg);
    return mapGroupMessage(message);
  },

  async getMessageById(id_msg: number) {
    await ensureChatInfrastructure();

    const message = await prisma.chatMessage.findUnique({
      where: { id_msg },
      select: DIRECT_MSG_SELECT,
    });

    return mapDirectMessage(message as DirectMessageRecord | null);
  },

  async updateMessage(id_msg: number, id_admin: number, contenu: string) {
    await this.assertChatEnabled(id_admin);

    const message = await prisma.chatMessage.findUnique({
      where: { id_msg },
      select: DIRECT_MSG_SELECT,
    });

    if (!message) throw { status: 404, message: "Message introuvable" };
    if (message.id_from !== id_admin) {
      throw { status: 403, message: "Vous ne pouvez modifier que vos propres messages" };
    }
    if (message.deleted_at) {
      throw { status: 400, message: "Impossible de modifier un message supprimé" };
    }

    const trimmed = contenu.trim().substring(0, 4000);
    if (!trimmed && !message.fichier_url) {
      throw { status: 400, message: "Le contenu du message ne peut pas être vide" };
    }

    const updated = await prisma.chatMessage.update({
      where: { id_msg },
      data: {
        contenu: trimmed,
        edited_at: new Date(),
      } as any,
      select: DIRECT_MSG_SELECT,
    });

    return mapDirectMessage(updated as DirectMessageRecord);
  },

  async updateGroupMessage(id_msg: number, id_admin: number, contenu: string) {
    await this.assertChatEnabled(id_admin);

    const message = await getGroupMessageById(id_msg);
    if (!message) throw { status: 404, message: "Message de groupe introuvable" };
    if (message.id_from !== id_admin) {
      throw { status: 403, message: "Vous ne pouvez modifier que vos propres messages" };
    }
    if (message.deleted_at) {
      throw { status: 400, message: "Impossible de modifier un message supprimé" };
    }

    const trimmed = contenu.trim().substring(0, 4000);
    if (!trimmed && !message.fichier_url) {
      throw { status: 400, message: "Le contenu du message ne peut pas être vide" };
    }

    await prisma.$executeRawUnsafe(
      "UPDATE chat_group_messages SET contenu = ?, edited_at = CURRENT_TIMESTAMP(3) WHERE id_group_msg = ?",
      trimmed,
      id_msg
    );

    return mapGroupMessage(await getGroupMessageById(id_msg));
  },

  async deleteMessage(id_msg: number, id_admin: number) {
    await this.assertChatEnabled(id_admin);

    const message = await prisma.chatMessage.findUnique({
      where: { id_msg },
      select: DIRECT_MSG_SELECT,
    });

    if (!message) throw { status: 404, message: "Message introuvable" };
    if (message.id_from !== id_admin) {
      throw { status: 403, message: "Vous ne pouvez supprimer que vos propres messages" };
    }
    if (message.deleted_at) {
      return mapDirectMessage(message as DirectMessageRecord);
    }

    deleteUploadedFile(message.fichier_url ?? undefined);

    const updated = await prisma.chatMessage.update({
      where: { id_msg },
      data: {
        contenu: "",
        fichier_url: null,
        fichier_nom: null,
        fichier_size: null,
        thumbs: [],
        deleted_at: new Date(),
        deleted_by: id_admin,
      } as any,
      select: DIRECT_MSG_SELECT,
    });

    return mapDirectMessage(updated as DirectMessageRecord);
  },

  async deleteGroupMessage(id_msg: number, id_admin: number) {
    await this.assertChatEnabled(id_admin);

    const message = await getGroupMessageById(id_msg);
    if (!message) throw { status: 404, message: "Message de groupe introuvable" };
    if (message.id_from !== id_admin) {
      throw { status: 403, message: "Vous ne pouvez supprimer que vos propres messages" };
    }
    if (message.deleted_at) {
      return mapGroupMessage(message);
    }

    deleteUploadedFile(message.fichier_url ?? undefined);

    await prisma.$executeRawUnsafe(
      `
        UPDATE chat_group_messages
        SET contenu = '',
            fichier_url = NULL,
            fichier_nom = NULL,
            fichier_size = NULL,
            thumbs = ?,
            deleted_at = CURRENT_TIMESTAMP(3),
            deleted_by = ?
        WHERE id_group_msg = ?
      `,
      JSON.stringify([]),
      id_admin,
      id_msg
    );

    return mapGroupMessage(await getGroupMessageById(id_msg));
  },

  async toggleThumb(id_msg: number, id_admin: number) {
    await this.assertChatEnabled(id_admin);

    const message = await prisma.chatMessage.findUnique({
      where: { id_msg },
      select: DIRECT_MSG_SELECT,
    });

    if (!message) throw { status: 404, message: "Message introuvable" };
    if (message.id_from !== id_admin && message.id_to !== id_admin) {
      throw { status: 403, message: "Accès refusé à ce message" };
    }
    if (message.deleted_at) {
      throw { status: 400, message: "Impossible de réagir à un message supprimé" };
    }

    const thumbs = normalizeThumbs(message.thumbs);
    const nextThumbs = thumbs.includes(id_admin)
      ? thumbs.filter((id) => id !== id_admin)
      : [...thumbs, id_admin];

    const updated = await prisma.chatMessage.update({
      where: { id_msg },
      data: { thumbs: nextThumbs } as any,
      select: DIRECT_MSG_SELECT,
    });

    return mapDirectMessage(updated as DirectMessageRecord);
  },

  async toggleGroupThumb(id_msg: number, id_admin: number) {
    await this.assertChatEnabled(id_admin);

    const message = await getGroupMessageById(id_msg);
    if (!message) throw { status: 404, message: "Message de groupe introuvable" };
    await getGroupConversationForMember(id_admin, message.id_group);

    if (message.deleted_at) {
      throw { status: 400, message: "Impossible de réagir à un message supprimé" };
    }

    const thumbs = normalizeThumbs(message.thumbs);
    const nextThumbs = thumbs.includes(id_admin)
      ? thumbs.filter((id) => id !== id_admin)
      : [...thumbs, id_admin];

    await prisma.$executeRawUnsafe(
      "UPDATE chat_group_messages SET thumbs = ? WHERE id_group_msg = ?",
      JSON.stringify(nextThumbs),
      id_msg
    );

    return mapGroupMessage(await getGroupMessageById(id_msg));
  },

  async markRead(id_to: number, id_from: number) {
    await this.ensureConversationAccess(id_to, id_from);

    return prisma.chatMessage.updateMany({
      where: { id_from, id_to, lu: false },
      data: { lu: true },
    });
  },

  async markGroupRead(id_admin: number, id_group: number) {
    await this.assertChatEnabled(id_admin);
    await getGroupConversationForMember(id_admin, id_group);

    await prisma.$executeRawUnsafe(
      "UPDATE chat_group_members SET last_read_at = CURRENT_TIMESTAMP(3) WHERE id_group = ? AND id_admin = ?",
      id_group,
      id_admin
    );

    return { ok: true };
  },

  async totalUnread(id_admin: number) {
    await this.assertChatEnabled(id_admin);

    const [directUnread, groupUnreadRows] = await Promise.all([
      prisma.chatMessage.count({
        where: { id_to: id_admin, lu: false },
      }),
      prisma.$queryRawUnsafe<CountRow[]>(
        `
          SELECT COUNT(*) AS total
          FROM chat_group_messages gm
          INNER JOIN chat_group_members member ON member.id_group = gm.id_group
          INNER JOIN chat_groups g ON g.id_group = gm.id_group
          WHERE member.id_admin = ?
            AND g.actif = 1
            AND gm.id_from <> ?
            AND (member.last_read_at IS NULL OR gm.created_at > member.last_read_at)
        `,
        id_admin,
        id_admin
      ),
    ]);

    return directUnread + toNumber(groupUnreadRows[0]?.total);
  },

  async getGroupMemberIds(id_group: number) {
    const rows = await prisma.$queryRawUnsafe<{ id_admin: number }[]>(
      "SELECT id_admin FROM chat_group_members WHERE id_group = ?",
      id_group
    );

    return rows.map((row) => row.id_admin);
  },

  async getTrace(id_admin: number, limit = 80) {
    const admin = await getAdminAccessRecord(id_admin);
    if (!admin || admin.id_role !== 1) {
      throw { status: 403, message: "Traçabilité réservée au superadmin" };
    }

    await ensureChatInfrastructure();

    const [directRows, groupRows] = await Promise.all([
      prisma.chatMessage.findMany({
        orderBy: { created_at: "desc" },
        take: limit,
        select: DIRECT_MSG_SELECT,
      }),
      prisma.$queryRawUnsafe<GroupMessageRow[]>(
        `
          SELECT
            gm.id_group_msg AS id_msg,
            gm.id_group,
            g.nom AS group_name,
            gm.id_from,
            gm.contenu,
            gm.type_message,
            gm.fichier_url,
            gm.fichier_nom,
            gm.fichier_size,
            gm.thumbs,
            gm.edited_at,
            gm.deleted_at,
            gm.deleted_by,
            gm.created_at,
            a.id_admin AS emetteur_id,
            a.nom AS emetteur_nom,
            a.avatar AS emetteur_avatar
          FROM chat_group_messages gm
          INNER JOIN chat_groups g ON g.id_group = gm.id_group
          INNER JOIN admins a ON a.id_admin = gm.id_from
          ORDER BY gm.created_at DESC, gm.id_group_msg DESC
          LIMIT ?
        `,
        limit
      ),
    ]);

    const directMessages = await mapDirectMessages(directRows as DirectMessageRecord[]);
    const groupMessages = await mapGroupMessages(groupRows);

    const items = [
      ...directMessages.map((message) => ({
        trace_id: `direct-${message.id_msg}`,
        scope: "direct" as const,
        conversation_label: `${message.emetteur.nom} → ${message.recepteur?.nom ?? "Admin"}`,
        message,
        activity_at: new Date(message.deleted_at ?? message.edited_at ?? message.created_at).getTime(),
      })),
      ...groupMessages.map((message) => ({
        trace_id: `group-${message.id_msg}`,
        scope: "group" as const,
        conversation_label: message.group_name ?? "Groupe",
        message,
        activity_at: new Date(message.deleted_at ?? message.edited_at ?? message.created_at).getTime(),
      })),
    ];

    return items
      .sort((a, b) => b.activity_at - a.activity_at)
      .slice(0, limit)
      .map(({ trace_id, scope, conversation_label, message }) => ({
        trace_id,
        scope,
        conversation_label,
        message,
      }));
  },
};
