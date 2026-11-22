// SQL helpers retain authorization at the point of mutation, including after revocation.
export function editAccess(parameter: number, alias = 'decks') {
  return `(${alias}.owner_id = ?${parameter} OR EXISTS (SELECT 1 FROM deck_collaborators dc WHERE dc.deck_id = ${alias}.id AND dc.user_id = ?${parameter}))`;
}
export function managementPermissions(owner: boolean, editor: boolean) {
  return { can_read: true, can_edit: owner || editor, can_manage: owner };
}
export function permissions(owner: boolean, editor: boolean) {
  return { canEdit: editor, canManageCollaborators: owner, canDelete: owner };
}

export async function canEditDeck(db: D1Database, user: string, deck: { id: string; owner_id: string }) {
  return deck.owner_id === user || Boolean(await db.prepare('SELECT 1 FROM deck_collaborators WHERE deck_id = ? AND user_id = ?').bind(deck.id, user).first());
}
