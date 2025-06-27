import { useState } from "react";

import QrMatrixPlayer from "./components/QrMatrixPlayer";
import QrScanner from "./components/QrScanner";

import { DEFAULT_MATRIX } from "@/constants/defaultMatrix";
import Card from "@/ui/Card";

const Decode = () => {
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_MATRIX);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
      <div className="lg:col-span-2 gap-2 flex flex-col">
        <QrMatrixPlayer matrix={matrix} />
        <Card className="w-full"></Card>
      </div>
      <div className="gap-2 flex flex-col">
        <QrScanner setMatrix={setMatrix} />
        <Card className="w-full"></Card>
      </div>
    </div>
  );
};

export default Decode;
