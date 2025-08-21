import { Web3Provider } from "@/providers/web3-provider"
import Dashboard from "./components/Dashboard"

function App() {
  return (
    <Web3Provider>
      <Dashboard />
    </Web3Provider>
  )
}

export default App
