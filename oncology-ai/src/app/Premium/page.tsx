"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const plans = [
  {
    id: 1,
    title: "Basic Plan",
    price: "₹149/month",
    description: "Get access to thinking model.",
    features: ["Critical thinking", "Human-like solution"],
  },
  {
    id: 2,
    title: "Pro Plan",
    price: "₹599/6-months",
    description: "Enjoy advanced features with canvas support.",
    features: ["Unlimited Access", "Priority Support"],
  },
  {
    id: 3,
    title: "Enterprise Plan",
    price: "₹1099/year",
    description: "Full access to all features with global server support.",
    features: ["All Features", "24/7 Support", "Custom Solutions"],
  },
];

const PremiumPage = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#151515] p-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-white mb-8">Choose Your Plan</h1>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-[#1b1a1a] p-8 rounded-lg text-white shadow-xl text-center transform hover:scale-105 transition-transform duration-300"
          >
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">{plan.title}</h2>
            <p className="text-lg font-bold text-yellow-400">{plan.price}</p>
            <p className="text-gray-300 mb-4">{plan.description}</p>

            {/* Features List */}
            <ul className="text-gray-400 text-sm mb-6 space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx}>✅ {feature}</li>
              ))}
            </ul>

            {/* Select Plan Button */}
            <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg hover:bg-yellow-600 transition">
              Select Plan
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PremiumPage;
