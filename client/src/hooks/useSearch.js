import { useQuery } from "@tanstack/react-query";
import { globalSearch } from "../utils/api"; 

export function useGlobalSearch(query) {
  return useQuery({
    queryKey: ["globalSearch", query],
    queryFn: () => globalSearch(query),
    enabled: !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
}
