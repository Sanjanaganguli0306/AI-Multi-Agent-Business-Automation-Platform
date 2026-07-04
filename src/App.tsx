import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play, Send, Cpu, Clock, CheckCircle2, AlertCircle, Terminal, Megaphone,
  TrendingUp, Users, DollarSign, HelpCircle, Code, Workflow, Copy,
  ChevronRight, Info, Sparkles, RefreshCw, Layers, Activity, Check,
  Sun, Moon, Database, Share2, Eye, Server, Zap, ShieldAlert, BarChart3, Network
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Types
interface AgentMeta {
  id: string;
  name: string;
  role: string;
  avatar: string;
  icon: React.ComponentType<any>;
  color: string;
  glowColor: string;
  description: string;
}

const AGENTS_META: AgentMeta[] = [
  { id: "ceo", name: "CEO Agent", role: "Strategic Orchestrator", avatar: "💼", icon: Workflow, color: "from-blue-600 to-indigo-600", glowColor: "rgba(99,102,241,0.4)", description: "Decomposes corporate objectives, coordinates tactical workflows." },
  { id: "marketing", name: "Marketing Agent", role: "Brand & SEO Strategist", avatar: "📢", icon: Megaphone, color: "from-purple-600 to-pink-600", glowColor: "rgba(236,72,153,0.4)", description: "Designs outreach taglines, schedules content, and plans SEO campaigns." },
  { id: "sales", name: "Sales Agent", role: "B2B Enablement Expert", avatar: "📈", icon: TrendingUp, color: "from-emerald-600 to-teal-600", glowColor: "rgba(16,185,129,0.4)", description: "Scores leads, writes pitch decks, and handles enterprise objections." },
  { id: "hr", name: "HR Recruiter Agent", role: "Talent Acquisition Specialist", avatar: "👥", icon: Users, color: "from-amber-600 to-orange-600", glowColor: "rgba(245,158,11,0.4)", description: "Drafts role descriptions, requirements, and onboarding steps." },
  { id: "finance", name: "Finance Agent", role: "Chief Financial Officer", avatar: "💵", icon: DollarSign, color: "from-rose-600 to-red-600", glowColor: "rgba(244,63,94,0.4)", description: "Allocates capital, computes ROI, and audits operational spend." },
  { id: "support", name: "Customer Support Agent", role: "Operations Architect", avatar: "❓", icon: HelpCircle, color: "from-cyan-600 to-sky-600", glowColor: "rgba(6,182,212,0.4)", description: "Authors proactive product FAQs and structures service routing SLAs." },
  { id: "developer", name: "Software Developer Agent", role: "Principal Systems Engineer", avatar: "💻", icon: Code, color: "from-violet-600 to-fuchsia-600", glowColor: "rgba(139,92,246,0.4)", description: "Scaffolds schemas, specifies technologies, and generates boilerplate." }
];

const PRESETS = [
  "Launch a SaaS app for pet tracking",
  "Automate corporate invoice auditing with AI",
  "Launch an on-demand custom print retail platform",
  "Establish a fully remote tech onboarding workflow"
];

const BASELINE_INTERACTIONS: Record<string, Record<string, number>> = {
  ceo: { ceo: 0, marketing: 28, sales: 24, hr: 18, finance: 22, support: 15, developer: 32 },
  marketing: { ceo: 14, marketing: 0, sales: 25, hr: 5, finance: 16, support: 8, developer: 10 },
  sales: { ceo: 19, marketing: 18, sales: 0, hr: 6, finance: 20, support: 22, developer: 12 },
  hr: { ceo: 12, marketing: 4, sales: 5, hr: 0, finance: 15, support: 4, developer: 26 },
  finance: { ceo: 24, marketing: 14, sales: 15, hr: 10, finance: 0, support: 5, developer: 11 },
  support: { ceo: 8, marketing: 11, sales: 16, hr: 4, finance: 6, support: 0, developer: 35 },
  developer: { ceo: 15, marketing: 8, sales: 10, hr: 12, finance: 8, support: 24, developer: 0 }
};

interface LogEntry {
  text: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error" | "agent";
  agentId?: string;
}

interface Blackboard {
  objective: string;
  industry: string;
  coreStrategy: string;
  targetAudience: string;
  primaryMilestones: string[];
  campaignTagline: string;
  proposedAdSpend: number;
  targetSEOKeywords: string[];
  closeRatePercent: number;
  salesTarget: string;
  hireTitle: string;
  hiringBudget: number;
  onboardingSteps: string[];
  totalYear1Revenue: number;
  totalYear1Cost: number;
  recalculatedROI: number;
  primarySLA: string;
  techStack: string[];
  databaseSchema: string;
}

interface InterAgentPayload {
  timestamp: string;
  sender: string;
  receiver: string;
  type: string;
  endpoint: string;
  latencyMs: number;
  payload: string;
}

function getMockAgentResult(agentId: string, industry: string, defaultAdSpend: number, expectedCloseRate: number) {
  return agentId === "ceo" ? {
    coreStrategy: `Orchestrate a scalable business deployment in the ${industry} market. Prioritize capital efficiency and digital onboarding pipelines.`,
    targetAudience: `Enterprise department executives and early adopters seeking custom workspace platforms.`,
    milestones: ["Launch high-fidelity MVP in Month 3", "Deploy multi-channel campaign in Month 6", "Scale to $30k Monthly Recurring Revenue by Month 12"],
    logMessages: ["Decomposing master objectives", "Structuring segment demographics"]
  } : agentId === "marketing" ? {
    campaignTagline: industry.includes("Pet") ? "Paws, Tracked. Ultimate Peace of Mind." : industry.includes("Fintech") ? "Zero Error Ledgering. Instant Velocity." : "Automated Flow. Instant Scale.",
    channels: [{ name: "Organic Search & Dev-Ops Blogs", strategy: "Create high-intent content matching target search arrays." }],
    seoKeywords: ["enterprise scale", "custom integration", "smart monitoring", "cloud database", "automatic tracking"],
    adCopy: "Upgrade your enterprise processes with standard workflows built for tomorrow. Start today.",
    logMessages: ["Crafting tagline", "Injecting keyword indices"]
  } : agentId === "sales" ? {
    leadScoring: [{ tier: "Tier A (High Fit)", criteria: "SaaS companies with over 50 employees looking to automate", action: "AE outbound demo" }],
    pitchDeck: [{ slide: "Problem", title: "Operational Friction", script: "Every day hours are lost to manual tasks." }],
    objections: [{ objection: "Is setup difficult?", response: "We offer zero-config integrations." }],
    logMessages: ["Scoring outbound leads", "Structuring slide outlines"]
  } : agentId === "hr" ? {
    hiringRole: `Lead ${industry.includes("Fintech") ? "Cryptography Ledger" : "Systems Distributed Solutions"} Engineer`,
    responsibilities: ["Maintain scalable cloud architectures", "Supervise junior developers", "Implement security policies"],
    requirements: ["5+ years TypeScript & Express production background", "Docker & Kubernetes microservices expertise"],
    onboardingSteps: ["Environment staging configuration", "Take over first code milestones"],
    logMessages: ["Structuring job parameters", "Designing onboarding loops"]
  } : agentId === "finance" ? {
    budgetAllocation: [
      { category: "Research & Development", percentage: 50, allocationUsd: 150000 },
      { category: "Marketing & Growth", percentage: 25, allocationUsd: 75000 },
      { category: "Sales Enablement", percentage: 15, allocationUsd: 45000 },
      { category: "Ops & Infrastructure", percentage: 10, allocationUsd: 30000 }
    ],
    roiProjection: [
      { year: "Year 1", revenue: 140000, cost: 105000, profit: 35000 },
      { year: "Year 2", revenue: 490000, cost: 210000, profit: 280000 },
      { year: "Year 3", revenue: 1600000, cost: 500000, profit: 1100000 }
    ],
    financialSummary: "With R&D prioritizing modular stack builds, operational margin expands dramatically in Year 2 and Year 3.",
    logMessages: ["Simulating balance sheets", "Auditing proposed campaign budgets"]
  } : agentId === "support" ? {
    faqs: [{ question: "Is my corporate data secure?", answer: "We support AES-256 standard encryption on all pipeline routes." }],
    routingRules: [{ issueType: "API Down Time", priority: "Urgent (P0)", slaHours: 1, targetAgent: "Core DevOps Devs" }],
    logMessages: ["Drafting FAQ indices", "Configuring routing escalation rules"]
  } : {
    architectureStyle: "Distributed Event-Driven Microservices (Node.js/TypeScript, Redis, PostgreSQL)",
    techStack: ["TypeScript", "Express.js", "Redis PubSub", "Prisma ORM", "PostgreSQL", "Docker & GCP"],
    databaseSchema: "model NodeObject { id String @id @default(uuid()) }",
    codeBoilerplate: `// Server Entrypoint\nimport express from 'express';\nconst app = express();\napp.listen(3000, () => console.log('Up and running.'));`,
    logMessages: ["Evaluating Express boilerplates", "Compiling system models"]
  };
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("apex-orchestra-theme");
    return (saved as "light" | "dark") || "dark";
  });

  const [objective, setObjective] = useState<string>("Launch a SaaS app for pet tracking");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentAgentIndex, setCurrentAgentIndex] = useState<number>(-1);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("ceo");
  const [compareAgentAId, setCompareAgentAId] = useState<string>("ceo");
  const [compareAgentBId, setCompareAgentBId] = useState<string>("marketing");
  const [routingMode, setRoutingMode] = useState<"hierarchical" | "mesh">("hierarchical");
  const [faultyAgentId, setFaultyAgentId] = useState<string | null>(null);

  // Advanced Network Latency Simulator state
  const [latencyView, setLatencyView] = useState<"simple" | "stacked">("simple");
  const [jitterMs, setJitterMs] = useState<number>(15);
  const [packetLossPercent, setPacketLossPercent] = useState<number>(0);
  const [traceAgentSelection, setTraceAgentSelection] = useState<"A" | "B">("A");
  const [selectedPathNode, setSelectedPathNode] = useState<string>("client");

  // Agent Interaction Heatmap state
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<"performance" | "heatmap">("performance");
  const [heatmapSource, setHeatmapSource] = useState<"live" | "baseline">("baseline");
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState<{ senderId: string; receiverId: string } | null>({
    senderId: "ceo",
    receiverId: "marketing"
  });
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{ senderId: string; receiverId: string } | null>(null);
  const [optimizedCells, setOptimizedCells] = useState<Record<string, boolean>>({});

  // App metrics
  const [metrics, setMetrics] = useState({
    totalTokens: 0,
    totalTimeMs: 0,
    tasksCompleted: 0,
    crossTalksCount: 0
  });

  // Blackboard Memory Space (Blackboard Architecture)
  const [blackboard, setBlackboard] = useState<Blackboard>({
    objective: "",
    industry: "",
    coreStrategy: "",
    targetAudience: "",
    primaryMilestones: [],
    campaignTagline: "",
    proposedAdSpend: 0,
    targetSEOKeywords: [],
    closeRatePercent: 0,
    salesTarget: "",
    hireTitle: "",
    hiringBudget: 0,
    onboardingSteps: [],
    totalYear1Revenue: 0,
    totalYear1Cost: 0,
    recalculatedROI: 0,
    primarySLA: "",
    techStack: [],
    databaseSchema: ""
  });

  // Highlights state for memory cells when modified
  const [cellHighlights, setCellHighlights] = useState<Record<string, boolean>>({});

  // Fine-grained Agent States with Neon Pulsers
  const [agentsState, setAgentsState] = useState<Record<string, {
    completed: boolean;
    running: boolean;
    status: "IDLE" | "THINKING" | "COMPOSING" | "STREAMING_OUTPUT" | "SUCCESS" | "RETRYING" | "ERROR";
    result: any;
    logStream: string[];
    metrics: { 
      tokensUsed: number; 
      executionTimeMs: number; 
      tasksCompleted: number;
      rttComponents?: {
        handshake: number;
        routing: number;
        inference: number;
        transfer: number;
        totalRtt: number;
      };
      traceLog?: string[];
    };
  }>>({
    ceo: { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } },
    marketing: { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } },
    sales: { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } },
    hr: { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } },
    finance: { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } },
    support: { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } },
    developer: { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } },
  });

  // Global log stream
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([
    { text: "Apex OS platform initialized. Ready to execute dynamic multi-agent system workflows.", timestamp: "00:00:00", type: "info" }
  ]);

  // Raw Inter-Agent JSON Payloads list
  const [payloadLogs, setPayloadLogs] = useState<InterAgentPayload[]>([]);
  const [selectedPayloadIndex, setSelectedPayloadIndex] = useState<number>(-1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Chat state
  const [chatAgentId, setChatAgentId] = useState<string>("ceo");
  const [chatInput, setChatInput] = useState<string>("How can we streamline Year 1 cost further?");
  const [chatMessages, setChatMessages] = useState<{ sender: string; role: string; text: string; timestamp: string; isUser: boolean }[]>([
    { sender: "CEO Agent", role: "Strategic Orchestrator", text: "Welcome. Please click 'INITIALIZE AGENTS' to run the pipeline, or ask any follow-up strategies here.", timestamp: "00:00:00", isUser: false }
  ]);
  const [isChatTyping, setIsChatTyping] = useState<boolean>(false);

  // Sparkline state updates
  const [latencyHistory, setLatencyHistory] = useState<number[]>([150, 240, 180, 290, 210, 310, 250]);

  // Scroll references
  const consoleBottomRef = useRef<HTMLDivElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [globalLogs]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("apex-orchestra-theme", nextTheme);
  };

  const addGlobalLog = (text: string, type: "info" | "success" | "warning" | "error" | "agent", agentId?: string) => {
    const time = new Date().toLocaleTimeString();
    setGlobalLogs((prev) => [...prev, { text, timestamp: time, type, agentId }]);
  };

  const handleInjectRandomFault = () => {
    if (isRunning) return;
    const randomAgent = AGENTS_META[Math.floor(Math.random() * AGENTS_META.length)];
    setFaultyAgentId(randomAgent.id);
    addGlobalLog(`⚠️ [FAULT STAGED] Injected simulated network failure context on node [${randomAgent.name}]. Launch the pipeline to trigger automated retry & failover!`, "error", randomAgent.id);
  };

  // Helper to trigger highlights
  const updateBlackboard = (updates: Partial<Blackboard>) => {
    setBlackboard((prev) => ({ ...prev, ...updates }));
    const keys = Object.keys(updates);
    const highlightState: Record<string, boolean> = {};
    keys.forEach(k => { highlightState[k] = true; });
    setCellHighlights(prev => ({ ...prev, ...highlightState }));
    setTimeout(() => {
      setCellHighlights(prev => {
        const reset = { ...prev };
        keys.forEach(k => { reset[k] = false; });
        return reset;
      });
    }, 2500);
  };

  // Core Orchestration Pipeline with dynamic Blackboard Writes
  const handleLaunchPipeline = async () => {
    if (isRunning) return;
    setIsRunning(true);
    addGlobalLog(`Launching corporate orchestration strategy: "${objective}"`, "info");
    addGlobalLog(`Routing Framework set to: [${routingMode.toUpperCase()}] Model`, "warning");

    // Reset States
    const resetState = { ...agentsState };
    AGENTS_META.forEach((m) => {
      resetState[m.id] = { completed: false, running: false, status: "IDLE", result: null, logStream: [], metrics: { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 } };
    });
    setAgentsState(resetState);
    setPayloadLogs([]);
    setSelectedPayloadIndex(-1);
    setMetrics({ totalTokens: 0, totalTimeMs: 0, tasksCompleted: 0, crossTalksCount: 0 });

    // Determine Industry/Subject
    const textLower = objective.toLowerCase();
    let industry = "General SaaS / Enterprise AI Hub";
    let defaultAdSpend = 75000;
    let expectedCloseRate = 32;

    if (textLower.includes("pet")) {
      industry = "PetTech / IoT Consumer Services";
      defaultAdSpend = 65000;
      expectedCloseRate = 28;
    } else if (textLower.includes("invoice") || textLower.includes("audit") || textLower.includes("finance")) {
      industry = "Fintech / B2B Ledger Compliance";
      defaultAdSpend = 85000;
      expectedCloseRate = 38;
    } else if (textLower.includes("onboarding") || textLower.includes("remote") || textLower.includes("hr")) {
      industry = "HRTech / Remote Workforce Automation";
      defaultAdSpend = 45000;
      expectedCloseRate = 22;
    } else if (textLower.includes("print") || textLower.includes("retail")) {
      industry = "E-Commerce / Automated Logistical Warehousing";
      defaultAdSpend = 80000;
      expectedCloseRate = 34;
    }

    updateBlackboard({
      objective,
      industry,
      campaignTagline: "Awaiting calculation...",
      proposedAdSpend: 0,
      closeRatePercent: 0,
      recalculatedROI: 0,
      hireTitle: "Awaiting recruitment analysis...",
      techStack: []
    });

    let cumulativeContext: any = {};
    const stepDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < AGENTS_META.length; i++) {
      const meta = AGENTS_META[i];
      setSelectedAgentId(meta.id);

      // Fine-grained typewriter states simulation
      // State 1: THINKING (Reading context and Blackboard)
      setAgentsState(prev => ({
        ...prev,
        [meta.id]: { ...prev[meta.id], running: true, status: "THINKING" }
      }));
      addGlobalLog(`[System Routing] Agent ${meta.name} reading Blackboard variables...`, "info", meta.id);
      await stepDelay(600);

      // State 2: COMPOSING (Solving parameters)
      setAgentsState(prev => ({
        ...prev,
        [meta.id]: { ...prev[meta.id], status: "COMPOSING" }
      }));
      addGlobalLog(`[Computational Engine] Agent ${meta.name} constructing strategy arrays...`, "info", meta.id);
      await stepDelay(600);

      let data: any = null;
      let latency = 0;
      const startTime = Date.now();
      const isNodeFaulty = meta.id === faultyAgentId;

      // Simulated network jitter & packet loss effects
      let packetLossPenalty = 0;
      let simulatedLossEvent = false;
      if (!isNodeFaulty && packetLossPercent > 0 && (Math.random() * 100 < packetLossPercent)) {
        simulatedLossEvent = true;
        addGlobalLog(`⚠️ [PACKET LOSS] Simulated packet dropped during transit to ${meta.name}. Retrying TCP window transmission...`, "warning", meta.id);
        await stepDelay(500);
        packetLossPenalty = Math.floor(400 + Math.random() * 300);
      }

      const activeJitter = Math.floor(Math.random() * jitterMs);

      if (isNodeFaulty) {
        // State 3: STREAMING OUTPUT (API fetch simulation with fault)
        setAgentsState(prev => ({
          ...prev,
          [meta.id]: { ...prev[meta.id], status: "STREAMING_OUTPUT" }
        }));
        await stepDelay(800);

        // Fail first attempt!
        addGlobalLog(`[CRITICAL FAULT] Connection to ${meta.name} failed with HTTP 500 Internal Server Error (DNS resolution timed out).`, "error", meta.id);
        setAgentsState(prev => ({
          ...prev,
          [meta.id]: { ...prev[meta.id], status: "ERROR" }
        }));
        await stepDelay(1500);

        // Self-Healing Trigger
        addGlobalLog(`⚠️ [SELF-HEALING] Active system fault detected! Initiating automated error recovery framework...`, "warning", meta.id);
        setAgentsState(prev => ({
          ...prev,
          [meta.id]: { ...prev[meta.id], status: "RETRYING" }
        }));
        await stepDelay(1200);

        addGlobalLog(`[HEALING LOOP] Attempt 1/3: Recycling connection sockets and refreshing TLS handshake on node [${meta.id}]...`, "info", meta.id);
        await stepDelay(1200);

        addGlobalLog(`[HEALING LOOP] Attempt 1/3 failed. Node unresponsive. Initiating FAILOVER to legacy hot-spare controller node...`, "error", meta.id);
        setAgentsState(prev => ({
          ...prev,
          [meta.id]: { ...prev[meta.id], status: "RETRYING" }
        }));
        await stepDelay(1500);

        addGlobalLog(`[FAILOVER] Secondary failover node spawned successfully. Synchronizing Blackboard memory space...`, "warning", meta.id);
        await stepDelay(1000);

        addGlobalLog(`[FAILOVER] Connection established with secondary failover node. Executing agent payload...`, "success", meta.id);
        await stepDelay(800);

        // Clear the faulty agent ID so it doesn't repeat automatically in subsequent loops
        setFaultyAgentId(null);

        // Generate success response from failover node
        latency = (Date.now() - startTime) + activeJitter + packetLossPenalty;
        const mockTokens = Math.floor(1100 + Math.random() * 300);
        data = {
          agentId: meta.id,
          status: "completed",
          metrics: { tokensUsed: mockTokens, executionTimeMs: latency, tasksCompleted: 4 },
          result: getMockAgentResult(meta.id, industry, defaultAdSpend, expectedCloseRate)
        };
      } else {
        // State 3: STREAMING OUTPUT (API fetch)
        setAgentsState(prev => ({
          ...prev,
          [meta.id]: { ...prev[meta.id], status: "STREAMING_OUTPUT" }
        }));

        try {
          const res = await fetch(`/api/agent/${meta.id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ objective, context: cumulativeContext })
          });
          if (!res.ok) throw new Error();
          data = await res.json();
          latency = (Date.now() - startTime) + activeJitter + packetLossPenalty;
        } catch (err) {
          // High fidelity recovery helper (fully independent & contextual)
          await stepDelay(500);
          latency = (Date.now() - startTime + 500) + activeJitter + packetLossPenalty;
          
          // Generate rich fallback
          const mockTokens = Math.floor(1000 + Math.random() * 400);
          data = {
            agentId: meta.id,
            status: "completed",
            metrics: { tokensUsed: mockTokens, executionTimeMs: latency, tasksCompleted: 3 },
            result: getMockAgentResult(meta.id, industry, defaultAdSpend, expectedCloseRate)
          };
        }
      }

      // Record logs slowly for maximum visual realism
      const resData = data.result;
      const logMessages = resData.logMessages || [`[Compute] Calculated metrics for ${meta.id}`];
      
      for (const logText of logMessages) {
        await stepDelay(250);
        addGlobalLog(logText, "agent", meta.id);
        setAgentsState(prev => ({
          ...prev,
          [meta.id]: { ...prev[meta.id], logStream: [...prev[meta.id].logStream, logText] }
        }));
      }

      // Simulate routing "Cross-Talks" if routing mode is MESH
      let crossTalkCountLocal = 0;
      if (routingMode === "mesh") {
        await stepDelay(300);
        if (meta.id === "marketing") {
          addGlobalLog(`[Mesh Link] Marketing queries CEO for strategy guidelines.`, "warning", meta.id);
          crossTalkCountLocal++;
        } else if (meta.id === "sales") {
          addGlobalLog(`[Mesh Link] Sales queries Marketing for target keywords to write script.`, "warning", meta.id);
          crossTalkCountLocal++;
        } else if (meta.id === "finance") {
          addGlobalLog(`[Mesh Link] Finance queries Marketing proposed ad spend ($${defaultAdSpend.toLocaleString()}) to run dynamic ROI.`, "warning", meta.id);
          crossTalkCountLocal++;
        } else if (meta.id === "hr") {
          addGlobalLog(`[Mesh Link] HR Recruiter queries Tech stacks with Developers.`, "warning", meta.id);
          crossTalkCountLocal++;
        } else if (meta.id === "support") {
          addGlobalLog(`[Mesh Link] Support requests system architecture blueprints from Developer.`, "warning", meta.id);
          crossTalkCountLocal++;
        } else if (meta.id === "developer") {
          addGlobalLog(`[Mesh Link] Developer checks database SLA guidelines with Support.`, "warning", meta.id);
          crossTalkCountLocal++;
        }
      }

      // Write parameters to Blackboard (Centralized Memory Space)
      const blackboardWrites: Partial<Blackboard> = {};
      if (meta.id === "ceo") {
        blackboardWrites.coreStrategy = resData.coreStrategy;
        blackboardWrites.targetAudience = resData.targetAudience;
        blackboardWrites.primaryMilestones = resData.milestones || [];
      } else if (meta.id === "marketing") {
        blackboardWrites.campaignTagline = resData.campaignTagline;
        blackboardWrites.proposedAdSpend = defaultAdSpend;
        blackboardWrites.targetSEOKeywords = resData.seoKeywords || [];
      } else if (meta.id === "sales") {
        blackboardWrites.closeRatePercent = expectedCloseRate;
        blackboardWrites.salesTarget = `Forecast: ${(expectedCloseRate * 1.5).toFixed(0)} Enterprise Deals`;
      } else if (meta.id === "hr") {
        blackboardWrites.hireTitle = resData.hiringRole;
        blackboardWrites.hiringBudget = 145000;
        blackboardWrites.onboardingSteps = resData.onboardingSteps || [];
      } else if (meta.id === "finance") {
        // Finance dynamically recalculates budget allocations using the Marketing Proposed Ad Spend
        const mktgSpend = blackboard.proposedAdSpend || defaultAdSpend;
        const totalCapital = 300000;
        const remaining = totalCapital - mktgSpend;
        const computedCost = Math.floor(totalCapital - (mktgSpend * 0.1));
        const computedRev = Math.floor(computedCost * 3.42);

        blackboardWrites.totalYear1Revenue = computedRev;
        blackboardWrites.totalYear1Cost = computedCost;
        blackboardWrites.recalculatedROI = Math.floor((computedRev / computedCost) * 100);
      } else if (meta.id === "support") {
        blackboardWrites.primarySLA = `SLA Trigger: Urgent priority (P0) within ${resData.routingRules?.[0]?.slaHours || 1} Hour.`;
      } else if (meta.id === "developer") {
        blackboardWrites.techStack = resData.techStack || [];
        blackboardWrites.databaseSchema = resData.databaseSchema || "";
      }

      updateBlackboard(blackboardWrites);
      addGlobalLog(`[Memory Allocation] Committed values of ${meta.name} to Blackboard Space`, "success", meta.id);

      // Decompose Network Latency Components mathematically matching measured 'latency'
      const compHandshake = Math.floor(25 + Math.random() * 15 + (routingMode === "mesh" ? 25 : 0) + (isNodeFaulty ? 320 : 0));
      const compRouting = Math.floor(8 + Math.random() * 10 + (routingMode === "mesh" ? 40 : 0) + (isNodeFaulty ? 420 : 0) + (simulatedLossEvent ? 180 : 0));
      const compTransfer = Math.floor(5 + Math.random() * 5 + (JSON.stringify(resData || {}).length / 180));
      
      // Inference gets the remainder to guarantee total equals latency
      const rawInference = latency - compHandshake - compRouting - compTransfer;
      const compInference = rawInference > 40 ? rawInference : Math.max(40, latency - 30);
      const finalRtt = compHandshake + compRouting + compInference + compTransfer;

      // Connection Trace Diagnostic Log (DevTools-style sequence list)
      const traceLog = [
        `0ms: [Socket] Initialized HTTP/2 keep-alive TCP connection stream to /api/agent/${meta.id}`,
        `${Math.floor(compHandshake * 0.35)}ms: [DNS] Server lookup resolved to cloud edge router node`,
        `${Math.floor(compHandshake * 0.75)}ms: [TLS] TLSv1.3 Negotiation & secure Session Key handshake completed`,
        `${compHandshake}ms: [Request] Sent headers and compressed JSON body packet stream (${JSON.stringify(cumulativeContext).length} bytes)`,
        `${compHandshake + compRouting}ms: [Proxy] Ingress routing completed (${routingMode === "mesh" ? `Decentralized Peer Mesh; Crosstalk Hop Count: ${crossTalkCountLocal + 1}` : "Top-Down Direct Gateway Route"})`,
        `${compHandshake + compRouting + compInference}ms: [Response] Received TTFB (First byte of server-side inference payload)`,
        `${finalRtt}ms: [Connection] Closed. Successfully deserialized and parsed response body JSON stream (${JSON.stringify(resData).length} bytes)`
      ];

      // Construct simulated raw JSON Transaction Payload for inter-agent logs
      const reqPayload = {
        metaHeader: {
          transactionId: `tx_hop_${Math.random().toString(36).substring(3, 10)}`,
          routingFramework: routingMode,
          blackboardHash: `sha256_${Math.random().toString(36).substring(3, 15)}`
        },
        request: {
          endpoint: `/api/agent/${meta.id}`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer x-token-jwt-apex-orchestra"
          },
          body: {
            objective,
            sharedBlackboardMemory: {
              industry,
              previousActiveStep: i > 0 ? AGENTS_META[i-1].id : "SYSTEM_LAUNCH",
              activeHops: AGENTS_META.slice(0, i+1).map(a => a.id)
            }
          }
        },
        response: {
          statusCode: 200,
          responseHeader: {
            "x-agent-signature": `sign_${Math.random().toString(36).substring(2, 12)}`,
            "server-timing": `db;dur=15, ai-infer;dur=${compInference}, handshake;dur=${compHandshake}, routing;dur=${compRouting}, transfer;dur=${compTransfer}`
          },
          body: resData
        }
      };

      const newPayloadLog: InterAgentPayload = {
        timestamp: new Date().toLocaleTimeString(),
        sender: routingMode === "hierarchical" ? "ceo" : (i > 0 ? AGENTS_META[i-1].id : "controller"),
        receiver: meta.id,
        type: routingMode === "hierarchical" ? "Broadcast Hop" : "Peer Mesh Query",
        endpoint: `/api/v1/agent/${meta.id}`,
        latencyMs: finalRtt,
        payload: JSON.stringify(reqPayload, null, 2)
      };

      setPayloadLogs(prev => [...prev, newPayloadLog]);
      if (selectedPayloadIndex === -1) setSelectedPayloadIndex(0);

      // Set agent execution complete with dynamic RTT profile
      setAgentsState(prev => ({
        ...prev,
        [meta.id]: {
          ...prev[meta.id],
          running: false,
          completed: true,
          status: "SUCCESS",
          result: resData,
          metrics: {
            ...data.metrics,
            executionTimeMs: finalRtt,
            rttComponents: {
              handshake: compHandshake,
              routing: compRouting,
              inference: compInference,
              transfer: compTransfer,
              totalRtt: finalRtt
            },
            traceLog: traceLog
          }
        }
      }));

      // Update metrics with actual client measured RTT
      setMetrics(prev => ({
        totalTokens: prev.totalTokens + data.metrics.tokensUsed,
        totalTimeMs: prev.totalTimeMs + finalRtt,
        tasksCompleted: prev.tasksCompleted + data.metrics.tasksCompleted,
        crossTalksCount: prev.crossTalksCount + crossTalkCountLocal
      }));

      // Update dynamic sparklines
      setLatencyHistory(prev => [...prev.slice(1), finalRtt]);

      addGlobalLog(`✓ Agent [${meta.name}] analysis complete. Parameters validated.`, "success", meta.id);
      await stepDelay(800);
    }

    setIsRunning(false);
    setCurrentAgentIndex(-1);
    addGlobalLog("🏆 Platform blueprint compiled. Dynamic corporate strategies established successfully.", "success");
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatTyping) return;

    const query = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { sender: "Human Partner", role: "Manager", text: query, timestamp: new Date().toLocaleTimeString(), isUser: true }]);
    setIsChatTyping(true);

    const activeMeta = AGENTS_META.find(a => a.id === chatAgentId)!;
    await new Promise(r => setTimeout(r, 1200));

    // Custom response mapping
    let response = "";
    if (chatAgentId === "ceo") {
      response = `Strategic Report: To enhance capital efficiency under **"${objective}"**, I advise immediately throttling early advertising testing by 20% and extending the closed-beta timeline by 3 weeks. This buffers cash flow before launching enterprise outbound sales pipelines.`;
    } else if (chatAgentId === "marketing") {
      response = `Marketing Report: Based on current trends in **"${objective}"**, we can optimize costs by routing 60% of focus onto developer influencer relations and high-conversion documentation SEO instead of premium LinkedIn Ads. This slashes customer acquisition cost by nearly 40%.`;
    } else if (chatAgentId === "finance") {
      response = `Finance Audit: I have modeled your query against the active Blackboard memory. By adjusting staffing budgets down and deferring non-essential CRM software licensing, Year 1 operating overhead is reduced from $245,000 to **$195,000**, lifting Year 1 net profit margins to nearly **22%**.`;
    } else {
      response = `As the ${activeMeta.role}, I have formulated a tactical recommendation. For **"${objective}"**, we must optimize system boundaries and configure strict microservice SLAs to protect our operations from early churn or system lag. Let me know what data arrays I should calculate next!`;
    }

    setChatMessages(prev => [...prev, { sender: activeMeta.name, role: activeMeta.role, text: response, timestamp: new Date().toLocaleTimeString(), isUser: false }]);
    setIsChatTyping(false);
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const activeAgent = AGENTS_META.find(a => a.id === selectedAgentId)!;
  const activeAgentState = agentsState[selectedAgentId];

  const chartData = AGENTS_META.map(agent => ({
    name: agent.name.replace(" Agent", ""),
    tasksCompleted: agentsState[agent.id]?.metrics?.tasksCompleted || 0,
    color: agent.id === "ceo" ? "#3b82f6" :
           agent.id === "marketing" ? "#ec4899" :
           agent.id === "sales" ? "#10b981" :
           agent.id === "hr" ? "#f59e0b" :
           agent.id === "finance" ? "#f43f5e" :
           agent.id === "support" ? "#06b6d4" : "#8b5cf6"
  }));

  const compareAgentA = AGENTS_META.find(a => a.id === compareAgentAId)!;
  const compareAgentB = AGENTS_META.find(a => a.id === compareAgentBId)!;

  const compareAgentAMetrics = agentsState[compareAgentAId]?.metrics || { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 };
  const compareAgentBMetrics = agentsState[compareAgentBId]?.metrics || { tokensUsed: 0, executionTimeMs: 0, tasksCompleted: 0 };

  const tokenCompareData = [
    {
      name: compareAgentA.name.replace(" Agent", ""),
      value: compareAgentAMetrics.tokensUsed,
      color: compareAgentAId === "ceo" ? "#3b82f6" :
             compareAgentAId === "marketing" ? "#ec4899" :
             compareAgentAId === "sales" ? "#10b981" :
             compareAgentAId === "hr" ? "#f59e0b" :
             compareAgentAId === "finance" ? "#f43f5e" :
             compareAgentAId === "support" ? "#06b6d4" : "#8b5cf6"
    },
    {
      name: compareAgentB.name.replace(" Agent", ""),
      value: compareAgentBMetrics.tokensUsed,
      color: compareAgentBId === "ceo" ? "#3b82f6" :
             compareAgentBId === "marketing" ? "#ec4899" :
             compareAgentBId === "sales" ? "#10b981" :
             compareAgentBId === "hr" ? "#f59e0b" :
             compareAgentBId === "finance" ? "#f43f5e" :
             compareAgentBId === "support" ? "#06b6d4" : "#8b5cf6"
    }
  ];

  const latencyCompareData = [
    {
      name: compareAgentA.name.replace(" Agent", ""),
      value: compareAgentAMetrics.executionTimeMs,
      color: compareAgentAId === "ceo" ? "#3b82f6" :
             compareAgentAId === "marketing" ? "#ec4899" :
             compareAgentAId === "sales" ? "#10b981" :
             compareAgentAId === "hr" ? "#f59e0b" :
             compareAgentAId === "finance" ? "#f43f5e" :
             compareAgentAId === "support" ? "#06b6d4" : "#8b5cf6"
    },
    {
      name: compareAgentB.name.replace(" Agent", ""),
      value: compareAgentBMetrics.executionTimeMs,
      color: compareAgentBId === "ceo" ? "#3b82f6" :
             compareAgentBId === "marketing" ? "#ec4899" :
             compareAgentBId === "sales" ? "#10b981" :
             compareAgentBId === "hr" ? "#f59e0b" :
             compareAgentBId === "finance" ? "#f43f5e" :
             compareAgentBId === "support" ? "#06b6d4" : "#8b5cf6"
    }
  ];

  let tokenDiffText = "";
  if (compareAgentAMetrics.tokensUsed > 0 || compareAgentBMetrics.tokensUsed > 0) {
    if (compareAgentAMetrics.tokensUsed === compareAgentBMetrics.tokensUsed) {
      tokenDiffText = "Identical tokens consumption";
    } else if (compareAgentAMetrics.tokensUsed > compareAgentBMetrics.tokensUsed) {
      const pct = (((compareAgentAMetrics.tokensUsed - compareAgentBMetrics.tokensUsed) / (compareAgentBMetrics.tokensUsed || 1)) * 100).toFixed(0);
      tokenDiffText = `${compareAgentA.name} used ${pct}% more tokens than ${compareAgentB.name}`;
    } else {
      const pct = (((compareAgentBMetrics.tokensUsed - compareAgentAMetrics.tokensUsed) / (compareAgentAMetrics.tokensUsed || 1)) * 100).toFixed(0);
      tokenDiffText = `${compareAgentB.name} used ${pct}% more tokens than ${compareAgentA.name}`;
    }
  } else {
    tokenDiffText = "No active run data found";
  }

  let latencyDiffText = "";
  if (compareAgentAMetrics.executionTimeMs > 0 || compareAgentBMetrics.executionTimeMs > 0) {
    if (compareAgentAMetrics.executionTimeMs === compareAgentBMetrics.executionTimeMs) {
      latencyDiffText = "Identical execution speed";
    } else if (compareAgentAMetrics.executionTimeMs > compareAgentBMetrics.executionTimeMs) {
      const msDiff = compareAgentAMetrics.executionTimeMs - compareAgentBMetrics.executionTimeMs;
      latencyDiffText = `${compareAgentB.name} is ${msDiff}ms faster than ${compareAgentA.name}`;
    } else {
      const msDiff = compareAgentBMetrics.executionTimeMs - compareAgentAMetrics.executionTimeMs;
      latencyDiffText = `${compareAgentA.name} is ${msDiff}ms faster than ${compareAgentB.name}`;
    }
  } else {
    latencyDiffText = "No active run data found";
  }

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
      theme === "dark" ? "theme-dark bg-[#09090b] text-[#f4f4f5]" : "theme-light bg-slate-50 text-slate-800"
    }`}>
      
      {/* 1. HEADER SECTION */}
      <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 sticky top-0 z-40 backdrop-blur-md transition-all duration-300 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-950/60" : "border-slate-200 bg-white/70"
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(79,70,229,0.35)] text-white overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-600/30 opacity-80 blur-sm group-hover:scale-125 transition-transform duration-500" />
            <svg className="h-5 w-5 relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4L3 11l9 7 9-7-9-7Z" stroke="currentColor" strokeWidth="2" />
              <path d="M12 11L7 15l5 4 5-4-5-4Z" fill="rgba(255, 255, 255, 0.2)" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="11" r="1.5" fill="#ffffff" />
            </svg>
            <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-indigo-200 opacity-60"></span>
            <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-purple-200 opacity-60"></span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className={`text-sm font-black tracking-widest leading-none transition-colors duration-300 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                APEX<span className="text-indigo-600 dark:text-indigo-400 font-extrabold font-mono text-[13px] ml-0.5">ORCHESTRA</span>
              </span>
              <span className={`text-[8px] uppercase tracking-widest font-mono font-bold ml-2 px-1.5 py-0.5 rounded-md border transition-all duration-300 ${
                theme === "dark" ? "bg-zinc-900 border-zinc-800 text-zinc-400" : "bg-slate-100 border-slate-200 text-slate-500"
              }`}>v3.0</span>
            </div>
            <span className="text-[7.5px] font-mono tracking-[0.25em] text-zinc-500 uppercase font-bold mt-1 leading-none">
              DECEN_NEURAL_OS
            </span>
          </div>
        </div>

        {/* Global Live System Telemetry */}
        <div className="flex gap-4 md:gap-6 items-center">
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase text-zinc-500 font-mono font-semibold">Active Tokens</span>
            <span className={`text-xs font-mono font-bold transition-colors duration-300 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`}>
              {(metrics.totalTokens).toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase text-zinc-500 font-mono font-semibold">Elapsed Latency</span>
            <span className={`text-xs font-mono font-bold transition-colors duration-300 ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>
              {metrics.totalTimeMs}ms
            </span>
          </div>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] uppercase text-zinc-500 font-mono font-semibold">Active Mode</span>
            <span className={`text-xs font-mono font-bold uppercase transition-colors duration-300 ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
              {routingMode}
            </span>
          </div>

          {/* Theme switcher */}
          <div className="pl-2 border-l border-zinc-800 dark:border-zinc-800/10 flex items-center">
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-1.5 rounded border transition-all duration-300 flex items-center justify-center cursor-pointer ${
                theme === "dark"
                  ? "bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-amber-400"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-250 text-indigo-600"
              }`}
            >
              {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto w-full overflow-hidden">
        
        {/* 2. LEFT COLUMN: OBJECTIVE INPUT & CONSOLE */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Business Objective Card */}
          <div className={`border rounded-xl p-4 flex flex-col gap-3.5 relative overflow-hidden transition-all duration-300 ${
            theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
              <h2 className="text-[10px] font-bold uppercase tracking-widest font-mono text-indigo-500 dark:text-indigo-400">Tactical Injector</h2>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">Business Goal Objective</label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                disabled={isRunning}
                placeholder="e.g. Build an AI-driven invoice auditing B2B tool..."
                className={`w-full h-20 border rounded p-2.5 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-all duration-300 ${
                  theme === "dark" ? "bg-zinc-900 border-zinc-800 placeholder:text-zinc-600 text-white" : "bg-slate-50 border-slate-200 placeholder:text-slate-400 text-slate-800"
                }`}
              />
            </div>

            {/* Presets */}
            <div className="flex flex-col gap-2">
              <label className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">Standard Blueprints</label>
              <div className="flex flex-col gap-1.5">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setObjective(preset)}
                    disabled={isRunning}
                    className={`text-left text-[10px] px-2.5 py-1.5 rounded border transition-all duration-150 truncate cursor-pointer ${
                      objective === preset
                        ? (theme === "dark" ? "bg-indigo-950/20 border-indigo-500/50 text-indigo-300 font-semibold" : "bg-indigo-50 border-indigo-300 text-indigo-700 font-bold")
                        : (theme === "dark" ? "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 text-zinc-400" : "bg-white border-slate-200 hover:border-slate-300 text-slate-600")
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-1.5">
              <button
                onClick={handleLaunchPipeline}
                disabled={isRunning || !objective.trim()}
                className={`flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all shadow-[0_0_12px_rgba(79,70,229,0.2)] tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50`}
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>ORCHESTRATING...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 fill-current" />
                    <span>INITIALIZE AGENTS</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleInjectRandomFault}
                disabled={isRunning}
                className={`px-3 py-2 border rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  faultyAgentId
                    ? "bg-rose-950/25 border-rose-500/50 text-rose-400 hover:bg-rose-950/45 animate-pulse"
                    : (theme === "dark" ? "border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/60" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100")
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>{faultyAgentId ? "FAULT STAGED" : "INJECT FAULT"}</span>
              </button>
            </div>
          </div>

          {/* Unified System Logs Terminal */}
          <div className={`border rounded-xl p-4 flex flex-col flex-1 min-h-[250px] transition-all duration-300 ${
            theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest font-mono text-emerald-500">root@apex-agent:~</h2>
              </div>
              <span className="text-[8px] font-mono text-zinc-500">Live Stream Logs</span>
            </div>

            <div className={`flex-1 rounded-lg border p-3 font-mono text-[9.5px] leading-relaxed overflow-y-auto max-h-[300px] flex flex-col gap-1.5 select-text transition-all duration-300 ${
              theme === "dark" ? "bg-zinc-900/60 border-zinc-800/60 text-zinc-400" : "bg-slate-50 border-slate-150 text-slate-700"
            }`}>
              {globalLogs.map((log, index) => {
                let color = "text-slate-600 dark:text-zinc-400";
                if (log.type === "success") color = "text-emerald-600 dark:text-emerald-400 font-bold";
                if (log.type === "warning") color = "text-amber-600 dark:text-amber-400 font-bold";
                if (log.type === "error") color = "text-rose-600 dark:text-rose-400 font-black";
                if (log.type === "agent") color = "text-indigo-600 dark:text-indigo-400 font-bold";

                return (
                  <div key={index} className={`flex gap-1.5 items-start border-b pb-1 last:border-0 transition-colors ${
                    theme === "dark" ? "border-zinc-800/30 hover:bg-zinc-800/10" : "border-slate-100 hover:bg-slate-100/50"
                  }`}>
                    <span className={`${theme === "dark" ? "text-zinc-600" : "text-slate-400"} select-none font-semibold`}>[{log.timestamp}]</span>
                    <span className={color}>{log.text}</span>
                  </div>
                );
              })}
              <div ref={consoleBottomRef} />
            </div>
          </div>
        </section>

        {/* 3. CENTER & RIGHT COLUMNS: CANVAS & COCKPIT WORKSPACE */}
        <section className="lg:col-span-8 flex flex-col gap-4 overflow-hidden">
          
          {/* Active Collaboration Canvas Pipeline Graph */}
          <div className={`border rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${
            theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                <h2 className="text-[10px] font-bold uppercase tracking-widest font-mono text-zinc-500">Active Multi-Agent Orchestration Topology</h2>
              </div>

              {/* Hierarchical vs Mesh Routing Toggle Switch */}
              <div className="flex items-center gap-2 border border-zinc-800/60 dark:border-zinc-800 rounded p-1 text-[9.5px] font-mono self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setRoutingMode("hierarchical")}
                  disabled={isRunning}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    routingMode === "hierarchical"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Top-Down (Hierarchical)
                </button>
                <button
                  type="button"
                  onClick={() => setRoutingMode("mesh")}
                  disabled={isRunning}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    routingMode === "mesh"
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Decentralized Mesh
                </button>
              </div>
            </div>

            {/* Canvas Area */}
            <div className={`relative border rounded-lg p-3 overflow-x-auto select-none ${
              theme === "dark" ? "border-zinc-900 bg-zinc-900/20" : "border-slate-100 bg-slate-50/50"
            }`}>
              {/* Radial dots design layer */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.07]" style={{
                backgroundImage: `radial-gradient(${theme === 'dark' ? '#6366f1' : '#4f46e5'} 1.5px, transparent 1.5px)`,
                backgroundSize: "20px 20px"
              }} />

              {/* Dynamic SVGs for Paths */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
                <svg className="w-full h-full min-w-[650px]">
                  {routingMode === "hierarchical" ? (
                    // CEO broadcasts to every node
                    <>
                      <path d="M 110 75 L 210 40" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="1.2" fill="none" className={agentsState.marketing.completed ? "line-active" : ""} />
                      <path d="M 110 75 L 210 100" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="1.2" fill="none" className={agentsState.sales.completed ? "line-active" : ""} />
                      <path d="M 110 75 L 210 160" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="1.2" fill="none" className={agentsState.hr.completed ? "line-active" : ""} />
                      <path d="M 110 75 L 210 220" stroke="#4f46e5" strokeOpacity="0.35" strokeWidth="1.2" fill="none" className={agentsState.finance.completed ? "line-active" : ""} />
                      
                      <path d="M 310 40 L 410 40" stroke="#4f46e5" strokeOpacity="0.2" strokeWidth="1" fill="none" className={agentsState.support.completed ? "line-active" : ""} />
                      <path d="M 310 100 L 410 130" stroke="#4f46e5" strokeOpacity="0.2" strokeWidth="1" fill="none" className={agentsState.support.completed ? "line-active" : ""} />
                      
                      <path d="M 510 130 L 590 130" stroke="#4f46e5" strokeOpacity="0.25" strokeWidth="1" fill="none" className={agentsState.developer.completed ? "line-active" : ""} />
                    </>
                  ) : (
                    // Mesh Routing: Nodes connected as dynamic network grid
                    <>
                      <path d="M 110 75 L 210 40" stroke="#06b6d4" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                      <path d="M 210 40 L 210 100" stroke="#ec4899" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
                      <path d="M 210 100 L 210 220" stroke="#a855f7" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                      <path d="M 210 220 L 410 130" stroke="#10b981" strokeOpacity="0.4" strokeWidth="1.2" strokeDasharray="1 1" fill="none" />
                      <path d="M 410 130 L 590 130" stroke="#6366f1" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
                      <path d="M 590 130 L 210 160" stroke="#ec4899" strokeOpacity="0.35" strokeWidth="1" fill="none" />
                    </>
                  )}

                  {/* Pulsing glow particle layer */}
                  {isRunning && (
                    <circle r="3.5" fill="#a855f7" className="shadow-lg">
                      <animateMotion dur="4.5s" repeatCount="indefinite" path={routingMode === "hierarchical" ? "M 110 75 C 150 75, 170 40, 210 40 L 310 40 C 370 40, 370 130, 410 130 L 590 130" : "M 210 40 L 210 100 L 210 220 L 410 130 L 590 130"} />
                    </circle>
                  )}
                </svg>
              </div>

              {/* Absolute Nodes Container */}
              <div className="relative min-w-[650px] h-[260px]">
                
                {/* CEO Node */}
                <div className="absolute left-[5px] top-[95px] z-10">
                  <NodeCard meta={AGENTS_META[0]} state={agentsState.ceo} isSelected={selectedAgentId === "ceo"} onClick={() => setSelectedAgentId("ceo")} theme={theme} isFaulty={faultyAgentId === "ceo"} />
                </div>

                {/* Segment Middle column */}
                <div className="absolute left-[165px] top-[10px] z-10">
                  <NodeCard meta={AGENTS_META[1]} state={agentsState.marketing} isSelected={selectedAgentId === "marketing"} onClick={() => setSelectedAgentId("marketing")} theme={theme} isFaulty={faultyAgentId === "marketing"} />
                </div>
                <div className="absolute left-[165px] top-[72px] z-10">
                  <NodeCard meta={AGENTS_META[2]} state={agentsState.sales} isSelected={selectedAgentId === "sales"} onClick={() => setSelectedAgentId("sales")} theme={theme} isFaulty={faultyAgentId === "sales"} />
                </div>
                <div className="absolute left-[165px] top-[134px] z-10">
                  <NodeCard meta={AGENTS_META[3]} state={agentsState.hr} isSelected={selectedAgentId === "hr"} onClick={() => setSelectedAgentId("hr")} theme={theme} isFaulty={faultyAgentId === "hr"} />
                </div>
                <div className="absolute left-[165px] top-[196px] z-10">
                  <NodeCard meta={AGENTS_META[4]} state={agentsState.finance} isSelected={selectedAgentId === "finance"} onClick={() => setSelectedAgentId("finance")} theme={theme} isFaulty={faultyAgentId === "finance"} />
                </div>

                {/* Support Column */}
                <div className="absolute left-[355px] top-[95px] z-10">
                  <NodeCard meta={AGENTS_META[5]} state={agentsState.support} isSelected={selectedAgentId === "support"} onClick={() => setSelectedAgentId("support")} theme={theme} isFaulty={faultyAgentId === "support"} />
                </div>

                {/* Dev Column */}
                <div className="absolute left-[515px] top-[95px] z-10">
                  <NodeCard meta={AGENTS_META[6]} state={agentsState.developer} isSelected={selectedAgentId === "developer"} onClick={() => setSelectedAgentId("developer")} theme={theme} isFaulty={faultyAgentId === "developer"} />
                </div>

              </div>
            </div>
          </div>

          {/* Live Telemetry & System Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Sparkline Latency Metric */}
            <div className={`border rounded-xl p-3 flex flex-col justify-between transition-all duration-300 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8.5px] uppercase text-zinc-500 font-mono font-bold block">Network Roundtrip latency</span>
                  <span className={`text-sm font-mono font-extrabold block mt-0.5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {latencyHistory[latencyHistory.length - 1]}ms
                  </span>
                </div>
                <Zap className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
              </div>
              {/* Dynamic SVG Sparkline Graph */}
              <div className="h-7 w-full mt-2 select-none">
                <svg className="w-full h-full overflow-visible">
                  <polyline
                    fill="none"
                    stroke={theme === "dark" ? "#6366f1" : "#4f46e5"}
                    strokeWidth="1.8"
                    points={latencyHistory.map((val, i) => `${(i / (latencyHistory.length - 1)) * 180},${30 - (val / 400) * 25}`).join(" ")}
                  />
                  {/* Subtle area gradient below sparkline */}
                  <path
                    d={`M 0,30 ${latencyHistory.map((val, i) => `L ${(i / (latencyHistory.length - 1)) * 180},${30 - (val / 400) * 25}`).join(" ")} L 180,30 Z`}
                    fill={theme === "dark" ? "rgba(99,102,241,0.06)" : "rgba(79,70,229,0.06)"}
                  />
                </svg>
              </div>
            </div>

            {/* Efficiency completion vector velocity */}
            <div className={`border rounded-xl p-3 flex flex-col justify-between transition-all duration-300 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8.5px] uppercase text-zinc-500 font-mono font-bold block">Efficiency Completion Vector</span>
                  <span className={`text-sm font-mono font-extrabold block mt-0.5 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {isRunning ? "84.2% velocity" : "Optimal (Idle)"}
                  </span>
                </div>
                <Activity className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <div className="flex items-center gap-2 mt-2 font-mono text-[9px] text-zinc-500">
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: isRunning ? "84%" : "100%" }} />
                </div>
                <span>100%</span>
              </div>
            </div>

            {/* System Cost tracking */}
            <div className={`border rounded-xl p-3 flex flex-col justify-between transition-all duration-300 ${
              theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[8.5px] uppercase text-zinc-500 font-mono font-bold block">Est. Computational Overhead</span>
                  <span className={`text-sm font-mono font-extrabold block mt-0.5 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>
                    ${(metrics.totalTokens * 0.000015).toFixed(4)} USD
                  </span>
                </div>
                <DollarSign className="h-3.5 w-3.5 text-rose-500" />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-zinc-500 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-1.5 mt-2">
                <span>Mesh Hops: {metrics.crossTalksCount}</span>
                <span>Active Nodes: 7</span>
              </div>
            </div>

          </div>

          {/* Dashboard Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800/10 dark:border-zinc-800 pb-2 mb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveAnalyticsTab("performance")}
                type="button"
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  activeAnalyticsTab === "performance"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.25)]"
                    : (theme === "dark" ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-white border-slate-200 text-slate-600 hover:text-slate-800 shadow-sm")
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Performance & Telemetry</span>
              </button>
              <button
                onClick={() => setActiveAnalyticsTab("heatmap")}
                type="button"
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                  activeAnalyticsTab === "heatmap"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.25)]"
                    : (theme === "dark" ? "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-white border-slate-200 text-slate-600 hover:text-slate-800 shadow-sm")
                }`}
              >
                <Network className="h-3.5 w-3.5" />
                <span>Agent Interaction Heatmap</span>
              </button>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:block">
              Apex Analytics Control
            </div>
          </div>

          {activeAnalyticsTab === "performance" ? (
            <>
              {/* Task Completion Analytics Card */}
              <div className={`border rounded-xl p-4 transition-all duration-300 ${
                theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                    <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-400">Agent Task Execution Load (Completed Tasks)</h3>
                  </div>
                  <span className="text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded px-1.5 py-0.5">Real-time Load Metrics</span>
                </div>

                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(63,63,70,0.4)" : "rgba(226,232,240,0.8)"} vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: theme === "dark" ? "#a1a1aa" : "#64748b", fontSize: 9 }} 
                        axisLine={{ stroke: theme === "dark" ? "#27272a" : "#cbd5e1" }}
                        tickLine={false} 
                      />
                      <YAxis 
                        tick={{ fill: theme === "dark" ? "#a1a1aa" : "#64748b", fontSize: 10 }} 
                        axisLine={{ stroke: theme === "dark" ? "#27272a" : "#cbd5e1" }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip 
                        cursor={{ fill: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.01)" }} 
                        contentStyle={{ 
                          backgroundColor: theme === "dark" ? "#09090b" : "#ffffff", 
                          borderColor: theme === "dark" ? "#27272a" : "#e2e8f0", 
                          borderRadius: "8px", 
                          fontSize: "11px", 
                          color: theme === "dark" ? "#f4f4f5" : "#1e293b",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }} 
                      />
                      <Bar dataKey="tasksCompleted" barSize={32} radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend / Stats Grid */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-3">
                  {chartData.map((agent, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-[9.5px] font-mono">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: agent.color }} />
                      <span className="text-zinc-500 dark:text-zinc-400">{agent.name}:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{agent.tasksCompleted}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Side-by-Side Agent Performance Comparator */}
              <div className={`border rounded-xl p-4 transition-all duration-300 ${
                theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5 text-indigo-500" />
                    <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-400">Agent Performance Comparator & Connection Trace</h3>
                  </div>
                  <span className="text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded px-1.5 py-0.5">Telemetry Analyzer</span>
                </div>

                {/* Selectors Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-mono uppercase font-bold">Select Agent A</label>
                    <select
                      value={compareAgentAId}
                      onChange={(e) => setCompareAgentAId(e.target.value)}
                      className={`text-xs p-2 rounded border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors ${
                        theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      {AGENTS_META.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.avatar} {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[8px] text-zinc-500 font-mono uppercase font-bold">Select Agent B</label>
                    <select
                      value={compareAgentBId}
                      onChange={(e) => setCompareAgentBId(e.target.value)}
                      className={`text-xs p-2 rounded border focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors ${
                        theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      {AGENTS_META.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.avatar} {agent.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Real-time Network Jitter & Loss Injector Controls */}
                <div className={`p-3 rounded-lg border mb-4 flex flex-col md:flex-row gap-4 items-center justify-between ${
                  theme === "dark" ? "bg-zinc-900/30 border-zinc-800/80" : "bg-slate-50/40 border-slate-200"
                }`}>
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-indigo-400 text-xs font-mono">📡</span>
                    <div>
                      <h4 className={`text-[10px] font-mono uppercase font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-800'}`}>Edge Gateway Simulator</h4>
                      <p className={`text-[8.5px] font-mono ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>Inject latency jitter and connection loss on live request pipes</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
                    {/* Jitter Slider */}
                    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                      <span className={`text-[8px] font-mono uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>Jitter:</span>
                      <input
                        type="range"
                        min="5"
                        max="150"
                        value={jitterMs}
                        onChange={(e) => setJitterMs(Number(e.target.value))}
                        className={`h-1 rounded-lg appearance-none cursor-pointer accent-indigo-500 flex-1 ${
                          theme === "dark" ? "bg-zinc-700" : "bg-slate-200"
                        }`}
                      />
                      <span className="text-[9px] font-mono font-bold text-indigo-400 min-w-[32px] text-right">{jitterMs}ms</span>
                    </div>

                    {/* Loss Slider */}
                    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                      <span className={`text-[8px] font-mono uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>Loss Ratio:</span>
                      <input
                        type="range"
                        min="0"
                        max="45"
                        step="5"
                        value={packetLossPercent}
                        onChange={(e) => setPacketLossPercent(Number(e.target.value))}
                        className={`h-1 rounded-lg appearance-none cursor-pointer accent-rose-500 flex-1 ${
                          theme === "dark" ? "bg-zinc-700" : "bg-slate-200"
                        }`}
                      />
                      <span className={`text-[9px] font-mono font-bold min-w-[30px] text-right ${
                        packetLossPercent > 0 
                          ? "text-rose-400 animate-pulse" 
                          : (theme === 'dark' ? "text-zinc-500" : "text-slate-400")
                      }`}>
                        {packetLossPercent}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparison Metrics Grid with Side-by-Side Bar Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Tokens Used Comparison Card */}
                  <div className={`p-3 rounded-lg border ${
                    theme === "dark" ? "bg-zinc-900/40 border-zinc-800/80" : "bg-slate-50/50 border-slate-150"
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] uppercase text-zinc-500 font-mono font-bold block">Computational Token Intensity</span>
                      <span className="text-[8.5px] font-mono text-zinc-400">Tokens</span>
                    </div>

                    <div className="w-full h-[120px] mb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tokenCompareData} layout="vertical" margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="2 2" stroke={theme === "dark" ? "rgba(63,63,70,0.2)" : "rgba(226,232,240,0.5)"} horizontal={false} />
                          <XAxis type="number" tick={{ fill: theme === "dark" ? "#a1a1aa" : "#64748b", fontSize: 8 }} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill: theme === "dark" ? "#a1a1aa" : "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme === "dark" ? "#09090b" : "#ffffff", 
                              borderColor: theme === "dark" ? "#27272a" : "#e2e8f0", 
                              borderRadius: "6px", 
                              fontSize: "10px", 
                              color: theme === "dark" ? "#f4f4f5" : "#1e293b" 
                            }} 
                          />
                          <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                            {tokenCompareData.map((entry, index) => (
                              <Cell key={`token-cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-1.5 flex items-center gap-1">
                      <span className="text-indigo-500">⚡</span>
                      <span className="truncate">{tokenDiffText}</span>
                    </div>
                  </div>

                  {/* Execution Latency Comparison Card */}
                  <div className={`p-3 rounded-lg border ${
                    theme === "dark" ? "bg-zinc-900/40 border-zinc-800/80" : "bg-slate-50/50 border-slate-150"
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] uppercase text-zinc-500 font-mono font-bold block">Temporal Execution Latency</span>
                      <div className="flex items-center gap-1 bg-black/20 p-0.5 rounded border border-zinc-800/40">
                        <button 
                          onClick={() => setLatencyView("simple")}
                          className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded transition-all ${
                            latencyView === "simple" 
                              ? "bg-indigo-600/80 text-white font-bold" 
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          Simple
                        </button>
                        <button 
                          onClick={() => setLatencyView("stacked")}
                          className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded transition-all ${
                            latencyView === "stacked" 
                              ? "bg-indigo-600/80 text-white font-bold" 
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          Stacked RTT
                        </button>
                      </div>
                    </div>

                    <div className="w-full h-[120px] mb-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={latencyCompareData} layout="vertical" margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="2 2" stroke={theme === "dark" ? "rgba(63,63,70,0.2)" : "rgba(226,232,240,0.5)"} horizontal={false} />
                          <XAxis type="number" tick={{ fill: theme === "dark" ? "#a1a1aa" : "#64748b", fontSize: 8 }} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill: theme === "dark" ? "#a1a1aa" : "#64748b", fontSize: 9 }} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme === "dark" ? "#09090b" : "#ffffff", 
                              borderColor: theme === "dark" ? "#27272a" : "#e2e8f0", 
                              borderRadius: "6px", 
                              fontSize: "10px", 
                              color: theme === "dark" ? "#f4f4f5" : "#1e293b" 
                            }} 
                          />
                          {latencyView === "simple" ? (
                            <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                              {latencyCompareData.map((entry, index) => {
                                const agentColor = index === 0 
                                  ? (compareAgentAId === "ceo" ? "#3b82f6" : compareAgentAId === "marketing" ? "#ec4899" : compareAgentAId === "sales" ? "#10b981" : compareAgentAId === "hr" ? "#f59e0b" : compareAgentAId === "finance" ? "#f43f5e" : compareAgentAId === "support" ? "#06b6d4" : "#8b5cf6")
                                  : (compareAgentBId === "ceo" ? "#3b82f6" : compareAgentBId === "marketing" ? "#ec4899" : compareAgentBId === "sales" ? "#10b981" : compareAgentBId === "hr" ? "#f59e0b" : compareAgentBId === "finance" ? "#f43f5e" : compareAgentBId === "support" ? "#06b6d4" : "#8b5cf6");
                                return <Cell key={`latency-cell-${index}`} fill={agentColor} />;
                              })}
                            </Bar>
                          ) : (
                            <>
                              <Bar dataKey="Handshake" name="TCP Handshake" stackId="rtt" fill="#f59e0b" barSize={16} />
                              <Bar dataKey="Routing" name="Proxy Routing" stackId="rtt" fill="#3b82f6" barSize={16} />
                              <Bar dataKey="Inference" name="LLM Inference" stackId="rtt" fill="#10b981" barSize={16} />
                              <Bar dataKey="Transfer" name="Data Transfer" stackId="rtt" fill="#ec4899" barSize={16} radius={[0, 4, 4, 0]} />
                            </>
                          )}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-800/10 dark:border-zinc-800/40 pt-1.5 flex items-center gap-1">
                      <span className="text-emerald-500">⏱</span>
                      <span className="truncate">{latencyDiffText}</span>
                    </div>
                  </div>

                </div>

                {/* TCP / HTTP Connection Waterfall Trace & Diagnostics */}
                <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
                  theme === "dark" ? "bg-zinc-900/10 border-zinc-800/80" : "bg-slate-50/40 border-slate-200 shadow-sm"
                }`}>
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes ping-packet {
                      0% { left: 10%; opacity: 0; }
                      10% { opacity: 1; }
                      90% { opacity: 1; }
                      100% { left: 90%; opacity: 0; }
                    }
                  `}} />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-zinc-800/10 dark:border-zinc-800/40 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-indigo-500 font-mono text-sm animate-pulse">📡</span>
                      <div>
                        <h4 className={`text-[10px] font-mono uppercase font-black ${theme === "dark" ? "text-zinc-200" : "text-slate-800"}`}>Connection RTT Telemetry & Trace Timeline</h4>
                        <p className={`text-[8px] font-mono ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`}>Detailed physical socket roundtrip trace analysis</p>
                      </div>
                    </div>

                    {/* Agent Selection buttons */}
                    <div className="flex items-center gap-1 bg-black/10 dark:bg-black/20 p-0.5 rounded-lg border border-zinc-800/10 dark:border-zinc-800/40 self-end sm:self-auto">
                      <button
                        onClick={() => setTraceAgentSelection("A")}
                        type="button"
                        className={`text-[8px] font-mono uppercase px-2 py-1 rounded-md transition-all cursor-pointer ${
                          traceAgentSelection === "A"
                            ? "bg-indigo-600 text-white font-bold shadow-sm"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Inspect A ({AGENTS_META.find(a => a.id === compareAgentAId)?.name.split(" ")[0]})
                      </button>
                      <button
                        onClick={() => setTraceAgentSelection("B")}
                        type="button"
                        className={`text-[8px] font-mono uppercase px-2 py-1 rounded-md transition-all cursor-pointer ${
                          traceAgentSelection === "B"
                            ? "bg-indigo-600 text-white font-bold shadow-sm"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        Inspect B ({AGENTS_META.find(a => a.id === compareAgentBId)?.name.split(" ")[0]})
                      </button>
                    </div>
                  </div>

                  {/* Trace Viewer Content */}
                  {(() => {
                    const selectedId = traceAgentSelection === "A" ? compareAgentAId : compareAgentBId;
                    const agentState = agentsState[selectedId];
                    const agentMeta = AGENTS_META.find(a => a.id === selectedId);

                    if (!agentState || !agentState.completed) {
                      return (
                        <div className={`text-center py-8 border border-dashed rounded-xl ${
                          theme === "dark" ? "border-zinc-800 bg-zinc-900/10" : "border-slate-200 bg-slate-50/50"
                        }`}>
                          <span className={`text-[10px] font-mono uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                            💤 Node [ {agentMeta?.name} ] has not been executed yet. Run the pipeline to capture telemetry data.
                          </span>
                        </div>
                      );
                    }

                    const rtt = agentState.metrics.rttComponents;
                    const logs = agentState.metrics.traceLog || [];

                    if (!rtt) {
                      return (
                        <div className={`text-center py-8 border border-dashed rounded-xl ${
                          theme === "dark" ? "border-zinc-800 bg-zinc-900/10" : "border-slate-200 bg-slate-50/50"
                        }`}>
                          <span className={`text-[10px] font-mono uppercase ${theme === 'dark' ? 'text-rose-500' : 'text-rose-600'}`}>
                            ⚠️ Socket metrics incomplete for [ {agentMeta?.name} ]. Relaunch the pipeline to compile diagnostic frames.
                          </span>
                        </div>
                      );
                    }

                    // SLA Grade Calculation
                    const slaScore = Math.max(10, Math.min(100, Math.floor(100 - (packetLossPercent * 3.5) - (jitterMs / 3))));
                    let slaGrade = "A+";
                    let slaColor = "text-emerald-500 dark:text-emerald-400";
                    let slaBg = theme === "dark" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-50 border-emerald-100";
                    let slaDescription = "Optimized Edge Route: Minimal jitter, zero loss. Sockets operating within ideal parameters.";

                    if (slaScore < 50) {
                      slaGrade = "D-";
                      slaColor = "text-rose-500 dark:text-rose-400";
                      slaBg = theme === "dark" ? "bg-rose-500/10 border-rose-500/20" : "bg-rose-50 border-rose-100";
                      slaDescription = "Critical Telemetry: Severe dropped packets and network starvation. TCP window throttling in progress.";
                    } else if (slaScore < 70) {
                      slaGrade = "C";
                      slaColor = "text-orange-500 dark:text-orange-400";
                      slaBg = theme === "dark" ? "bg-orange-500/10 border-orange-500/20" : "bg-orange-50 border-orange-100";
                      slaDescription = "Degraded Delivery: Moderate packet drop rates. Active segment retransmission is throttling throughput.";
                    } else if (slaScore < 85) {
                      slaGrade = "B";
                      slaColor = "text-amber-500 dark:text-amber-400";
                      slaBg = theme === "dark" ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-100";
                      slaDescription = "Nominal Path: Active jitter margins are elevated, but packet delivery remains reliable.";
                    } else if (slaScore < 95) {
                      slaGrade = "A";
                      slaColor = "text-indigo-500 dark:text-indigo-400";
                      slaBg = theme === "dark" ? "bg-indigo-500/10 border-indigo-500/20" : "bg-indigo-50 border-indigo-100";
                      slaDescription = "Highly Stable: Connection is firm and packet transport jitter is well-compensated.";
                    }

                    const total = rtt.totalRtt || 1;
                    
                    // Gantt phases breakdown
                    const phases = [
                      {
                        name: "DNS Lookup",
                        duration: Math.floor(rtt.handshake * 0.35),
                        offset: 0,
                        color: "bg-amber-500",
                        text: "text-amber-500 dark:text-amber-400",
                        description: "Resolving host domain to cloud edge gateway"
                      },
                      {
                        name: "TCP Socket Connect",
                        duration: Math.floor(rtt.handshake * 0.40),
                        offset: Math.floor(rtt.handshake * 0.35),
                        color: "bg-orange-500",
                        text: "text-orange-500 dark:text-orange-400",
                        description: "Establishing three-way TCP socket synchronisation"
                      },
                      {
                        name: "TLSv1.3 Handshake",
                        duration: Math.floor(rtt.handshake * 0.25),
                        offset: Math.floor(rtt.handshake * 0.75),
                        color: "bg-cyan-500",
                        text: "text-cyan-500 dark:text-cyan-400",
                        description: "TLS Secure session key negotiation"
                      },
                      {
                        name: "API Proxy Routing",
                        duration: rtt.routing,
                        offset: rtt.handshake,
                        color: "bg-blue-500",
                        text: "text-blue-500 dark:text-blue-400",
                        description: `Gateway proxy queue (${routingMode === "mesh" ? "Multi-Hop Mesh" : "Direct Routing"})`
                      },
                      {
                        name: "LLM Inference (TTFB)",
                        duration: rtt.inference,
                        offset: rtt.handshake + rtt.routing,
                        color: "bg-emerald-500",
                        text: "text-emerald-500 dark:text-emerald-400",
                        description: "Gemini token execution and prompt processing latency"
                      },
                      {
                        name: "Payload Download",
                        duration: rtt.transfer,
                        offset: rtt.handshake + rtt.routing + rtt.inference,
                        color: "bg-pink-500",
                        text: "text-pink-500 dark:text-pink-400",
                        description: "Downloading and parsing server-side response body payload"
                      }
                    ];

                    const totalDuration = phases.reduce((acc, p) => acc + p.duration, 0) || total;

                    return (
                      <div className="space-y-4">
                        {/* SLA Health Summary Grid */}
                        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl border ${slaBg}`}>
                          <div className="flex items-center gap-3 border-r border-zinc-800/10 dark:border-zinc-800/20 pr-2">
                            <div className="text-center">
                              <div className={`text-2xl font-black tracking-tighter ${slaColor}`}>{slaGrade}</div>
                              <div className={`text-[8px] font-mono uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>SLA Grade</div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-[10px] font-extrabold leading-tight ${theme === 'dark' ? 'text-zinc-200' : 'text-slate-800'}`}>Health Score: {slaScore}/100</div>
                              <div className={`text-[7.5px] font-mono truncate mt-0.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>
                                Protocol: HTTP/2 Multiplexed
                              </div>
                            </div>
                          </div>
                          <div className="sm:col-span-2 flex items-start gap-2">
                            <span className="text-xs">🔒</span>
                            <div className="flex-1 min-w-0">
                              <span className={`text-[9.5px] font-mono uppercase font-bold tracking-wider block ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>Diagnostic Assessment</span>
                              <p className={`text-[8.5px] mt-0.5 leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>{slaDescription}</p>
                            </div>
                          </div>
                        </div>

                        {/* Visual Waterfall Timing Gantt Chart */}
                        <div>
                          <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500 dark:text-zinc-400 mb-2 pb-1 border-b border-zinc-800/10 dark:border-zinc-800/20">
                            <span className="uppercase font-bold">RTT waterfall trace (timing-gantt)</span>
                            <span className="font-extrabold text-indigo-500">TOTAL: {totalDuration}ms</span>
                          </div>

                          <div className={`relative border rounded-xl overflow-hidden p-2 flex flex-col gap-1.5 ${
                            theme === "dark" ? "bg-zinc-900/40 border-zinc-800/40" : "bg-slate-50/50 border-slate-150"
                          }`}>
                            {/* Vertical Dotted Timeline Grid Lines */}
                            <div className="absolute inset-0 pointer-events-none">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={`gridline-${i}`}
                                  className={`absolute h-full border-l border-dashed top-0 z-0 ${
                                    theme === "dark" ? "border-zinc-800/40" : "border-slate-200"
                                  }`}
                                  style={{ left: `${i * 25}%` }}
                                />
                              ))}
                            </div>

                            {/* Gantt Trace Rows */}
                            <div className="relative z-10 flex flex-col gap-1.5 font-mono text-[9px]">
                              {phases.map((phase, pIdx) => {
                                const startPct = (phase.offset / totalDuration) * 100;
                                const widthPct = Math.max(2, (phase.duration / totalDuration) * 100);
                                return (
                                  <div key={phase.name} className={`grid grid-cols-12 items-center gap-2 group transition-all duration-200 py-0.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/5`}>
                                    <div className="col-span-4 flex flex-col pl-1">
                                      <span className={`font-extrabold truncate ${theme === "dark" ? "text-zinc-300" : "text-slate-800"}`}>{phase.name}</span>
                                      <span className="text-[6.5px] text-zinc-400 dark:text-zinc-500 truncate leading-none mt-0.5">{phase.description}</span>
                                    </div>
                                    <div className="col-span-8 relative h-4 flex items-center">
                                      <div
                                        className={`absolute h-2.5 rounded-md ${phase.color} shadow-sm transition-all duration-300 group-hover:scale-y-110 group-hover:brightness-110`}
                                        style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                                        title={`${phase.name}: ${phase.duration}ms`}
                                      />
                                      {/* Duration text indicator */}
                                      <span
                                        className={`absolute text-[7.5px] font-bold ${phase.text} transition-all duration-300`}
                                        style={{ left: `${startPct + widthPct + 1.5}%` }}
                                      >
                                        {phase.duration}ms <span className="text-[6.5px] text-zinc-500 opacity-60">({((phase.duration/totalDuration)*100).toFixed(0)}%)</span>
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Path Traceroute Topology Mapping */}
                        <div className="space-y-2 border-t border-b py-4 my-2 border-zinc-800/10 dark:border-zinc-800/40">
                          <span className={`text-[8px] font-mono uppercase font-black block ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-500'}`}>Interactive Network Routing Traceroute Topology</span>
                          <div className={`relative flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-xl overflow-hidden border ${
                            theme === 'dark' ? 'bg-black/20 border-zinc-800/40' : 'bg-slate-50/20 border-slate-200 shadow-sm'
                          }`}>
                            {/* Animated connection line */}
                            <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-indigo-500 via-emerald-500 to-indigo-500 opacity-20 hidden md:block" />
                            {/* Animated moving pulse packet */}
                            <div className="absolute top-[28px] h-[2px] w-12 bg-gradient-to-r from-transparent via-indigo-400 to-transparent animate-pulse-slow hidden md:block" style={{ left: "15%", animation: "ping-packet 4s infinite linear" }} />

                            {[
                              { id: "client", label: "Client Edge", icon: Server, desc: "Local Interface", latency: "0ms" },
                              { id: "dns", label: "Cloudflare DNS", icon: Zap, desc: "Anycast Edge", latency: `~${Math.floor(rtt.handshake * 0.35)}ms` },
                              { id: "gateway", label: "Apex Proxy", icon: Network, desc: routingMode === "mesh" ? "Mesh Ingress" : "Direct Proxy", latency: `~${rtt.routing}ms` },
                              { id: "llm", label: "Gemini Node", icon: Cpu, desc: "Inference Engine", latency: `~${rtt.inference}ms` },
                              { id: "blackboard", label: "Memory Bus", icon: Database, desc: "Atomic State Write", latency: "~4ms" }
                            ].map((node, nIdx) => {
                              const isSelected = selectedPathNode === node.id;
                              const NodeIcon = node.icon;
                              return (
                                <React.Fragment key={node.id}>
                                  <button
                                    onClick={() => setSelectedPathNode(node.id)}
                                    type="button"
                                    className={`relative z-10 flex flex-col items-center p-2 rounded-xl border transition-all duration-300 w-full md:w-[18%] group cursor-pointer ${
                                      isSelected
                                        ? "bg-indigo-600/10 border-indigo-500 dark:border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                                        : "bg-white dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800/60 hover:border-slate-350 dark:hover:border-zinc-700 hover:scale-[1.03]"
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded-lg mb-1 transition-colors ${
                                      isSelected
                                        ? "bg-indigo-600 text-white"
                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 group-hover:bg-slate-200 dark:group-hover:bg-zinc-750"
                                    }`}>
                                      <NodeIcon className="h-3.5 w-3.5" />
                                    </div>
                                    <span className={`text-[9px] font-bold truncate leading-none ${
                                      isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-zinc-300"
                                    }`}>{node.label}</span>
                                    <span className="text-[7px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate leading-none">{node.desc}</span>
                                    <span className={`text-[7.5px] font-mono mt-1 font-bold px-1 py-0.2 rounded ${
                                      isSelected ? "bg-indigo-500/20 text-indigo-500" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                                    }`}>{node.latency}</span>
                                  </button>
                                  {nIdx < 4 && (
                                    <div className="text-zinc-300 dark:text-zinc-800 block md:hidden text-center text-[10px] leading-none my-0.5">▼</div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>

                          {/* Deep Packet Inspection specifications */}
                          {(() => {
                            let nodeSpec = {
                              title: "Local Client Spec",
                              address: "192.168.1.104 (Localhost loopback)",
                              details: [
                                { label: "Session Socket Type", value: "Multiplexed HTTP/2 Streams" },
                                { label: "Client Engine VM", value: "V8 Production Sandbox" },
                                { label: "Transport Encryption", value: "TLS_AES_256_GCM_SHA384 cipher" },
                                { label: "Keep-Alive Socket State", value: "Enabled (Keep-alive stream pool)" },
                                { label: "Client Handshake Frame", value: "SYN state verified (3-way packet synchronised)" }
                              ]
                            };

                            if (selectedPathNode === "dns") {
                              nodeSpec = {
                                title: "Cloudflare DNS Spec",
                                address: "1.1.1.1 (Anycast Global Edge Node)",
                                details: [
                                  { label: "IP Lookup Latency", value: `${Math.floor(rtt.handshake * 0.35)}ms response time` },
                                  { label: "Hardware Certificate", value: "DigiCert HSM Secure Root TLS CA" },
                                  { label: "Socket Protocol Layer", value: "IPv4/IPv6 Dual Stack DNS" },
                                  { label: "DNS TTL Strategy", value: "300s automated cache refresh" },
                                  { label: "DNS SLA Uptime", value: "99.9999% globally distributed" }
                                ]
                              };
                            } else if (selectedPathNode === "gateway") {
                              nodeSpec = {
                                title: "Apex Routing Proxy Spec",
                                address: "10.0.4.82 (GCP Container Private Subnet)",
                                details: [
                                  { label: "Ingress Router Type", value: "Nginx Gateway Ingress Controller" },
                                  { label: "Selected Routing Mode", value: routingMode === "mesh" ? "Multi-hop Decentralized Mesh" : "Direct Hierarchical Controller" },
                                  { label: "SLA Queue Latency", value: `${rtt.routing}ms total routing duration` },
                                  { label: "WAF Security Filter", value: "SQLi / Rate Limit Filter Active" },
                                  { label: "TCP Window Scaling", value: "Scale Factor: 8 (Multiplier 256)" }
                                ]
                              };
                            } else if (selectedPathNode === "llm") {
                              nodeSpec = {
                                title: "LLM Node Processor Spec",
                                address: "Google Gemini 3.5 Flash Engine Instance",
                                details: [
                                  { label: "Model Endpoint Name", value: "models/gemini-3.5-flash-001" },
                                  { label: "Token Generation Time", value: `${rtt.inference}ms (Time to First Byte)` },
                                  { label: "Allocated Context Area", value: "1,048,576 maximum context tokens" },
                                  { label: "Compression Algorithm", value: "Response compressed with Gzip" },
                                  { label: "API Rate-Limit State", value: "Safe (0% limits reached, healthy)" }
                                ]
                              };
                            } else if (selectedPathNode === "blackboard") {
                              nodeSpec = {
                                title: "Blackboard Memory Shared-Bus Spec",
                                address: "Whiteboard Memory Array (Atomic Commit Node)",
                                details: [
                                  { label: "Allocation Storage Type", value: "Shared Context Variable Bus" },
                                  { label: "Write Lock Status", value: "Released (Lock freed successfully)" },
                                  { label: "SLA Commit Duration", value: "~4ms write operation delay" },
                                  { label: "Local Storage Backup", value: "Synchronized with LocalStorage context" },
                                  { label: "Atomic Transaction Hash", value: `Commit complete (${Math.floor(rtt.transfer * 1.5)} byte payload)` }
                                ]
                              };
                            }

                            return (
                              <div className={`p-3 rounded-xl border text-[9.5px] font-mono transition-all duration-300 ${
                                theme === "dark" ? "bg-zinc-900/60 border-zinc-800/80 text-zinc-300" : "bg-slate-50/50 border-slate-200 text-slate-700"
                              }`}>
                                <div className="flex justify-between items-center pb-2 border-b border-zinc-800/10 dark:border-zinc-800/30 mb-2">
                                  <span className="font-extrabold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                    <Activity className="h-3 w-3 animate-pulse" />
                                    Deep Packet Inspection: {nodeSpec.title}
                                  </span>
                                  <span className="text-[8px] text-zinc-400 dark:text-zinc-500">{nodeSpec.address}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                                  {nodeSpec.details.map((detail, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-0.5 border-b border-dashed border-zinc-800/5 dark:border-zinc-800/10 last:border-0 sm:last:border-b">
                                      <span className="text-zinc-400 dark:text-zinc-500 text-[8.5px] uppercase">{detail.label}:</span>
                                      <span className="font-extrabold text-slate-800 dark:text-white text-right">{detail.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Chronological Connection Event Log */}
                        <div className="space-y-1.5">
                          <span className={`text-[8px] font-mono uppercase font-black block ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>Chronological Connection Event Log</span>
                          <div className="bg-slate-950 border border-zinc-900 p-2.5 rounded-xl font-mono text-[9px] text-indigo-300 flex flex-col gap-1 overflow-y-auto max-h-[140px] shadow-inner select-text">
                            {logs.map((line, idx) => (
                              <div key={idx} className="flex gap-2 items-start py-0.5 hover:bg-zinc-800/10 transition-colors">
                                <span className="text-zinc-600 select-none text-[8.5px]">[{idx + 1}]</span>
                                <span className="text-zinc-300 leading-relaxed">{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Real-time Network Diagnostic Insights */}
                        <div className="p-3 rounded-xl bg-indigo-950/10 border border-indigo-900/20 font-mono text-[9px] text-zinc-400 leading-relaxed flex items-start gap-2">
                          <span className="text-indigo-400 text-xs mt-0.5">💡</span>
                          <div>
                            <span className="text-zinc-200 font-extrabold block mb-0.5">AI Telemetry Diagnostic Report</span>
                            {routingMode === "mesh" ? (
                              <span>
                                **Decentralized Peer Mesh Link Active**: Node-to-node multi-hop queries compiled additional router gateway hops, adding ~40-60ms in routing overhead. Multi-agent cross-talks are currently optimized at **{metrics.crossTalksCount}** cycles.
                              </span>
                            ) : (
                              <span>
                                **Hierarchical Broadcast Route Active**: Connection was channeled directly via the CEO central gateway. Direct single-hop request reduces connection setup and proxy queueing times.
                              </span>
                            )}
                            {jitterMs > 40 && (
                              <span className="block mt-1 text-amber-400/90 font-semibold">
                                ⚠️ Warning: High baseline network jitter ({jitterMs}ms) detected. Connection latency variance is unstable, raising jitter margins.
                              </span>
                            )}
                            {packetLossPercent > 0 && (
                              <span className="block mt-1 text-rose-400/90 font-semibold">
                                ⚠️ Simulated Packet Loss Active ({packetLossPercent}%): Socket transport has TCP window recovery penalties enabled. Dropped packets trigger immediate segment retransmission.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

            </>
          ) : (
            /* Agent Interaction Heatmap Tab View */
            <div className={`border rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${
              theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
            }`}>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-zinc-850 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-indigo-500" />
                  <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-400">Agent Interaction Heatmap</h3>
                    <p className="text-[8.5px] text-zinc-500 font-mono">2D density & cross-talk matrix mapping message exchange volumes</p>
                  </div>
                </div>

                {/* Live vs Baseline Toggle */}
                <div className="flex items-center gap-1.5 bg-black/20 p-0.5 rounded border border-zinc-800/40 text-[9.5px] font-mono self-start sm:self-center">
                  <button
                    onClick={() => setHeatmapSource("baseline")}
                    type="button"
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      heatmapSource === "baseline"
                        ? "bg-indigo-600 text-white font-bold animate-pulse-slow"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Simulated Baseline
                  </button>
                  <button
                    onClick={() => setHeatmapSource("live")}
                    type="button"
                    className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                      heatmapSource === "live"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    Live Session ({payloadLogs.length})
                  </button>
                </div>
              </div>

              {/* Heatmap Layout Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                {/* 2D Intensity Matrix */}
                <div className="xl:col-span-8 flex flex-col justify-center">
                  {/* X-axis Top Headers */}
                  <div className="flex items-center mb-2">
                    <div className="w-20 sm:w-24 shrink-0" />
                    <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
                      {AGENTS_META.map(agent => (
                        <div key={`header-x-${agent.id}`} className="flex flex-col items-center justify-center min-w-0" title={`Receiver: ${agent.name}`}>
                          <span className="text-xs sm:text-sm">{agent.avatar}</span>
                          <span className="text-[7px] sm:text-[8px] font-mono font-bold uppercase text-zinc-500 truncate w-full px-0.5 mt-0.5">
                            {agent.id === "marketing" ? "Mktg" : agent.id === "developer" ? "Dev" : agent.id === "support" ? "Supp" : agent.id.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grid Rows */}
                  <div className="space-y-1 sm:space-y-1.5">
                    {AGENTS_META.map(sender => (
                      <div key={`row-${sender.id}`} className="flex items-center">
                        {/* Row Header (Y-axis Sender label) */}
                        <div className="w-20 sm:w-24 shrink-0 flex items-center gap-1 sm:gap-1.5 pr-2 text-right justify-end" title={`Sender: ${sender.name}`}>
                          <span className={`text-[7.5px] sm:text-[8.5px] font-mono font-bold uppercase truncate leading-none transition-colors ${
                            theme === "dark" ? "text-zinc-400" : "text-slate-500"
                          }`}>
                            {sender.id === "marketing" ? "Mktg" : sender.id === "developer" ? "Dev" : sender.id === "support" ? "Supp" : sender.id.toUpperCase()}
                          </span>
                          <span className="text-xs sm:text-sm">{sender.avatar}</span>
                        </div>

                        {/* Grid Cells */}
                        <div className="flex-1 grid grid-cols-7 gap-1 sm:gap-1.5">
                          {AGENTS_META.map(receiver => {
                            const isSelfLoop = sender.id === receiver.id;
                            
                            // Dynamic Cell counter
                            const getCellCount = (s: string, r: string) => {
                              if (heatmapSource === "baseline") {
                                const base = BASELINE_INTERACTIONS[s]?.[r] || 0;
                                if (optimizedCells[`${s}-${r}`]) {
                                  return Math.max(1, Math.round(base * 0.4));
                                }
                                return base;
                              } else {
                                return payloadLogs.filter(log => log.sender === s && log.receiver === r).length;
                              }
                            };

                            const count = getCellCount(sender.id, receiver.id);
                            const isSelected = selectedHeatmapCell?.senderId === sender.id && selectedHeatmapCell?.receiverId === receiver.id;
                            const isHovered = hoveredHeatmapCell?.senderId === sender.id && hoveredHeatmapCell?.receiverId === receiver.id;
                            const isOptimized = optimizedCells[`${sender.id}-${receiver.id}`];

                            // Determine dynamic colors mapped to saturation
                            let bgClass = "";
                            let cellTextStyle = "text-[9.5px] sm:text-xs font-mono transition-all duration-200";
                            
                            if (isSelfLoop) {
                              bgClass = theme === "dark"
                                ? "bg-zinc-950/30 text-zinc-800/30 border border-zinc-900/30"
                                : "bg-slate-100 text-slate-300/30 border border-slate-200/50";
                            } else if (count === 0) {
                              bgClass = theme === "dark"
                                ? "bg-zinc-900/10 text-zinc-700 border border-zinc-800/20 hover:border-zinc-700"
                                : "bg-slate-50 text-slate-300 border border-slate-100 hover:border-slate-200";
                            } else {
                              if (count < 6) {
                                bgClass = theme === "dark"
                                  ? "bg-indigo-950/30 text-indigo-400 border border-indigo-900/40 hover:bg-indigo-950/45"
                                  : "bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100/70";
                              } else if (count < 16) {
                                bgClass = theme === "dark"
                                  ? "bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 hover:bg-indigo-900/50"
                                  : "bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200/70";
                              } else if (count < 26) {
                                bgClass = theme === "dark"
                                  ? "bg-indigo-600/70 text-white border border-indigo-500 hover:bg-indigo-600/80"
                                  : "bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700";
                              } else {
                                bgClass = "bg-fuchsia-600 text-white font-extrabold border border-fuchsia-400 animate-pulse hover:bg-fuchsia-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]";
                              }
                            }

                            if (isSelected && !isSelfLoop) {
                              bgClass += theme === "dark"
                                ? " ring-2 ring-indigo-400 border-indigo-400 scale-[1.03] z-10"
                                : " ring-2 ring-indigo-600 border-indigo-600 scale-[1.03] z-10";
                            } else if (isHovered && !isSelfLoop) {
                              bgClass += theme === "dark"
                                ? " border-zinc-400 scale-[1.02] z-10"
                                : " border-slate-400 scale-[1.02] z-10";
                            }

                            return (
                              <button
                                key={`cell-${sender.id}-${receiver.id}`}
                                onClick={() => {
                                  if (!isSelfLoop) {
                                    setSelectedHeatmapCell({ senderId: sender.id, receiverId: receiver.id });
                                  }
                                }}
                                onMouseEnter={() => {
                                  if (!isSelfLoop) {
                                    setHoveredHeatmapCell({ senderId: sender.id, receiverId: receiver.id });
                                  }
                                }}
                                onMouseLeave={() => setHoveredHeatmapCell(null)}
                                disabled={isSelfLoop}
                                type="button"
                                className={`h-8 sm:h-10 rounded-md transition-all flex flex-col items-center justify-center relative cursor-pointer ${bgClass} ${cellTextStyle}`}
                              >
                                <span>{isSelfLoop ? "-" : count}</span>
                                {isOptimized && !isSelfLoop && (
                                  <span className="absolute bottom-0.5 right-0.5 text-[6px] text-emerald-400 animate-pulse font-mono font-bold leading-none">⚡</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Color Scale Legend */}
                  <div className={`mt-4 flex flex-col xs:flex-row items-center justify-between text-[8.5px] font-mono border-t pt-3 gap-2 ${
                    theme === "dark" ? "text-zinc-500 border-zinc-800/40" : "text-slate-500 border-slate-200"
                  }`}>
                    <span className="uppercase font-bold tracking-wider">Intensity Scale:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded border ${theme === 'dark' ? 'bg-zinc-900/20 border-zinc-800/40' : 'bg-slate-50 border-slate-100'}`} />
                        <span>0 (Idle)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded border ${theme === 'dark' ? 'bg-indigo-950/30 border-indigo-900/40' : 'bg-indigo-50 border-indigo-100'}`} />
                        <span>1-5 (Low)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded border ${theme === 'dark' ? 'bg-indigo-900/40 border-indigo-700/40' : 'bg-indigo-100 border-indigo-200'}`} />
                        <span>6-15 (Mid)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`w-2.5 h-2.5 rounded border ${theme === 'dark' ? 'bg-indigo-600/70 border-indigo-500' : 'bg-indigo-600 border-indigo-500'}`} />
                        <span>16-25 (High)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-fuchsia-600 animate-pulse border border-fuchsia-400" />
                        <span>26+ (Critical)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Edge Telemetry Inspector & Link Optimizer */}
                <div className="xl:col-span-4 flex flex-col justify-between">
                  {(() => {
                    if (!selectedHeatmapCell) {
                      return (
                        <div className={`h-full flex flex-col items-center justify-center text-center p-4 border border-dashed rounded-xl min-h-[220px] transition-all duration-300 ${
                          theme === "dark" ? "border-zinc-800 bg-zinc-900/10" : "border-slate-200 bg-slate-50/50"
                        }`}>
                          <Activity className={`h-5 w-5 mb-1.5 animate-pulse ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`} />
                          <span className={`text-[10px] font-mono uppercase font-bold ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>Connection Inspector</span>
                          <p className={`text-[9px] max-w-[180px] mt-1 leading-normal ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>Select an intersection grid cell to inspect interaction volumes and optimize links.</p>
                        </div>
                      );
                    }

                    const sender = AGENTS_META.find(a => a.id === selectedHeatmapCell.senderId)!;
                    const receiver = AGENTS_META.find(a => a.id === selectedHeatmapCell.receiverId)!;
                    
                    // Count & calculated metrics
                    const getCellCount = (s: string, r: string) => {
                      if (heatmapSource === "baseline") {
                        const base = BASELINE_INTERACTIONS[s]?.[r] || 0;
                        if (optimizedCells[`${s}-${r}`]) {
                          return Math.max(1, Math.round(base * 0.4));
                        }
                        return base;
                      } else {
                        return payloadLogs.filter(log => log.sender === s && log.receiver === r).length;
                      }
                    };

                    const count = getCellCount(sender.id, receiver.id);
                    const isOptimized = optimizedCells[`${sender.id}-${receiver.id}`];

                    // Computed dynamic latency based on count
                    const rawLatency = Math.round(75 + (BASELINE_INTERACTIONS[sender.id]?.[receiver.id] || 8) * 3.5);
                    const calculatedLatency = isOptimized ? Math.round(rawLatency * 0.45) : rawLatency;
                    const estimatedTokens = count * 950;

                    // Link type badge
                    let badgeLabel = "Low Pathway";
                    let badgeColor = "bg-zinc-800 text-zinc-400 border-zinc-700/50";
                    if (count > 0) {
                      if (count < 6) {
                        badgeLabel = "Active Link";
                        badgeColor = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
                      } else if (count < 16) {
                        badgeLabel = "Core Route";
                        badgeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-400/30";
                      } else if (count < 26) {
                        badgeLabel = "Heavy Load";
                        badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold";
                      } else {
                        badgeLabel = "Saturated Bottleneck";
                        badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/25 font-bold animate-pulse";
                      }
                    }

                    // Link descriptions helper
                    const getLinkDiagnosticDescription = (s: string, r: string) => {
                      if (s === "ceo" && r === "marketing") return "CEO Agent transmits strategic milestones and master business targets for branding alignment.";
                      if (s === "ceo" && r === "sales") return "CEO Agent relays outbound lead qualification goals and slide outlines to refine B2B presentation script.";
                      if (s === "marketing" && r === "sales") return "Marketing Agent feeds campaign taglines and organic lead score segments to CRM outbound queues.";
                      if (s === "sales" && r === "support") return "Sales Agent matches enterprise client objections with support FAQ categories to avoid SLA breaches.";
                      if (s === "hr" && r === "developer") return "HR Agent structures distributed systems job requirements and initiates developers environment onboarding.";
                      if (s === "finance" && r === "ceo") return "Finance Agent reports audited operative costs, gross ROI, and Year 1-3 operating cash projections.";
                      if (s === "support" && r === "developer") return "Support Agent logs escalated critical bug reports and routes ticket payloads to principal engineers.";
                      if (s === "developer" && r === "ceo") return "Developer Agent scaffolds database schemas and registers active technology stacks with central orchestration.";
                      return `${AGENTS_META.find(a => a.id === s)?.role} synchronizes intermediate Blackboard data with the ${AGENTS_META.find(a => a.id === r)?.role} to resolve tactical dependencies.`;
                    };

                    const linkDescription = getLinkDiagnosticDescription(sender.id, receiver.id);

                    const handleToggleOptimize = () => {
                      const key = `${sender.id}-${receiver.id}`;
                      const nowOptimized = !isOptimized;
                      setOptimizedCells(prev => ({ ...prev, [key]: nowOptimized }));
                      
                      if (nowOptimized) {
                        addGlobalLog(`⚙️ [LINK OPTIMIZED] Deployed Edge Cache middleware on route [${sender.name} → ${receiver.name}]. Simulated link latency slashed by 55%!`, "success", sender.id);
                      } else {
                        addGlobalLog(`⚙️ [LINK RESTORED] Disabled caching/bypass routing on [${sender.name} → ${receiver.name}]. Link reset to baseline metrics.`, "warning", sender.id);
                      }
                    };

                    return (
                      <div className={`h-full flex flex-col justify-between p-3.5 rounded-xl border gap-4 min-h-[220px] transition-all duration-300 ${
                        theme === "dark" ? "border-zinc-800 bg-zinc-900/30" : "border-slate-200 bg-slate-50/50 shadow-sm"
                      }`}>
                        
                        {/* Upper Section: Sender and Receiver Pair */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className={`text-[8.5px] font-mono uppercase font-bold ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-500'}`}>Edge Pathway Link</span>
                            <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                              {badgeLabel}
                            </span>
                          </div>

                          <div className={`flex items-center justify-between border rounded-xl p-2.5 gap-1 font-mono text-[10px] ${
                            theme === 'dark' ? 'bg-black/35 border-zinc-800/60' : 'bg-white border-slate-200 shadow-sm'
                          }`}>
                            {/* Sender */}
                            <div className="flex flex-col items-center text-center flex-1 min-w-0">
                              <span className="text-sm">{sender.avatar}</span>
                              <span className={`font-extrabold mt-1 truncate w-full ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-800'}`}>{sender.name.split(" ")[0]}</span>
                              <span className={`text-[7px] font-semibold uppercase truncate w-full ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>Sender</span>
                            </div>
                            
                            {/* Direction Indicator */}
                            <div className="flex flex-col items-center justify-center shrink-0 px-2">
                              <span className="text-indigo-500 text-xs font-bold animate-pulse-slow">⇄</span>
                              <span className={`text-[7px] font-semibold uppercase tracking-widest mt-0.5 ${theme === 'dark' ? 'text-zinc-600' : 'text-slate-400'}`}>Link</span>
                            </div>

                            {/* Receiver */}
                            <div className="flex flex-col items-center text-center flex-1 min-w-0">
                              <span className="text-sm">{receiver.avatar}</span>
                              <span className={`font-extrabold mt-1 truncate w-full ${theme === 'dark' ? 'text-zinc-300' : 'text-slate-800'}`}>{receiver.name.split(" ")[0]}</span>
                              <span className={`text-[7px] font-semibold uppercase truncate w-full ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>Receiver</span>
                            </div>
                          </div>

                          {/* Dynamic diagnostic log */}
                          <div className={`text-[9px] font-mono leading-normal p-2.5 rounded-lg border ${
                            theme === 'dark' ? 'text-zinc-400 bg-black/15 border-zinc-850' : 'text-slate-700 bg-white border-slate-200'
                          }`}>
                            <span className="font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide block mb-1">Functional Exchange context</span>
                            {linkDescription}
                          </div>
                        </div>

                        {/* Middle Section: Stats */}
                        <div className={`grid grid-cols-3 gap-2 text-center font-mono text-[9px] ${theme === 'dark' ? 'text-zinc-400' : 'text-slate-600'}`}>
                          <div className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-black/20 border-zinc-850' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <span className={`block text-[7px] uppercase font-bold mb-0.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>Messages</span>
                            <span className={`font-extrabold text-[10px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{count}</span>
                          </div>
                          <div className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-black/20 border-zinc-850' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <span className={`block text-[7px] uppercase font-bold mb-0.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>RTT Latency</span>
                            <span className={`font-extrabold text-[10px] ${isOptimized ? "text-emerald-500 font-bold" : "text-amber-500"}`}>
                              {calculatedLatency}ms
                            </span>
                          </div>
                          <div className={`p-2 rounded-lg border ${theme === 'dark' ? 'bg-black/20 border-zinc-850' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <span className={`block text-[7px] uppercase font-bold mb-0.5 ${theme === 'dark' ? 'text-zinc-500' : 'text-slate-400'}`}>Overhead</span>
                            <span className={`font-extrabold text-[10px] ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{estimatedTokens}tk</span>
                          </div>
                        </div>

                        {/* Lower Section: Action Optimizer */}
                        <div className="space-y-2">
                          <button
                            onClick={handleToggleOptimize}
                            type="button"
                            className={`w-full py-1.5 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                              isOptimized
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:bg-emerald-950/50"
                                : "bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.15)]"
                            }`}
                          >
                            <Zap className={`h-3 w-3 ${isOptimized ? "fill-emerald-400 text-emerald-400 animate-bounce" : ""}`} />
                            <span>{isOptimized ? "EDGE OPTIMIZER ROUTE ACTIVE" : "OPTIMIZE LINK WITH EDGE CACHE"}</span>
                          </button>
                          
                          {isOptimized && (
                            <p className="text-[7.5px] font-mono text-emerald-400/90 leading-normal text-center animate-pulse-slow">
                              ⚡ Link optimization reduces network handshake penalties and routes via local Redis cache layers.
                            </p>
                          )}
                        </div>

                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>
          )}

          {/* Shared Memory Space (Blackboard Architecture) */}
          <div className={`border rounded-xl p-4 transition-all duration-300 ${
            theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
          }`}>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                <h3 className="text-[10px] font-mono uppercase tracking-widest font-bold text-zinc-400">Blackboard Centralized Shared Memory</h3>
              </div>
              <span className="text-[8px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded px-1.5 py-0.5">L2-Cache Connected</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className={`border rounded p-2 transition-all duration-500 ${
                cellHighlights.industry ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)]" : (theme === "dark" ? "bg-zinc-900/60 border-zinc-800/60" : "bg-slate-50 border-slate-150")
              }`}>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Industry Sector</span>
                <span className="text-[10.5px] font-bold block truncate mt-0.5">{blackboard.industry || "Dormant Node"}</span>
              </div>
              
              <div className={`border rounded p-2 transition-all duration-500 ${
                cellHighlights.proposedAdSpend ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)]" : (theme === "dark" ? "bg-zinc-900/60 border-zinc-800/60" : "bg-slate-50 border-slate-150")
              }`}>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Proposed Ad Spend</span>
                <span className="text-[10.5px] font-mono font-bold block mt-0.5">
                  {blackboard.proposedAdSpend ? `$${blackboard.proposedAdSpend.toLocaleString()}` : "Dormant Node"}
                </span>
              </div>

              <div className={`border rounded p-2 transition-all duration-500 ${
                cellHighlights.closeRatePercent ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)]" : (theme === "dark" ? "bg-zinc-900/60 border-zinc-800/60" : "bg-slate-50 border-slate-150")
              }`}>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Sales Target Rate</span>
                <span className="text-[10.5px] font-bold block truncate mt-0.5">
                  {blackboard.closeRatePercent ? `${blackboard.closeRatePercent}% Close Rate` : "Dormant Node"}
                </span>
              </div>

              <div className={`border rounded p-2 transition-all duration-500 ${
                cellHighlights.totalYear1Revenue ? "bg-indigo-950/40 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)]" : (theme === "dark" ? "bg-zinc-900/60 border-zinc-800/60" : "bg-slate-50 border-slate-150")
              }`}>
                <span className="text-[8px] font-mono text-zinc-500 uppercase block font-bold">Year 1 Gross Recalculated ROI</span>
                <span className="text-[10.5px] font-mono font-bold block mt-0.5 text-emerald-500">
                  {blackboard.recalculatedROI ? `${blackboard.recalculatedROI}% ROI` : "Dormant Node"}
                </span>
              </div>
            </div>
          </div>

          {/* Active Agent Workspace Cockpit */}
          <div className={`border rounded-xl p-4 flex flex-col min-h-[380px] transition-all duration-300 ${
            theme === "dark" ? "border-zinc-800 bg-zinc-950" : "border-slate-200 bg-white shadow-sm"
          }`}>
            
            {/* Cockpit Title Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800/10 dark:border-zinc-800 pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded bg-gradient-to-br ${activeAgent.color} text-white shadow`}>
                  <activeAgent.icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    {activeAgent.name} Blueprint View
                    {activeAgentState?.completed && <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">Calculated</span>}
                  </h3>
                  <p className="text-[10.5px] text-zinc-500">{activeAgent.description}</p>
                </div>
              </div>
              <div className="text-[9.5px] font-mono px-2 py-0.5 border border-zinc-800/60 rounded bg-zinc-900/40 text-zinc-400 self-start sm:self-center">
                Allocated Overhead: <span className="text-indigo-400 font-bold">{activeAgentState?.metrics?.tokensUsed || 0} tokens</span>
              </div>
            </div>

            {/* Content view based on active completion state */}
            <div className="flex-1 flex flex-col">
              {!activeAgentState?.completed && !activeAgentState?.running && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-zinc-800/60 rounded-lg">
                  <Activity className="h-5 w-5 text-zinc-600 animate-pulse-slow mb-2" />
                  <span className="text-xs font-semibold text-zinc-500">Node Dormant</span>
                  <p className="text-[10.5px] text-zinc-500 max-w-xs mt-0.5">Launch the strategy pipeline to populate this agent's dynamic enterprise dataset.</p>
                </div>
              )}

              {activeAgentState?.running && (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="relative mb-3 flex items-center justify-center">
                    <div className="h-9 w-9 rounded-full border-2 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                    <span className="absolute text-xs">{activeAgent.avatar}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 animate-pulse uppercase">Calculating State: {activeAgentState.status}</span>
                  <p className="text-[10.5px] text-zinc-500 max-w-xs mt-0.5">Accessing blackboard memories, compiling neural matrix and structuring strategic outputs...</p>
                </div>
              )}

              {activeAgentState?.completed && activeAgentState?.result && (
                <div className="flex-1 flex flex-col gap-3.5 select-text">
                  
                  {/* CEO Output view */}
                  {selectedAgentId === "ceo" && (
                    <div className="flex flex-col gap-3">
                      <div className="border border-zinc-800/60 dark:border-zinc-800/80 bg-zinc-900/10 p-3 rounded">
                        <span className="text-[8.5px] font-mono text-indigo-400 uppercase block font-bold">Executive Strategic Vision</span>
                        <p className="text-xs leading-relaxed mt-1">{activeAgentState.result.coreStrategy}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-zinc-800/60 dark:border-zinc-800/80 p-3 rounded">
                          <span className="text-[8.5px] font-mono text-emerald-400 uppercase block font-bold">Target Demographics Map</span>
                          <p className="text-[11px] leading-relaxed mt-1 text-zinc-400">{activeAgentState.result.targetAudience}</p>
                        </div>
                        <div className="border border-zinc-800/60 dark:border-zinc-800/80 p-3 rounded flex flex-col gap-1">
                          <span className="text-[8.5px] font-mono text-amber-400 uppercase block font-bold">Strategic Milestones</span>
                          <div className="flex flex-col gap-1.5 mt-1">
                            {activeAgentState.result.milestones?.map((m: string, i: number) => (
                              <div key={i} className="text-[10.5px] flex items-center gap-1.5">
                                <span className="h-3.5 w-3.5 rounded bg-zinc-800 text-[9px] font-mono flex items-center justify-center text-zinc-500">{i+1}</span>
                                <span className="text-zinc-300 truncate">{m}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Marketing output view */}
                  {selectedAgentId === "marketing" && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-indigo-950/15 border border-indigo-500/30 p-3 rounded flex items-center justify-between">
                        <div>
                          <span className="text-[8.5px] font-mono text-indigo-400 uppercase block font-bold">Marketing Slogan Tagline</span>
                          <span className="text-xs font-extrabold block mt-0.5">"{activeAgentState.result.campaignTagline}"</span>
                        </div>
                        <Megaphone className="h-4 w-4 text-pink-500 shrink-0" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-8 border border-zinc-800/60 dark:border-zinc-800/80 p-3 rounded flex flex-col gap-1.5">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-bold">Strategic Marketing Outreach</span>
                          {activeAgentState.result.channels?.map((c: any, idx: number) => (
                            <div key={idx} className="text-[10.5px] leading-normal border-b border-zinc-850 pb-1.5 last:border-0 last:pb-0">
                              <span className="font-semibold text-zinc-200">{c.name}</span>
                              <p className="text-zinc-500 text-[9.5px] mt-0.5">{c.strategy}</p>
                            </div>
                          ))}
                        </div>
                        <div className="md:col-span-4 border border-zinc-800/60 dark:border-zinc-800/80 p-3 rounded flex flex-col gap-1.5">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-bold">Target SEO Clusters</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {activeAgentState.result.seoKeywords?.map((kw: string, i: number) => (
                              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">#{kw}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sales output view */}
                  {selectedAgentId === "sales" && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {activeAgentState.result.leadScoring?.map((l: any, i: number) => (
                          <div key={i} className="border border-zinc-800/60 bg-zinc-900/10 p-2.5 rounded flex flex-col justify-between">
                            <span className="text-[9px] font-bold font-mono text-emerald-400">{l.tier}</span>
                            <p className="text-[10px] text-zinc-400 leading-normal mt-1">{l.criteria}</p>
                            <span className="text-[9px] font-mono text-zinc-500 border-t border-zinc-800/40 pt-1 mt-2 block">Action: {l.action}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border border-zinc-800/60 p-3 rounded">
                        <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-bold">Objections mitigation protocol</span>
                        <div className="flex flex-col gap-2 mt-1.5 text-[10.5px]">
                          {activeAgentState.result.objections?.map((o: any, i: number) => (
                            <div key={i} className="border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-rose-400 font-semibold">Objection: </span><span className="italic">"{o.objection}"</span>
                              <p className="text-zinc-500 text-[10px] mt-0.5"><span className="text-emerald-400 font-semibold">AE Response: </span>"{o.response}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HR output view */}
                  {selectedAgentId === "hr" && (
                    <div className="flex flex-col gap-3">
                      <div className="bg-amber-950/15 border border-amber-500/25 p-3 rounded">
                        <span className="text-[8.5px] font-mono text-amber-400 uppercase block font-bold">Acquisition Role Target</span>
                        <span className="text-xs font-bold block mt-0.5">{activeAgentState.result.hiringRole}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-zinc-800/60 p-3 rounded">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-bold">Staff Deliverables</span>
                          <div className="flex flex-col gap-1 mt-1 text-[10.5px] text-zinc-400">
                            {activeAgentState.result.responsibilities?.map((item: string, i: number) => (
                              <div key={i} className="flex gap-1.5 items-start">
                                <span className="h-1 w-1 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="border border-zinc-800/60 p-3 rounded">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-bold">Talent Qualifications</span>
                          <div className="flex flex-col gap-1 mt-1 text-[10.5px] text-zinc-400">
                            {activeAgentState.result.requirements?.map((item: string, i: number) => (
                              <div key={i} className="flex gap-1.5 items-start">
                                <span className="h-1 w-1 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Finance View */}
                  {selectedAgentId === "finance" && (
                    <div className="flex flex-col gap-3">
                      <div className="border border-zinc-800/60 p-3 rounded bg-rose-950/10 text-xs">
                        <span className="text-[8.5px] font-mono text-rose-400 uppercase block font-bold">CFO risk assessment summary</span>
                        <p className="mt-1 leading-relaxed">{activeAgentState.result.financialSummary}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="border border-zinc-800/60 p-3 rounded flex flex-col gap-2">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-bold">Sub-budget allocations</span>
                          {activeAgentState.result.budgetAllocation?.map((item: any, i: number) => (
                            <div key={i} className="text-[10px] flex justify-between items-center">
                              <span className="text-zinc-400">{item.category}</span>
                              <span className="font-mono text-rose-400 font-semibold">{item.percentage}% (${(item.allocationUsd || 0).toLocaleString()})</span>
                            </div>
                          ))}
                        </div>
                        <div className="border border-zinc-800/60 p-3 rounded overflow-x-auto">
                          <span className="text-[8.5px] font-mono text-zinc-500 uppercase block font-bold">Projected ROI Forecasts</span>
                          <table className="w-full text-[9.5px] font-mono text-left mt-1 border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-500">
                                <th className="py-1">Year</th>
                                <th className="py-1">Revenue</th>
                                <th className="py-1 text-right">Profit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeAgentState.result.roiProjection?.map((r: any, idx: number) => (
                                <tr key={idx} className="border-b border-zinc-900/60 text-zinc-300">
                                  <td className="py-1 font-bold">{r.year}</td>
                                  <td className="py-1 text-emerald-500">${(r.revenue || 0).toLocaleString()}</td>
                                  <td className="py-1 text-indigo-400 text-right">${(r.profit || 0).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Support view */}
                  {selectedAgentId === "support" && (
                    <div className="flex flex-col gap-3">
                      <div className="border border-zinc-800/60 p-3 rounded">
                        <span className="text-[8.5px] font-mono text-cyan-400 uppercase block font-bold">Customer Knowledge Base FAQ Index</span>
                        <div className="flex flex-col gap-2 mt-1.5 text-[10.5px]">
                          {activeAgentState.result.faqs?.map((f: any, idx: number) => (
                            <div key={idx} className="border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0">
                              <span className="font-bold text-cyan-500 font-mono">Q: </span><span>{f.question}</span>
                              <p className="text-zinc-500 text-[10px] mt-0.5 pl-3">{f.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dev Output view */}
                  {selectedAgentId === "developer" && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="border border-zinc-800/60 p-3 rounded">
                          <span className="text-[8.5px] font-mono text-indigo-400 uppercase block font-bold">System Microservices Pattern</span>
                          <span className="font-bold block text-[10.5px] mt-1 text-zinc-300">{activeAgentState.result.architectureStyle}</span>
                        </div>
                        <div className="border border-zinc-800/60 p-3 rounded flex flex-col gap-1.5">
                          <span className="text-[8.5px] font-mono text-indigo-400 uppercase block font-bold">Technology Stack</span>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {activeAgentState.result.techStack?.map((s: string, idx: number) => (
                              <span key={idx} className="text-[9px] font-mono px-1.5 py-0.5 border border-zinc-850 rounded bg-zinc-900 text-zinc-400">{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="border border-zinc-850 p-3 rounded flex flex-col gap-2 bg-zinc-950">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                          <span className="text-[9px] font-mono text-emerald-400">server.ts Boilerplate (Express Code)</span>
                          <button
                            onClick={() => handleCopyCode(activeAgentState.result.codeBoilerplate)}
                            className="text-[9px] font-mono px-1.5 py-0.5 border border-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer"
                          >
                            {copiedCode ? "Copied!" : "Copy Code"}
                          </button>
                        </div>
                        <pre className="text-[10px] font-mono text-indigo-300 overflow-x-auto max-h-[110px] p-1 whitespace-pre">
                          {activeAgentState.result.codeBoilerplate}
                        </pre>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 4. CHAT PLAYGROUND FOOTER & CENTRAL MULTI-AGENT ADVISORY */}
      <section id="chat-playground" className={`border p-4 md:p-5 flex flex-col max-w-7xl mx-auto w-full gap-3 glass rounded-xl mt-2 mb-4 transition-all duration-300 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-950/40" : "border-slate-200 bg-white"
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-2.5 gap-2 transition-all duration-300 ${
          theme === "dark" ? "border-zinc-800" : "border-slate-150"
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <h3 className={`text-xs font-bold uppercase tracking-widest font-mono ${
              theme === "dark" ? "text-zinc-400" : "text-slate-600"
            }`}>Interactive Consultation Deck</h3>
          </div>

          {/* Select Chat agent dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-zinc-500">Consult Specialist:</span>
            <select
              value={chatAgentId}
              onChange={(e) => setChatAgentId(e.target.value)}
              className={`border text-[10.5px] rounded px-2.5 py-1.5 outline-none font-mono focus:border-indigo-500 cursor-pointer transition-all duration-300 ${
                theme === "dark" ? "bg-zinc-900 border-zinc-800 text-white" : "bg-slate-50 border-slate-250 text-slate-800"
              }`}
            >
              {AGENTS_META.map((meta) => (
                <option key={meta.id} value={meta.id}>
                  {meta.avatar} {meta.role} ({meta.id.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message Thread view */}
        <div className={`border rounded-xl p-3 flex flex-col min-h-[140px] max-h-[220px] overflow-hidden transition-all duration-300 ${
          theme === "dark" ? "bg-zinc-900/40 border-zinc-800" : "bg-slate-50 border-slate-150"
        }`}>
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 select-text">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[85%] flex flex-col gap-1 ${
                  msg.isUser ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500">
                  <span className={`font-semibold ${theme === "dark" ? "text-zinc-400" : "text-slate-600"}`}>{msg.sender}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div
                  className={`text-xs leading-relaxed rounded-lg px-3 py-1.5 border whitespace-pre-wrap ${
                    msg.isUser
                      ? "bg-indigo-600 border-indigo-500 text-white rounded-tr-none"
                      : (theme === "dark" ? "bg-zinc-950 border-zinc-800 text-zinc-300 rounded-tl-none font-sans" : "bg-white border-slate-200 text-slate-700 rounded-tl-none font-sans")
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatTyping && (
              <div className="mr-auto items-start max-w-[80%] flex flex-col gap-1">
                <span className="text-[9px] font-mono text-zinc-500 animate-pulse">Specialist formulating advice...</span>
                <div className={`border rounded-lg rounded-tl-none px-3 py-1.5 flex items-center gap-1 transition-all duration-300 ${
                  theme === "dark" ? "bg-zinc-950 border-zinc-800" : "bg-white border-slate-200"
                }`}>
                  <span className="h-1 w-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1 w-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1 w-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask the specialist a question...`}
            className={`flex-1 border focus:ring-1 focus:ring-indigo-500 rounded px-3 py-2 text-xs outline-none transition-all duration-300 ${
              theme === "dark" ? "bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700" : "bg-white border-slate-250 text-slate-800 placeholder:text-slate-400"
            }`}
          />
          <button
            type="submit"
            className="p-2 rounded bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-white transition flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(79,70,229,0.15)]"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </section>

      {/* Prominent Inter-Agent Logs Panel (Raw JSON Payloads) */}
      <section className={`border p-4 md:p-5 flex flex-col max-w-7xl mx-auto w-full gap-3 glass rounded-xl mb-6 transition-all duration-300 ${
        theme === "dark" ? "border-zinc-800 bg-zinc-950/20" : "border-slate-200 bg-white"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-850 dark:border-zinc-800/80 pb-2.5 gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest font-mono">Inter-Agent Live Raw JSON Transaction Payload Logs</h3>
          </div>
          <span className="text-[8px] font-mono bg-zinc-800/80 text-zinc-400 border border-zinc-700 rounded px-1.5 py-0.5">Packet Analyzer Connected</span>
        </div>

        {payloadLogs.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-zinc-800/60 rounded-lg font-mono text-[10.5px] text-zinc-500">
            No dynamic transaction payloads recorded. Click "INITIALIZE AGENTS" above to record raw network packet routing logs.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Left list: Hops */}
            <div className="md:col-span-4 flex flex-col gap-1 max-h-[220px] overflow-y-auto">
              {payloadLogs.map((log, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPayloadIndex(idx)}
                  className={`text-left p-2 rounded border text-[9.5px] font-mono flex flex-col gap-1 transition-all cursor-pointer ${
                    selectedPayloadIndex === idx
                      ? "bg-indigo-950/20 border-indigo-500/70 text-indigo-300"
                      : (theme === "dark" ? "bg-zinc-900/40 border-zinc-850 text-zinc-400 hover:border-zinc-700" : "bg-slate-50 border-slate-200 hover:border-slate-300")
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span>{log.type}</span>
                    <span className="text-emerald-500">{log.latencyMs}ms</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>Hop: {log.sender} → {log.receiver}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right code inspector: JSON */}
            <div className="md:col-span-8 border border-zinc-850 rounded bg-[#030303] flex flex-col max-h-[220px] overflow-hidden">
              <div className="flex justify-between items-center border-b border-zinc-900 bg-zinc-950 px-3 py-1.5 text-[9px] font-mono text-zinc-500">
                <span>Network Packet: {payloadLogs[selectedPayloadIndex]?.endpoint}</span>
                <button
                  onClick={() => handleCopyCode(payloadLogs[selectedPayloadIndex]?.payload || "")}
                  className="text-[8.5px] hover:text-white cursor-pointer"
                >
                  {copiedCode ? "Copied JSON!" : "Copy Raw Payload"}
                </button>
              </div>
              <pre className="flex-1 p-3 font-mono text-[9.5px] text-emerald-400 overflow-y-auto select-text whitespace-pre leading-relaxed">
                {payloadLogs[selectedPayloadIndex]?.payload}
              </pre>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className={`border-t py-4 px-6 text-center text-[9px] font-mono transition-colors duration-300 ${
        theme === "dark" ? "border-zinc-900 bg-[#060608] text-zinc-600" : "border-slate-200 bg-slate-50 text-slate-500"
      }`}>
        © 2026 APEX ORCHESTRA CORP. SECURE BLACKBOARD MULTI-AGENT EXECUTION BLOCK. ALL CHANNELS FULLY DECENTRALIZED.
      </footer>
    </div>
  );
}

// Compact Sub-Component NodeCard
interface NodeCardProps {
  meta: AgentMeta;
  state: { completed: boolean; running: boolean; status: "IDLE" | "THINKING" | "COMPOSING" | "STREAMING_OUTPUT" | "SUCCESS" | "RETRYING" | "ERROR" };
  isSelected: boolean;
  onClick: () => void;
  theme: string;
  isFaulty?: boolean;
}

function NodeCard({ meta, state, isSelected, onClick, theme, isFaulty = false }: NodeCardProps) {
  const isRunning = state?.running;
  const isCompleted = state?.completed;
  const status = state?.status || "IDLE";

  let statusClass = theme === "dark" ? "border-zinc-800/80 bg-zinc-900/60" : "border-slate-200 bg-slate-50";
  let statusColor = "bg-zinc-500";

  if (isRunning) {
    if (status === "THINKING") {
      statusClass = theme === "dark"
        ? "border-amber-500 bg-amber-950/10 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
        : "border-amber-400 bg-amber-50/70 shadow-[0_0_12px_rgba(245,158,11,0.08)]";
      statusColor = "bg-amber-500 animate-pulse";
    } else if (status === "COMPOSING") {
      statusClass = theme === "dark"
        ? "border-orange-500 bg-orange-950/10 shadow-[0_0_12px_rgba(249,115,22,0.15)]"
        : "border-orange-400 bg-orange-50/70 shadow-[0_0_12px_rgba(249,115,22,0.08)]";
      statusColor = "bg-orange-500 animate-pulse";
    } else if (status === "STREAMING_OUTPUT") {
      statusClass = theme === "dark"
        ? "border-sky-500 bg-sky-950/10 shadow-[0_0_12px_rgba(14,165,233,0.15)]"
        : "border-sky-400 bg-sky-50/70 shadow-[0_0_12px_rgba(14,165,233,0.08)] animate-pulse";
      statusColor = "bg-sky-500 animate-bounce";
    } else if (status === "ERROR") {
      statusClass = theme === "dark"
        ? "border-rose-600 bg-rose-950/25 shadow-[0_0_14px_rgba(244,63,94,0.45)] animate-pulse"
        : "border-rose-500 bg-rose-50 shadow-[0_0_14px_rgba(244,63,94,0.15)] animate-pulse";
      statusColor = "bg-rose-500 animate-ping";
    } else if (status === "RETRYING") {
      statusClass = theme === "dark"
        ? "border-amber-500 bg-amber-950/20 shadow-[0_0_12px_rgba(245,158,11,0.35)] animate-pulse"
        : "border-amber-400 bg-amber-50/50 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse";
      statusColor = "bg-amber-500 animate-pulse";
    }
  } else if (isCompleted) {
    if (theme === "dark") {
      statusClass = isSelected
        ? "border-indigo-500 bg-indigo-950/15 shadow-[0_0_12px_rgba(99,102,241,0.2)]"
        : "border-indigo-500/40 bg-indigo-950/5";
    } else {
      statusClass = isSelected
        ? "border-indigo-600 bg-indigo-50/80 shadow-[0_0_12px_rgba(79,70,229,0.12)]"
        : "border-indigo-200 bg-indigo-50/20 hover:border-indigo-300";
    }
    statusColor = "bg-emerald-500";
  } else if (isFaulty) {
    statusClass = theme === "dark"
      ? "border-rose-500 bg-rose-950/10 shadow-[0_0_10px_rgba(244,63,94,0.2)] animate-pulse"
      : "border-rose-300 bg-rose-50/50 shadow-[0_0_10px_rgba(244,63,94,0.08)] animate-pulse";
    statusColor = "bg-rose-500";
  } else if (isSelected) {
    statusClass = theme === "dark" ? "border-zinc-400 bg-zinc-800" : "border-indigo-500 bg-indigo-50/30 shadow-sm";
  } else {
    statusClass = theme === "dark" ? "border-zinc-800 bg-zinc-900/90" : "border-slate-200 bg-white hover:bg-slate-50/50";
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className={`w-32 border rounded-xl p-2 text-left flex items-center gap-2 transition-all duration-350 hover:scale-[1.02] cursor-pointer ${statusClass}`}
    >
      <div className={`p-1.5 rounded-lg shrink-0 transition-colors duration-300 ${
        isRunning 
          ? "bg-indigo-600 text-white shadow-[0_0_8px_rgba(79,70,229,0.3)]" 
          : (isFaulty 
              ? "bg-rose-600 text-white animate-pulse" 
              : (theme === "dark" ? "bg-zinc-800 text-zinc-300" : "bg-slate-100 text-slate-500"))
      }`}>
        <meta.icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-[9.5px] font-black leading-tight truncate transition-colors duration-200 ${
          theme === "dark" ? "text-white" : "text-slate-800"
        }`}>{meta.role}</div>
        <div className="text-[7.5px] font-mono leading-none mt-1 flex items-center gap-1">
          <span className={`h-1 w-1 rounded-full ${statusColor}`} />
          <span className={`uppercase font-bold truncate ${theme === "dark" ? "text-zinc-500" : "text-slate-400"}`}>
            {isFaulty && status === "IDLE" ? "FAULTY" : status}
          </span>
        </div>
      </div>
    </button>
  );
}
