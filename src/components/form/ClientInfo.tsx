import { ArrowLeft, ArrowRight, CalendarIcon, UserRound } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";

interface ClientInfoProps {
  setCounter: (step: number) => void;
  handleReportID: (id: string) => void;
  userCPO: string;
  userName: string;
  userCell: string;
}

const ClientInfo: React.FC<ClientInfoProps> = ({
  setCounter,
  handleReportID,
  userCPO,
}) => {
  const [clientName, setClientName] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [clientNr, setClientNr] = useState<string>("");
  const [clientAddr, setClientAddr] = useState<string>("");
  const [date, setDate] = useState<Date>();

  const handleBack = () => {
    setCounter(1);
  };

  const searchClient = async (clientEmail: string): Promise<void> => {
    if (clientEmail.length === 0) return;

    const response: Response = await fetch("/portal_api/search_client.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_email: clientEmail,
      }),
    });

    if (!response.ok) {
      console.error("Failed to fetch user data:", response.statusText);
      setClientName("");
      setClientNr("");
      setClientAddr("");
      return;
    }

    try {
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (result.success && result.data.length > 0) {
          const client = result.data[0];

          setClientName(client.client_name);
          setClientNr(client.client_cell);
          setClientAddr(client.client_address);
        } else {
          console.error("No user data found or operation was not successful.");
          setClientName("");
          setClientNr("");
          setClientAddr("");
        }
      } else {
        console.error("Unexpected response format. Expected JSON.");
        setClientName("");
        setClientNr("");
        setClientAddr("");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setClientName("");
      setClientNr("");
      setClientAddr("");
    }
  };

  useEffect(() => {
    if (clientEmail.length > 0) {
      searchClient(clientEmail);
    } else {
      setClientName("");
      setClientNr("");
      setClientAddr("");
    }
  }, [clientEmail]);

  const saveClient = async (
    name: string,
    email: string,
    cell: string,
    address: string,
    date: string | Date | null | undefined
  ): Promise<void> => {
    if (
      name.length === 0 ||
      email.length === 0 ||
      cell.length === 0 ||
      address.length === 0 ||
      userCPO.length === 0 ||
      date == null ||
      date == undefined
    )
      return;

    const response: Response = await fetch("/portal_api/save_client.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_name: name,
        client_email: email,
        client_cell: cell,
        client_address: address,
        user_id: userCPO,
        report_date: date,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save client data:", response.statusText);
      return;
    }

    try {
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        console.log(result);

        if (result.success && result.report_id) {
          setCounter(3); // Move to the next step
          handleReportID(result.report_id); // Pass the report ID to the parent component
        } else {
          console.error("No report ID found or operation was not successful.");
        }
      } else {
        console.error("Unexpected response format. Expected JSON.");
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
      <div className="w-full h-full py-12 ">
        <div className="w-full h-full flex flex-col justify-center items-center">
          <h1 className="flex justify-between w-full px-4 py-6 ">
            <div className="flex items-center text-left">
              <span className="rounded-xl border-0 bg-gray-100 border-gray-800 w-10 h-10 flex justify-center items-center mr-2">
                <UserRound className="text-gray-800" size={20} />
              </span>
              <span className="text-2xl">Client Info</span>
            </div>
          </h1>

          <div className="px-4 py-2 mt-4 w-full max-w-md">
            <Label htmlFor="clientEmail" className="text-gray-600">
              Email
            </Label>
            <Input
              name="clientEmail"
              type="email"
              placeholder="Enter Email"
              className="bg-white mt-4 "
              onChange={(e) => setClientEmail(e.target.value)}
              value={clientEmail}
            />
          </div>

          {/* Add your form fields here */}
          <div className="px-4 py-2 w-full max-w-md">
            <Label htmlFor="clientName" className="text-gray-600">
              Name
            </Label>
            <Input
              name="clientName"
              placeholder="Enter Name"
              className="bg-white mt-4 "
              onChange={(e) => setClientName(e.target.value)}
              value={clientName}
            />
          </div>

          <div className="px-4 py-2 mt-4 w-full max-w-md">
            <Label htmlFor="clientNr" className="text-gray-600">
              Contact Number
            </Label>
            <Input
              name="clientNr"
              type="number"
              placeholder="Enter Contact Number"
              className="bg-white mt-4 "
              onChange={(e) => setClientNr(e.target.value)}
              value={clientNr}
            />
          </div>

          <div className="px-4 py-2 mt-4 w-full max-w-md">
            <Label htmlFor="clientAddr" className="text-gray-600">
              Address
            </Label>
            <Input
              name="clientAddr"
              type="texte"
              placeholder="Enter Address"
              className="bg-white mt-4 "
              onChange={(e) => setClientAddr(e.target.value)}
              value={clientAddr}
            />
          </div>

          <div className="px-4 py-2 mt-4 w-full max-w-md">
            <Label className="text-gray-600 mb-4">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selectedDate) => {
                    setDate(selectedDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="px-4 py-2 mt-4 w-full max-w-md">
            <Button
              onClick={() =>
                saveClient(
                  clientName,
                  clientEmail,
                  clientNr,
                  clientAddr,
                  date as Date
                )
              }
              className="w-full"
            >
              Generate Report <ArrowRight />
            </Button>
            <Button
              variant="outline"
              className="px-4 py-2 mt-4 w-full max-w-md"
              onClick={() => handleBack()}
            >
              <ArrowLeft className="text-gray-800" /> Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
