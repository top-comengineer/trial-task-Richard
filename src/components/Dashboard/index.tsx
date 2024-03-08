import Nav from "@/components/Nav";
import { useEffect } from "react";
import { useRouter } from "next/router";
import useGlobalContext from "@/hook/useGlobalContext";
import { signIn, signOut, useSession } from "next-auth/react";


const Dashboard = () => {

  const router = useRouter();
  const {status, data: session} = useSession();

  const { state, dispatch } = useGlobalContext();

  
  useEffect(() => {
    const currentDate = new Date();
    console.log('session -> ', session, status)

    if(status === 'unauthenticated') {
      router.push('/auth/login')
    } else if(status === 'loading') {
      dispatch({type: 'SET_IS_LOADING', payload: true})
    } 
    else {
      router.push('/')
    }

    dispatch({type: "SET_IS_LOADING", payload: false})
  }, [session, status])


  return (
    <div className={"min-h-screen bg-[#0b0e13]"}>
      <p className="text-white">DashBoard</p>
    </div>
  )
}

export default Dashboard