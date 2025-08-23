import { Web3Provider } from "@/providers/web3-provider"
import Dashboard from "./components/Dashboard"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner";
import Navbar from "./Navbar";

function App() {
  return (
    <Web3Provider>
      <TooltipProvider>
        <Navbar />
        <Dashboard />
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </TooltipProvider>

    </Web3Provider>
  )
}

export default App
