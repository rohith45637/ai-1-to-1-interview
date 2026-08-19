from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class JobRoleDefinition(BaseModel):
    id: str
    title: str
    category: str
    description: str
    icon: str
    core_technical_skills: List[str]
    common_tools: List[str]
    scenario_topics: List[str]
    hr_competency_focus: List[str]
    sample_questions: List[str]

BUILT_IN_JOB_ROLES: List[Dict[str, Any]] = [
    {
        "id": "software-developer",
        "title": "Software Developer",
        "category": "Software Engineering",
        "description": "General software engineering covering core algorithms, OOP principles, debugging, and clean architecture.",
        "icon": "Code",
        "core_technical_skills": ["Data Structures & Algorithms", "OOP", "System Architecture", "Git", "REST APIs", "Unit Testing"],
        "common_tools": ["Git", "Docker", "VS Code", "Postman", "CI/CD"],
        "scenario_topics": ["Refactoring legacy code", "Optimizing algorithmic complexity", "Concurrency handling"],
        "hr_competency_focus": ["Team Collaboration", "Handling Code Reviews", "Meeting Tight Deadlines"],
        "sample_questions": ["Explain polymorphism with a real-world example.", "How do you detect and fix memory leaks in an application?"]
    },
    {
        "id": "full-stack-developer",
        "title": "Full Stack Developer",
        "category": "Software Engineering",
        "description": "End-to-end web application development covering frontend UI, backend services, databases, and deployment.",
        "icon": "Layers",
        "core_technical_skills": ["JavaScript/TypeScript", "React", "Node.js/Python", "REST/GraphQL APIs", "SQL & NoSQL", "Authentication (JWT/OAuth)", "State Management", "Deployment"],
        "common_tools": ["React", "Express/FastAPI", "PostgreSQL", "MongoDB", "Docker", "Git", "Webpack/Vite"],
        "scenario_topics": ["Designing an authenticated CRUD service", "Handling state synchronization between client and server", "Database indexing for high-traffic queries"],
        "hr_competency_focus": ["Cross-functional communication", "Balancing frontend vs backend priorities", "Client requirement translation"],
        "sample_questions": ["How does React reconciliation and virtual DOM diffing work?", "Explain how you handle race conditions in asynchronous API calls."]
    },
    {
        "id": "frontend-developer",
        "title": "Frontend Developer",
        "category": "Software Engineering",
        "description": "Modern frontend development focusing on responsive UI, Web Vitals, accessibility, state architecture, and micro-frontends.",
        "icon": "Layout",
        "core_technical_skills": ["HTML5/CSS3", "JavaScript/TypeScript", "React/Vue", "CSS Architecture (Tailwind)", "Web Performance & Core Vitals", "Accessibility (a11y)", "State Management"],
        "common_tools": ["React", "TailwindCSS", "Redux/Zustand", "Vite", "Lighthouse", "Jest/Cypress"],
        "scenario_topics": ["Optimizing page load time and Cumulative Layout Shift", "Building accessible compound UI components", "Handling offline client state"],
        "hr_competency_focus": ["Working with UX Designers", "Advocating for user accessibility", "Handling rapid design iterations"],
        "sample_questions": ["How do you prevent unnecessary re-renders in large React applications?", "Explain CSS box model, stacking context, and CSS grid vs flexbox."]
    },
    {
        "id": "backend-developer",
        "title": "Backend Developer",
        "category": "Software Engineering",
        "description": "Robust server-side architecture, high-throughput microservices, distributed caching, and database design.",
        "icon": "Server",
        "core_technical_skills": ["Node.js/Go/Java/Python", "REST & gRPC", "Relational & Document Databases", "Distributed Caching (Redis)", "Message Brokers (Kafka/RabbitMQ)", "System Design", "Microservices"],
        "common_tools": ["PostgreSQL", "Redis", "Kafka", "Docker", "Kubernetes", "Prometheus"],
        "scenario_topics": ["Preventing race conditions with database transactions", "Designing an idempotent payment webhook", "Horizontal scaling strategy"],
        "hr_competency_focus": ["Handling production outages", "Mentoring junior engineers", "Cross-team API contracts"],
        "sample_questions": ["How does database connection pooling work and how do you prevent connection starvation?", "Explain CAP theorem and its real-world trade-offs in distributed systems."]
    },
    {
        "id": "python-developer",
        "title": "Python Developer",
        "category": "Software Engineering",
        "description": "Python engineering across backend services, asynchronous programming, automation, and API backends.",
        "icon": "Terminal",
        "core_technical_skills": ["Python Internals (GIL, Memory Management)", "FastAPI / Django / Flask", "Asyncio & Multiprocessing", "SQLAlchemy / ORM", "Pytest & Mocking", "Type Hinting"],
        "common_tools": ["Poetry/Pipenv", "FastAPI", "Django", "Celery", "PostgreSQL", "Docker"],
        "scenario_topics": ["Overcoming GIL limitations with multiprocessing/asyncio", "Designing background workers with Celery & Redis", "Profiling memory usage"],
        "hr_competency_focus": ["Code readability and PEP8 standards", "Handling technical debt", "Collaborative problem solving"],
        "sample_questions": ["Explain Python generators, decorators, and context managers under the hood.", "How does FastAPI leverage Pydantic and async event loops for high performance?"]
    },
    {
        "id": "java-developer",
        "title": "Java Developer",
        "category": "Software Engineering",
        "description": "Enterprise Java systems, Spring Boot microservices, JVM tuning, and multi-threaded architectures.",
        "icon": "Cpu",
        "core_technical_skills": ["Java 17/21+", "Spring Boot & Spring Cloud", "JVM Garbage Collection Tuning", "Hibernate / JPA", "Multithreading & Concurrency", "Kafka / ActiveMQ", "Microservices"],
        "common_tools": ["Spring Boot", "Maven/Gradle", "IntelliJ IDEA", "PostgreSQL/Oracle", "Docker", "JUnit 5"],
        "scenario_topics": ["Diagnosing Java thread deadlocks", "Optimizing JVM heap and garbage collection pauses", "Designing distributed transactions (Saga pattern)"],
        "hr_competency_focus": ["Enterprise governance", "Adapting to legacy codebases", "Clear stakeholder reporting"],
        "sample_questions": ["Explain the internal workings of ConcurrentHashMap and volatile keyword in Java.", "How does Spring Boot auto-configuration work under the hood?"]
    },
    {
        "id": "cybersecurity-analyst",
        "title": "Cybersecurity Analyst",
        "category": "Security & Cloud",
        "description": "Threat vulnerability analysis, security posture hardening, risk mitigation, and compliance frameworks.",
        "icon": "ShieldAlert",
        "core_technical_skills": ["Vulnerability Assessment", "Network Security Protocols", "OWASP Top 10", "Incident Response", "Firewalls & IDS/IPS", "Nmap & Wireshark", "Encryption / PKI"],
        "common_tools": ["Nmap", "Wireshark", "Burp Suite", "Nessus", "Metasploit", "Splunk"],
        "scenario_topics": ["Investigating an unauthorized SSH brute force alert", "Remediating SQLi and SSRF in an enterprise app", "Hardening perimeter firewalls"],
        "hr_competency_focus": ["Security awareness training", "Ethical decision making", "Communicating risk to executives"],
        "sample_questions": ["How do you detect and mitigate an SSRF (Server-Side Request Forgery) vulnerability?", "Explain the steps of the incident response lifecycle according to NIST framework."]
    },
    {
        "id": "soc-analyst",
        "title": "SOC Analyst",
        "category": "Security & Cloud",
        "description": "Security Operations Center monitoring, SIEM log triage, intrusion detection, and threat hunting.",
        "icon": "Eye",
        "core_technical_skills": ["SIEM Operations", "Log Correlation (Syslog, Windows Event Logs)", "MITRE ATT&CK Framework", "Threat Hunting", "Phishing Investigation", "Malware Triage", "EDR Systems"],
        "common_tools": ["Splunk", "QRadar", "Elastic Security", "CrowdStrike", "Wireshark", "VirusTotal"],
        "scenario_topics": ["Triage of high-severity lateral movement alarm", "Analyzing suspicious PowerShell command executions", "Handling a ransomware containment request"],
        "hr_competency_focus": ["High-pressure calm thinking", "Detail-oriented observation", "24/7 on-call readiness"],
        "sample_questions": ["Walk through how you investigate a suspected pass-the-hash attack using SIEM logs.", "Explain the MITRE ATT&CK matrix and how you map observed adversary techniques."]
    },
    {
        "id": "cloud-engineer",
        "title": "Cloud Engineer",
        "category": "Security & Cloud",
        "description": "Cloud infrastructure architecture, serverless systems, IAM governance, and cost optimization.",
        "icon": "Cloud",
        "core_technical_skills": ["AWS / Azure / GCP", "Infrastructure as Code (Terraform)", "VPC, Subnets & Routing", "IAM & Security Groups", "Serverless (Lambda/Cloud Functions)", "Cloud Monitoring & FinOps"],
        "common_tools": ["Terraform", "AWS Console/CLI", "CloudFormation", "Kubernetes", "CloudWatch", "Datadog"],
        "scenario_topics": ["Designing a multi-region highly available VPC architecture", "Resolving cross-account IAM permission failures", "Optimizing cloud compute bills by 40%"],
        "hr_competency_focus": ["Cost governance discipline", "Cross-team cloud evangelism", "Balancing agility vs compliance"],
        "sample_questions": ["Explain how you structure a secure multi-account AWS architecture with IAM Identity Center and SCPs.", "How do Terraform state locking and drift detection work in team environments?"]
    },
    {
        "id": "devops-engineer",
        "title": "DevOps Engineer",
        "category": "Infrastructure",
        "description": "CI/CD pipelines, container orchestration, GitOps, zero-downtime deployments, and SRE reliability.",
        "icon": "GitBranch",
        "core_technical_skills": ["CI/CD Pipelines", "Docker & Containerization", "Kubernetes (K8s)", "GitOps (ArgoCD)", "Linux Internals & Bash", "Monitoring (Prometheus & Grafana)", "Infrastructure as Code"],
        "common_tools": ["Docker", "Kubernetes", "GitHub Actions", "GitLab CI", "Terraform", "Helm", "Grafana"],
        "scenario_topics": ["Implementing zero-downtime Blue/Green or Canary deployments", "Debugging CrashLoopBackOff in Kubernetes pods", "Automating compliance checks in CI/CD"],
        "hr_competency_focus": ["Blameless post-mortem culture", "Collaboration between Dev and Ops", "Reliability mindset"],
        "sample_questions": ["How do Kubernetes Ingress controllers, Services, and Pod networking interact?", "Describe how you build a secure, multi-stage Docker build with vulnerability scanning."]
    },
    {
        "id": "data-analyst",
        "title": "Data Analyst",
        "category": "Data & AI",
        "description": "Data storytelling, advanced SQL querying, business intelligence dashboards, and statistical exploratory analysis.",
        "icon": "BarChart3",
        "core_technical_skills": ["Advanced SQL (Window functions, CTEs)", "BI Tools (Tableau, PowerBI)", "Python/R for Data Analysis (Pandas)", "Data Cleaning & Transformation", "Statistical Hypothesis Testing", "Data Storytelling"],
        "common_tools": ["SQL", "PowerBI", "Tableau", "Pandas", "Excel/Google Sheets", "Snowflake"],
        "scenario_topics": ["Diagnosing sudden drop in user retention", "Designing executive KPI dashboard", "Analyzing A/B test statistical significance"],
        "hr_competency_focus": ["Translating complex numbers to non-technical stakeholders", "Curiosity and proactive questioning", "Data ethics"],
        "sample_questions": ["Explain SQL window functions: ROW_NUMBER(), RANK(), and DENSE_RANK() with an example.", "How do you determine if an observed change in conversion rate is statistically significant?"]
    },
    {
        "id": "data-scientist",
        "title": "Data Scientist",
        "category": "Data & AI",
        "description": "Statistical modeling, predictive machine learning, feature engineering, and experimental design.",
        "icon": "Brain",
        "core_technical_skills": ["Machine Learning (Scikit-Learn, XGBoost)", "Statistical Inference & Probability", "Feature Engineering", "Python (NumPy, Pandas, SciPy)", "Model Evaluation (ROC-AUC, Precision/Recall)", "SQL & BigQuery"],
        "common_tools": ["Jupyter", "Scikit-Learn", "XGBoost", "MLflow", "SQL", "Pandas"],
        "scenario_topics": ["Handling severe class imbalance in fraud detection", "Mitigating data leakage during time-series modeling", "A/B testing experimentation frameworks"],
        "hr_competency_focus": ["Scientific rigor", "Communication of model limitations", "Business impact orientation"],
        "sample_questions": ["How do you handle severe class imbalance in a classification model?", "Explain the trade-offs between precision and recall, and when you would optimize for one over the other."]
    },
    {
        "id": "machine-learning-engineer",
        "title": "Machine Learning Engineer",
        "category": "Data & AI",
        "description": "Production ML systems, deep learning architectures, model deployment, MLOps, and real-time inference pipelines.",
        "icon": "Activity",
        "core_technical_skills": ["Deep Learning (PyTorch / TensorFlow)", "MLOps & Model Registry (MLflow)", "Real-time & Batch Model Serving", "Feature Stores", "Model Optimization (Quantization, ONNX)", "Distributed Training"],
        "common_tools": ["PyTorch", "TensorFlow", "Triton / TorchServe", "Docker", "MLflow", "Kubeflow"],
        "scenario_topics": ["Deploying a sub-50ms latency recommendation model", "Continuous model retraining and drift detection", "Optimizing memory footprint for edge inference"],
        "hr_competency_focus": ["Cross-functional alignment with product engineers", "Pragmatism in choosing simple models vs complex networks", "Continuous learning"],
        "sample_questions": ["Explain how you detect and address covariate shift and concept drift in production ML models.", "What is model quantization (INT8 vs FP16) and how does it affect inference latency and accuracy?"]
    },
    {
        "id": "ai-engineer",
        "title": "AI Engineer",
        "category": "Data & AI",
        "description": "Generative AI applications, LLM orchestration, Retrieval-Augmented Generation (RAG), fine-tuning, and agentic workflows.",
        "icon": "Sparkles",
        "core_technical_skills": ["LLM APIs & Prompt Engineering", "RAG Architecture (Embeddings & Vector DBs)", "Agent Frameworks (LangChain, LlamaIndex)", "Evaluation Frameworks (Ragas)", "Fine-Tuning (LoRA/QLoRA)", "Safety & Guardrails"],
        "common_tools": ["Google Gemini SDK", "OpenAI / Claude APIs", "Pinecone/Chroma", "LangChain", "HuggingFace", "FastAPI"],
        "scenario_topics": ["Building an accurate RAG system with hybrid search and re-ranking", "Eliminating hallucination in financial Q&A", "Designing autonomous agent multi-step tooling"],
        "hr_competency_focus": ["Ethical AI considerations", "Managing stakeholder expectations around GenAI", "Rapid experimentation mindset"],
        "sample_questions": ["How do you optimize retrieval in RAG systems using semantic chunking, hybrid keyword search, and cross-encoder re-ranking?", "Explain how you implement structured JSON outputs and schema validation with LLMs."]
    },
    {
        "id": "qa-engineer",
        "title": "QA Engineer",
        "category": "Software Engineering",
        "description": "Automated testing pipelines, end-to-end test frameworks, performance load testing, and quality assurance strategy.",
        "icon": "CheckCircle2",
        "core_technical_skills": ["Test Automation (Playwright / Selenium / Cypress)", "API Testing (Postman, REST-assured)", "Performance & Load Testing (JMeter, k6)", "CI/CD Test Integration", "Test Case Design (Boundary, Equivalence)", "Bug Life Cycle Management"],
        "common_tools": ["Playwright", "Cypress", "Postman", "k6", "Jira", "GitHub Actions"],
        "scenario_topics": ["Handling flaky end-to-end tests in CI pipelines", "Designing a test matrix for a payment gateway", "Load testing a flash sale event"],
        "hr_competency_focus": ["Attention to detail", "Constructive diplomacy with developers", "Advocating for user experience"],
        "sample_questions": ["How do you handle asynchronous waiting and flaky assertions in automated UI tests?", "What is the difference between boundary value analysis and equivalence partitioning?"]
    },
    {
        "id": "mobile-app-developer",
        "title": "Mobile App Developer",
        "category": "Software Engineering",
        "description": "Cross-platform and native mobile applications, responsive mobile UX, offline sync, and app store deployment.",
        "icon": "Smartphone",
        "core_technical_skills": ["React Native / Flutter / Swift / Kotlin", "Mobile State Management", "Offline Data Persistence (SQLite, Realm)", "Push Notifications & Deep Linking", "Mobile Performance & Battery Optimization", "App Store & Play Store Guidelines"],
        "common_tools": ["React Native", "Flutter", "Xcode", "Android Studio", "Firebase", "Fastlane"],
        "scenario_topics": ["Optimizing app startup time and 60fps scroll smoothness", "Designing bidirectional offline synchronization", "Handling background location and battery drain"],
        "hr_competency_focus": ["User empathy on mobile devices", "Navigating app review rejections", "Fast release cycles"],
        "sample_questions": ["How does the React Native bridge / new architecture (Fabric & TurboModules) work?", "How do you design an offline-first mobile app that gracefully handles network reconnection conflicts?"]
    },
    {
        "id": "network-engineer",
        "title": "Network Engineer",
        "category": "Infrastructure",
        "description": "Routing protocols, network infrastructure design, VPNs, load balancers, and network troubleshooting.",
        "icon": "Network",
        "core_technical_skills": ["OSI Model & TCP/IP Internals", "BGP, OSPF, Routing & Switching", "VLANs & Subnetting", "DNS, DHCP, SSL/TLS", "Firewalls & VPNs (IPsec, WireGuard)", "Wireshark Packet Analysis"],
        "common_tools": ["Wireshark", "Cisco Packet Tracer", "GNS3", "tcpdump", "Nmap", "BGP Looking Glass"],
        "scenario_topics": ["Troubleshooting intermittent packet loss across WAN", "Designing high-availability dual-ISP BGP peering", "Resolving DNS propagation and split-brain issues"],
        "hr_competency_focus": ["Clear communication during network outages", "Methodical root cause analysis", "Vendor coordination"],
        "sample_questions": ["Explain TCP 3-way handshake, SYN flood attacks, and TCP window scaling.", "How does BGP path selection work and how do you prevent route flapping?"]
    },
    {
        "id": "database-administrator",
        "title": "Database Administrator",
        "category": "Infrastructure",
        "description": "Database reliability, index optimization, query execution plan tuning, replication, backup, and high availability.",
        "icon": "Database",
        "core_technical_skills": ["PostgreSQL / MySQL / Oracle Administration", "Query Optimization (EXPLAIN ANALYZE)", "Indexing Strategies (B-Tree, GIN, Hash)", "Replication & High Availability (Patroni, WAL)", "Backup & Disaster Recovery", "Database Security & User Permissions"],
        "common_tools": ["pgAdmin", "DBeaver", "Patroni", "pg_stat_statements", "Percona Toolkit", "Prometheus PG Exporter"],
        "scenario_topics": ["Optimizing a slow query locking tables in production", "Configuring streaming replication with automatic failover", "Executing zero-downtime database schema migrations"],
        "hr_competency_focus": ["Meticulous attention to data safety", "Managing high-stress maintenance windows", "Cross-team data education"],
        "sample_questions": ["How do you interpret PostgreSQL EXPLAIN ANALYZE output and identify sequential scans vs index scans?", "Explain Write-Ahead Logging (WAL) and how point-in-time recovery (PITR) works."]
    },
    {
        "id": "ui-ux-designer",
        "title": "UI/UX Designer",
        "category": "Design & Product",
        "description": "Design systems, user research, wireframing, high-fidelity prototyping, and design-to-code collaboration.",
        "icon": "Palette",
        "core_technical_skills": ["Design Systems & Component Libraries", "User Research & Usability Testing", "Wireframing & High-Fidelity Prototyping (Figma)", "Information Architecture & User Journeys", "Accessibility (WCAG 2.1)", "Responsive Grid Systems"],
        "common_tools": ["Figma", "FigJam", "Miro", "Adobe Creative Suite", "Storybook", "Zeroheight"],
        "scenario_topics": ["Redesigning an onboarding flow to boost completion by 25%", "Building an accessible multi-brand design system", "Conducting usability tests on a complex dashboard"],
        "hr_competency_focus": ["User empathy", "Articulating design decisions to engineering and business leads", "Embracing constructive critique"],
        "sample_questions": ["Walk through your process for conducting user research and synthesizing insights into actionable design decisions.", "How do you ensure your UI components meet WCAG 2.1 AA accessibility standards?"]
    },
    {
        "id": "business-analyst",
        "title": "Business Analyst",
        "category": "Design & Product",
        "description": "Requirements elicitation, business process modeling, stakeholder management, gap analysis, and agile user stories.",
        "icon": "Briefcase",
        "core_technical_skills": ["Requirements Gathering & User Stories (BRD/FRD)", "Process Modeling (BPMN / UML)", "Gap Analysis & Feasibility Studies", "SQL for Business Validation", "Stakeholder Communication & Conflict Resolution", "Agile/Scrum Framework"],
        "common_tools": ["Jira", "Confluence", "Lucidchart", "SQL", "Excel", "Miro"],
        "scenario_topics": ["Resolving conflicting requirements between product and sales", "Defining acceptance criteria for a complex payment integration", "Conducting root-cause analysis on missed project milestones"],
        "hr_competency_focus": ["Active listening", "Negotiation and compromise", "Clear and concise documentation"],
        "sample_questions": ["How do you handle situations where stakeholders have contradictory requirements for a critical feature?", "What framework do you use to write clear, testable acceptance criteria for agile user stories?"]
    }
]
