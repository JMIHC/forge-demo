import { Button } from "../components/ui/button"; 
import Editor from '@monaco-editor/react';
import { useState } from 'react';
import DiffViewer from 'react-diff-viewer';
import { getSpec, getComponent } from "../lib/forgeClient";
import { Select, SelectTrigger, SelectContent,
    SelectItem, SelectValue } from "../components/ui/select";
import { templates } from "../templates/index";
import { useTheme } from "../context/ThemeContext";

export default function Editors() {
  const { editorTheme, theme, toggleTheme } = useTheme();
  const [prompt, setPrompt] = useState('// Dev requirements to be rendered to JSON spec');
  const [spec,   setSpec]   = useState("{}");
  const [code,   setCode]   = useState("// generated code here");
  const [prevCode, setPrevCode] = useState("");
  const [hasPreviousGeneration, setHasPreviousGeneration] = useState(false);
  const [isSpecLoading, setIsSpecLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);
  const templateKeys = Object.keys(templates);
  const [selectedTemplateName, setSelectedTemplateName] =
    useState(templateKeys[0]);

  async function handleGenerateSpec() {
    try {
      setIsSpecLoading(true);
      const json = await getSpec(prompt);
      setSpec(JSON.stringify(json, null, 2));
    } finally {
      setIsSpecLoading(false);
    }
  }
  
  async function handleGenerateCode() {
    try {
      setIsCodeLoading(true);
      
      // Save the current code for diff only if it's not the initial placeholder
      if (code !== "// generated code here" && code.trim() !== "") {
        setPrevCode(code);
        setHasPreviousGeneration(true);
      }
      
      const template = templates[selectedTemplateName as keyof typeof templates];
      const files = await getComponent(template, JSON.parse(spec));
      
      // Log what files we received to help with debugging
      console.log('Received files:', Object.keys(files));
      
      // First, check if we received a string that looks like JSON
      let processedFiles = files;
      if (typeof files === 'string' && files.trim().startsWith('{')) {
        try {
          // If it's a JSON string, parse it
          processedFiles = JSON.parse(files);
          console.log('Parsed JSON string into object with keys:', Object.keys(processedFiles));
        } catch (err) {
          console.error('Failed to parse JSON string:', err);
          // Keep the original files object if parsing fails
          processedFiles = files;
        }
      }
      
      // Extract component and test files
      const fileEntries = typeof processedFiles === 'object' && !Array.isArray(processedFiles) 
        ? Object.entries(processedFiles) 
        : [];
      
      // Find primary component file (exclude test, Test, or stories)
      const componentFile = fileEntries.find(([name]) => 
        !name.toLowerCase().includes('test') && 
        !name.toLowerCase().includes('stories')
      );
      
      // Update state with the component file
      if (componentFile) {
        let componentCode = '';
        
        if (typeof componentFile[1] === 'string') {
          // The content is already a string, use it directly
          componentCode = componentFile[1];
        } else if (typeof componentFile[1] === 'object') {
          // The content is an object, stringify it
          componentCode = JSON.stringify(componentFile[1], null, 2);
        }
        
        // Clean up the code by removing any file prefix comments if they exist
        componentCode = componentCode.replace(/\/\/ \{file: .*?\}\n/, '');
        
        setCode(formatCode(componentCode));
        console.log('Component file set:', componentFile[0]);
      } else if (typeof processedFiles === 'string') {
        // If we didn't find a component file but have a string, use it directly
        // This is a fallback for when the server returns just code without file structure
        setCode(formatCode(processedFiles));
        console.log('Using string response as component code');
      } else {
        // Set an error message if we can't find component code
        setCode("// No component code found in the response");
        console.log('No component file found in the response');
      }
    } catch (error) {
      console.error('Error generating component:', error);
      setCode("// Error generating component: " + (error instanceof Error ? error.message : String(error)));
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
    <div className="flex flex-col w-full space-y-6">
      <div className="flex justify-between items-center">
      <h1 className={`text-2xl ml-4 mt-4 font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Prompt-as-Policy Demo</h1>
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className={`mr-4 mt-4 z-10 rounded-full p-2.5 
                  shadow-md border transition-colors hover:cursor-pointer
                  ${theme === 'dark' 
                    ? 'bg-gray-800 text-yellow-300 border-gray-700' 
                    : 'bg-white text-gray-800 border-gray-300'}`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      </div>
      <div className="p-4 flex flex-col space-y-8">
        {/* Prompt Section */}
        <div className="flex flex-col">
          <h2 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Enter custom requirements for Table, Chart, or Datepicker:</h2>
          <div className={`h-[300px] border rounded ${theme === 'dark' ? 'border-gray-700' : 'border-gray-400'}`}>
            <Editor
              height="100%"
              defaultLanguage="markdown"
              defaultValue={prompt}
              onChange={(v) => setPrompt(v ?? '')}
              theme={editorTheme}
              options={{ minimap: { enabled: false }, fontSize: 20 }}
            />
          </div>
          <div className="flex gap-3 mt-4">
            <Button 
              onClick={handleGenerateSpec} 
              variant="outline" 
              className={`hover:bg-blue-700 hover:text-white transition-colors hover:cursor-pointer ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'}`}
              disabled={isSpecLoading}
            >
              {isSpecLoading ? 'Generating...' : 'Generate JSON spec'}
            </Button>
          </div>
        </div>
        
        {/* JSON Spec Section */}
        {spec !== "{}" && (
          <div className="flex flex-col">
            <h3 className={`text-md font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>JSON Specification</h3>
            <div className={`border rounded h-[200px] ${theme === 'dark' ? 'border-gray-700' : 'border-gray-400'}`}>
              <Editor
                height="100%"
                defaultLanguage="json"
                value={spec}
                theme={editorTheme}
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 20,
                  readOnly: true
                }}
              />
            </div>
          </div>
        )}

        {/* Template and Generation Section */}
        <div className="flex flex-col">
          <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Generate the Code</h2>
          <div className="flex flex-col gap-2">
            <h3 className={`text-md font-semibold my-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
              First select policy template, then generate the component, a combination of JSON spec and guiding policy.
              The JSON spec helps prevent format drift. 
              The template acts as guardrails to ensure the generated code uses base components (here shadcn/ui) and 
              themed design tokens (here tailwind) with any other decisions. 
            </h3>
            <div className="flex flex-col space-y-2">
              <Select
                value={selectedTemplateName}
                onValueChange={(v: string) => {
                  setSelectedTemplateName(v);
                }}
              >
                <SelectTrigger className={`w-[180px] hover:cursor-pointer hover:bg-amber-700 hover:text-white transition-colors ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent className={`hover:cursor-pointer ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-white text-gray-800'}`}>
                  {Object.keys(templates).map((key) => (
                    <SelectItem key={key} value={key} className="hover:cursor-pointer hover:bg-amber-700 hover:text-white  transition-colors">
                      {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleGenerateCode} 
                variant="outline"
                className={`hover:bg-purple-700 hover:text-white w-[180px] transition-colors hover:cursor-pointer ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'}`}
                disabled={isCodeLoading}
              >
                {isCodeLoading ? 'Generating...' : 'Generate Component'}
              </Button>
            </div>
          </div>
        </div>

        {/* Code Display Section */}
        <div className="flex flex-col">
          <div className={`flex-grow border rounded ${theme === 'dark' ? 'border-gray-700' : 'border-gray-400'}`}>
            <Editor
              height="320px"
              defaultLanguage="typescript"
              value={code}
              onChange={(v) => setCode(v ?? '')}
              theme={editorTheme}
              options={{ 
                minimap: { enabled: false }, 
                fontSize: 20,
                formatOnPaste: true,
                formatOnType: true
              }}
            />
          </div>
        </div>
        
        {/* Diff Button */}
        <div className="flex justify-end">
          <button
            className={`px-3 py-1 rounded border hover:cursor-pointer ${theme === 'dark' ? 'border-gray-700 text-gray-200 hover:bg-gray-700' : 'border-gray-400 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => {
              setPrevCode(code);
              setHasPreviousGeneration(true);
            }}
            disabled={code === "// generated code here" || code.trim() === ""}
          >
            Save Snapshot for Diff
          </button>
        </div>
        
        {/* Diff Section */}
        {hasPreviousGeneration && (
          <div className="flex flex-col">
            <h3 className={`text-md font-semibold mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>Diff View to consider variance between generations</h3>
            <div className={`border rounded overflow-scroll h-[300px] ${theme === 'dark' ? 'border-gray-700' : 'border-gray-400'}`}>
              <DiffViewer
                oldValue={prevCode}
                newValue={code}
                splitView
                useDarkTheme={editorTheme === 'vs-dark'}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}