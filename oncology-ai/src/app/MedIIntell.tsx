"use client";

import * as z from "zod";
import { Stethoscope, User, HeartPulse, Volume2,Mic,Paperclip  } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { formSchema } from "./constants";
import { ModelViewer } from "@/components/CarModel";
import AdminHeader from "@/components/Header";
import { Edit, Save, X } from "lucide-react"; // Import icons


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
  }, -10);
};

const speakText = (text: string) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    
    const femaleVoice = voices.find((v) => v.name.includes("Female") || v.name.includes("Google UK English Female") || v.name.includes("Samantha"));
    utterance.voice = femaleVoice || voices.find((v) => v.name.includes("Google")) || null;
    
    utterance.rate = 1; 
    utterance.pitch = 1.2; 
    speechSynthesis.speak(utterance);
  } else {
    console.error("Speech synthesis not supported in this browser.");
  }
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
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedMessage, setEditedMessage] = useState("");


  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      form.setValue("prompt", transcript);
      form.handleSubmit(onSubmit)();
    };

    recognition.start();
  };


  const handleEditClick = (index: number, content: string) => {
    setEditingIndex(index);
    setEditedMessage(content);
  };

  const handleSaveEdit = async (index: number) => {
    const updatedMessages = [...messages];
    updatedMessages[index].content = editedMessage;
    setMessages(updatedMessages);
    setEditingIndex(null);
  
    await onSubmit({ prompt: editedMessage });
  };


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
  const fallbackResponses = [
    "I'm specialized in medical topics. Try asking me about healthcare!",
    "I currently focus on medical and health-related discussions.",
    "It looks like your question isn't related to medicine. Try a medical topic!",
    "I'm built to provide medical insights. Can I help with anything health-related?",
    "I'm here for medical conversations! Maybe ask me about diseases, treatments, or healthcare?"
  ];

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
  
      const userMessage = values.prompt.toLowerCase();
  
    

  

    
      let botResponse;
  
        const response = await fetch("/api/OnCologyChat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2",
            messages: [{ role: "user", content: values.prompt }]
          })
        });
  
        if (!response.ok) {
          throw new Error("Failed to get a response from the API.");
        }
  
        const data = await response.json();
        botResponse = data.content;
     
  
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
        botResponse,
        (content: string) => {
          setMessages((current) => [
            ...current.slice(0, -1),
            { role: "assistant", content },
          ]);
        },
        () => {
          setIsAnimating(false);
          setIsLoading(false);
          speakText(botResponse); 
        }
      );
  
      form.reset();
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };
  
  const handleToggle = (collapsed: boolean) => {
    console.log("Menu collapsed:", collapsed);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
  };

  return (
    <div className="w-[100%] h-screen flex">
      <AdminHeader onToggle={handleToggle} isAdmin={true} />

      <div className="w-full p-9  bg-[#151515] text-white">
        <div className="px-4 lg:px-8 w-[100%] flex flex-col justify-center items-center">
          <div className="space-y-4 items-center justify-center flex-col flex w-[70%] mt-2 scrollbar-hidden h-[78vh] overflow-y-auto">
            <div className="w-full">
              <Heading
                title="MedIntel"
                description="Ever Evolving model."
                icon={HeartPulse}
                iconColor="text-white"
                bgColor=" "
              />
            </div>
              <div className="overflow-y-auto scrollbar-hidden w-[100%] h-full">
                {messages.length === 0 && !isLoading && <ModelViewer />}
                <div className="flex flex-col gap-y-[4rem] p-4 rounded-lg">
                {messages.map((message, index) => (
  <div
    key={index}
    className={cn(
      "p-4 flex items-center justify-center gap-x-[2rem] text-[1.2rem] rounded-lg shadow-sm",
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

    {editingIndex === index ? (
      <input
        type="text"
        value={editedMessage}
        onChange={(e) => setEditedMessage(e.target.value)}
        className="bg-gray-700 text-white p-2 rounded-md border-none focus:ring-2 focus:ring-blue-400"
      />
    ) : (
      <span>{message.content}</span>
    )}

    {message.role === "assistant" && (
      <button
        onClick={() => speakText(message.content)}
        className="text-blue-500 hover:text-blue-300 ml-2"
      >
        <Volume2 className="w-5 h-5" />
      </button>
    )}
    

    {message.role === "user" && editingIndex === index ? (
      <>
        <button
          onClick={() => handleSaveEdit(index)}
          className="text-green-500 hover:text-green-300 ml-2"
        >
          <Save className="w-5 h-5" />
        </button>
        <button
          onClick={() => setEditingIndex(null)}
          className="text-red-500 hover:text-red-300 ml-2"
        >
          <X className="w-5 h-5" />
        </button>
      </>
    ) : message.role === "user" ? (
      <button
        onClick={() => handleEditClick(index, message.content)}
        className="text-blue-500 hover:text-blue-300 ml-2"
      >
        <Edit className="w-5 h-5" />
      </button>
    ) : null}
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

          <div className="w-full flex pt-5 flex-col justify-center items-center">
  <Form {...form}>
  <form
  onSubmit={form.handleSubmit(onSubmit)}
  className="w-[70%] fle1x gap-2 border-[#272626] bg-[#1d1d1d] border px-4 py-3 rounded-[3rem]"
>
 

  <FormField
    name="prompt"
    render={({ field }) => (
      <FormItem className="w-full flex items-left">
        <FormControl>
          <Input
            className="w-full border-0 focus-visible:ring-0"
            disabled={isLoading}
            placeholder="Tell me about Oncology..."
            {...field}
          />
        </FormControl>
      </FormItem>
    )}
  />

  <div className="w-full flex justify-between items-center gap-4 p-2">
  <div>
    <input
      type="file"
      accept="image/*,application/pdf"
      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      className="hidden"
      id="file-upload"
    />
    <label htmlFor="file-upload" className="cursor-pointer text-gray-400 hover:text-white">
      <Paperclip className="w-6 h-6" />
    </label>
  </div>

  <div className="flex items-center gap-3">
    <Mic
      className={cn(
        "w-6 h-6 cursor-pointer",
        isListening ? "text-red-500" : "text-white hover:text-gray-400"
      )}
      onClick={startListening}
    />  
     <button
          onClick={stopSpeaking}
          className="text-red-500 hover:text-gray-400 transition duration-300"
        >
          ⏹️
        </button>

    <Button
      className="w-[100px] text-black bg-white rounded-[3rem]"
      type="submit"
      disabled={isLoading}
    >
      Learn
    </Button>
  </div>
</div>

</form>
  </Form>

  {selectedFile && (
    <div className="mt-2 text-gray-300 text-sm">{selectedFile.name}</div>
  )}
</div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
