import { Button } from "../components/ui/button"; 
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import DiffViewer from 'react-diff-viewer';
import { getSpec, getComponent } from "../lib/forgeClient";
import { Select, SelectTrigger, SelectContent,
    SelectItem, SelectValue } from "../components/ui/select";
import { templates } from "../templates/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

export default function Editors() {
  const [prompt, setPrompt] = useState('// free text user requirements here');
  const [spec,   setSpec]   = useState("{}");
  const [code,   setCode]   = useState("// generated code here");
  const [testCode, setTestCode] = useState("");
  const [prev,   setPrev]   = useState("");
  const [isSpecLoading, setIsSpecLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState("component");
  const templateKeys = Object.keys(templates);
  const [selectedTemplateName, setSelectedTemplateName] =
    useState(templateKeys[0]);

  async function handleGenerateSpec() {
    try {
      setIsSpecLoading(true);
      const json = await getSpec(prompt);
      setSpec(JSON.stringify(json, null, 2));
      console.log('spec', json);
    } finally {
      setIsSpecLoading(false);
    }
  }
  
  async function handleGenerateCode() {
    try {
      setIsCodeLoading(true);
      const template = templates[selectedTemplateName as keyof typeof templates];
      const files = await getComponent(template, JSON.parse(spec));
      
      // Extract component and test files
      const fileEntries = Object.entries(files);
      const componentFile = fileEntries.find(([name]) => !name.includes('test') && !name.includes('Test'));
      const testFile = fileEntries.find(([name]) => name.includes('test') || name.includes('Test'));
      
      // Update state with the files
      if (componentFile) {
        // Make sure we're getting clean code, not JSON-wrapped content
        const componentCode = typeof componentFile[1] === 'string' 
          ? componentFile[1] 
          : JSON.stringify(componentFile[1], null, 2);
        setCode(formatCode(componentCode));
      }
      
      if (testFile) {
        // Make sure we're getting clean code, not JSON-wrapped content
        const testCodeContent = typeof testFile[1] === 'string' 
          ? testFile[1] 
          : JSON.stringify(testFile[1], null, 2);
        setTestCode(formatCode(testCodeContent));
      } else {
        setTestCode("// No test file was generated for this component.");
      }
      
      console.log('Generated files:', Object.keys(files));
    } finally {
      setIsCodeLoading(false);
    }
  }
  
  // Simple formatting function (Monaco editor will handle most formatting)
  function formatCode(codeString: string) {
    return codeString
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove excessive blank lines
      .trim();
  }

  return (
    <div className="flex flex-col">
        <h1 className="text-2xl ml-4 mt-4 font-semibold text-gray-300">Prompt-as-Policy Demo</h1>
    <div className="w-full grid gap-6 p-4 flex-wrap">
      {/* Prompt / Spec pane */}
      <div className="flex flex-col h-[50vh]">
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
          <Button 
            onClick={handleGenerateSpec} 
            variant="outline" 
            className="hover:bg-blue-700 transition-colors hover:cursor-pointer"
            disabled={isSpecLoading}
          >
            {isSpecLoading ? 'Generating...' : 'Generate JSON spec'}
          </Button>
        </div>
        
        {spec !== "{}" && (
          <div className="mt-4 flex flex-col">
            <h3 className="text-md font-semibold mb-2 text-gray-300">JSON Specification</h3>
            <div className="border border-gray-700 rounded h-[200px]">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={spec}
                theme="vs-dark"
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 14,
                  readOnly: true
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Generated code + diff */}
      <div className="flex flex-col gap-2 h-full">
        <div className="flex flex-col flex-grow-[3] h-full">
          <div className="flex-col justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-300">Generate Code</h2>
            <div className="flex flex-col gap-2">
                <h3 className="text-md font-semibold my-2 text-gray-300">First select policy template, then generate the combination of json spec and code policy.</h3>
            <Select
            value={selectedTemplateName}
            onValueChange={(v: string) => {
              setSelectedTemplateName(v);
            }}
          >
            <SelectTrigger className="w-[180px] hover:cursor-pointer hover:bg-amber-700 transition-colors">
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent className="hover:cursor-pointer bg-gray-700">
              {Object.keys(templates).map((key) => (
                <SelectItem key={key} value={key} className="hover:cursor-pointer hover:bg-amber-700 transition-colors">
                  {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleGenerateCode} 
            variant="outline"
            className="hover:bg-purple-700 mt-2 w-[180px] transition-colors hover:cursor-pointer"
            disabled={isCodeLoading}
          >
            {isCodeLoading ? 'Generating...' : 'Generate Component'}
          </Button>
            </div>
          </div>
          
          <Tabs 
            value={currentTab} 
            onValueChange={setCurrentTab} 
            className="w-full min-h-80"
          >
            <TabsList className="mb-2">
              <TabsTrigger 
                value="component" 
                className="hover:cursor-pointer hover:bg-gray-700 flex-1"
              >
                Component
              </TabsTrigger>
              <TabsTrigger 
                value="test" 
                className="hover:cursor-pointer hover:bg-gray-700 flex-1"
              >
                Unit Test
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="component" className="flex-grow border border-gray-700 rounded h-[350px]">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                value={code}
                onChange={(v) => setCode(v ?? '')}
                theme="vs-dark"
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 20,
                  formatOnPaste: true,
                  formatOnType: true
                }}
              />
            </TabsContent>
            
            <TabsContent value="test" className="flex-grow border border-gray-700 rounded h-[350px]">
              <Editor
                height="100%"
                defaultLanguage="typescript"
                value={testCode || "// No test file generated yet"}
                onChange={(v) => setTestCode(v ?? '')}
                theme="vs-dark"
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 20,
                  formatOnPaste: true,
                  formatOnType: true
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <button
          className="self-end px-3 py-1 rounded border border-gray-600 hover:bg-gray-700"
          onClick={() => setPrev(currentTab === "component" ? code : testCode)}
        >
          Save Snapshot for Diff
        </button>
        
        {prev && (
          <div className="flex flex-col flex-grow-[2] min-h-0">
            <h3 className="text-md font-semibold my-2 text-gray-300">Diff View</h3>
            <div className="flex-grow border border-gray-700 rounded overflow-hidden">
              <DiffViewer
                oldValue={prev}
                newValue={currentTab === "component" ? code : testCode}
                splitView
                useDarkTheme={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}