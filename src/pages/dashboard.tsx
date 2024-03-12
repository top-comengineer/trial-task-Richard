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
import Searchable from "@/components/Searchable";
import Draggable,  { DraggableEvent, DraggableData } from "react-draggable";

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
    } else {
      setTabs(["Grid 1"]);
    }
  };

  const handleLayout = (selectedTab: number) => {
    const newLayoutLock = layoutLock.map((lock, index) =>
      index === selectedTab ? !lock : lock,
    );
    setLayoutLock(newLayoutLock);
  };

  const [draggable1Position, setDraggable1Position] = useState({ x: 0, y: 0 });
  const [draggable2Position, setDraggable2Position] = useState({ x: 200, y: 0 });

  const handleDrag1 = (e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = ui;
    console.log('x1, y1 => ', x, y)

    // setDraggable1Position({ x, y });

    // // Check if draggable 1 overlaps with draggable 2
    // if (
    //   x < draggable2Position.x + 200 &&
    //   x + 200 > draggable2Position.x &&
    //   y < draggable2Position.y + 50 &&
    //   y + 50 > draggable2Position.y
    // ) {
    //   // Adjust the position of draggable 2
    //   setDraggable2Position({ x: x + 200, y: draggable2Position.y });
    // }
  };

  const handleDrag2 = (e: DraggableEvent, ui: DraggableData) => {
    const { x, y } = ui;
    console.log('x2, y2 => ', x, y)
    // setDraggable2Position({ x, y });

    // if (
    //   x < draggable1Position.x + 200 &&
    //   x + 200 > draggable1Position.x &&
    //   y < draggable1Position.y + 50 &&
    //   y + 50 > draggable1Position.y
    // ) {
    //   setDraggable1Position({ x: x - 200, y: draggable1Position.y });
    // }
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

              <Searchable />
            </div>

            <p className="text-white">{tabs[selectedTab]}</p>

            <Draggable
              // axis="x"
              handle=".handle"
              grid={[25, 25]}
              scale={1}
              onDrag={handleDrag1}
            >
              <div className="border bg-[white] w-[200px] cursor-pointer">
                <div className="handle">Drag from here</div>
                <div>This readme is really dragging on...</div>
              </div>
            </Draggable>

            
            <Draggable
              // axis="x"
              handle=".handle"
              grid={[25, 25]}
              scale={1}
              onDrag={handleDrag2}
            >
              <div className="border bg-sky-400 w-[200px] cursor-pointer">
                <div className="handle">Drag from here</div>
                <div>This readme is really dragging on...</div>
              </div>
            </Draggable>
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
