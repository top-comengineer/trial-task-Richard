import Nav from "@/components/Nav/AuthNav";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useGlobalContext from "@/hook/useGlobalContext";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const router = useRouter();
  const { status, data: session } = useSession();

  const { state, dispatch } = useGlobalContext();

  useEffect(() => {
    console.log("session -> ", session, status);
    dispatch({ type: "SET_IS_LOADING", payload: true });

    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "loading") {
      dispatch({ type: "SET_IS_LOADING", payload: true });
    } else {
      router.push("/");
    }    
    dispatch({type: 'SET_IS_LOADING', payload: false})

  }, [session, status]);

  return (
    <div className={"h-full bg-[#0b0e13]"}>
      <p className="text-white">DashBoard</p>
    </div>
  );
};

export default Dashboard;
