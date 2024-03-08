import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/Common/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/Common/Form";
import { Input } from "@/components/Common/Input";
import Link from "next/link";
import { useRouter } from "next/router";
import useGlobalContext from "@/hook/useGlobalContext";
import clsx from "clsx";
import { api } from "@/utils/api";
import { toast } from "react-toastify";

const FormSchema = z
  .object({
    email: z.string().email({
      message: "Please enter the valid email address.",
    }),
    password: z.string().nonempty({
      message: "Please enter your password.",
    }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match.",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const router = useRouter();
  const { state } = useGlobalContext();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = api.auth.register.useMutation({
    onError: (e) => setErrorMessage(e.message),
    onSuccess: () => router.push("/auth/login"),
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      await mutation.mutateAsync(data).then(() => {
        toast.success("successfully", {
          position: 'top-center'
        })
      }).catch(e => {
        toast.error(errorMessage, {
          position: 'top-center'
        })
      })

    } catch (e) {
      console.error("Sign Up Failed:", e);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mx-auto my-auto flex w-[320px] flex-col gap-5 rounded-2xl bg-[#181d2a] p-10 text-white shadow-md sm:w-[400px] md:w-[576px] lg:w-[576px]"
      >
        <div className="flex flex-col gap-6 py-4">
          <p className="text-center text-3xl font-bold">Sign Up</p>
          <div className="flex justify-center gap-2">
            <p className="text-center text-lg">Already joined?</p>
            <Link
              href="/auth/login"
              className="text-lg text-sky-400 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Email *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email"
                  {...field}
                  className={clsx(
                    form.formState.errors.email ? "border-red-500" : "",
                    "text-black",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="password"
                  {...field}
                  className={clsx(
                    form.formState.errors.password ? "border-red-500" : "",
                    "text-black",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base">Confirm Password *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="confirm password"
                  {...field}
                  className={clsx(
                    form.formState.errors.confirmPassword
                      ? "border-red-500"
                      : "",
                    "text-black",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant={"none"}
          className="mt-3 bg-[#3374d9] text-lg hover:bg-[#4574c0]"
        >
          SignUp
        </Button>
      </form>
    </Form>
  );
};

export default SignUp;
