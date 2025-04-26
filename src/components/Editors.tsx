import { Button } from "../components/ui/button"; 
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import DiffViewer from 'react-diff-viewer';
import { getSpec, getComponent } from "../lib/forgeClient";
import { Select, SelectTrigger, SelectContent,
    SelectItem, SelectValue } from "../components/ui/select";
import { templates } from "../templates/index";

export default function Editors() {
  const [prompt, setPrompt] = useState('// requirements here');
  const [spec,   setSpec]   = useState("{}");
  const [code,   setCode]   = useState("// generated code here");
  const [prev,   setPrev]   = useState("");
  const templateKeys = Object.keys(templates);
  const [selectedTemplateName, setSelectedTemplateName] =
    useState(templateKeys[0]);

  async function handleGenerateSpec() {
    const json = await getSpec(prompt);
    setSpec(JSON.stringify(json, null, 2));
  }
  
  async function handleGenerateCode() {
    const template = templates[selectedTemplateName as keyof typeof templates];
    const files = await getComponent(template, JSON.parse(spec));
    setPrev(code);
    setCode(Object.values(files)[0] as string);
  }

  return (
    <div className="w-full grid grid-cols-2 gap-6 h-[80vh] p-4 flex-wrap">
      {/* Prompt / Spec pane */}
      <div className="flex flex-col h-full">
        <h2 className="text-lg font-semibold mb-2 text-gray-300">Prompt / Specification</h2>
        <div className="flex-grow border border-gray-700 rounded">
          <Editor
            height="100%"
            defaultLanguage="markdown"
            defaultValue={prompt}
            onChange={(v) => setPrompt(v ?? '')}
            theme="vs-dark"
            options={{ minimap: { enabled: false }, fontSize: 20 }}
          />
        </div>
        <div className="flex gap-3 mt-4">
          <Select
            value={selectedTemplateName}
            onValueChange={(v: string) => {
              setSelectedTemplateName(v);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(templates).map((key) => (
                <SelectItem key={key} value={key}>
                  {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateSpec} variant="default">
            Generate JSON spec
          </Button>
          <Button onClick={handleGenerateCode} variant="outline">
            Generate Component
          </Button>
        </div>
      </div>

      {/* Generated code + diff */}
      <div className="flex flex-col gap-2 h-full">
        <div className="flex flex-col flex-grow-[3] min-h-0">
          <h2 className="text-lg font-semibold mb-2 text-gray-300">Generated Code</h2>
          <div className="flex-grow border border-gray-700 rounded">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              theme="vs-dark"
              options={{ minimap: { enabled: false }, fontSize: 20 }}
            />
          </div>
        </div>
        <button
          className="self-end px-3 py-1 rounded border border-gray-600 hover:bg-gray-700"
          onClick={() => setPrev(code)}
        >
          Save Snapshot for Diff
        </button>
        {prev && (
          <div className="flex flex-col flex-grow-[2] min-h-0">
            <h3 className="text-md font-semibold my-2 text-gray-300">Diff View</h3>
            <div className="flex-grow border border-gray-700 rounded overflow-hidden">
              <DiffViewer
                oldValue={prev}
                newValue={code}
                splitView
                useDarkTheme={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}