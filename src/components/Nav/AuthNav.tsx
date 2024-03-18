import { Fragment } from "react";
import { Button } from "@/components/Common/Button";
import { useRouter } from "next/router";

const AuthNav = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <Fragment>
      <div className="fixed flex w-full justify-between px-10 py-4">
        <p className="title text-3xl uppercase">Defi</p>

        <div className="ml-auto">
          <div className="flex gap-2">
            <Button onClick={handleLogin}>Login</Button>

            <Button
              className="bg-sky-500 text-center hover:bg-sky-600"
              variant="none"
              onClick={handleSignUp}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default AuthNav;
