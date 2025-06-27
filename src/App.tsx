import { useState } from "react";

import type { TabKey } from "@/types/tapKey";

import Decode from "@/features/decode";
import Encode from "@/features/encode";
import Recovery from "@/features/recovery";
import Navigation from "@/ui/Navigation";
import Text from "@/ui/Text";

const navigationMap = {
  decode: Decode,
  encode: Encode,
  recovery: Recovery,
};

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("decode");

  const ActiveComponent = navigationMap[activeTab];

  return (
    <div className="min-h-screen flex flex-col gap-6 items-center justify-start bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-10 space-y-12">
      <Text
        fontSize="3xl"
        fontWeight="bold"
      >
        QR Code Parser Simulator
      </Text>
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="w-full h-full">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default App;
