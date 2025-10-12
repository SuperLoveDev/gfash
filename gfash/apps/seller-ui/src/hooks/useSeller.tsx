import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosinstance";

// Fetch seller data from API using Axios instance
const fetchSeller = async () => {
  const response = await axiosInstance.get("/api/vendeur-connecte");
  return response.data.user;
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: fetchSeller,
    staleTime: 1000 * 60 * 5, // cache valid 5 min
    retry: 1, // retry once if fail
  });

  return { seller, isLoading, isError, refetch };
};

export default useSeller;
