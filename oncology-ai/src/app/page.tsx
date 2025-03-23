"use client";

import * as z from "zod";
import { Stethoscope, User, HeartPulse, Volume2,Mic,Paperclip ,Star } from "lucide-react";
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
import { useRouter } from "next/navigation";


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
  
      const medicalKeywords = [
        // General Medical Terms
        "medical", "medicine", "health", "doctor", "nurse", "hospital", "clinic", 
        "patient", "treatment", "diagnosis", "therapy", "symptoms", "disease", "disorder", 

        "diabetes", "type 1 diabetes", "type 2 diabetes", "gestational diabetes", 
        "prediabetes", "MODY", "LADA", "insulin", "blood sugar", "hyperglycemia", "hypoglycemia", 
        "glucose monitoring", "insulin resistance", "HbA1c", "diabetic neuropathy", 
        "diabetic retinopathy", "diabetic foot", "pancreas", "endocrinology", "metformin",
        "glucose tolerance test", "continuous glucose monitor", "ketones", "ketoacidosis",
      
        // Specialties
        "oncology", "cardiology", "neurology", "dermatology", "orthopedics", "psychiatry", 
        "endocrinology", "gastroenterology", "pulmonology", "rheumatology", "ophthalmology", 
        "otolaryngology", "urology", "nephrology", "gynecology", "pediatrics", "geriatrics",
        "hematology", "immunology", "anesthesiology", "pathology", "radiology", "allergy", 
        "genetics", "infectious disease", "toxicology", "sports medicine",
      
        // Conditions & Diseases
        "cancer", "tumor", "diabetes", "hypertension", "stroke", "asthma", "arthritis",
        "alzheimer", "parkinson", "epilepsy", "depression", "anxiety", "schizophrenia",
        "bipolar", "autism", "HIV", "AIDS", "COVID", "tuberculosis", "malaria",
        "influenza", "pneumonia", "hepatitis", "liver disease", "heart disease",
        "kidney disease", "lung disease", "chronic pain", "migraine", "eczema",
        "psoriasis", "osteoporosis", "sclerosis", "meningitis", "sepsis",
        "hypothyroidism", "hyperthyroidism", "anemia", "leukemia", "lymphoma",
      
        // Treatments & Procedures
        "surgery", "chemotherapy", "radiotherapy", "immunotherapy", "dialysis", "transplant",
        "vaccination", "MRI", "CT scan", "X-ray", "ultrasound", "biopsy", "endoscopy",
        "colonoscopy", "blood test", "ECG", "EEG", "ventilator", "stent", "bypass",
        "pacemaker", "IV therapy", "antibiotics", "antidepressants", "painkillers",
        "steroids", "hormone therapy", "physical therapy", "occupational therapy",
      
        // Anatomy & Physiology
        "heart", "lungs", "brain", "kidneys", "liver", "stomach", "intestines", 
        "pancreas", "thyroid", "blood vessels", "veins", "arteries", "muscles", 
        "bones", "joints", "spinal cord", "nervous system", "immune system",
        "respiratory system", "digestive system", "circulatory system", 
        "endocrine system", "reproductive system", "skin", "cells", "DNA",
      
        // Medical Equipment & Devices
        "stethoscope", "defibrillator", "ventilator", "wheelchair", "crutches", 
        "hearing aid", "prosthetic", "pacemaker", "catheter", "syringe", "scalpel",
        "thermometer", "blood pressure monitor", "pulse oximeter", "insulin pump",
      
        // Public Health & Preventive Medicine
        "nutrition", "diet", "exercise", "wellness", "mental health", "public health", 
        "epidemiology", "hygiene", "infection control", "first aid", "CPR", 
        "occupational health", "environmental health", "toxicology", "drug safety",
      
        // Pharmaceuticals & Medications
        "antibiotics", "antivirals", "antifungals", "vaccines", "analgesics", 
        "NSAIDs", "opioids", "antidepressants", "antipsychotics", "antihistamines",
        "chemotherapy drugs", "immunosuppressants", "hormones", "insulin", "corticosteroids",
        "anesthetics", "sedatives", "anticoagulants", "statins", "beta-blockers",
      
        // Alternative & Complementary Medicine
        "acupuncture", "chiropractic", "homeopathy", "herbal medicine", "meditation",
        "yoga", "naturopathy", "ayurveda", "holistic medicine", "mindfulness",
        "hypnotherapy", "reflexology", "massage therapy",

          // Medical Education & MMS
        "MBBS","MMS", "Master of Medical Science", "USMLE", "MCAT", "NEET", "medical school",
        "residency", "fellowship", "clinical rotations", "case study", "research paper",
        "medical ethics", "pathophysiology", "biochemistry", "pharmacology",
        "microbiology", "anatomy", "physiology", "biostatistics", "genomics",
        "medical licensing", "board certification", "continuing medical education (CME)",
        "clinical guidelines", "medical terminology", "evidence-based medicine",

  // Study-Related Topics
  "textbooks", "lectures", "online courses", "study guides", "medical journals",
  "case reports", "clinical trials", "peer-reviewed studies", "meta-analysis",
  "systematic reviews", "lab experiments", "dissections", "cadaver studies",
  "pharmacokinetics", "toxicology reports", "disease modeling",
  "telemedicine", "health informatics", "biomedical research", "statistics in medicine",

  // Healthcare & Policy
  "health insurance", "healthcare policy", "medical law", "patient rights",
  "HIPAA", "medical malpractice", "telehealth", "clinical guidelines",
  "hospital administration", "electronic health records (EHR)", "public health policy",
  "medical coding", "billing", "ICD codes", "clinical documentation",
  "health economics", "global health", "pandemic response", "disease prevention",
  "medical history", "physician burnout", "evidence-based practice"," twin autonomy", "hey","fever","Gynecology","Pediatrics","progesterone","BMI","acid","Nutrition","uric","BMI","yes",
  "स्वास्थ्य बीमा",  
  "स्वास्थ्य देखभाल नीति",  
  "चिकित्सा कानून",  
  "रोगी अधिकार",  
  "एचआईपीएए",  
  "चिकित्सीय कदाचार",  
  "टेलीहेल्थ",  
  "नैदानिक दिशानिर्देश",  
  "अस्पताल प्रशासन",  
  "इलेक्ट्रॉनिक स्वास्थ्य रिकॉर्ड (EHR)",  
  "सार्वजनिक स्वास्थ्य नीति",  
  "चिकित्सा कोडिंग",  
  "बिलिंग",  
  "आईसीडी कोड",  
  "नैदानिक दस्तावेज़ीकरण",  
  "स्वास्थ्य अर्थशास्त्र",  
  "वैश्विक स्वास्थ्य",  
  "महामारी प्रतिक्रिया",  
  "रोग निवारण",  
  "चिकित्सा इतिहास",  
  "चिकित्सक तनाव",  
  "साक्ष्य-आधारित अभ्यास",  
  "जुड़वां स्वायत्तता",  
  "हे",  
  "बुखार",  
  "स्त्री रोग",  
  "बाल चिकित्सा",  
  "प्रोजेस्टेरोन",  
  "बीएमआई",  
  "अम्ल",  
  "पोषण",  
  "यूरिक",  
  "हाँ",
  "चिकित्सा", "मेडिसिन", "स्वास्थ्य", "डॉक्टर", "नर्स", "अस्पताल", "क्लिनिक",
"मरीज़", "उपचार", "निदान", "थेरेपी", "लक्षण", "बीमारी", "विकार",

"मधुमेह", "टाइप 1 डायबिटीज", "टाइप 2 डायबिटीज", "गर्भकालीन मधुमेह",
"पूर्व मधुमेह", "MODY", "LADA", "इंसुलिन", "ब्लड शुगर", "हाइपरग्लाइसीमिया", "हाइपोग्लाइसीमिया",
"ग्लूकोज़ मॉनिटरिंग", "इंसुलिन प्रतिरोध", "HbA1c", "डायबिटिक न्यूरोपैथी",
"डायबिटिक रेटिनोपैथी", "डायबिटिक फुट", "अग्न्याशय", "एंडोक्राइनोलॉजी", "मेटफॉर्मिन",
"ग्लूकोज़ सहनशीलता परीक्षण", "निरंतर ग्लूकोज़ मॉनिटर", "कीटोन्स", "कीटोएसिडोसिस",

// विशेषताएँ
"ऑन्कोलॉजी", "कार्डियोलॉजी", "न्यूरोलॉजी", "डर्मेटोलॉजी", "ऑर्थोपेडिक्स", "साइकेट्री",
"एंडोक्राइनोलॉजी", "गैस्ट्रोएंटेरोलॉजी", "पल्मोनोलॉजी", "रयूमेटोलॉजी", "ऑप्थाल्मोलॉजी",
"ओटोलरिंगोलॉजी", "यूरोलॉजी", "नेफ्रोलॉजी", "गायनेकोलॉजी", "पीडियाट्रिक्स", "गेरियाट्रिक्स",
"हेमेटोलॉजी", "इम्यूनोलॉजी", "एनेस्थेसियोलॉजी", "पैथोलॉजी", "रेडियोलॉजी", "एलर्जी",
"जेनेटिक्स", "संक्रामक रोग", "टॉक्सिकोलॉजी", "खेल चिकित्सा",

// रोग और स्थितियाँ
"कैंसर", "ट्यूमर", "मधुमेह", "हाई ब्लड प्रेशर", "स्ट्रोक", "अस्थमा", "गठिया",
"अल्जाइमर", "पार्किंसन", "मिर्गी", "डिप्रेशन", "एंग्जायटी", "स्किज़ोफ्रेनिया",
"बाइपोलर", "ऑटिज्म", "एचआईवी", "एड्स", "कोविड", "क्षय रोग", "मलेरिया",
"इन्फ्लूएंजा", "निमोनिया", "हेपेटाइटिस", "यकृत रोग", "हृदय रोग",
"किडनी रोग", "फेफड़ों की बीमारी", "पुराना दर्द", "माइग्रेन", "एक्जिमा",
"सोरायसिस", "ऑस्टियोपोरोसिस", "स्क्लेरोसिस", "मेनिनजाइटिस", "सेप्सिस",
"हाइपोथायरायडिज्म", "हाइपरथायरायडिज्म", "एनीमिया", "ल्यूकेमिया", "लिंफोमा",
"वैद्यकीय", "औषध", "आरोग्य", "डॉक्टर", "नर्स", "रुग्णालय", "क्लिनिक",
"रुग्ण", "उपचार", "निदान", "थेरपी", "लक्षणे", "आजार", "विकार",

"मधुमेह", "टाइप 1 डायबिटीज", "टाइप 2 डायबिटीज", "गर्भधारणा मधुमेह",
"पूर्व मधुमेह", "MODY", "LADA", "इन्सुलिन", "रक्तातील साखर", "हायपरग्लायसेमिया", "हायपोग्लायसेमिया",
"ग्लुकोज निरीक्षण", "इन्सुलिन प्रतिकारशक्ती", "HbA1c", "डायबेटिक न्यूरोपॅथी",
"डायबेटिक रेटिनोपॅथी", "डायबेटिक फूट", "अग्न्याशय", "एंडोक्रायनोलॉजी", "मेटफॉर्मिन",
"ग्लुकोज टॉलरन्स टेस्ट", "सतत ग्लुकोज मॉनिटर", "केटोन्स", "केटोएसिडोसिस",

// विशेषज्ञता
"ऑन्कोलॉजी", "हृदयरोगशास्त्र", "मेंदूविज्ञान", "त्वचारोग", "हाडे आणि सांधे", "मानसोपचारशास्त्र",
"एंडोक्रायनोलॉजी", "गॅस्ट्रोएन्टेरोलॉजी", "फुप्फुसरोगशास्त्र", "सांधेदुखीशास्त्र", "नेत्ररोगशास्त्र",
"कान, नाक, घसा", "मूत्रपिंडशास्त्र", "मूत्रविज्ञान", "स्त्रीरोगशास्त्र", "बालरोगशास्त्र", "ज्येष्ठ नागरिक आरोग्य",
"रक्तरोगशास्त्र", "प्रतिकारशक्तीशास्त्र", "बेहोशीशास्त्र", "पॅथॉलॉजी", "रेडिओलॉजी", "अॅलर्जी",
"अनुवंशशास्त्र", "संसर्गजन्य रोग", "विषशास्त्र", "क्रीडा औषधशास्त्र",

// रोग आणि परिस्थिती
"कर्करोग", "ट्यूमर", "मधुमेह", "उच्च रक्तदाब", "स्ट्रोक", "अस्थमा", "संधिवात",
"अल्झायमर", "पार्किन्सन्स", "अपस्मार", "नैराश्य", "चिंता", "स्किझोफ्रेनिया",
"बायपोलर", "ऑटिझम", "एचआयव्ही", "एड्स", "कोविड", "क्षयरोग", "मलेरिया",
"इन्फ्लूएंझा", "न्यूमोनिया", "हिपॅटायटिस", "यकृत रोग", "हृदयविकार",
"मूत्रपिंडाचे आजार", "फुफ्फुस रोग", "जुनाट वेदना", "मायग्रेन", "अँक्सिमा",
"सोरायसिस", "हाडांचा ठिसूळपणा", "स्क्लेरोसिस", "मेंदूज्वर", "सेप्सिस",
"हायपोथायरॉइडिझम", "हायपरथायरॉइडिझम", "अ‍ॅनिमिया", "ल्यूकेमिया", "लिंफोमा"



      ];
      
      const isMedicalQuery = medicalKeywords.some(keyword =>
        userMessage.includes(keyword)
      );
  
      let botResponse;
  
      if (isMedicalQuery) {
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
      } else {
        botResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }
  
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


  const router = useRouter();

  return (
    <div className="w-[100%] h-screen flex">
      <AdminHeader onToggle={handleToggle} isAdmin={true} />

      <div className="w-full p-9  bg-[#151515] text-white">
      <button
        onClick={() => router.push("/Premium")}
        className="absolute top-5 right-5 flex items-center bg-yellow-500 text-white text-xs px-3 py-3 rounded-full shadow-md transition-transform hover:scale-105"
      >
        <Star size={14} className="mr-1" />
        Premium
      </button>
     
        <div className="px-4 lg:px-8 w-[100%] flex flex-col justify-center items-center">
          <div className="space-y-4 items-center justify-center flex-col flex w-[70%] mt-2 scrollbar-hidden h-[77vh] overflow-y-auto">
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
