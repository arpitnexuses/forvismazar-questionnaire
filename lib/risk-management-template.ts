export const riskManagementTemplate = {
  title: "Risk Management Assessment",
  description: "Comprehensive risk assessment questionnaire for organizations",
  sections: [
    {
      id: "section-1",
      title: "Risk Governance & Framework",
      questions: [
        {
          id: "q1-1",
          text: "Is there a formally approved Risk Management Policy or Framework?",
          expectedEvidence: "• Approved document\n• Board/EXCOM minutes\n• Version control with approval history",
          options: [
            { text: "Not available", points: 0 },
            { text: "No formal policy exists", points: 1 },
            { text: "Policy exists but not approved", points: 2 },
            { text: "Policy approved but not implemented", points: 3 },
            { text: "Policy approved and partially implemented", points: 4 },
            { text: "Policy fully approved and implemented", points: 5 }
          ]
        },
        {
          id: "q1-2",
          text: "Does the Risk function report independently (not via Finance or Operations)?",
          expectedEvidence: "• Organization chart\n• Reporting lines\n• Interview notes",
          options: [
            { text: "Not available", points: 0 },
            { text: "Risk reports through Finance/Operations", points: 1 },
            { text: "Mixed reporting structure", points: 2 },
            { text: "Partially independent reporting", points: 3 },
            { text: "Mostly independent reporting", points: 4 },
            { text: "Fully independent reporting", points: 5 }
          ]
        },
        {
          id: "q1-3",
          text: "Is there a committee (Audit or Risk) that reviews risk topics regularly?",
          expectedEvidence: "• Committee charters\n• Meeting agendas/minutes\n• Risk reports presented",
          options: [
            { text: "Not available", points: 0 },
            { text: "No risk committee exists", points: 1 },
            { text: "Committee exists but rarely meets", points: 2 },
            { text: "Committee meets occasionally", points: 3 },
            { text: "Committee meets regularly", points: 4 },
            { text: "Committee meets regularly with comprehensive reviews", points: 5 }
          ]
        },
        {
          id: "q1-4",
          text: "Is there a clearly defined escalation process for high-risk exposures?",
          expectedEvidence: "• RAS thresholds\n• Escalation charts\n• Incident logs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No escalation process", points: 1 },
            { text: "Informal escalation only", points: 2 },
            { text: "Basic escalation process", points: 3 },
            { text: "Well-defined escalation process", points: 4 },
            { text: "Comprehensive escalation with clear thresholds", points: 5 }
          ]
        },
        {
          id: "q1-5",
          text: "Is risk formally integrated into corporate governance processes (e.g., strategic reviews, investment approvals)?",
          expectedEvidence: "• Investment committee memos\n• Strategic risk reviews\n• Decision templates",
          options: [
            { text: "Not available", points: 0 },
            { text: "No risk integration", points: 1 },
            { text: "Minimal risk integration", points: 2 },
            { text: "Some risk integration", points: 3 },
            { text: "Good risk integration", points: 4 },
            { text: "Comprehensive risk integration", points: 5 }
          ]
        },
        {
          id: "q1-6",
          text: "Are risk-related roles and responsibilities clearly defined in job descriptions, frameworks, or charters?",
          expectedEvidence: "• JD for CRO, Risk Analysts, Line Managers\n• Risk policy or framework with RACI matrix\n• Governance charters",
          options: [
            { text: "Not available", points: 0 },
            { text: "No defined risk roles", points: 1 },
            { text: "Basic risk role definitions", points: 2 },
            { text: "Some risk roles defined", points: 3 },
            { text: "Most risk roles clearly defined", points: 4 },
            { text: "All risk roles comprehensively defined", points: 5 }
          ]
        },
        {
          id: "q1-7",
          text: "Are risk owners designated for key risks at business unit or functional level?",
          expectedEvidence: "• Risk register with owner column\n• Interviews with BU Heads\n• Risk treatment plans",
          options: [
            { text: "Not available", points: 0 },
            { text: "No designated risk owners", points: 1 },
            { text: "Few risk owners designated", points: 2 },
            { text: "Some risk owners designated", points: 3 },
            { text: "Most risks have owners", points: 4 },
            { text: "All key risks have designated owners", points: 5 }
          ]
        },
        {
          id: "q1-8",
          text: "Are risk owners held accountable (e.g., through KPIs, reviews, performance assessments)?",
          expectedEvidence: "• Risk-related KPIs\n• Performance appraisals\n• Mitigation follow-up reports",
          options: [
            { text: "Not available", points: 0 },
            { text: "No accountability mechanisms", points: 1 },
            { text: "Informal accountability", points: 2 },
            { text: "Basic accountability measures", points: 3 },
            { text: "Good accountability mechanisms", points: 4 },
            { text: "Comprehensive accountability framework", points: 5 }
          ]
        },
        {
          id: "q1-9",
          text: "Does executive management (CEO, CFO, COO) take active responsibility for major risks?",
          expectedEvidence: "• Risk committee attendees\n• C-level sign-off on risk registers\n• Risk included in EXCOM meetings",
          options: [
            { text: "Not available", points: 0 },
            { text: "No executive involvement", points: 1 },
            { text: "Minimal executive involvement", points: 2 },
            { text: "Some executive involvement", points: 3 },
            { text: "Active executive involvement", points: 4 },
            { text: "Comprehensive executive ownership", points: 5 }
          ]
        },
        {
          id: "q1-10",
          text: "Are risk roles and accountability cascaded and aligned across all subsidiaries and investment entities?",
          expectedEvidence: "• Group risk governance model\n• Group-level only subsidiaries unmanaged\n• Delegation of authority matrix",
          options: [
            { text: "Not available", points: 0 },
            { text: "No cascading to subsidiaries", points: 1 },
            { text: "Limited cascading", points: 2 },
            { text: "Partial cascading", points: 3 },
            { text: "Good cascading", points: 4 },
            { text: "Full cascading and alignment", points: 5 }
          ]
        }
      ]
    },
    {
      id: "section-2",
      title: "Risk Appetite & Strategy",
      questions: [
        {
          id: "q2-1",
          text: "Is there a formally documented Risk Appetite Statement (RAS) approved by the Board or EXCOM?",
          expectedEvidence: "• RAS document\n• Board/EXCOM approval minutes\n• Version history",
          options: [
            { text: "Not available", points: 0 },
            { text: "No RAS exists", points: 1 },
            { text: "Draft RAS only", points: 2 },
            { text: "RAS exists but not approved", points: 3 },
            { text: "RAS approved but outdated", points: 4 },
            { text: "Current RAS formally approved", points: 5 }
          ]
        },
        {
          id: "q2-2",
          text: "Is the RAS structured by risk category (e.g., investment, operational, market, compliance, ESG)?",
          expectedEvidence: "• Risk appetite framework\n• Category-specific thresholds or matrices",
          options: [
            { text: "Not available", points: 0 },
            { text: "No structure by category", points: 1 },
            { text: "Basic categorization", points: 2 },
            { text: "Some categories covered", points: 3 },
            { text: "Most categories covered", points: 4 },
            { text: "Comprehensive categorization", points: 5 }
          ]
        },
        {
          id: "q2-3",
          text: "Are risk appetite thresholds or limits embedded in policies and procedures (e.g., investment criteria, approval matrices)?",
          expectedEvidence: "• Investment policies\n• Delegation of authority charts\n• Embedded thresholds",
          options: [
            { text: "Not available", points: 0 },
            { text: "No embedded thresholds", points: 1 },
            { text: "Few embedded thresholds", points: 2 },
            { text: "Some embedded thresholds", points: 3 },
            { text: "Many embedded thresholds", points: 4 },
            { text: "Comprehensive embedded thresholds", points: 5 }
          ]
        },
        {
          id: "q2-4",
          text: "Is the risk appetite statement cascaded to subsidiaries, departments, and investment entities?",
          expectedEvidence: "• Risk policy distribution logs\n• Subsidiary-level training or documentation",
          options: [
            { text: "Not available", points: 0 },
            { text: "No cascading", points: 1 },
            { text: "Limited cascading", points: 2 },
            { text: "Partial cascading", points: 3 },
            { text: "Good cascading", points: 4 },
            { text: "Full cascading", points: 5 }
          ]
        },
        {
          id: "q2-5",
          text: "Are major decisions (e.g., investments, expansions) formally screened against the RAS?",
          expectedEvidence: "• Decision templates\n• Risk screening checklists\n• Investment committee records",
          options: [
            { text: "Not available", points: 0 },
            { text: "No screening against RAS", points: 1 },
            { text: "Informal screening", points: 2 },
            { text: "Some formal screening", points: 3 },
            { text: "Regular formal screening", points: 4 },
            { text: "Comprehensive screening", points: 5 }
          ]
        },
        {
          id: "q2-6",
          text: "Is the RAS reviewed and updated periodically (e.g., annually or following major events)?",
          expectedEvidence: "• RAS review logs\n• Board minutes\n• Change tracking",
          options: [
            { text: "Not available", points: 0 },
            { text: "No periodic review", points: 1 },
            { text: "Irregular review", points: 2 },
            { text: "Basic periodic review", points: 3 },
            { text: "Regular periodic review", points: 4 },
            { text: "Comprehensive review process", points: 5 }
          ]
        },
        {
          id: "q2-7",
          text: "Is risk appetite considered during strategic planning and business goal-setting?",
          expectedEvidence: "• Strategic planning workshop minutes\n• Risk appetite document aligned to KPIs or strategic goals\n• Board strategy decks",
          options: [
            { text: "Not available", points: 0 },
            { text: "No integration with strategy", points: 1 },
            { text: "Minimal integration", points: 2 },
            { text: "Some integration", points: 3 },
            { text: "Good integration", points: 4 },
            { text: "Comprehensive integration", points: 5 }
          ]
        },
        {
          id: "q2-8",
          text: "Are investment decisions assessed against risk appetite thresholds (e.g., exposure limits, concentration risks)?",
          expectedEvidence: "• Investment committee templates\n• Thresholds in RAS\n• Due diligence reports referencing risk appetite",
          options: [
            { text: "Not available", points: 0 },
            { text: "No assessment against thresholds", points: 1 },
            { text: "Informal assessment", points: 2 },
            { text: "Some formal assessment", points: 3 },
            { text: "Regular assessment", points: 4 },
            { text: "Comprehensive assessment", points: 5 }
          ]
        },
        {
          id: "q2-9",
          text: "Is risk appetite part of business case approval templates or evaluations (e.g. project risks, ROI vs. appetite)?",
          expectedEvidence: "• Business case templates\n• Risk scoring grids\n• Risk appetite section in project evaluation forms",
          options: [
            { text: "Not available", points: 0 },
            { text: "Not included in business cases", points: 1 },
            { text: "Minimal inclusion", points: 2 },
            { text: "Some inclusion", points: 3 },
            { text: "Good inclusion", points: 4 },
            { text: "Comprehensive inclusion", points: 5 }
          ]
        },
        {
          id: "q2-10",
          text: "Are breaches in risk appetite thresholds escalated with corrective actions or approvals?",
          expectedEvidence: "• Escalation logs\n• Incident reports\n• Audit trails of decision overrides",
          options: [
            { text: "Not available", points: 0 },
            { text: "No escalation process", points: 1 },
            { text: "Informal escalation", points: 2 },
            { text: "Basic escalation", points: 3 },
            { text: "Good escalation process", points: 4 },
            { text: "Comprehensive escalation", points: 5 }
          ]
        },
        {
          id: "q2-11",
          text: "Is the Board of Directors engaged in reviewing and updating the risk appetite based on strategic direction?",
          expectedEvidence: "• Board risk committee minutes\n• RAS annual review\n• Strategy vs. RAS realignment reports",
          options: [
            { text: "Not available", points: 0 },
            { text: "No Board engagement", points: 1 },
            { text: "Minimal Board engagement", points: 2 },
            { text: "Some Board engagement", points: 3 },
            { text: "Active Board engagement", points: 4 },
            { text: "Comprehensive Board oversight", points: 5 }
          ]
        }
      ]
    },
    {
      id: "section-3",
      title: "Risk Identification & Assessment",
      questions: [
        {
          id: "q3-1",
          text: "Is there a structured, repeatable process for risk identification across the organization?",
          expectedEvidence: "• Risk identification procedure\n• RACI matrix\n• Internal control framework",
          options: [
            { text: "Not available", points: 0 },
            { text: "No structured process", points: 1 },
            { text: "Basic process", points: 2 },
            { text: "Some structure", points: 3 },
            { text: "Well-structured process", points: 4 },
            { text: "Comprehensive structured process", points: 5 }
          ]
        },
        {
          id: "q3-2",
          text: "Are risk identification exercises conducted at both strategic and operational levels (e.g., top-down & bottom-up)?",
          expectedEvidence: "• Risk workshop reports\n• Consolidated risk registers\n• BU-level risk submissions",
          options: [
            { text: "Not available", points: 0 },
            { text: "No systematic identification", points: 1 },
            { text: "One level only", points: 2 },
            { text: "Both levels but limited", points: 3 },
            { text: "Good coverage at both levels", points: 4 },
            { text: "Comprehensive multi-level approach", points: 5 }
          ]
        },
        {
          id: "q3-3",
          text: "Are risks identified across all relevant categories: strategic, financial, operational, legal/compliance, reputational, ESG?",
          expectedEvidence: "• Risk taxonomy\n• Risk categorization in registers\n• Risk heatmaps",
          options: [
            { text: "Not available", points: 0 },
            { text: "Limited categories", points: 1 },
            { text: "Basic categories", points: 2 },
            { text: "Some key categories", points: 3 },
            { text: "Most categories covered", points: 4 },
            { text: "All categories comprehensively covered", points: 5 }
          ]
        },
        {
          id: "q3-4",
          text: "Are external and emerging risks (e.g., geopolitical, cyber, regulatory) proactively identified?",
          expectedEvidence: "• PESTLE or scenario analysis\n• Risk horizon scanning reports\n• Industry benchmarking",
          options: [
            { text: "Not available", points: 0 },
            { text: "No proactive identification", points: 1 },
            { text: "Limited identification", points: 2 },
            { text: "Some proactive identification", points: 3 },
            { text: "Good proactive identification", points: 4 },
            { text: "Comprehensive proactive identification", points: 5 }
          ]
        },
        {
          id: "q3-5",
          text: "Are risk identification activities linked to business planning, budgeting, and change initiatives (e.g., new markets, tech investments)?",
          expectedEvidence: "• Project initiation templates\n• Risk section in business cases\n• Interviews with Strategy/PMO teams",
          options: [
            { text: "Not available", points: 0 },
            { text: "No linkage", points: 1 },
            { text: "Minimal linkage", points: 2 },
            { text: "Some linkage", points: 3 },
            { text: "Good linkage", points: 4 },
            { text: "Comprehensive integration", points: 5 }
          ]
        },
        {
          id: "q3-6",
          text: "Does the organisation have a formally documented risk assessment methodology (impact & likelihood scales, qualitative / quantitative criteria)?",
          expectedEvidence: "• Assessment guideline document\n• Impact-likelihood matrix\n• Board or EXCOM approval minutes",
          options: [
            { text: "Not available", points: 0 },
            { text: "No formal methodology", points: 1 },
            { text: "Basic methodology", points: 2 },
            { text: "Some documentation", points: 3 },
            { text: "Well-documented methodology", points: 4 },
            { text: "Comprehensive formal methodology", points: 5 }
          ]
        },
        {
          id: "q3-7",
          text: "Are risk ratings applied consistently across business units and subsidiaries?",
          expectedEvidence: "• Subsidiary risk registers\n• Cross-unit calibration workshops",
          options: [
            { text: "Not available", points: 0 },
            { text: "No consistency", points: 1 },
            { text: "Limited consistency", points: 2 },
            { text: "Some consistency", points: 3 },
            { text: "Good consistency", points: 4 },
            { text: "Full consistency", points: 5 }
          ]
        },
        {
          id: "q3-8",
          text: "Does the methodology differentiate between inherent (gross) and residual (net) risk?",
          expectedEvidence: "• Risk registers showing both ratings\n• Training decks",
          options: [
            { text: "Not available", points: 0 },
            { text: "No differentiation", points: 1 },
            { text: "Basic differentiation", points: 2 },
            { text: "Some differentiation", points: 3 },
            { text: "Good differentiation", points: 4 },
            { text: "Clear differentiation", points: 5 }
          ]
        },
        {
          id: "q3-9",
          text: "Are quantitative techniques (e.g. sensitivity, VaR, scenario analysis) used where data allows?",
          expectedEvidence: "• Quant risk models\n• Scenario analysis reports",
          options: [
            { text: "Not available", points: 0 },
            { text: "No quantitative techniques", points: 1 },
            { text: "Basic quantitative techniques", points: 2 },
            { text: "Some quantitative techniques", points: 3 },
            { text: "Good use of quantitative techniques", points: 4 },
            { text: "Advanced quantitative techniques", points: 5 }
          ]
        },
        {
          id: "q3-10",
          text: "Is the risk assessment refreshed at defined intervals (e.g. quarterly) and on major trigger events?",
          expectedEvidence: "• Calendar / timetable\n• Evidence of ad-hoc reassessments",
          options: [
            { text: "Not available", points: 0 },
            { text: "No regular refresh", points: 1 },
            { text: "Irregular refresh", points: 2 },
            { text: "Basic refresh schedule", points: 3 },
            { text: "Regular refresh", points: 4 },
            { text: "Comprehensive refresh process", points: 5 }
          ]
        },
        {
          id: "q3-11",
          text: "Are the results of assessments used to prioritise mitigation resources and management attention?",
          expectedEvidence: "• Risk dashboards \n• Budget allocation docs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No prioritization", points: 1 },
            { text: "Basic prioritization", points: 2 },
            { text: "Some prioritization", points: 3 },
            { text: "Good prioritization", points: 4 },
            { text: "Comprehensive prioritization", points: 5 }
          ]
        },
        {
          id: "q3-12",
          text: "Are assumptions, data sources, and confidence levels documented for each assessment?",
          expectedEvidence: "• Risk assessment forms\n• Data lineage documentation",
          options: [
            { text: "Not available", points: 0 },
            { text: "No documentation", points: 1 },
            { text: "Basic documentation", points: 2 },
            { text: "Some documentation", points: 3 },
            { text: "Good documentation", points: 4 },
            { text: "Comprehensive documentation", points: 5 }
          ]
        }
      ]
    },
    {
      id: "section-4",
      title: "Risk Treatment & Controls",
      questions: [
        {
          id: "q4-1",
          text: "Are mitigation actions defined for all key risks in the corporate and subsidiary-level risk registers?",
          expectedEvidence: "• Risk register with mitigation columns\n• Action plans",
          options: [
            { text: "Not available", points: 0 },
            { text: "No mitigation actions", points: 1 },
            { text: "Few mitigation actions", points: 2 },
            { text: "Some mitigation actions", points: 3 },
            { text: "Most risks have mitigation", points: 4 },
            { text: "All key risks have mitigation", points: 5 }
          ]
        },
        {
          id: "q4-2",
          text: "Are mitigation actions specific, measurable, and time-bound (SMART)?",
          expectedEvidence: "• Mitigation plan templates\n• Project tracking tools",
          options: [
            { text: "Not available", points: 0 },
            { text: "No SMART criteria", points: 1 },
            { text: "Basic criteria", points: 2 },
            { text: "Some SMART actions", points: 3 },
            { text: "Most actions are SMART", points: 4 },
            { text: "All actions are SMART", points: 5 }
          ]
        },
        {
          id: "q4-3",
          text: "Are mitigation responsibilities clearly assigned to accountable individuals or departments?",
          expectedEvidence: "• Risk register with owner column\n• Emails or meeting minutes assigning responsibility",
          options: [
            { text: "Not available", points: 0 },
            { text: "No clear assignments", points: 1 },
            { text: "Basic assignments", points: 2 },
            { text: "Some clear assignments", points: 3 },
            { text: "Most responsibilities assigned", points: 4 },
            { text: "All responsibilities clearly assigned", points: 5 }
          ]
        },
        {
          id: "q4-4",
          text: "Is there a centralized process to track and follow up on mitigation implementation progress?",
          expectedEvidence: "• Risk mitigation tracking tool\n• Dashboard / reporting to Audit Committee",
          options: [
            { text: "Not available", points: 0 },
            { text: "No tracking process", points: 1 },
            { text: "Basic tracking", points: 2 },
            { text: "Some centralized tracking", points: 3 },
            { text: "Good tracking process", points: 4 },
            { text: "Comprehensive tracking", points: 5 }
          ]
        },
        {
          id: "q4-5",
          text: "Are delays or failures in implementing mitigation actions escalated and acted upon?",
          expectedEvidence: "• Escalation logs\n• Audit or Risk Committee minutes\n• Revised action plans",
          options: [
            { text: "Not available", points: 0 },
            { text: "No escalation", points: 1 },
            { text: "Informal escalation", points: 2 },
            { text: "Some escalation", points: 3 },
            { text: "Good escalation process", points: 4 },
            { text: "Comprehensive escalation", points: 5 }
          ]
        },
        {
          id: "q4-6",
          text: "Are mitigation actions evaluated for effectiveness (e.g. did they reduce risk scores or close control gaps)?",
          expectedEvidence: "• Updated risk ratings\n• Control test results\n• Management review forms",
          options: [
            { text: "Not available", points: 0 },
            { text: "No effectiveness evaluation", points: 1 },
            { text: "Basic evaluation", points: 2 },
            { text: "Some evaluation", points: 3 },
            { text: "Good evaluation process", points: 4 },
            { text: "Comprehensive evaluation", points: 5 }
          ]
        },
        {
          id: "q4-7",
          text: "Are key controls identified and documented for major risks across business functions?",
          expectedEvidence: "• Risk-control matrix (RCM)\n• SOPs\n• Process maps",
          options: [
            { text: "Not available", points: 0 },
            { text: "No controls identified", points: 1 },
            { text: "Basic controls identified", points: 2 },
            { text: "Some controls documented", points: 3 },
            { text: "Most controls documented", points: 4 },
            { text: "All key controls documented", points: 5 }
          ]
        },
        {
          id: "q4-8",
          text: "Are controls evaluated for design effectiveness (i.e., capable of preventing or detecting the risk)?",
          expectedEvidence: "• Control design assessments\n• Internal audit plans\n• Control walkthroughs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No design evaluation", points: 1 },
            { text: "Basic evaluation", points: 2 },
            { text: "Some design evaluation", points: 3 },
            { text: "Good design evaluation", points: 4 },
            { text: "Comprehensive design evaluation", points: 5 }
          ]
        },
        {
          id: "q4-9",
          text: "Are controls tested regularly for operating effectiveness?",
          expectedEvidence: "• Testing logs\n• Control sample testing reports\n• Audit working papers",
          options: [
            { text: "Not available", points: 0 },
            { text: "No testing", points: 1 },
            { text: "Irregular testing", points: 2 },
            { text: "Some regular testing", points: 3 },
            { text: "Good testing program", points: 4 },
            { text: "Comprehensive testing", points: 5 }
          ]
        },
        {
          id: "q4-10",
          text: "Are control failures tracked, and are corrective actions planned, implemented, and verified?",
          expectedEvidence: "• Internal audit findings\n• CAPA (Corrective Action) logs\n• Follow-up reports",
          options: [
            { text: "Not available", points: 0 },
            { text: "No tracking of failures", points: 1 },
            { text: "Basic tracking", points: 2 },
            { text: "Some tracking and actions", points: 3 },
            { text: "Good tracking and follow-up", points: 4 },
            { text: "Comprehensive tracking and verification", points: 5 }
          ]
        },
        {
          id: "q4-11",
          text: "Is control design reviewed when processes, systems, or risk profiles change?",
          expectedEvidence: "• Change management forms\n• Process review logs\n• Risk re-assessments",
          options: [
            { text: "Not available", points: 0 },
            { text: "No review on changes", points: 1 },
            { text: "Irregular review", points: 2 },
            { text: "Some review on changes", points: 3 },
            { text: "Good change review process", points: 4 },
            { text: "Comprehensive change review", points: 5 }
          ]
        },
        {
          id: "q4-12",
          text: "Are control responsibilities assigned and accepted by process/control owners?",
          expectedEvidence: "• RACI charts\n• Signed control attestations\n• Role descriptions",
          options: [
            { text: "Not available", points: 0 },
            { text: "No assigned responsibilities", points: 1 },
            { text: "Basic assignments", points: 2 },
            { text: "Some clear assignments", points: 3 },
            { text: "Good ownership structure", points: 4 },
            { text: "Comprehensive ownership", points: 5 }
          ]
        }
      ]
    },
    {
      id: "section-5",
      title: "Risk Reporting & Culture",
      questions: [
        {
          id: "q5-1",
          text: "Is there a formal risk reporting framework in place that defines frequency, format, and audience of risk reports?",
          expectedEvidence: "• Risk reporting policy or SOP\n• Reporting calendar",
          options: [
            { text: "Not available", points: 0 },
            { text: "No reporting framework", points: 1 },
            { text: "Basic reporting", points: 2 },
            { text: "Some formal reporting", points: 3 },
            { text: "Good reporting framework", points: 4 },
            { text: "Comprehensive reporting framework", points: 5 }
          ]
        },
        {
          id: "q5-2",
          text: "Are risk reports submitted periodically to senior management and/or the Board (e.g. Risk Committee, Audit Committee)?",
          expectedEvidence: "• Board/Audit Committee packs\n• EXCOM decks\n• Risk Committee minutes",
          options: [
            { text: "Not available", points: 0 },
            { text: "No periodic reports", points: 1 },
            { text: "Irregular reports", points: 2 },
            { text: "Some periodic reports", points: 3 },
            { text: "Regular reports to management", points: 4 },
            { text: "Comprehensive reporting to all levels", points: 5 }
          ]
        },
        {
          id: "q5-3",
          text: "Are reports tailored to the audience (e.g. summary for board, detailed for management, visuals for ops)?",
          expectedEvidence: "• Multiple report formats\n• Sample reports by audience",
          options: [
            { text: "Not available", points: 0 },
            { text: "No tailoring", points: 1 },
            { text: "Basic tailoring", points: 2 },
            { text: "Some tailoring", points: 3 },
            { text: "Good tailoring", points: 4 },
            { text: "Comprehensive tailoring", points: 5 }
          ]
        },
        {
          id: "q5-4",
          text: "Are key risk indicators (KRIs) or heat maps used to monitor and visualize risk exposure?",
          expectedEvidence: "• Risk dashboards\n• KRI scorecards\n• Heatmaps",
          options: [
            { text: "Not available", points: 0 },
            { text: "No KRIs or visuals", points: 1 },
            { text: "Basic indicators", points: 2 },
            { text: "Some KRIs and visuals", points: 3 },
            { text: "Good KRI framework", points: 4 },
            { text: "Comprehensive KRI and visualization", points: 5 }
          ]
        },
        {
          id: "q5-5",
          text: "Are trends in risk exposure tracked over time (e.g., historical ratings, new/emerging risks)?",
          expectedEvidence: "• Risk trend reports\n• Year-on-year comparisons\n• Historical dashboards",
          options: [
            { text: "Not available", points: 0 },
            { text: "No trend tracking", points: 1 },
            { text: "Basic trend tracking", points: 2 },
            { text: "Some trend analysis", points: 3 },
            { text: "Good trend tracking", points: 4 },
            { text: "Comprehensive trend analysis", points: 5 }
          ]
        },
        {
          id: "q5-6",
          text: "Are risk reports integrated with strategy, performance, or audit reporting to support holistic decision-making?",
          expectedEvidence: "• Integrated management reports\n• Strategy dashboards\n• Risk sections in Board KPIs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No integration", points: 1 },
            { text: "Minimal integration", points: 2 },
            { text: "Some integration", points: 3 },
            { text: "Good integration", points: 4 },
            { text: "Comprehensive integration", points: 5 }
          ]
        },
        {
          id: "q5-7",
          text: "Are risk management roles and responsibilities clearly communicated across the organization?",
          expectedEvidence: "• Risk management policy\n• Induction materials\n• Intranet resources",
          options: [
            { text: "Not available", points: 0 },
            { text: "No communication", points: 1 },
            { text: "Basic communication", points: 2 },
            { text: "Some clear communication", points: 3 },
            { text: "Good communication", points: 4 },
            { text: "Comprehensive communication", points: 5 }
          ]
        },
        {
          id: "q5-8",
          text: "Are employees trained or briefed on risk management principles relevant to their roles?",
          expectedEvidence: "• Training records\n• Awareness sessions\n• E-learning modules",
          options: [
            { text: "Not available", points: 0 },
            { text: "No training", points: 1 },
            { text: "Basic training", points: 2 },
            { text: "Some relevant training", points: 3 },
            { text: "Good training program", points: 4 },
            { text: "Comprehensive training", points: 5 }
          ]
        },
        {
          id: "q5-9",
          text: "Are senior leaders actively promoting risk culture and tone from the top?",
          expectedEvidence: "• Leadership messages\n• Townhalls / speeches\n• Risk culture KPIs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No leadership promotion", points: 1 },
            { text: "Minimal promotion", points: 2 },
            { text: "Some promotion", points: 3 },
            { text: "Active promotion", points: 4 },
            { text: "Strong leadership promotion", points: 5 }
          ]
        },
        {
          id: "q5-10",
          text: "Is risk awareness embedded in employee performance objectives, scorecards, or appraisal criteria?",
          expectedEvidence: "• HR templates\n• Performance appraisals\n• Balanced scorecards",
          options: [
            { text: "Not available", points: 0 },
            { text: "No embedding", points: 1 },
            { text: "Basic embedding", points: 2 },
            { text: "Some embedding", points: 3 },
            { text: "Good embedding", points: 4 },
            { text: "Comprehensive embedding", points: 5 }
          ]
        },
        {
          id: "q5-11",
          text: "Are channels available for employees to report concerns, raise risk issues, or suggest improvements?",
          expectedEvidence: "• Whistleblower policy\n• Anonymous feedback forms\n• Risk suggestion box / system",
          options: [
            { text: "Not available", points: 0 },
            { text: "No channels", points: 1 },
            { text: "Basic channels", points: 2 },
            { text: "Some channels", points: 3 },
            { text: "Good channels", points: 4 },
            { text: "Comprehensive channels", points: 5 }
          ]
        },
        {
          id: "q5-12",
          text: "Is risk awareness measured (e.g. surveys, feedback, incident trends)?",
          expectedEvidence: "• Survey results\n• Employee feedback\n• Risk event logs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No measurement", points: 1 },
            { text: "Basic measurement", points: 2 },
            { text: "Some measurement", points: 3 },
            { text: "Good measurement", points: 4 },
            { text: "Comprehensive measurement", points: 5 }
          ]
        }
      ]
    },
    {
      id: "section-6",
      title: "Technology & Business Continuity",
      questions: [
        {
          id: "q6-1",
          text: "Does the organization use a centralized system or software for risk management (e.g. ERM platform, GRC tool)?",
          expectedEvidence: "• System screenshots\n• Vendor contracts\n• Access logs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No centralized system", points: 1 },
            { text: "Basic spreadsheet tracking", points: 2 },
            { text: "Some system usage", points: 3 },
            { text: "Good centralized system", points: 4 },
            { text: "Advanced ERM platform", points: 5 }
          ]
        },
        {
          id: "q6-2",
          text: "Does the system cover key processes (risk identification, assessment, treatment, monitoring, reporting)?",
          expectedEvidence: "• System workflow\n• Functional specifications\n• Sample reports",
          options: [
            { text: "Not available", points: 0 },
            { text: "No coverage", points: 1 },
            { text: "Basic coverage", points: 2 },
            { text: "Some processes covered", points: 3 },
            { text: "Most processes covered", points: 4 },
            { text: "Comprehensive coverage", points: 5 }
          ]
        },
        {
          id: "q6-3",
          text: "Is the risk system integrated with other enterprise systems (e.g. finance, audit, compliance, HR)?",
          expectedEvidence: "• Integration diagrams\n• API documentation\n• Data sync reports",
          options: [
            { text: "Not available", points: 0 },
            { text: "No integration", points: 1 },
            { text: "Basic integration", points: 2 },
            { text: "Some integration", points: 3 },
            { text: "Good integration", points: 4 },
            { text: "Comprehensive integration", points: 5 }
          ]
        },
        {
          id: "q6-4",
          text: "Are risk dashboards and analytics generated automatically within the system?",
          expectedEvidence: "• Dashboard screenshots\n• Reports with timestamps\n• Alert settings",
          options: [
            { text: "Not available", points: 0 },
            { text: "No automation", points: 1 },
            { text: "Basic automation", points: 2 },
            { text: "Some automated dashboards", points: 3 },
            { text: "Good automation", points: 4 },
            { text: "Comprehensive automation", points: 5 }
          ]
        },
        {
          id: "q6-5",
          text: "Is user access and data security for the risk system well-defined and enforced?",
          expectedEvidence: "• Access control matrix\n• User logs\n• Security audit reports",
          options: [
            { text: "Not available", points: 0 },
            { text: "No access controls", points: 1 },
            { text: "Basic access controls", points: 2 },
            { text: "Some access controls", points: 3 },
            { text: "Good access controls", points: 4 },
            { text: "Comprehensive security", points: 5 }
          ]
        },
        {
          id: "q6-6",
          text: "Is the system regularly updated and supported (vendor patches, upgrades, maintenance)?",
          expectedEvidence: "• Change logs\n• IT support tickets\n• Vendor SLAs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No regular updates", points: 1 },
            { text: "Irregular updates", points: 2 },
            { text: "Some regular updates", points: 3 },
            { text: "Good update process", points: 4 },
            { text: "Comprehensive maintenance", points: 5 }
          ]
        },
        {
          id: "q6-7",
          text: "Are there defined standards for risk data accuracy, completeness, and timeliness?",
          expectedEvidence: "• Data quality policy\n• Risk data guidelines\n• SOPs",
          options: [
            { text: "Not available", points: 0 },
            { text: "No standards", points: 1 },
            { text: "Basic standards", points: 2 },
            { text: "Some defined standards", points: 3 },
            { text: "Good standards", points: 4 },
            { text: "Comprehensive standards", points: 5 }
          ]
        },
        {
          id: "q6-8",
          text: "Is risk data subject to validation, review, or approval before inclusion in dashboards or reports?",
          expectedEvidence: "• Review logs\n• Approval workflows\n• Dashboard version history",
          options: [
            { text: "Not available", points: 0 },
            { text: "No validation", points: 1 },
            { text: "Basic validation", points: 2 },
            { text: "Some validation", points: 3 },
            { text: "Good validation process", points: 4 },
            { text: "Comprehensive validation", points: 5 }
          ]
        },
        {
          id: "q6-9",
          text: "Are responsibilities for risk data ownership and stewardship clearly assigned across departments?",
          expectedEvidence: "• RACI matrices\n• Role descriptions\n• Governance committee charters",
          options: [
            { text: "Not available", points: 0 },
            { text: "No assignments", points: 1 },
            { text: "Basic assignments", points: 2 },
            { text: "Some clear assignments", points: 3 },
            { text: "Good ownership structure", points: 4 },
            { text: "Comprehensive stewardship", points: 5 }
          ]
        },
        {
          id: "q6-10",
          text: "Is there a formal process to correct or update outdated or inaccurate risk data?",
          expectedEvidence: "• Data correction logs\n• Revision protocols\n• Audit trails",
          options: [
            { text: "Not available", points: 0 },
            { text: "No correction process", points: 1 },
            { text: "Basic correction", points: 2 },
            { text: "Some formal process", points: 3 },
            { text: "Good correction process", points: 4 },
            { text: "Comprehensive correction", points: 5 }
          ]
        },
        {
          id: "q6-11",
          text: "Is data from subsidiaries or business units consolidated and standardized at the group level?",
          expectedEvidence: "• Group risk reports\n• Consolidation rules\n• Group-wide templates",
          options: [
            { text: "Not available", points: 0 },
            { text: "No consolidation", points: 1 },
            { text: "Basic consolidation", points: 2 },
            { text: "Some consolidation", points: 3 },
            { text: "Good consolidation", points: 4 },
            { text: "Comprehensive consolidation", points: 5 }
          ]
        },
        {
          id: "q6-12",
          text: "Are data quality metrics or KPIs tracked (e.g., error rates, stale records, missing fields)?",
          expectedEvidence: "• Quality scorecards\n• Exception reports\n• Dashboard metrics",
          options: [
            { text: "Not available", points: 0 },
            { text: "No quality metrics", points: 1 },
            { text: "Basic metrics", points: 2 },
            { text: "Some quality tracking", points: 3 },
            { text: "Good quality metrics", points: 4 },
            { text: "Comprehensive quality tracking", points: 5 }
          ]
        },
        {
          id: "q6-13",
          text: "Does the company have a formal Business Continuity Plan (BCP)?",
          expectedEvidence: "• Approved BCP document\n• BCP testing schedule\n• Business impact analysis (BIA)",
          options: [
            { text: "Not available", points: 0 },
            { text: "No BCP exists", points: 1 },
            { text: "Basic BCP draft", points: 2 },
            { text: "BCP exists but not tested", points: 3 },
            { text: "BCP exists and occasionally tested", points: 4 },
            { text: "Comprehensive BCP with regular testing", points: 5 }
          ]
        },
        {
          id: "q6-14",
          text: "Are incident response and crisis management procedures in place and tested?",
          expectedEvidence: "• Incident response manual\n• Crisis management test reports\n• Tabletop or simulation records",
          options: [
            { text: "Not available", points: 0 },
            { text: "No procedures", points: 1 },
            { text: "Basic procedures", points: 2 },
            { text: "Procedures exist but not tested", points: 3 },
            { text: "Procedures tested occasionally", points: 4 },
            { text: "Comprehensive procedures with regular testing", points: 5 }
          ]
        }
      ]
    }
  ]
} 