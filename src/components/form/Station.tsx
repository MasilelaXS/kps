import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ListCheck,
  Rat,
  Trash,
} from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface StationProps {
  setCounter: (step: number) => void;
  reportID: string;
}

interface StationsProps {
  id: number;
  station_no: number;
  station_activity: number;
  is_outside: boolean;
  station_remark: string;
  station_poison_type: string;
  station_l_no: string;
  station_batch_no: string;
}

const Station: React.FC<StationProps> = ({ setCounter, reportID }) => {
  const [stationNr, setStationNr] = useState<number>(0);
  const [station_activity, setStationActivity] = useState<number>(0);
  const [is_outside, setIsOutside] = useState<boolean>(false);
  const [remark, setRemark] = useState<string>("");
  const [poisonType, setPoisonType] = useState<string>("");
  const [stationL, setStationL] = useState<string>("");
  const [batchNr, setBatchNr] = useState<string>("");
  const [stations, setStations] = useState<StationsProps[]>([]);

  const getStations = async (reportID: string): Promise<void> => {
    try {
      const response: Response = await fetch(`/portal_api/get_stations.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: reportID,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch stations:", errorText);
        toast("Error fetching stations.");
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setStations(result.data);
        } else {
          console.error(
            "Unexpected response format. Expected an array under 'data'."
          );
          toast("Error fetching stations.");
        }
      } else {
        console.error("Unexpected response format. Expected JSON.");
        toast("Error fetching stations.");
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
      toast("Error fetching stations. Please try again.");
    }
  };

  const saveStation = async (
    stationNr: number,
    station_activity: number,
    is_outside: boolean,
    remark: string,
    poisonType: string,
    stationL: string,
    batchNr: string
  ): Promise<void> => {
    if (
      stationNr === 0 ||
      (station_activity !== 0 && station_activity !== 1) || // Ensure activity is either 0 or 1
      remark.trim().length === 0 ||
      poisonType.trim().length === 0 ||
      stationL.trim().length === 0 ||
      batchNr.trim().length === 0
    ) {
      toast("All fields are required.");
      return;
    }

    try {
      const response: Response = await fetch("/portal_api/save_station.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: reportID,
          station_no: stationNr,
          station_activity: station_activity,
          is_outside: is_outside,
          station_remark: remark,
          station_poison_type: poisonType,
          station_l_no: stationL,
          station_batch_no: batchNr,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save station data:", errorText);
        toast("Error saving station data.");
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (result.success) {
          toast("Station data saved successfully.");

          // Reset form fields after saving
          setStationNr(0);
          setStationActivity(Number(0));
          setIsOutside(false);
          setRemark("");
          setPoisonType("");
          setStationL("");
          setBatchNr("");

          // Fetch and update stations
          await getStations(reportID);
        } else {
          console.error("Error saving station data:", result.error);
          toast(result.error || "Error saving station data.");
        }
      } else {
        console.error("Unexpected response format. Expected JSON.");
        toast("Error saving station data.");
      }
    } catch (error) {
      console.error("Error saving station data:", error);
      toast("Error saving station data. Please try again.");
    }
  };

  const deleteStation = async (id: number): Promise<void> => {
    try {
      const response: Response = await fetch("/portal_api/delete_station.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to delete station:", errorText);
        toast("Error deleting station data.");
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (result.success) {
          toast("Station data deleted successfully.");

          // Fetch and update stations
          await getStations(reportID);
        } else {
          console.error("Error saving station data:", result.error);
          toast(result.error || "Error saving station data.");
        }
      } else {
        console.error("Unexpected response format. Expected JSON.");
        toast("Error saving station data.");
      }
    } catch (error) {
      console.error("Error saving station data:", error);
      toast("Error saving station data. Please try again.");
    }
  };

  useEffect(() => {
    getStations(reportID);
  }, [reportID]);

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
      <div>
        <div className="w-full h-full py-12 ">
          <div className="w-full h-full flex flex-col justify-center items-center">
            <h1 className="flex justify-between w-full px-4 py-6 ">
              <div className="flex items-center text-left">
                <span className="rounded-xl border-0 bg-gray-100 dark:bg-gray-700 border-gray-800 w-10 h-10 flex justify-center items-center mr-2">
                  <Rat className="text-gray-800 dark:text-gray-200" size={20} />
                </span>
                <span className="text-2xl">Stations</span>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <ListCheck size={25} />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] min-h-[60vh] max-h-[60vh] overflow-y-scroll">
                  <DialogHeader>
                    <DialogTitle>Inspected Stations</DialogTitle>
                    <DialogDescription>
                      List of inspected stations
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <ul className="overflow-y-auto max-h-60">
                      {stations.map((station) => (
                        <li key={station.id} className="flex justify-between">
                          <div>
                            <p>Station No: {station.station_no}</p>
                            <p className="text-gray-400 dark:text-gray-500 text-[8pt] italic">
                              Activity:{" "}
                              {station.station_activity == 1 ? "Yes" : "No"}
                              {" • "}
                              {station.station_poison_type}
                            </p>
                            <p>Remark: {station.station_remark}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => deleteStation(station.id)}
                              variant="outline"
                              size="sm"
                            >
                              Delete <Trash />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </DialogContent>
              </Dialog>
            </h1>

            {/* Add your form fields here */}
            <div className="px-4 py-2 w-full max-w-md">
              <Label
                htmlFor="stationNr"
                className="text-gray-600 dark:text-gray-400"
              >
                Station Number
              </Label>
              <Input
                name="stationNr"
                type="number"
                placeholder="Enter Station Number"
                className="bg-white dark:bg-gray-700 mt-4 "
                onChange={(e) => setStationNr(Number(e.target.value))}
                value={stationNr}
              />
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label
                htmlFor="clientEmail"
                className="text-gray-600 dark:text-gray-400"
              >
                Activity
              </Label>
              <Select
                onValueChange={(value) => setStationActivity(Number(value))}
                value={`${station_activity}`}
              >
                <SelectTrigger className="w-full mt-4">
                  <SelectValue placeholder="Any Activity?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Any Traces of Activity?</SelectLabel>
                    <SelectItem value="1">Yes</SelectItem>
                    <SelectItem value="0">No</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label
                htmlFor="clientEmail"
                className="text-gray-600 dark:text-gray-400"
              >
                Inside/Outside
              </Label>
              <Select
                onValueChange={(value) => setIsOutside(value === "1")}
                value={`${is_outside ? 1 : 0}`}
              >
                <SelectTrigger className="w-full mt-4">
                  <SelectValue placeholder="Any Activity?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Inside/Outside</SelectLabel>
                    <SelectItem value="1">Outside</SelectItem>
                    <SelectItem value="0">Inside</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label
                htmlFor="clientEmail"
                className="text-gray-600 dark:text-gray-400"
              >
                Remark
              </Label>
              <Select
                onValueChange={(value) => setRemark(value)}
                value={`${remark}`}
              >
                <SelectTrigger className="w-full mt-4">
                  <SelectValue placeholder="Remark" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Remark</SelectLabel>
                    <SelectItem value="cleaned">Cleaned</SelectItem>
                    <SelectItem value="wet">Wet</SelectItem>
                    <SelectItem value="eaten">Eaten</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label
                htmlFor="clientEmail"
                className="text-gray-600 dark:text-gray-400"
              >
                Poison Type
              </Label>
              <Select
                onValueChange={(value) => setPoisonType(value)}
                value={`${poisonType}`}
              >
                <SelectTrigger className="w-full mt-4">
                  <SelectValue placeholder="Select Poison Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Poison Type</SelectLabel>
                    <SelectItem value="poison">Poison</SelectItem>
                    <SelectItem value="non-poison">Non Poison</SelectItem>
                    <SelectItem value="liquid">Liquid Based</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label
                htmlFor="stationL"
                className="text-gray-600 dark:text-gray-400"
              >
                L Number
              </Label>
              <Input
                name="stationL"
                type="number"
                placeholder="Enter L Number"
                className="bg-white dark:bg-gray-700 mt-4 "
                onChange={(e) => setStationL(e.target.value)}
                value={stationL}
              />
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label
                htmlFor="batchNr"
                className="text-gray-600 dark:text-gray-400"
              >
                Batch Number
              </Label>
              <Input
                name="batchNr"
                type="number"
                placeholder="Enter Batch Number"
                className="bg-white dark:bg-gray-700 mt-4 "
                onChange={(e) => setBatchNr(e.target.value)}
                value={batchNr}
              />
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  saveStation(
                    stationNr,
                    station_activity,
                    is_outside,
                    remark,
                    poisonType,
                    stationL,
                    batchNr
                  );
                }}
              >
                Save <ArrowDownToLine />
              </Button>
              <Button onClick={() => setCounter(4)} className="w-full mt-4">
                Next <ArrowRight />
              </Button>
              <Button
                variant="outline"
                className="px-4 py-2 mt-4 w-full max-w-md"
                onClick={() => setCounter(2)}
              >
                <ArrowLeft className="text-gray-800 dark:text-gray-200" /> Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Station;
