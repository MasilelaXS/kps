import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { AlertCircle, Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Report {
  report_id: number;
  user_id: number;
  client_id: number;
  client_name: string;
  report_status: string;
  report_date: string;
}

const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const getReports = useCallback(async (): Promise<void> => {
    if (!hasMore) return;
    setLoading(true);
    try {
      const response: Response = await fetch("/portal_api/get_reports.php", {
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
        console.error("Failed to fetch reports:", errorText);
        toast("Error fetching reports.");
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setReports((prev) => {
            const existingIds = new Set(
              prev.map((report: Report) => report.report_id)
            );
            const filteredData = result.data.filter(
              (report: Report) => !existingIds.has(report.report_id)
            );
            return [...prev, ...filteredData];
          });
          if (result.data.length < 15) setHasMore(false);
        } else {
          console.error("Unexpected response format.", result.error);
          toast("Error fetching reports.");
        }
      } else {
        const rawResponse = await response.text();
        console.error("Unexpected response format:", rawResponse);
        toast("Error fetching reports.");
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast("Error fetching reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    getReports();
  }, [getReports]);

  const handleDownload = async (reportId: number): Promise<void> => {
    try {
      const response: Response = await fetch(
        `/portal_api/download_report.php`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            report_id: reportId,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to download report:", errorText);
        toast("Error downloading report.");
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast("Report downloaded successfully.");
    } catch (error) {
      console.error("Error downloading report:", error);
      toast("Error downloading report. Please try again.");
    }
  };

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
    <div className="py-4 h-full no-scrollbar bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
      {loading && reports.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <LoaderCircle className="w-12 h-12 mb-4 animate-spin" />
          <p className="text-lg">Loading, Please wait...</p>
        </div>
      )}

      {loading && reports.length !== 0 && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 flex items-center bg-white border border-gray-200 shadow-md rounded-full px-4 py-2">
          <LoaderCircle className="w-5 h-5 text-gray-600 animate-spin mr-2" />
          <span className="text-sm text-gray-700">Loading...</span>
        </div>
      )}
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg">No Reports Found</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200 h-full overflow-y-auto">
          {reports.map((report) => (
            <li key={report.report_id} className="flex items-center p-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                {report.client_name.toString().slice(0, 1)}
              </div>
              <div className="flex-1 ml-4">
                <p className=" text-gray-800 dark:text-white">
                  Report ID: {report.report_id}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {report.report_status}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {report.report_date}
                </p>
                <p className="text-sm text-gray-500 italic">
                  Client: {report.client_name}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <Button
                  onClick={() => handleDownload(report.report_id)}
                  variant="outline"
                  className=""
                >
                  Download <Download className="" />
                </Button>
              </div>
            </li>
          ))}
          <div ref={observerRef} className="h-10"></div>
        </ul>
      )}
    </div>
  );
};

export default Reports;
