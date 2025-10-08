import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosInstance";

// Fetch user data from API using Axios instance
const fetchUser = async () => {
  const response = await axiosInstance.get("/api/logged-in-user");
  return response.data.user;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // cache valid 5 min
    retry: 1, // retry once if fail
  });

  return { user, isLoading, isError, refetch };
};

export default useUser;
