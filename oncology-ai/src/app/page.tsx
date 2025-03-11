"use client";

import * as z from "zod";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
// import Model  from "@/components/CarModel";

import { Empty } from "@/components/ui/empty";
import { formSchema } from "./constants";

const ConversationPage = () => {
  type ChatCompletionRequestMessage = {
    role: "user" | "assistant" | "system";
    content: string;
  };

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const playAudio = async (text: string) => {
    try {
      const response = await fetch("http://localhost:8000/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch("/api/OnCologyChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3.2",
          messages: [{ role: "user", content: values.prompt }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get a response from the API.");
      }

      const data = await response.json();
      console.log("Assistant Response:", data.content);

      setMessages((current) => [
        ...current,
        { role: "user", content: values.prompt },
        { role: "assistant", content: data.content },
      ]);

      playAudio(data.content); // Convert AI response to speech
      form.reset();
    } catch (error) {
      console.error("Error communicating with the API:", error);
    }
  };

  return (
    <div className="w-full p-9 overflow-hidden bg-[#111111] text-white ">
      <Heading
        title="OnCology Research AI "
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-white"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8 w-[100%]">
        <div className="space-y-4 w-full mt-4 scrollbar-hidden  h-[75vh] overflow-y-auto">
          <div className="overflow-y-auto scrollbar-hidden  w-[100%] h-full">
            {messages.length === 0 && !isLoading && <Empty label="What On Your Mind" />}

            <div className="flex flex-col gap-y-4 p-4  rounded-lg">
              {messages.map((message) => (
                <div
                  key={message.content}
                  className={cn(
                    "p-4 flex items-start gap-x-4 text-[1.3rem] rounded-lg shadow-sm",
                    "inline-block max-w-[75%] whitespace-pre-wrap break-words",
                    message.role === "user"
                      ? "bg-[#161616] text-white rounded-xl rounded-br-none self-end"
                      : "bg-[#161616] text-white rounded-xl rounded-bl-none self-start"
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <div
                    className="text-sm w-full scrollbar-thin overflow-hidden scrollbar-thumb-gray-500 scrollbar-track-gray-300"
                    style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col justify-center items-center mt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className=" w-[60%]  rounded-[2rem] border-[#383838] border p-4 px-3 md:px-6 focus-within:shadow-sm flex items-center gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="w-full border-0 border-[#555454] outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="Tell me About OnCology..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className=" lg:w-[15%] rounded-[2rem] flex-shrink-0"
                type="submit"
                disabled={isLoading}
              >
                Learn
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
