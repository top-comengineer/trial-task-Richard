import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import type { GetServerSideProps, NextPage } from "next";
import { getServerAuthSession } from "@/server/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/Common/Tab";
import { Button } from "@/components/Common/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/Common/Dropdown";
import { AiOutlineMore } from "react-icons/ai";
import clsx from "clsx";
import { TabsContent } from "@radix-ui/react-tabs";
import { CiUnlock, CiLock } from "react-icons/ci";

const DashBoard = () => {
  const router = useRouter();
  const [tabs, setTabs] = useState<string[]>(["Grid 1"]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [layoutLock, setLayoutLock] = useState<boolean[]>([false]);

  const addTab = () => {
    const newTab = `Grid ${tabs.length + 1}`;
    setTabs([...tabs, newTab]);
    const newLayoutLock = false;
    setLayoutLock([...layoutLock, newLayoutLock]);
  };

  const handleTabDelete = (id: number) => {
    if (tabs.length > 1) {
      console.log("id", id);
      const newTabs = tabs.filter((_, index) => index !== id);

      console.log("newTabs", newTabs);
      const newSelectedTab =
        selectedTab >= newTabs.length ? newTabs.length - 1 : selectedTab;

      console.log("newSelectedTab", newSelectedTab);

      setSelectedTab(newSelectedTab);
      setTabs(newTabs);
    }
  };

  const handleLayout = (selectedTab: number) => {
    const newLayoutLock = layoutLock.map((lock, index) =>
      index === selectedTab ? !lock : lock,
    );
    setLayoutLock(newLayoutLock);
  };

  return (
    <div className={"h-full w-full bg-[#0b0e13] px-10"}>
      <div className="flex">
        <Tabs defaultValue={tabs[selectedTab]} className="w-full">
          <TabsList className="h-auto flex-wrap gap-3">
            {tabs.map((tab, index) => (
              <div key={index}>
                <TabsTrigger
                  value={tab}
                  className={clsx(
                    "flex gap-4 rounded-lg text-white",
                    selectedTab === index ? "border border-[#3374d9]" : "",
                  )}
                  onClick={() => setSelectedTab(index)}
                >
                  {tab}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <p onClick={() => setSelectedTab(index)}>
                        <AiOutlineMore />
                      </p>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mt-2 bg-[#222839]">
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="hover:opacity-75">
                          <button className="text-gray-300">Duplicate</button>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="hover:opacity-75"
                          onClick={() => handleTabDelete(index)}
                        >
                          <button className="text-gray-300">Delete</button>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TabsTrigger>
              </div>
            ))}

            <Button
              onClick={addTab}
              className="my-auto px-2 py-2 text-white"
              variant={"none"}
            >
              +
            </Button>
          </TabsList>
          <div className="my-2 border border-[#3374d9]"></div>

          <TabsContent value={tabs[selectedTab] || ""} className="mt-1 w-full">
            <div className="flex gap-2">

            <Button
              className={clsx(
                " px-3 py-1 text-base font-light text-white",
                layoutLock[selectedTab] ? "bg-[#3a76d6]" : "bg-[#a6a8aa]",
              )}
              variant="none"
              size="none"
              onClick={() => handleLayout(selectedTab)}
            >
              {layoutLock[selectedTab] ? <CiUnlock /> : <CiLock />}
              Layout
            </Button>
            </div>

            <p className="text-white">{tabs[selectedTab]}</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return { props: {} };
};

export default DashBoard;
