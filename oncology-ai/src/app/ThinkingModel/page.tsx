"use client";

import * as z from "zod";
import { Stethoscope, User, HeartPulse } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { formSchema } from "../constants";
import { ModelViewer } from "@/components/CarModel";
import AdminHeader from "@/components/Header";

const simulateTypingEffect = (
  text: string,
  callback: (content: string) => void,
  onComplete: () => void
) => {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      callback(text.substring(0, i + 1));
      i++;
    } else {
      clearInterval(interval);
      onComplete();
    }
  }, 10);
};

const ConversationPage = () => {
  type ChatCompletionRequestMessage = {
    role: "user" | "assistant" | "system";
    content: string;
  };

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

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
      ]);

      setMessages((current) => [
        ...current,
        { role: "assistant", content: "Typing..." },
      ]);

      setIsAnimating(true);

      simulateTypingEffect(
        data.content,
        (content: string) => {
          setMessages((current) => [
            ...current.slice(0, -1),
            { role: "assistant", content },
          ]);
        },
        () => {
          setIsAnimating(false);
          setIsLoading(false);
        }
      );

      form.reset();
    } catch (error) {
      console.error("Error communicating with the API:", error);
      setIsLoading(false);
    }
  };

  const handleToggle = (collapsed: boolean) => {
    console.log("Menu collapsed:", collapsed);
  };

  return (
    <div className="w-[100%] flex">
      <AdminHeader onToggle={handleToggle} isAdmin={true} />
      <div className="w-full p-9 overflow-hidden bg-[#111111] text-white">
        <div className="px-4 lg:px-8 w-[100%] flex flex-col justify-center items-center">
          <div className="space-y-4 items-center justify-center flex-col flex w-[70%] mt-4 scrollbar-hidden h-[84vh] overflow-y-auto">
            <div className="w-full">
              <Heading
                title="OnCology Research AI"
                description="Thinking Model."
                icon={HeartPulse}
                iconColor="text-white"
                bgColor=" "
              />
            </div>
            <div className="overflow-y-auto scrollbar-hidden w-[100%] h-full">
              {messages.length === 0 && !isLoading && <ModelViewer />}
              <div className="flex flex-col gap-y-4 p-4 rounded-lg">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 flex items-center justify-center gap-x-4 text-[3rem] rounded-lg shadow-sm",
                      "inline-block max-w-[80%] whitespace-pre-wrap break-words",
                      message.role === "user"
                        ? "bg-[#1f1e1e] text-white rounded-3xl rounded-br-none self-end"
                        : "bg-[#1f1e1e] text-white rounded-3xl rounded-bl-none self-start"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Stethoscope className="w-6 h-6 text-green-500" />
                    )}
                    <div
                      className="text-[1.2rem] w-full scrollbar-thin overflow-hidden scrollbar-thumb-gray-500 scrollbar-track-gray-300"
                      style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start items-start">
                    <div className="spinner"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full flex flex-col justify-center items-center">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-[60%] rounded-[3rem] border-[#383838] border p-4 px-3 md:px-6 focus-within:shadow-sm flex items-center gap-2"
              >
                <FormField
                  name="prompt"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl className="m-0 p-0">
                        <Input
                          className="w-full border-0 border-[#383838] outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                          disabled={isLoading}
                          placeholder="Tell me About OnCology..."
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button
                  className="lg:w-[12%] text-black bg-white rounded-[3rem] flex-shrink-0"
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
    </div>
  );
};

export default ConversationPage;
