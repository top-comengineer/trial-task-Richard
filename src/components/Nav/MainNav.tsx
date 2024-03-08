import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Fragment } from "react";
import { Button } from "@/components/Common/Button";
import { signOut } from "next-auth/react"
import { useDisconnect } from 'wagmi'


const MainNav = () => {
  const {disconnect} = useDisconnect();

  const handleLogout = () => {
    disconnect();
    signOut();
  }
  return (
    <Fragment>
      <div className="w-full flex px-10 py-4">
        <p className="text-3xl uppercase text-white">Defi</p>

        <div className="ml-auto flex gap-2">
        <ConnectButton />

        <Button className="bg-[#3898FF] hover:bg-sky-600 text-white" variant={"none"} onClick={handleLogout}>Log out</Button>
        </div>
      </div>
    </Fragment>
  )
}

export default MainNav;