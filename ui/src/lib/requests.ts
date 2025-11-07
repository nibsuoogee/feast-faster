import { AxiosResponse } from "axios";

/**
 * A helper function to handle API requests.
 */
export const handleApiRequest = async <T>(
  apiCall: () => Promise<AxiosResponse<T>>
): Promise<T | undefined> => {
  try {
    const response = await apiCall()

    return response.data
  } catch (err) {
    console.error(err)
  }

  return undefined
};
