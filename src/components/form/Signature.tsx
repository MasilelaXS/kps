import ReactSignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import { Save } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";

interface SignatureProps {
  setCounter: (step: number) => void;
  reportID: string;
}

interface SaveSignatureResponse {
  success: boolean;
  error?: string;
}

const ClientSignature: React.FC<SignatureProps> = ({
  setCounter,
  reportID,
}) => {
  const sigCanvasRef = useRef<ReactSignatureCanvas | null>(null);

  const handleClear = (): void => {
    sigCanvasRef.current?.clear();
  };

  const handleSave = async (): Promise<void> => {
    const canvas = sigCanvasRef.current;

    if (!canvas || canvas.isEmpty()) {
      toast("Please provide a signature before saving.");
      return;
    }

    try {
      const dataUrl: string = canvas.getCanvas().toDataURL("image/png");
      const base64Data: string = dataUrl.split(",")[1];

      const response: Response = await fetch("/portal_api/save_signature.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: reportID,
          signature: base64Data,
        }),
      });

      const contentType: string | null = response.headers.get("Content-Type");

      if (!response.ok) {
        const message: string = await response.text();
        throw new Error(message);
      }

      if (contentType?.includes("application/json")) {
        const result: SaveSignatureResponse = await response.json();
        if (result.success) {
          setCounter(6);
        } else {
          toast("Error saving signature. Please try again");
        }
      } else {
        toast("Unexpected response format from server.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error saving signature:", err.message);
        toast(err.message);
      } else {
        console.error("Unknown error saving signature:", err);
        toast("Failed to save signature. Please try again.");
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-full h-full py-12">
      <div className="w-full h-full flex flex-col justify-center items-center">
        <h1 className="flex justify-between w-full px-4 py-6">
          <div className="flex items-center text-left">
            <span className="rounded-xl border-0 bg-gray-100 dark:bg-gray-700 border-gray-800 w-10 h-10 flex justify-center items-center mr-2">
              <Save className="text-gray-800 dark:text-gray-200" size={20} />
            </span>
            <span className="text-2xl">Declaration</span>
          </div>
        </h1>

        <div className="px-4 py-2 mt-4 w-full max-w-md">
          <p>
            I, the undersigned, confirm that the pest control service was
            rendered by KPS Pest Control on my premises...
          </p>
        </div>

        <div className="px-4 py-2 mt-4 w-full max-w-md">
          <ReactSignatureCanvas
            ref={sigCanvasRef}
            canvasProps={{
              className:
                "border-2 border-gray-300 dark:border-gray-600 rounded-lg w-full h-48",
            }}
          />
        </div>

        <div className="px-4 py-2 mt-4 w-full max-w-md">
          <Button
            variant="outline"
            onClick={handleClear}
            className="w-full mt-4"
          >
            Clear
          </Button>
          <Button onClick={handleSave} className="w-full mt-4">
            Save <Save />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientSignature;
