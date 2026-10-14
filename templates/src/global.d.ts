import type { UniChatEvent } from "@voguh/unichat-widgets";

declare global {
    interface WindowEventMap {
        "unichat:connected": CustomEvent<unknown>;
        "unichat:event": CustomEvent<UniChatEvent>;
    }
}
