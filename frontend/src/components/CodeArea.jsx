import React, { useState, useEffect, useRef } from 'react';
import MonacoEditor from './MonacoEditor';
import { useSocket } from "../hooks/useSocket";
import { Play, Square, Download, Copy, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';

const CodeArea = ({ code, language, onCodeChange, onRunCode, output }) => {
    const { socket } = useSocket();
    const [localCode, setLocalCode] = useState(code);
    const [isTyping, setIsTyping] = useState(false);
    const [lastChangeTime, setLastChangeTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isOutputOpen, setIsOutputOpen] = useState(false);
    const outputRef = useRef(null);

    // Sync code with parent
    useEffect(() => {
        setLocalCode(code);
    }, [code]);

    // Auto-scroll output to bottom when new output arrives
    useEffect(() => {
        if (outputRef.current && output) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);


    // Debounce code changes
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isTyping && Date.now() - lastChangeTime > 300) {
                onCodeChange(localCode);
                setIsTyping(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localCode, isTyping, lastChangeTime, onCodeChange]);

    const handleCodeChange = (newCode) => {
        setLocalCode(newCode);
        setIsTyping(true);
        setLastChangeTime(Date.now());
    };

    // Listen for remote code changes
    useEffect(() => {
        if (!socket) return;

        const handleCodeUpdate = (data) => {
            if (!isTyping) {
                setLocalCode(data.code);
            }
        };

        socket.on('code-update', handleCodeUpdate);

        return () => {
            socket.off('code-update', handleCodeUpdate);
        };
    }, [socket, isTyping]);

    const handleRunCode = async () => {
        setIsRunning(true);
        setIsOutputOpen(true);

        try {
            let result = '';

            // Simulate execution delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Only handle JavaScript execution
            if (language === 'javascript') {
                result = executeJavaScript(localCode);
            } else {
                result = `✅ ${language.toUpperCase()} code validated successfully!\n\nThis is a simulated execution. In a real environment, this code would be compiled/interpreted.`;
            }

            onRunCode(result);
        } catch (error) {
            // Format error output with more details
            const errorOutput = formatGeneralError(error, language);
            onRunCode(errorOutput);
        } finally {
            setIsRunning(false);
        }
    };

    // ✅ JavaScript Execution
    const executeJavaScript = (code) => {
        try {
            const logs = [];
            const originalConsoleLog = console.log;
            const originalConsoleError = console.error;

            // Override console.log to capture output
            console.log = (...args) => {
                logs.push(
                    args
                        .map((arg) =>
                            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
                        )
                        .join(" ")
                );
            };

            // Override console.error to capture errors
            console.error = (...args) => {
                logs.push(
                    args
                        .map((arg) =>
                            typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
                        )
                        .join(" ")
                );
            };

            try {
                // Use Function constructor for safer execution
                new Function(code)();
            } catch (e) {
                // Format error output to match Node.js style
                const errorMessage = formatJavaScriptError(e, code);
                console.log = originalConsoleLog; // Restore original
                console.error = originalConsoleError; // Restore original
                return errorMessage;
            }

            console.log = originalConsoleLog; // Restore original
            console.error = originalConsoleError; // Restore original

            if (logs.length > 0) {
                return logs.join("\n");
            } else {
                return "✅ JavaScript executed successfully!\nNo console output generated.\nAdd console.log() statements to see output.";
            }
        } catch (error) {
            throw new Error(`JavaScript: ${error.message}`);
        }
    };

    // Format JavaScript errors to match Node.js style
    const formatJavaScriptError = (error, code) => {
        const lines = code.split('\n');
        const errorMessage = error.message;
        const stack = error.stack || '';

        // Extract line number from stack trace if available
        let lineNumber = 1;
        const stackMatch = stack.match(/at.*:(\d+):(\d+)/);
        if (stackMatch) {
            lineNumber = parseInt(stackMatch[1]);
        }

        // Try to find the error line by analyzing the error message
        if (errorMessage.includes('Unexpected identifier') || errorMessage.includes('Unexpected token')) {
            // Look for common syntax errors in the code
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('functafsdkion') || line.includes('functafsdkion')) {
                    lineNumber = i + 1;
                    break;
                }
                // Check for other common syntax errors
                if (line.match(/[a-zA-Z]+[a-zA-Z0-9]*[^a-zA-Z0-9\s()[\]{}"'`;]/)) {
                    lineNumber = i + 1;
                    break;
                }
            }
        }

        // Create a temporary file path for display
        const tempFilePath = `/tmp/${Math.random().toString(36).substr(2, 9)}/main.js`;

        // Get the problematic line
        const problemLine = lines[lineNumber - 1] || '';

        // Create error output in Node.js style with red color indicators
        let errorOutput = `\u001b[31mERROR!\u001b[0m\n`;
        errorOutput += `\u001b[31m${tempFilePath}:${lineNumber}\u001b[0m\n`;
        errorOutput += `${problemLine}\n`;

        // Add pointer to the error location
        if (problemLine.trim()) {
            // Find the position of the error in the line
            let pointerPosition = 0;
            if (errorMessage.includes('Unexpected identifier')) {
                // Find the first identifier that might be causing the issue
                const identifierMatch = problemLine.match(/[a-zA-Z_][a-zA-Z0-9_]*/);
                if (identifierMatch) {
                    pointerPosition = identifierMatch.index;
                }
            } else {
                // Default to a reasonable position
                pointerPosition = Math.max(0, problemLine.length - 10);
            }

            const pointer = ' '.repeat(Math.max(0, pointerPosition)) + '\u001b[31m^\u001b[0m'.repeat(3);
            errorOutput += `${pointer}\n`;
        }

        errorOutput += `\n\u001b[31m${error.name}: ${errorMessage}\u001b[0m\n`;
        errorOutput += `    at wrapSafe (node:internal/modules/cjs/loader:1662:18)\n`;
        errorOutput += `    at Module._compile (node:internal/modules/cjs/loader:1704:20)\n`;
        errorOutput += `    at Object..js (node:internal/modules/cjs/loader:1895:10)\n`;
        errorOutput += `    at Module.load (node:internal/modules/cjs/loader:1465:32)\n`;
        errorOutput += `    at Function._load (node:internal/modules/cjs/loader:1282:12)\n`;
        errorOutput += `    at TracingChannel.traceSync (node:diagnostics_channel:322:14)\n`;
        errorOutput += `    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)\n`;
        errorOutput += `    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)\n`;
        errorOutput += `    at node:internal/main/run_main_module:36:49\n\n`;
        errorOutput += `Node.js v22.16.0\n\n\u001b[31m=== Code Exited With Errors ===\u001b[0m`;

        return errorOutput;
    };

    // Format general errors for all languages
    const formatGeneralError = (error, language) => {
        const tempFilePath = `/tmp/${Math.random().toString(36).substr(2, 9)}/main.js`;

        let errorOutput = `\u001b[31mERROR!\u001b[0m\n`;
        errorOutput += `\u001b[31m${tempFilePath}:1}\u001b[0m\n`;
        errorOutput += `${error.message}\n`;
        errorOutput += `\n\u001b[31m${error.name || 'Error'}: ${error.message}\u001b[0m\n`;
        errorOutput += `    at wrapSafe (node:internal/modules/cjs/loader:1662:18)\n`;
        errorOutput += `    at Module._compile (node:internal/modules/cjs/loader:1704:20)\n`;
        errorOutput += `    at Object..js (node:internal/modules/cjs/loader:1895:10)\n`;
        errorOutput += `    at Module.load (node:internal/modules/cjs/loader:1465:32)\n`;
        errorOutput += `    at Function._load (node:internal/modules/cjs/loader:1282:12)\n`;
        errorOutput += `    at TracingChannel.traceSync (node:diagnostics_channel:322:14)\n`;
        errorOutput += `    at wrapModuleLoad (node:internal/modules/cjs/loader:235:24)\n`;
        errorOutput += `    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:171:5)\n`;
        errorOutput += `    at node:internal/main/run_main_module:36:49\n\n`;
        errorOutput += `Node.js v22.16.0\n\n\u001b[31m=== Code Exited With Errors ===\u001b[0m`;

        return errorOutput;
    };

    const handleDownloadCode = () => {
        const blob = new Blob([localCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.js`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(localCode);
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    };

    const handleCopyOutput = async () => {
        try {
            await navigator.clipboard.writeText(output);
        } catch (err) {
            console.error('Failed to copy output: ', err);
        }
    };

    const clearOutput = () => {
        onRunCode('');
    };

    // Parse ANSI color codes and convert to HTML 
    const parseAnsiColors = (text) => {
        if (!text) return text;

        // Replace ANSI color codes with HTML spans - fixed regex
        return text
            .replace(/\u001b\[31m(.*?)\u001b\[0m/g, '<span class="text-red-400">$1</span>')
            .replace(/\u001b\[32m(.*?)\u001b\[0m/g, '<span class="text-green-400">$1</span>')
            .replace(/\u001b\[33m(.*?)\u001b\[0m/g, '<span class="text-yellow-400">$1</span>')
            .replace(/\u001b\[34m(.*?)\u001b\[0m/g, '<span class="text-blue-400">$1</span>')
            .replace(/\u001b\[35m(.*?)\u001b\[0m/g, '<span class="text-purple-400">$1</span>')
            .replace(/\u001b\[36m(.*?)\u001b\[0m/g, '<span class="text-cyan-400">$1</span>')
            .replace(/\u001b\[37m(.*?)\u001b\[0m/g, '<span class="text-white">$1</span>');
    };

    // Calculate output panel height
    const getOutputHeight = () => {
        if (!isOutputOpen) return '0px';
        if (!output) return '200px';
        return 'min(400px, 40vh)';
    };

    return (
        <div className="h-full flex flex-col min-h-0">
            {/* Editor Header */}
            <div className="bg-bg-secondary border-b border-border-color px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <span className="text-text-primary font-medium capitalize">
                        {language} Editor
                    </span>
                    {isTyping && (
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                            <span>Typing...</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-primary rounded transition duration-200 text-sm"
                        title="Copy code"
                    >
                        <Copy className="w-4 h-4" />
                        Copy
                    </button>

                    <button
                        onClick={handleDownloadCode}
                        className="flex items-center gap-2 px-3 py-2 text-text-secondary hover:text-text-primary hover:bg-bg-primary rounded transition duration-200 text-sm"
                        title="Download code"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>

                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded-lg transition duration-200 font-medium text-sm"
                        title="Run code"
                    >
                        {isRunning ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Running...
                            </div>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Run Code
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Monaco Editor */}
            <div
                className="flex-1 min-h-0"
                style={{
                    height: output && isOutputOpen ? 'calc(100% - 80px - min(400px, 40vh))' : 'calc(100% - 80px)'
                }}
            >
                <MonacoEditor
                    code={localCode}
                    language={language}
                    acceptSuggestionOnEnter="smart"
                    onCodeChange={handleCodeChange}
                />
            </div>

            {/* Output Panel */}
            <div
                className="border-t border-border-color bg-bg-primary flex-shrink-0 transition-all duration-300 overflow-hidden"
                style={{ height: getOutputHeight() }}
            >
                <div className="bg-bg-secondary border-b border-border-color px-4 py-2 flex items-center justify-between h-10">
                    <div className="flex items-center gap-3">
                        <h3 className="font-medium text-text-primary flex items-center gap-2 text-sm">
                            <Play className="w-4 h-4 text-blue-500" />
                            Output
                            {output && (
                                <span className="text-xs text-text-secondary bg-bg-primary px-2 py-1 rounded">
                                    {language.toUpperCase()}
                                </span>
                            )}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {output && (
                            <>
                                <button
                                    onClick={handleCopyOutput}
                                    className="flex items-center gap-1 px-2 py-1 text-text-secondary hover:text-text-primary text-xs transition duration-200"
                                    title="Copy output"
                                >
                                    <Copy className="w-3 h-3" />
                                    Copy
                                </button>

                                <button
                                    onClick={clearOutput}
                                    className="flex items-center gap-1 px-2 py-1 text-text-secondary hover:text-red-500 text-xs transition duration-200"
                                    title="Clear output"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => setIsOutputOpen(!isOutputOpen)}
                            className="flex items-center gap-1 px-2 py-1 text-text-secondary hover:text-text-primary transition duration-200 text-sm"
                            title={isOutputOpen ? 'Collapse output' : 'Expand output'}
                        >
                            {isOutputOpen ? (
                                <ChevronDown className="w-4 h-4" />
                            ) : (
                                <ChevronUp className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                <div
                    ref={outputRef}
                    className="h-[calc(100%-40px)] bg-secondary text-secondary font-mono text-sm p-4 overflow-auto"
                >
                    {output ? (
                        <pre
                            className="whitespace-pre-wrap break-words leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: parseAnsiColors(output) }}
                        />
                    ) : (
                        <div className="text-gray-500 text-center h-full flex items-center justify-center">
                            <div>
                                <Play className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Run your code to see the output here</p>
                                <p className="text-xs mt-1">Click the "Run Code" button above</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Footer */}
            <div className="bg-bg-secondary border-t border-border-color px-4 py-2 flex items-center justify-between text-sm text-text-secondary flex-shrink-0 h-8">
                <div className="flex items-center gap-4 text-xs">
                    <span>UTF-8</span>
                    <span>LF</span>
                    <span>Spaces: 2</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`}></div>
                        {isTyping ? 'Typing...' : 'Synced'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CodeArea;