import Image from "next/image";
import { Code } from "lucide-react";
import CodeBlock from "./CodeBlock";

interface ExecutionsListProps {
  executions: Array<{
    id: string;
    userId: string;
    language: string;
    code: string;
    output?: string | null;
    error?: string | null;
    createdAt: Date;
  }>;
}

export default function ExecutionsList({ executions }: ExecutionsListProps) {
  if (executions.length === 0) {
    return (
      <div className="text-center py-12">
        <Code className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">
          No code executions yet
        </h3>
        <p className="text-gray-500">
          Start coding to see your execution history!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {executions.map((execution) => (
        <div
          key={execution.id}
          className="group rounded-xl overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/50"
        >
          <div className="flex items-center justify-between p-4 bg-black/30 border border-gray-800/50 rounded-t-xl">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <Image
                  src={"/" + execution.language + ".png"}
                  alt=""
                  className="rounded-lg relative z-10 object-cover"
                  width={40}
                  height={40}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {execution.language.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">
                    {execution.createdAt.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      execution.error
                        ? "bg-red-500/10 text-red-400"
                        : "bg-orange-500/10 text-orange-400"
                    }`}
                  >
                    {execution.error ? "Error" : "Success"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/20 rounded-b-xl border border-t-0 border-gray-800/50">
            <CodeBlock code={execution.code} language={execution.language} />

            {(execution.output || execution.error) && (
              <div className="mt-4 p-4 rounded-lg bg-black/40">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  Output
                </h4>
                <pre
                  className={`text-sm ${
                    execution.error ? "text-red-400" : "text-orange-400"
                  }`}
                >
                  {execution.error || execution.output}
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
