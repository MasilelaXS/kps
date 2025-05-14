import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle, LoaderCircle } from "lucide-react";

interface ClientProps {
  client_id: string;
  client_name: string;
  client_email: string;
  client_cell: string;
  client_address: string;
  created: string;
}

const Clients = () => {
  const [clients, setClients] = useState<ClientProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const getClients = useCallback(async (): Promise<void> => {
    if (!hasMore) return;
    setLoading(true);
    try {
      const response: Response = await fetch("/portal_api/get_clients.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit: 15,
          offset: page * 15,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch clients:", errorText);
        toast("Error fetching clients.");
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setClients((prev: ClientProps[]) => {
            const existingIds = new Set(prev.map((client) => client.client_id));
            const filteredData = result.data.filter(
              (client: ClientProps) => !existingIds.has(client.client_id)
            );
            return [...prev, ...filteredData];
          });
          if (result.data.length < 15) setHasMore(false);
        } else {
          console.error("Unexpected response format.", result.error);
          toast("Error fetching clients.");
        }
      } else {
        const rawResponse = await response.text();
        console.error("Unexpected response format:", rawResponse);
        toast("Error fetching clients.");
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast("Error fetching clients. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    getClients();
  }, [getClients]);

  useEffect(() => {
    const currentRef = observerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev: number) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loading]);

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 py-4 h-full no-scrollbar">
      {loading && clients.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <LoaderCircle className="w-12 h-12 mb-4 animate-spin" />
          <p className="text-lg">Loading, Please wait...</p>
        </div>
      )}

      {loading && clients.length !== 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center bg-white border border-gray-200 shadow-md rounded-full px-4 py-2">
          <LoaderCircle className="w-5 h-5 text-gray-600 animate-spin mr-2" />
          <span className="text-sm text-gray-700">Loading...</span>
        </div>
      )}
      {clients.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg">No Clients Found</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 h-full overflow-y-auto">
          {clients.map((client: ClientProps) => (
            <li key={client.client_id} className="flex items-center p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                {client.client_name.toString().slice(0, 1)}
              </div>
              <div className="flex-1 ml-4">
                <p className=" text-gray-800 dark:text-white">
                  {client.client_name}
                </p>
                <p className="text-sm text-gray-500">
                  Address: {client.client_address}
                </p>
                <p className="text-sm text-gray-500">
                  {client.client_email} • {client.client_cell}
                </p>
                <p className="text-sm text-gray-500 italic">
                  Since: {client.created}
                </p>
              </div>
            </li>
          ))}
          <div ref={observerRef} className="h-10"></div>
        </ul>
      )}
    </div>
  );
};

export default Clients;
