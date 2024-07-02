import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Header />
      <Outlet />
    </WalletProvider>
  )
}

export default App
