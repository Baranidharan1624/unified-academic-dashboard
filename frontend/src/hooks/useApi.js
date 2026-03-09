import { useState, useCallback } from "react";
import { api } from "../services/apiClient";

/**
 * Custom hook for API calls with loading and error handling
 * @param {Object} options - Configuration options
 */
export function useApi(options = {}) {
  const { onSuccess, onError } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (requestFn, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await requestFn(...args);
      const result = response.data;
      
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);

  const get = useCallback(async (url, config = {}) => {
    return execute(api.get, url, config);
  }, [execute]);

  const post = useCallback(async (url, data = {}, config = {}) => {
    return execute(api.post, url, data, config);
  }, [execute]);

  const put = useCallback(async (url, data = {}, config = {}) => {
    return execute(api.put, url, data, config);
  }, [execute]);

  const patch = useCallback(async (url, data = {}, config = {}) => {
    return execute(api.patch, url, data, config);
  }, [execute]);

  const del = useCallback(async (url, config = {}) => {
    return execute(api.delete, url, config);
  }, [execute]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
    reset,
    isEmpty: !data || (Array.isArray(data) && data.length === 0),
  };
}

/**
 * Hook for fetching data on mount
 */
export function useFetch(url, options = {}) {
  const { immediate = true, ...apiOptions } = options;
  const apiHook = useApi(apiOptions);

  useState(() => {
    if (immediate && url) {
      apiHook.get(url);
    }
  }, [url, immediate]);

  return apiHook;
}

export default useApi;

