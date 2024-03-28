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
import { db } from "@/server/db"; // Adjust the import path to your Prisma client

import { PubSubEvent, usePub, useSub } from "../hook/usePubSub";
import { useAppContext } from "../hook/useAppContext";
import { UserWidget, Widget } from "../../types";
import { DefaultLayout, DefaultWidgets } from "../utils/constants";
import { apiGet } from "../utils/apiUtils";
import { saveTabDB, saveTabLS } from "../utils/MainPageUtils";
import { deleteSettings } from "../hook/useWidgetSettings";
import { generateWID, getLS } from "../utils/appUtils";
import { isDoubleHeightWidget } from "../widgets";

import { WidthProvider, Responsive, Layouts, Layout } from "react-grid-layout";
import dynamic from "next/dynamic";

import { Toast } from "@/components/base";

import AnalogClock from "@/widgets/AnalogClock/AnalogClock";
import Embed from "@/widgets/Embed/Embed";
import Quote from "@/widgets/Quote/Quote";
import RSSReader from "@/widgets/RSSReader/RSSReader";
import StockChart from "../widgets/StockChart/StockChart";
import StockMini from "../widgets/StockMini/StockMini";
import AddWidgetModal from "@/components/base/AddWidgetModal/AddWidgetModal";

// Replace './YourComponent' with the path to your component
const StockMiniNoSSR = dynamic(() => import("../widgets/StockMini/StockMini"), {
  ssr: false,
});

const StockChartNoSSR = dynamic(
  () => import("../widgets/StockChart/StockChart"),
  {
    ssr: false,
  },
);

type TabItem = {
  user_id: number;
  layout_id: number;
  layout_name: string;
};

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashBoard = ({ initialTabs }: { initialTabs: any }) => {
  const router = useRouter();
  const [tabs, setTabs] = useState<TabItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedTabLayoutId, setSelectedTabLayoutId] = useState<
    number | undefined
  >(0);

  const [layoutLock, setLayoutLock] = useState<boolean[]>([false]);
  const { data: session, status } = useSession();
  const [actionType, setActionType] = useState<string>("tabSwitch"); // 'tabSwitch' or 'componentChange'
  const [modalShowed, setModalShowed] = useState(false);
  const [movingToastShowed, setMovingToastShowed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [userWidgets, setUserWidgets] = useState<UserWidget[]>([]);

  const [layout, setLayout] = useState<Layout[]>([]);

  const [currentBreakpoint, setCurrentBreakpoint] = useState("");

  const getLSLayout = (size: string) => {
    return getLS(`userLayout${selectedTab}${size}`, DefaultLayout, true);
  };

  const [layouts, setLayouts] = useState<Layouts>({
    xl: getLSLayout("xl"),
    lg: getLSLayout("lg"),
    md: getLSLayout("md"),
    sm: getLSLayout("sm"),
    xs: getLSLayout("xs"),
    xxs: getLSLayout("xxs"),
  });

  const publish = usePub();

  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [newTabName, setNewTabName] = useState("");

  if (!session) router.push("/");

  useEffect(() => {
    // Function to fetch layouts
    const fetchLayouts = async () => {
      try {
        const response = await fetch("/api/tabs", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: 'include' might be necessary depending on your session handling
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tabs");
        }
        const data: TabItem[] = await response.json();

        // Assuming 'data' is the array of layouts
        if (data && data.length > 0) {
          // const tabsFromApi = data.map(
          //   (tab: {
          //     user_id: number;
          //     layout_id: string;
          //     layout_name: string;
          //   }) => tab.layout_name,
          // );
          setTabs(data);
          setSelectedTab(0);
          setSelectedTabLayoutId(data[0]?.layout_id);

          fetchUserSettings(data[0]?.layout_id);
          setIsReady(true);

          const firstBtnInterval = setInterval(() => {
            const knownIdPart = `-trigger-${data[0]?.layout_name}`;
            const button = document.querySelector(`[id$="${knownIdPart}"]`);
            // const button = document.getElementById(
            //   "radix-:r3:-trigger-" + data[0]?.layout_name,
            // );

            console.log(button);
            if (button) {
              // Create a 'mousedown' event
              // alert();
              const mouseDownEvent = new MouseEvent("mousedown", {
                bubbles: true,
                cancelable: true,
                view: window,
              });
              // Dispatch the 'mousedown' event to simulate holding the button
              button.dispatchEvent(mouseDownEvent);

              clearInterval(firstBtnInterval);
            }
          }, 500);
        } else {
          // setTabs([
          //   {
          //     user_id: session?.user.userId ? session?.user.userId : 1,
          //     layout_id: 1,
          //     layout_name: "Grid 1",
          //   },
          // ]);
          // Default tab if no layouts are returned
          setIsReady(true);
        }
      } catch (error) {
        console.error("Error fetching layouts:", error);
        // setTabs([
        //   {
        //     user_id: session?.user.userId ? session?.user.userId : 1,
        //     layout_id: 1,
        //     layout_name: "Grid 1",
        //   },
        // ]);

        // Fallback in case of an error
        setIsReady(true);
      }
    };

    fetchLayouts();
  }, []); // Empty dependency array means this effect runs once on mount

  const fetchUserSettings = async (layout_id: number | undefined) => {
    setIsReady(false);

    const token = session?.user.token ?? "";
    if (token) {
      // timestamp for caching many same requests at the same time (up to the same second)
      const timestamp = new Date().toISOString().split(".")[0]; // 2023-11-03T15:06:24 (removed nanosecs)

      const response = await fetch(
        `/api/layout-config?layout_id=${layout_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      const data = await response.json();

      const newWidgets =
        (data?.userWidgets ?? []).length > 0
          ? data.userWidgets
          : DefaultWidgets;
      const newLayout =
        (data?.userLayout ?? []).length > 0 ? data.userLayout : DefaultLayout;

      console.log("newLayout--------,", newLayout);
      saveTabLS(selectedTab, newWidgets, newLayout);
      updateLayoutConfig(newWidgets, newLayout, layout_id);
      console.log(selectedTab);
      setUserWidgets(newWidgets);
      setLayout(newLayout);
      setLayouts({
        xl: newLayout,
        lg: newLayout,
        md: newLayout,
        sm: newLayout,
        xs: newLayout,
        xxs: newLayout,
      });
      console.log("data=tab", data?.tab);
    }

    // setTimeout(() => {
    //   setLayouts({});
    //   setTimeout(() => {
    //     setLayouts({
    //       xl: layout,
    //       lg: layout,
    //       md: layout,
    //       sm: layout,
    //       xs: layout,
    //       xxs: layout,
    //     });
    //     setIsReady(true);
    //   }, 10);
    // }, 10);

    setIsReady(true);
  };

  useSub(PubSubEvent.Delete, async (wid: string) => {
    if (confirm("Delete this widget?") === true) {
      setActionType("componentChange");

      const updatedUserWidgets = (userWidgets: UserWidget[]) =>
        [...userWidgets].filter((item: UserWidget) => item.wid !== wid);

      setUserWidgets(updatedUserWidgets);

      const updatedULayout = (layout: Layout[]) =>
        [...layout].filter((item: Layout) => item.i !== wid);

      setLayout(updatedULayout);
      // this triggers onLayoutChange => save Widgets & Layout
    }
  });

  useSub(PubSubEvent.MovingToast, ({ isMoving }: { isMoving: boolean }) => {
    setActionType("componentChange");
    setMovingToastShowed(isMoving);
  });

  useEffect(() => {
    // setUserWidgets(getLS(`userWidgets${selectedTab}`, DefaultWidgets, true));
    const laout = getLS(`userLayout${selectedTab}`, DefaultLayout, true);
    // setLayout(getLS(`userLayout${selectedTab}`, DefaultLayout, true));

    // setLayouts({
    //   xl: laout,
    //   lg: laout,
    //   md: laout,
    //   sm: laout,
    //   xs: laout,
    //   xxs: laout,
    // });
  }, [selectedTab]);

  const addWidget = (widget: Widget | null) => {
    setModalShowed(false);
    if (widget) {
      setActionType("componentChange");
      const wid = widget?.info?.wid + "-" + generateWID();
      userWidgets.push({
        wid,
      });

      const newLayoutItem: Layout = {
        i: wid,
        x: 1,
        y: 1,
        w: widget?.info?.w ?? 1,
        h: widget?.info?.h ?? 1,
      };
      // console.log('newLayoutItem', newLayoutItem);

      const newLayout = [...layout];
      newLayout.push(newLayoutItem);

      setLayout(() => newLayout);
      setLayouts({
        xl: newLayout,
        lg: newLayout,
        md: newLayout,
        sm: newLayout,
        xs: newLayout,
        xxs: newLayout,
      });

      saveTabLS(selectedTab, userWidgets, newLayout);
      updateLayoutConfig(userWidgets, newLayout);
      // Update LayoutConfig
    }
  };

  function handleSaveNewTabName(index: number, newName: string) {
    // Example: Update the tab name in local state
    const updatedTabs: TabItem[] = [...tabs];
    if (updatedTabs && index >= 0 && index < updatedTabs.length) {
      const tabToUpdate = updatedTabs[index];
      // Since tabToUpdate is derived from a condition-checked index, it should not be undefined.
      // However, TypeScript may still require assurance that tabToUpdate is not undefined.
      if (tabToUpdate) {
        // At this point, TypeScript understands tabToUpdate is not undefined due to the if check.
        const updatedTab = { ...tabToUpdate, layout_name: newName };
        // Now update the array with the updated item.
        const newTabs = [...updatedTabs];
        newTabs[index] = updatedTab;
        setTabs(newTabs);
      }
    }

    // setTabs(updatedTabs);

    // Optionally, make an API call to save the new tab name in your backend
    // fetch('/api/update-tab-name', { method: 'POST', body: JSON.stringify({ tabId: updatedTabs[index].layout_id, newName }) });
    if (index >= 0 && index < updatedTabs.length) {
      const tabToUpdate = updatedTabs[index];

      fetch("/api/update-tab-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          layout_id: tabToUpdate?.layout_id, // Ensure layout_id is accessed safely
          newName: newName,
        }),
        credentials: "include", // If needed for session handling
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json(); // Or handle the successful response appropriately
        })
        .then((data) => {
          console.log("Success:", data);
          // Handle success - perhaps confirming the tab update and managing any state as needed
        })
        .catch((error) => {
          console.error("Error:", error);
          // Handle failure - possibly by showing an error message or rolling back optimistic UI updates
        });

      // Assuming the rest of your logic correctly updates the UI
    }

    // Exit editing mode
    setIsEditing(false);
    setEditingIndex(-1);
    setNewTabName("");
  }

  const addTab = async () => {
    const newTabName = `Grid ${tabs.length + 1}`;
    // Optimistically update UI
    const optimisticTabs = [
      ...tabs,
      {
        user_id: session?.user.userId ? session?.user.userId : 1,
        layout_id: 0,
        layout_name: newTabName,
      },
    ];
    const optimisticLayoutLock = [...layoutLock, false];
    setTabs(optimisticTabs);
    setLayoutLock(optimisticLayoutLock);

    try {
      const response = await fetch("/api/tabs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          layout_name: newTabName,
        }),
      });

      if (!response.ok) {
        // Rollback optimistic updates upon error
        setTabs(tabs);
        setLayoutLock(layoutLock);

        throw new Error(`Error: ${response.statusText}`);
      }

      const updatedTabs = await response.json(); // Parse the response to get the updated tabs array

      // Update tabs with the response from the server
      setTabs(updatedTabs);

      // If you need to update the state with response data, do it here
    } catch (error) {
      console.error("Failed to add tab:", error);
    }
  };

  const handleTabDelete = async (id: number) => {
    if (tabs.length > 1) {
      console.log("id", id);
      const newTabs = tabs.filter((_, index) => index !== id);

      console.log("newTabs", newTabs);
      const newSelectedTab =
        selectedTab >= newTabs.length ? newTabs.length - 1 : selectedTab;

      console.log("newSelectedTab", newSelectedTab);

      setSelectedTab(newSelectedTab);
      setSelectedTabLayoutId(newTabs[0]?.layout_id);
      setTabs(newTabs);

      try {
        const response = await fetch(
          "/api/tabs?layout_id=" + tabs[id]?.layout_id,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          },
        );

        if (!response.ok) {
          // Rollback optimistic updates upon error
          // setTabs(tabs);
          // setLayoutLock(layoutLock);
          throw new Error(`Error: ${response.statusText}`);
        }

        alert("Successfully Deleted");

        // If you need to update the state with response data, do it here
      } catch (error) {
        console.error("Failed to add tab:", error);
      }
    }
  };

  const handleLayout = (selectedTab: number) => {
    const newLayoutLock = layoutLock.map((lock, index) =>
      index === selectedTab ? !lock : lock,
    );
    setLayoutLock(newLayoutLock);

    setModalShowed(true);
  };

  const updateLayoutConfig = async (
    userWidgets: UserWidget[],
    newLayout: Layout[],
    layout_id?: number,
  ) => {
    // selectedTab, newLayout;

    try {
      const response = await fetch("/api/layout-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          layout_id: layout_id ? layout_id : selectedTabLayoutId,
          layout_json: JSON.stringify(newLayout),
        }),
      });

      // If you need to update the state with response data, do it here
    } catch (error) {
      console.error("Failed to add tab:", error);
    }
  };

  const onLayoutChange =
    // useCallback(
    (currentLayout: ReactGridLayout.Layout[], allLayouts: Layouts) => {
      // resized done (from XL > LG):
      // onLayoutChange XL => onBreakpointChange LG (if changed => load & setLayout LG) => onLayoutChange LG

      // resized back (LG > XL)
      // onLayoutChange LG => onBreakpointChange XL  => onLayoutChange XL
      console.log("currentBreakpoint======", currentBreakpoint);
      console.log("isRedy", isReady);
      console.log(movingToastShowed);

      if (isReady) {
        if (movingToastShowed) {
          // tab switching
          // only save layout when moving widgets
          if (actionType == "componentChange") {
            saveTabLS(selectedTab, userWidgets, currentLayout);
            saveTabDB(selectedTab, userWidgets, currentLayout);

            updateLayoutConfig(userWidgets, currentLayout);

            // Update LayoutConfig

            localStorage.setItem(
              `userLayout${selectedTab}${currentBreakpoint}`,
              JSON.stringify(currentLayout),
            );
          }
        }

        currentLayout.forEach((item: Layout) => {
          if (isDoubleHeightWidget(item.i)) {
            item.h = 2;
          }
        });

        if (actionType == "tabSwitch") {
          // saveTabLS(selectedTab, userWidgets, currentLayout);
          // updateLayoutConfig(userWidgets, currentLayout);
        }
      }
    };

  return (
    <div className={"mt-4 h-full w-full overflow-auto px-10"}>
      <div className="flex">
        <Tabs defaultValue={tabs[selectedTab]?.layout_name} className="w-full">
          <TabsList className="h-auto flex-wrap">
            {tabs.map((tab, index) => (
              <div key={index}>
                {isEditing && editingIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={newTabName}
                      onChange={(e) => setNewTabName(e.target.value)}
                      className="rounded-md text-black"
                    />
                    <Button
                      onClick={() => {
                        // Function to handle saving the new tab name
                        handleSaveNewTabName(index, newTabName);
                      }}
                      className="ml-2 px-2 py-1 text-white"
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <TabsTrigger
                    value={tab.layout_name}
                    className={clsx(
                      "flex h-[40px] w-[100px] gap-4 rounded-t-md text-white",
                      selectedTab === index ? "border border-[#3374d9]" : "",
                    )}
                    onClick={() => {
                      setLayouts({});
                      setUserWidgets([]);

                      setSelectedTab(index);
                      setSelectedTabLayoutId(tabs[index]?.layout_id);
                      setActionType("tabSwitch");
                      fetchUserSettings(tabs[index]?.layout_id);
                    }}
                  >
                    {tab.layout_name}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <p
                          onClick={() => {
                            setSelectedTab(index);
                            setSelectedTabLayoutId(tabs[index]?.layout_id);
                          }}
                        >
                          <AiOutlineMore />
                        </p>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="mt-2 bg-[#222839]">
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            className="hover:opacity-75"
                            onClick={() => {
                              setIsEditing(true);
                              setEditingIndex(index);
                              setNewTabName(tab.layout_name); // Pre-fill the input with the current tab name
                              // Make sure to stop propagation to prevent triggering tab switch
                            }}
                          >
                            <a className="text-gray-300">Rename</a>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:opacity-75"
                            onClick={() => handleTabDelete(index)}
                          >
                            <a className="text-gray-300">Delete</a>
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TabsTrigger>
                )}
              </div>
            ))}

            <Button
              onClick={addTab}
              className="my-auto ml-2 px-2 py-2 text-white"
              variant={"none"}
            >
              +
            </Button>
          </TabsList>

          <TabsContent
            value={tabs[selectedTab]?.layout_name || ""}
            className="mt-1 w-full"
          >
            <ResponsiveGridLayout
              draggableHandle=".draggableHandle"
              className="layout"
              // layouts={{ xl: layout, lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
              layouts={layouts}
              onBreakpointChange={(newBreakpoint, newCols) => {
                if (newBreakpoint !== currentBreakpoint) {
                  // if changed => save LG; load & setLayout LG
                  // setLayout(getLSLayout(newBreakpoint));
                  // setLayouts({
                  //   xl: getLSLayout("xl"),
                  //   lg: getLSLayout("lg"),
                  //   md: getLSLayout("md"),
                  //   sm: getLSLayout("sm"),
                  //   xs: getLSLayout("xs"),
                  //   xxs: getLSLayout("xxs"),
                  // });
                }
                setCurrentBreakpoint(newBreakpoint);
                // console.log('onBreakpointChange', newBreakpoint, newCols);
                // setLayouts({ ...layouts });
              }}
              // cols={4}
              breakpoints={{
                xl: 1500,
                lg: 1200,
                md: 996,
                sm: 768,
                xs: 480,
                xxs: 0,
              }}
              cols={{ xl: 4, lg: 4, md: 4, sm: 4, xs: 1, xxs: 1 }}
              rowHeight={200}
              // width={1600}
              margin={[20, 20]}
              onLayoutChange={onLayoutChange}
              isResizable={false}
            >
              {userWidgets.map((widget: UserWidget, idx: number) => {
                const wid = widget?.wid ?? "";
                const type = wid.split("-")[0];
                const cn = ``;
                switch (type) {
                  case "analogclock":
                    return (
                      <div key={wid} className={cn}>
                        <AnalogClock key={`${wid}-main`} wid={wid} />
                      </div>
                    );
                  case "embed":
                    return (
                      <div key={wid} className={cn}>
                        <Embed key={`${wid}-main`} wid={wid} />
                      </div>
                    );
                  case "quote":
                    return (
                      <div key={wid} className={cn}>
                        <Quote key={`${wid}-main`} wid={wid} />
                      </div>
                    );
                  case "rssreader":
                    return (
                      <div key={wid} className={cn}>
                        <RSSReader key={`${wid}-main`} wid={wid} />
                      </div>
                    );
                  case "stock":
                    return (
                      <div key={wid} className={cn}>
                        <StockChartNoSSR
                          key={`${wid}-main`}
                          wid={wid}
                          symbol="SPY"
                        />
                      </div>
                    );
                  case "stockmini":
                    return (
                      <div key={wid} className={cn}>
                        <StockMiniNoSSR
                          key={`${wid}-main`}
                          wid={wid}
                          symbol="SPY"
                        />
                      </div>
                    );
                  case "BREAK":
                    return (
                      <div key={idx}>
                        <div key={`${idx}-main`} className="basis-full"></div>
                      </div>
                    );
                }
              })}
            </ResponsiveGridLayout>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button
            className={clsx(
              "add-widget px-3 py-1 text-base font-light text-white",
            )}
            variant="none"
            size="none"
            onClick={() => handleLayout(selectedTab)}
          >
            Add Widgets
          </Button>
        </div>

        {modalShowed && (
          <AddWidgetModal
            onCancel={() => setModalShowed(false)}
            onConfirm={addWidget}
          />
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(DashBoard), { ssr: false });
