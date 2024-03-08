import { signIn, signOut, useSession } from "next-auth/react";

import useGlobalContext from "@/hook/useGlobalContext";

import { api } from "@/utils/api";
import { Fragment, useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const router = useRouter();
  const { status, data: session } = useSession();
  const { state, dispatch } = useGlobalContext();


  useEffect(() => {
    dispatch({ type: "SET_IS_LOADING", payload: true });

    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "loading") {
      dispatch({ type: "SET_IS_LOADING", payload: true });
    } else {
      router.push("/dashboard");
    }    
    dispatch({type: 'SET_IS_LOADING', payload: false})

  }, [session, status]);
 
  return (
   <Fragment>
   </Fragment>
  );
}

