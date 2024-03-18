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
import { saveTabDB, saveTabLS } from "./MainPageUtils";
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

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashBoard = ({ initialTabs }: { initialTabs: any }) => {
  const router = useRouter();
  const [tabs, setTabs] = useState<string[]>(["Grid 1"]);
  // const [tabs, setTabs] = useState<string[]>(
  //   initialTabs.length > 0
  //     ? initialTabs.map(
  //         (tab: { user_id: number; layout_id: string; layout_name: string }) =>
  //           tab.layout_name,
  //       )
  //     : ["Grid 1"],
  // );
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [layoutLock, setLayoutLock] = useState<boolean[]>([false]);

  const { data: session, status } = useSession();
  const [actionType, setActionType] = useState<string>("tabSwitch"); // 'tabSwitch' or 'componentChange'

  // const addTab = async () => {
  //   const newTabName = `Grid ${tabs.length + 1}`;

  //   // Optimistically update UI
  //   const optimisticTabs = [...tabs, newTabName];
  //   const optimisticLayoutLock = [...layoutLock, false];
  //   setTabs(optimisticTabs);
  //   setLayoutLock(optimisticLayoutLock);

  //   try {
  //     const response = await fetch("/api/layouts", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         userId: session?.user.userId,
  //         layout_name: newTabName,
  //       }),
  //     });

  //     if (!response.ok) {
  //       // Rollback optimistic updates upon error
  //       setTabs(tabs);
  //       setLayoutLock(layoutLock);
  //       throw new Error(`Error: ${response.statusText}`);
  //     }

  //     // If you need to update the state with response data, do it here
  //   } catch (error) {
  //     console.error("Failed to add tab:", error);
  //   }
  // };

  const { tabSettings, setTabSettings } = useAppContext();
  const [modalShowed, setModalShowed] = useState(false);
  // const [tab, setTab] = useState(0);
  // const [tabSettings, setTabSettings] = useState<any>({});
  const [movingToastShowed, setMovingToastShowed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [userWidgets, setUserWidgets] = useState<UserWidget[]>(
    getLS(`userWidgets${selectedTab}`, DefaultWidgets, true),
  );
  const [layout, setLayout] = useState<Layout[]>(
    getLS(`userLayout${selectedTab}`, DefaultLayout, true),
  );

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

  useEffect(() => {
    // when delete or add
    console.log("layout--------", layout);
  }, [layout]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      setIsReady(false);

      const token = session?.user.token ?? "";
      if (token) {
        // timestamp for caching many same requests at the same time (up to the same second)
        const timestamp = new Date().toISOString().split(".")[0]; // 2023-11-03T15:06:24 (removed nanosecs)
        const { data } = await apiGet(`/api/user/settings?ts=${timestamp}`, {});
        const newWidgets =
          (data?.userWidgets ?? []).length > 0
            ? data.userWidgets
            : DefaultWidgets;
        const newLayout =
          (data?.userLayout ?? []).length > 0 ? data.userLayout : DefaultLayout;

        saveTabLS(selectedTab, newWidgets, newLayout);
        console.log(selectedTab);
        debugger;
        setUserWidgets(newWidgets);
        setLayout(newLayout);
        console.log("data=tab", data?.tab);
        // setTabSettings(data?.tab ?? {});
      }
      // TODO: This is a Hack: Grid didn't load col 4, force it to reload col 4.
      setTimeout(() => {
        setLayouts({});
        setTimeout(() => {
          setLayouts({
            xl: layout,
            lg: layout,
            md: layout,
            sm: layout,
            xs: layout,
            xxs: layout,
          });
          setIsReady(true);
        }, 10);
      }, 10);
    };
    fetchUserSettings();
  }, []);
  // console.log('isReady', isReady, userWidgets, layout);

  useSub(PubSubEvent.Delete, async (wid: string) => {
    if (confirm("Delete this widget?") === true) {
      setActionType("componentChange");
      // console.log('> layout', layout, userWidgets, wid);
      // await deleteSettings(wid);

      const updatedUserWidgets = (userWidgets: UserWidget[]) =>
        [...userWidgets].filter((item: UserWidget) => item.wid !== wid);

      console.log("updatedUserWidgets=============", updatedUserWidgets);

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
    setUserWidgets(getLS(`userWidgets${selectedTab}`, DefaultWidgets, true));

    // const [userWidgets, setUserWidgets] = useState<UserWidget[]>(
    //   getLS(`userWidgets${selectedTab}`, DefaultWidgets, true),
    // );

    // const [layout, setLayout] = useState<Layout[]>(
    //   getLS(`userLayout${selectedTab}`, DefaultLayout, true),
    // );

    setLayout(getLS(`userLayout${selectedTab}`, DefaultLayout, true));
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
      debugger;
      // console.log('added', userWidgets, newLayout);
    }
  };

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

    setModalShowed(true);
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

            localStorage.setItem(
              `userLayout${selectedTab}${currentBreakpoint}`,
              JSON.stringify(currentLayout),
            );
          }
        }

        // TODO: HACK: for some reason, layout item's h was set to 1 at some point => change them back to 2
        currentLayout.forEach((item: Layout) => {
          if (isDoubleHeightWidget(item.i)) {
            item.h = 2;
          }
        });

        // console.log("current layout------", currentLayout);
        if (actionType == "componentChange")
          saveTabLS(selectedTab, userWidgets, currentLayout);
        // debugger;

        // setLayout(currentLayout);
        // setLayouts({
        //   xl: currentLayout,
        //   lg: currentLayout,
        //   md: currentLayout,
        //   sm: currentLayout,
        //   xs: currentLayout,
        //   xxs: currentLayout
        // });

        // console.log('--- currentLayout', currentLayout, allLayouts, isReady);
      }
    };

  return (
    <div className={"mt-4 h-full w-full overflow-auto px-10"}>
      <div className="flex">
        <Tabs defaultValue={tabs[selectedTab]} className="w-full">
          <TabsList className="h-auto flex-wrap">
            {tabs.map((tab, index) => (
              <div key={index}>
                <TabsTrigger
                  value={tab}
                  className={clsx(
                    "flex h-[40px] w-[100px] gap-4 rounded-t-md text-white",
                    selectedTab === index ? "border border-[#3374d9]" : "",
                  )}
                  onClick={() => {
                    setSelectedTab(index);
                    setActionType("tabSwitch");
                  }}
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
                          <a className="text-gray-300">Rename</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:opacity-75">
                          <a className="text-gray-300">Duplicate</a>
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

          <TabsContent value={tabs[selectedTab] || ""} className="mt-1 w-full">
            <ResponsiveGridLayout
              draggableHandle=".draggableHandle"
              className="layout"
              // layout={layout}
              // layouts={{ xl: layout, lg: layout, md: layout, sm: layout, xs: layout, xxs: layout }}
              layouts={layouts}
              onBreakpointChange={(newBreakpoint, newCols) => {
                if (newBreakpoint !== currentBreakpoint) {
                  // if changed => save LG; load & setLayout LG
                  setLayout(getLSLayout(newBreakpoint));
                  setLayouts({
                    xl: getLSLayout("xl"),
                    lg: getLSLayout("lg"),
                    md: getLSLayout("md"),
                    sm: getLSLayout("sm"),
                    xs: getLSLayout("xs"),
                    xxs: getLSLayout("xxs"),
                  });
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
              cols={{ xl: 4, lg: 3, md: 2, sm: 2, xs: 1, xxs: 1 }}
              rowHeight={200}
              // width={1600}
              margin={[20, 20]}
              onLayoutChange={onLayoutChange}
              isResizable={false}
            >
              {/* <div key={"embed"} className={"embed"}>
                <Embed key={`embed-main`} wid={"embed"} />
              </div>
              <div key={"analogclock"} className={"analogclock"}>
                <AnalogClock key={`analogclock-main`} wid={"analogclock"} />
              </div> */}

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

            <p className="text-white">{tabs[selectedTab]}</p>
          </TabsContent>
        </Tabs>

        {modalShowed && (
          <AddWidgetModal
            onCancel={() => setModalShowed(false)}
            onConfirm={addWidget}
          />
        )}

        {movingToastShowed && (
          <Toast
            content={
              <>
                <div>
                  <div className="text-black">
                    Drag & Drop widgets to move them
                  </div>
                  <span
                    role="button"
                    className="link-minor text-black underline"
                    onClick={() => publish(PubSubEvent.Moving, { stop: true })}
                  >
                    I'm done moving
                  </span>
                </div>
              </>
            }
            success
            onDismiss={() => setMovingToastShowed(false)}
          />
        )}
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

  const tabs = await db.layout.findMany({
    where: {
      user_id: session.user.userId,
    },
    // orderBy: {
    //   createdAt: "asc", // Assuming you have a createdAt field for ordering
    // },
  });

  console.log(tabs);

  // Pass the tabs data as props
  return {
    props: {
      initialTabs: tabs.map((tab) => tab.layout_name), // Adjust according to your data model
    },
  };

  return { props: {} };
};

// export default DashBoard;
export default dynamic(() => Promise.resolve(DashBoard), { ssr: false });
