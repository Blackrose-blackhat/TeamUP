"use client";

import { Scene } from "@/components/visuals/model";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { Users, Lightbulb, Trophy, Rocket, GithubIcon } from "lucide-react";
import { FaGoogle, FaGithub } from "react-icons/fa";

const features = [
    {
        icon: Users,
        title: "Find Teammates",
        description: "Connect with builders, developers, and innovators.",
    },
    {
        icon: Lightbulb,
        title: "Showcase Skills",
        description: "Highlight your projects and attract collaborators.",
    },
    {
        icon: Trophy,
        title: "Join Hackathons",
        description: "Team up for exciting hackathons and competitions.",
    },
    {
        icon: Rocket,
        title: "Build Together",
        description: "Turn ideas into reality with the right team.",
    },
];

const Hero = () => {
    return (
        <div className="min-h-svh w-screen bg-linear-to-br from-[#000] to-[#1A2428] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <div className="w-full max-w-6xl space-y-12 relative z-10">
                {/* Headline + Subtext */}
                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="space-y-6 flex items-center justify-center flex-col">
                        <h1 className="text-3xl md:text-6xl font-semibold tracking-tight max-w-3xl">
                            TeamUp: <span className="text-primary">Find. Connect. Build.</span>
                        </h1>
                        <p className="text-lg text-neutral-300 max-w-2xl">
                            Join a community of students, developers, and innovators. Find your
                            perfect teammates, collaborate on projects, and grow together.
                        </p>

                        {/* Social Login Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Button
                                size="lg"
                                className="cursor-pointer text-sm px-8 py-3 rounded-xl bg-white text-black border border-white/10 hover:bg-white/90 flex items-center gap-2"
                                onClick={() => signIn("google",{callbackUrl:"/dashboard"}) }
                                
                            >
                                <FaGoogle className="w-5 h-5" />
                                Continue with Google
                            </Button>

                            <Button
                                size="lg"
                                className="cursor-pointer text-sm px-8 py-3 rounded-xl bg-black text-white border border-white/20 hover:bg-black/90 flex items-center gap-2"
                                onClick={() => signIn("github", {callbackUrl:"/dashboard"})}
                            >
                                <GithubIcon />
                                Continue with GitHub
                            </Button>

                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-40 md:h-48 flex flex-col justify-start items-start space-y-2 md:space-y-3"
                        >
                            <feature.icon size={20} className="text-white/80" />
                            <h3 className="text-sm md:text-base font-medium">{feature.title}</h3>
                            <p className="text-xs md:text-sm text-neutral-400">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Scene */}
            <div className="absolute inset-0">
                <Scene />
            </div>
        </div>
    );
};

export { Hero };
