import ClientInfo from "@/components/form/ClientInfo";
import ClientSignature from "@/components/form/Signature";
import Station from "@/components/form/Station";
import Success from "@/components/form/Success";
import TreatedArea from "@/components/form/TreatedArea";
import User from "@/components/form/User";
import { useState, useEffect } from "react";

const Form = () => {
  const [stepCounter, setStepCounter] = useState(1);
  const [userCPO, setuserCPO] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userCell, setUserCell] = useState<string>("");
  const [reportID, setReportID] = useState<string>("");

  useEffect(() => {
    setStepCounter(1);
  }, []);

  const handleUser = (cpo: string, cell: string, name: string) => {
    setuserCPO(cpo);
    setUserName(name);
    setUserCell(cell);
  };

  const handleCounter = (step: number) => {
    setStepCounter(step);
  };

  const handleReportID = (id: string) => {
    setReportID(id);
  };

  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 w-full h-full overflow-x-hidden overflow-y-scroll">
      {stepCounter === 1 && (
        <User handleUser={handleUser} setCounter={handleCounter} />
      )}

      {stepCounter === 2 && (
        <ClientInfo
          userCPO={userCPO}
          userName={userName}
          userCell={userCell}
          setCounter={handleCounter}
          handleReportID={handleReportID}
        />
      )}

      {stepCounter === 3 && (
        <Station reportID={reportID} setCounter={handleCounter} />
      )}

      {stepCounter === 4 && (
        <TreatedArea reportID={reportID} setCounter={handleCounter} />
      )}

      {stepCounter === 5 && (
        <ClientSignature reportID={reportID} setCounter={handleCounter} />
      )}

      {stepCounter === 6 && <Success setCounter={handleCounter} />}
    </div>
  );
};

export default Form;
