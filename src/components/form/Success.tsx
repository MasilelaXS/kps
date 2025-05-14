import { CheckCircle } from "lucide-react";
import { Button } from "../ui/button";

interface SuccessProps {
  setCounter: (step: number) => void;
}

const Success: React.FC<SuccessProps> = ({ setCounter }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <CheckCircle size={48} className="text-gray-500" />
      <p className="my-6">Report Created and Sent Successfully</p>
      <Button onClick={() => setCounter(1)}>Start a new report</Button>
    </div>
  );
};

export default Success;
