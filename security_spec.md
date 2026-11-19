# Velvet Lobby Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Identity Integrity**: A player document at `rooms/{roomId}/players/{uid}` can only be created or updated by `request.auth.uid == uid` with `email_verified == true`, and `data.uid` must equal `request.auth.uid`.
2. **Adult Verification Gate**: `isAdultConfirmed` must strictly be `true` on player creation and remain immutable (`true`) on updates.
3. **Bounds & Grid Integrity**: Player coordinates (`x`, `y`, `targetX`, `targetY`) must be numbers bounded within `[0, 11]`, and `direction` must be one of `NE`, `NW`, `SE`, `SW`.
4. **Avatar Palette Validation**: `avatar` must contain only `skin`, `hair`, `top`, and `bottom`, each matching `^#[0-9a-fA-F]{6}$` (`size() == 7`).
5. **Temporal Integrity**: `lastActive` on players and `createdAt` on messages must strictly equal `request.time` (server timestamps only).
6. **Stale Cleanup**: A player document may be deleted by its owner (`request.auth.uid == uid`) OR by any verified signed-in patron only if `existing().lastActive < request.time - duration.value(60, 's')`.
7. **Immutable Messages**: Chat messages in `rooms/{roomId}/messages/{messageId}` are append-only (`update` is always denied) and only deletable by the original sender (`existing().uid == request.auth.uid`).
8. **No Shadow Fields or PII**: Strict `keys().hasAll(...)` and `keys().hasOnly(...)` guards prevent extra fields (`isAdmin`, `email`, etc.) from being injected.

## 2. Adversarial "Dirty Dozen" Attack Payloads (All Must Fail with PERMISSION_DENIED)
1. **Unauthenticated Create**: Unauthenticated user attempts to create `rooms/velvet_lobby/players/attacker1`.
2. **Unverified Email Write**: Signed-in user with `email_verified: false` attempts to create a player or message.
3. **UID Spoofing on Player**: User A attempts to create `rooms/velvet_lobby/players/userB` or set `uid: "userB"`.
4. **Underage Bypass**: User attempts to create a player with `isAdultConfirmed: false`.
5. **Shadow Field Injection**: User includes `isAdmin: true` or `role: "moderator"` in player creation payload.
6. **Out-of-Bounds Coordinate Poisoning**: User sets `x: 999` or `targetY: -5` to escape the 12x12 grid.
7. **Client-Spoofed Heartbeat Timestamp**: User sends a past or future `lastActive` timestamp instead of `serverTimestamp()` (`request.time`).
8. **Active Player Grief Delete**: User B attempts to delete User A's player document while `lastActive` is within 60 seconds.
9. **Message Sender Spoofing**: User A posts a message to `rooms/velvet_lobby/messages/msg1` with `uid: "userB"`.
10. **Message Tampering**: User A or B attempts to `update` an existing chat message.
11. **Oversized Text / Denial-of-Wallet**: User posts a 10KB `text` payload or 500-character `displayName`.
12. **ID Poisoning**: User attempts to write to a path with invalid characters or >128 char document ID.
