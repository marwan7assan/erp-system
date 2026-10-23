import { useCallback, useState } from "react";

export default function useConfirmDelete(remove) {
  const [pendingId, setPendingId] = useState(null);
  const requestDelete = useCallback((id) => setPendingId(id), []);
  const cancelDelete = useCallback(() => setPendingId(null), []);
  const confirmDelete = useCallback(async () => {
    if (pendingId == null) return;
    const succeeded = await remove(pendingId);
    if (succeeded) setPendingId(null);
  }, [pendingId, remove]);
  return { pendingId, requestDelete, cancelDelete, confirmDelete };
}
