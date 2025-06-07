"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Blocks, Code2, Sparkles } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import RunButton from "./RunButton";
import HeaderProfileBtn from "./HeaderProfileBtn";
import TitleEditor from "./TitleEditor";
import SavingStatusIndicator from "./SavingStatusIndicator";

interface HeaderProps {
  snippetId?: string;
  snippetTitle?: string;
  onTitleUpdate?: (newTitle: string) => void;
}

function Header({ snippetId, snippetTitle, onTitleUpdate }: HeaderProps) {
  const { user } = useUser();

  return (
    <div className="relative z-10">
      <div
        className="flex items-center lg:justify-between justify-center 
        bg-gradient-to-br from-[#12121a] to-[#1a1a2e] backdrop-blur-xl p-6 mb-4 rounded-lg"
      >
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group relative">
            {/* Logo hover effect */}

            <div
              className="absolute -inset-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 rounded-lg opacity-0 
                group-hover:opacity-100 transition-all duration-500 blur-xl"
            />

            {/* Logo */}
            <div
              className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1
              ring-white/10 group-hover:ring-white/20 transition-all"
            >
              <Blocks className="size-6 text-orange-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
            </div>

            {/* <div className="flex flex-col">
              <span className="block text-lg font-semibold bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 text-transparent bg-clip-text">
                GistHub
              </span>
              <span className="block text-xs text-orange-400/60 font-medium">
                Interactive Code Editor
              </span>
            </div> */}
          </Link>

          {/* Title Editor and Saving Status */}
          <div className="flex items-center gap-4">
            {/* Title Editor - only show if we have snippet data */}
            {snippetId && snippetTitle && onTitleUpdate && (
              <TitleEditor
                snippetId={snippetId}
                initialTitle={snippetTitle}
                onTitleUpdate={onTitleUpdate}
              />
            )}

            {/* Saving Status Indicator */}
            <SavingStatusIndicator />
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            <Link
              href="/snippets"
              className="relative group flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-300 bg-gray-800/50 
                hover:bg-orange-500/10 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 shadow-lg overflow-hidden"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-orange-500/10 
                to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <Code2 className="w-4 h-4 relative z-10 group-hover:rotate-3 transition-transform" />
              <span
                className="text-sm font-medium relative z-10 group-hover:text-white
                 transition-colors"
              >
                Snippets
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <LanguageSelector hasAccess={true} />
          </div>

          {true && (
            <Link
              href="/pricing"
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border border-amber-500/20 hover:border-amber-500/40 bg-gradient-to-r from-amber-500/10 
                to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 
                transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 text-amber-400 hover:text-amber-300" />
              <span className="text-sm font-medium text-amber-400/90 hover:text-amber-300">
                Pro
              </span>
            </Link>
          )}

          <SignedIn>
            <RunButton />
          </SignedIn>

          <div className="pl-3 border-l border-gray-800">
            <HeaderProfileBtn />
          </div>
        </div>
      </div>
    </div>
  );
}
export default Header;
