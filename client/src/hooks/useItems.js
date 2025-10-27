import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useItems(inventoryId) {
  return useQuery({
    queryKey: ["items", inventoryId],
    queryFn: () => getItems(inventoryId),
    enabled: !!inventoryId,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryId, data }) => createItem(inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
}
