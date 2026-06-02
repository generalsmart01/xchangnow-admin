import {
  ArrowLeftRight,
  Bell,
  IdCard,
  MessageSquarePlus,
  MessagesSquare,
  ServerCrash,
  ShieldAlert,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { Tone } from "@/components/shared/tone-badge";
import { smartLabel } from "@/lib/labels";
import type { AdminNotification } from "@/lib/types/notification";

export type NotificationMeta = {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  description: string;
  /** Deep-link target, or undefined for non-navigable alerts. */
  href?: string;
};

/** Safely read a string field off the notification payload. */
function field(
  payload: Record<string, unknown> | null,
  key: string,
): string | undefined {
  const v = payload?.[key];
  return v === null || v === undefined ? undefined : String(v);
}

/**
 * Map an admin notification to its icon / tone / copy / deep-link. Falls back
 * to the notification's own title/body for unknown event types.
 */
export function notificationMeta(n: AdminNotification): NotificationMeta {
  const p = n.payload;

  switch (n.type) {
    case "transaction.proof_uploaded": {
      const ref = field(p, "referenceCode") ?? "transaction";
      const txType = field(p, "txType");
      const asset = field(p, "assetSymbol");
      const amount = field(p, "cryptoAmount");
      const txId = field(p, "transactionId");
      return {
        icon: ArrowLeftRight,
        tone: "info",
        title: "New transaction to review",
        description: [txType, ref, asset && amount ? `${amount} ${asset}` : null]
          .filter(Boolean)
          .join(" · "),
        href: txId
          ? `/admin/transactions/${txId}`
          : "/admin/transactions?status=UNDER_REVIEW",
      };
    }
    case "kyc.submitted": {
      const who =
        field(p, "firstName") ?? field(p, "email") ?? "A customer";
      const userId = field(p, "userId");
      return {
        icon: IdCard,
        tone: "brand",
        title: "New KYC submission",
        description: `${who} submitted identity documents`,
        href: userId ? `/admin/kyc/${userId}` : "/admin/kyc?status=PENDING",
      };
    }
    case "chat.conversation_opened": {
      const convId = field(p, "conversationId");
      return {
        icon: MessagesSquare,
        tone: "info",
        title: "New support conversation",
        description: "A customer opened a conversation — claim it from the queue",
        href: convId ? `/admin/chat/${convId}` : "/admin/chat",
      };
    }
    case "chat.conversation_assigned": {
      const convId = field(p, "conversationId");
      return {
        icon: UserCheck,
        tone: "brand",
        title: "You've been assigned a conversation",
        description: "A support conversation was assigned to you",
        href: convId ? `/admin/chat/${convId}` : "/admin/chat",
      };
    }
    case "chat.user_message": {
      const convId = field(p, "conversationId");
      return {
        icon: MessageSquarePlus,
        tone: "info",
        title: "New message from customer",
        description: "A customer replied in a conversation",
        href: convId ? `/admin/chat/${convId}` : "/admin/chat",
      };
    }
    case "system.coingecko_failed": {
      const count = field(p, "failedAssetCount");
      return {
        icon: ServerCrash,
        tone: "warning",
        title: "CoinGecko price fetch failed",
        description: count
          ? `${count} asset price(s) may be stale — set them manually`
          : "Asset prices may be stale — set them manually",
        href: "/admin/assets",
      };
    }
    case "bootstrap.attempted": {
      return {
        icon: ShieldAlert,
        tone: "danger",
        title: "Bootstrap endpoint hit",
        description:
          "Someone attempted SUPER_ADMIN bootstrap. Rotate BOOTSTRAP_SECRET if this wasn't you.",
      };
    }
    default:
      return {
        icon: Bell,
        tone: "neutral",
        title: n.title ?? smartLabel(n.type.replace(/[._]/g, " ")),
        description: n.body ?? "",
      };
  }
}
