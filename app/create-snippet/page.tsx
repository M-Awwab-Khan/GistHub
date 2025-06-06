import Header from "@/components/create-snippet/Header";
import EditorPanel from "@/components/create-snippet/EditorPanel";
import OutputPanel from "@/components/create-snippet/OutputPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a0a] to-[#0a0a0f]">
      <div className="max-w-[1800px] mx-auto p-4">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EditorPanel />
          <OutputPanel />
        </div>
      </div>
    </div>
  );
}
