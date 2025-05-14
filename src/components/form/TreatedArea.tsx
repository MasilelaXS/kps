import { ArrowRight, BugOff } from "lucide-react";
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
import { useState } from "react";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

interface TreatedAreaProps {
  setCounter: (step: number) => void;
  reportID: string;
}

const TreatedArea: React.FC<TreatedAreaProps> = ({ setCounter, reportID }) => {
  const [area, setArea] = useState<string>("");
  const [treated, setTreated] = useState<string>("");
  const [poison, setPoison] = useState<string>("");
  const [isRodentReplaced, setIsRodentReplaced] = useState<boolean>(false);
  const [isWarningReplaced, setIsWarningReplaced] = useState<boolean>(false);
  const [isLiquidReplaced, setIsLiquidReplaced] = useState<boolean>(false);
  const [attention, setAttention] = useState<string>("");
  const [remark, setRemark] = useState<string>("");

  const handleAreaChange = (value: string) => {
    setArea(value);
  };

  const handleTreatedChange = (value: string) => {
    setTreated(value);
  };

  const handlePoisonChange = (value: string) => {
    setPoison(value);
  };

  const saveTreatment = async (
    treatedArea: string,
    treatedFor: string,
    treatedWith: string,
    isRodentReplaced: boolean,
    isWarningReplaced: boolean,
    isLiquidReplaced: boolean,
    attention: string,
    remark: string
  ) => {
    if (
      treatedArea.trim().length === 0 ||
      treatedFor.trim().length === 0 ||
      treatedWith.trim().length === 0
    ) {
      toast("All fields are required.");
      return;
    }

    try {
      const response: Response = await fetch("/portal_api/save_treatment.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          report_id: reportID,
          treated_area: treatedArea,
          treated_for: treatedFor,
          treated_with: treatedWith,
          is_rodent_replaced: isRodentReplaced,
          is_warning_replaced: isWarningReplaced,
          is_liquid_replaced: isLiquidReplaced,
          attention,
          remark,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to save treatment data:", errorText);
        toast("Error saving treatment data.");
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();

        if (result.success) {
          toast("Treatment data saved successfully.");
          setCounter(5);
        } else {
          console.error("Error saving treatment data:", result.error);
          toast(result.error || "Error saving treatment data.");
        }
      } else {
        console.error("Unexpected response format. Expected JSON.");
        toast("Error saving treatment data.");
      }
    } catch (error) {
      console.error("Error saving treatment data:", error);
      toast("Error saving treatment data. Please try again.");
    }
  };

  const handleSaveAndNext = () => {
    saveTreatment(
      area,
      treated,
      poison,
      isRodentReplaced,
      isWarningReplaced,
      isLiquidReplaced,
      attention,
      remark
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
      <div>
        <div className="w-full h-full py-12 ">
          <div className="w-full h-full flex flex-col justify-center items-center">
            <h1 className="flex justify-between w-full px-4 py-6 ">
              <div className="flex items-center text-left">
                <span className="rounded-xl border-0 bg-gray-100 border-gray-800 w-10 h-10 flex justify-center items-center mr-2">
                  <BugOff className="text-gray-800" size={20} />
                </span>
                <span className="text-2xl">Treated Area</span>
              </div>
            </h1>

            {/* Form Fields */}

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label htmlFor="clientEmail" className="text-gray-600">
                Area
              </Label>
              <Select onValueChange={(value) => handleAreaChange(value)}>
                <SelectTrigger className="w-full mt-4">
                  <SelectValue placeholder="Select Treated Area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select Treated Area</SelectLabel>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="zink">Zink</SelectItem>
                    <SelectItem value="deli">Deli</SelectItem>
                    <SelectItem value="backdoor">Backdoor</SelectItem>
                    <SelectItem value="front desk">Front Desk/Till</SelectItem>
                    <SelectItem value="store room">Store Room</SelectItem>
                    <SelectItem value="office area">Office Area</SelectItem>
                    <SelectItem value="staff area">
                      Staff Area/Lockers
                    </SelectItem>
                    <SelectItem value="rubish area area">
                      Rubish Area
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {area === "other" && (
              <div className="px-4 py-2 mt-4 w-full max-w-md">
                <Label htmlFor="otherArea" className="text-gray-600">
                  Other Area
                </Label>
                <Input
                  name="otherArea"
                  placeholder="Enter Other Area"
                  className="bg-white mt-4 "
                />
              </div>
            )}

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label htmlFor="clientEmail" className="text-gray-600">
                Treated For
              </Label>
              <Select onValueChange={(value) => handleTreatedChange(value)}>
                <SelectTrigger className="w-full mt-4">
                  <SelectValue placeholder="Area Treated For " />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Area Treated For</SelectLabel>
                    <SelectItem value="cockroaches">Cockroaches</SelectItem>
                    <SelectItem value="fleas">Fleas</SelectItem>
                    <SelectItem value="lice">Lice</SelectItem>
                    <SelectItem value="ants">Ants</SelectItem>
                    <SelectItem value="rodents">Rodents</SelectItem>
                    <SelectItem value="flies">Flies</SelectItem>
                    <SelectItem value="fishmoths">Fishmoths</SelectItem>
                    <SelectItem value="bedbugs">Bedbugs</SelectItem>
                    <SelectItem value="termites">Termites</SelectItem>
                    <SelectItem value="crickets">Crickets</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {treated === "other" && (
              <div className="px-4 py-2 mt-4 w-full max-w-md">
                <Label htmlFor="otherTreat" className="text-gray-600">
                  Other Pest Treated For
                </Label>
                <Input
                  name="otherTreat"
                  placeholder="Enter Other Pest"
                  className="bg-white mt-4 "
                />
              </div>
            )}

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label htmlFor="clientEmail" className="text-gray-600">
                Treated With
              </Label>
              <Select onValueChange={(value) => handlePoisonChange(value)}>
                <SelectTrigger className="w-full mt-4">
                  <SelectValue placeholder="Area Treated With " />
                </SelectTrigger>
                <SelectContent>
                  {treated !== "rodents" ? (
                    <SelectGroup>
                      <SelectLabel>Treatment for Insects</SelectLabel>
                      <SelectItem value="Alpharin">Alpharin</SelectItem>
                      <SelectItem value="Roachforce">Roachforce</SelectItem>
                      <SelectItem value="PCO Flushing agent">
                        PCO Flushing agent
                      </SelectItem>
                      <SelectItem value="Bandit">Bandit</SelectItem>
                      <SelectItem value="Fly Bait">Fly Bait</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  ) : (
                    <SelectGroup>
                      <SelectLabel>Treatment for Rodents</SelectLabel>
                      <SelectItem value="Supa Kill Wheat">Alpharin</SelectItem>
                      <SelectItem value="Supa Kill Liquid Bait">
                        Supa Kill Liquid Bait
                      </SelectItem>
                      <SelectItem value="Supa Kill Block">
                        Supa Kill Block
                      </SelectItem>
                      <SelectItem value="Supa Kill Non Poison Block">
                        Supa Kill Non Poison Block
                      </SelectItem>
                      <SelectItem value="Racumin Powder">
                        Racumin Powder
                      </SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            {poison === "other" && (
              <div className="px-4 py-2 mt-4 w-full max-w-md">
                <Label htmlFor="otherTreatment" className="text-gray-600">
                  Other Treament
                </Label>
                <Input
                  name="otherTreatment"
                  placeholder="Enter Other Treatement"
                  className="bg-white mt-4 "
                />
              </div>
            )}

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label htmlFor="replaced" className="text-gray-600">
                Replaced
              </Label>
              <div className="w-full mt-2">
                <p className="mt-4">
                  <Checkbox
                    checked={isRodentReplaced}
                    onCheckedChange={(checked) =>
                      setIsRodentReplaced(!!checked)
                    }
                  />{" "}
                  Rodent Box
                </p>
                <p className="mt-4">
                  <Checkbox
                    checked={isWarningReplaced}
                    onCheckedChange={(checked) =>
                      setIsWarningReplaced(!!checked)
                    }
                  />{" "}
                  Warning Sign
                </p>
                <p className="mt-4">
                  <Checkbox
                    checked={isLiquidReplaced}
                    onCheckedChange={(checked) =>
                      setIsLiquidReplaced(!!checked)
                    }
                  />{" "}
                  Liquid Bait Holder
                </p>
              </div>
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label htmlFor="attent" className="text-gray-600">
                Attention must be given
              </Label>
              <Textarea
                name="attent"
                placeholder="Attention must be given to..."
                className="bg-white mt-4 max-h-32"
                value={attention}
                onChange={(e) => setAttention(e.target.value)}
              />
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Label htmlFor="remark" className="text-gray-600">
                Remark
              </Label>
              <Textarea
                name="remark"
                placeholder="Write remark here..."
                className="bg-white mt-4 max-h-32"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>

            <div className="px-4 py-2 mt-4 w-full max-w-md">
              <Button onClick={handleSaveAndNext} className="w-full mt-4">
                Save & Next <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreatedArea;
