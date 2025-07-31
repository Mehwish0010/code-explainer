"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { motion, AnimatePresence } from "framer-motion"

const LANGUAGES = ["javascript", "typescript", "python", "java", "c", "cpp"]

export default function CodeExplainer() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [result, setResult] = useState("")
  const [runOutput, setRunOutput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const handleAnalyze = async () => {
    if (!code.trim()) return
    setIsAnalyzing(true)
    setResult("Analyzing...")

    try {
      const res = await fetch("/api/code-explainer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      })

      const text = await res.text()
      let data: any
      try {
        data = JSON.parse(text)
      } catch {
        setResult("Invalid server response:\n\n" + text)
        return
      }

      if (!res.ok) {
        setResult("Error: " + (data.error || text))
        return
      }

      setResult(data.explanation || "Something went wrong.")
    } catch (error) {
      setResult("Network error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // NEW: Run code using Piston API
  const handleRunCode = async () => {
    if (!code.trim()) return
    setIsRunning(true)
    setRunOutput("Running...")

    try {
      const res = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: language,
          version: "*",
          files: [{ name: "main", content: code }],
        }),
      })
      const data = await res.json()
      const output = data.run?.output || data.message || "No output."
      setRunOutput(output)
    } catch (err: any) {
      setRunOutput("Failed to run code: " + err.message)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Code Explainer & Debugger
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Paste your code below and get detailed explanations, debugging insights, optimization suggestions,
            and now execute your code in a safe sandbox.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
        >
          {/* Header with language selector */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-slate-400 text-sm font-medium">Code Editor</span>
            </div>

            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-700/50 border border-slate-600 text-slate-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang} className="bg-slate-800">
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </motion.select>
          </div>

          {/* Monaco editor */}
          <div className="relative">
            <div className="h-96 border-b border-slate-700/50">
              <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Buttons */}
            <div className="p-6 flex gap-4 flex-col md:flex-row">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(139, 92, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={!code.trim() || isAnalyzing}
                className="w-full md:w-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isAnalyzing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>Analyze Code</>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRunCode}
                disabled={!code.trim() || isRunning}
                className="w-full md:w-1/2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Running...</span>
                  </>
                ) : (
                  <>Run Code</>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center space-x-3 p-6 border-b border-slate-700/50">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">AI Analysis</h3>
                </div>
                <div className="p-6">
                  <pre className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30 text-slate-300 whitespace-pre-wrap font-mono text-sm">
                    {result}
                  </pre>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Execution Output */}
        <AnimatePresence>
          {runOutput && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8"
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center space-x-3 p-6 border-b border-slate-700/50">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-200">Execution Output</h3>
                </div>
                <div className="p-6">
                  <pre className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30 text-green-300 whitespace-pre-wrap font-mono text-sm">
                    {runOutput}
                  </pre>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
