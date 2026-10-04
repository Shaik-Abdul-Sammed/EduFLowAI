/**
 * NIRF Insights Services
 * Provides explain, predict, benchmark, improve, and NAAC-correlation analytics for NIRF.
 */

import { NirfScoreCalculator } from './nirfScoreCalculator.js'
import { NirfRepository } from '../../models/NirfRepository.js'
import { PEER_INSTITUTIONS } from '../../../scripts/seed-nirf-data.js'
import { createAIProvider } from '../../ai/providers/providerFactory.js'
import { logger } from '../../utils/logger.js'

function safeParseJson(text, fallback = null) {
  if (!text || typeof text !== 'string') return fallback
  try {
    return JSON.parse(text)
  } catch {}
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (match) {
    try {
      return JSON.parse(match[1])
    } catch {}
  }
  return fallback
}

export class NirfInsights {
  /**
   * Function 1: explainScore(institutionId, parameter)
   * Analyzes why the institution scored low or high in a specific parameter.
   */
  static async explainScore(institutionId = 1, parameter = 'RP') {
    const paramKey = (parameter || 'RP').toUpperCase()
    const scoreData = await NirfScoreCalculator.calculateNirfScore(institutionId, 'Engineering')
    const currentParam = scoreData.parameterScores[paramKey] || scoreData.parameterScores.RP

    // Peer average calculation for parameter
    let peers = await NirfRepository.getPeerInstitutions({ category: 'Engineering', limit: 50 })
    if (!peers || peers.length === 0) peers = PEER_INSTITUTIONS

    const fieldMap = {
      TLR: 'tlr_score',
      RP: 'rp_score',
      GO: 'go_score',
      OI: 'oi_score',
      PR: 'pr_score',
    }
    const prop = fieldMap[paramKey] || 'rp_score'
    const peerScores = peers.map((p) => Number(p[prop] || p[paramKey.toLowerCase() + 'Score'] || 70)).filter((v) => !isNaN(v))
    const peerAvg = peerScores.length ? Number((peerScores.reduce((a, b) => a + b, 0) / peerScores.length).toFixed(2)) : 72.5

    const scoreGap = Number((peerAvg - currentParam.score).toFixed(2))

    // Root causes and fixes mapping
    const analysisTemplates = {
      TLR: {
        rootCauses: [
          'Faculty-to-Student Ratio (FSR) is 1:21, exceeding the optimal NIRF guideline of 1:15.',
          'Doctoral faculty proportion is 47%, trailing tier-1 benchmark institutions (75%+).',
          'Annual capital expenditure on modern laboratories and library resources under-utilized.',
        ],
        contributingMetrics: [
          { name: 'Student Strength (SS)', score: currentParam.subMetrics?.SS || 72, benchmark: 82 },
          { name: 'Faculty-Student Ratio (FSR)', score: currentParam.subMetrics?.FSR || 68, benchmark: 85 },
          { name: 'Faculty with PhD (FQE)', score: currentParam.subMetrics?.FQE || 64, benchmark: 80 },
          { name: 'Financial Resources (FRU)', score: currentParam.subMetrics?.FRU || 70, benchmark: 78 },
        ],
        quickFixes: [
          'Recruit 12 regular PhD faculty across core departments to bring FSR under 1:18.',
          'Incentivize currently enrolled faculty to complete and submit PhD dissertations within 12 months.',
          'Reallocate annual departmental lab modernization funds to high-demand computing infrastructure.',
        ],
      },
      RP: {
        rootCauses: [
          'Scopus/Web of Science indexed publication output per faculty stands at 1.4 papers/year versus peer average of 3.8.',
          'Low citation density in international high-impact quartile 1 (Q1) journals.',
          'Under-realized IPR conversion: 12 patents filed but zero commercial tech transfer licensing agreements.',
        ],
        contributingMetrics: [
          { name: 'Publications (PU)', score: currentParam.subMetrics?.PU || 58, benchmark: 76 },
          { name: 'Quality of Publications (QP)', score: currentParam.subMetrics?.QP || 62, benchmark: 80 },
          { name: 'Patents Granted (IPR)', score: currentParam.subMetrics?.IPR || 54, benchmark: 72 },
          { name: 'Sponsored Projects (FPPP)', score: currentParam.subMetrics?.FPPP || 60, benchmark: 74 },
        ],
        quickFixes: [
          'Launch institutional Seed Grant Scheme (₹50,000–₹2,00,000) for interdisciplinary research papers.',
          'Establish a dedicated IPR & Technology Transfer Cell to fast-track patent examinations and grants.',
          'Form research cluster pods targeting DST, SERB, and AICTE sponsored research grants.',
        ],
      },
      GO: {
        rootCauses: [
          'Median placement package is ₹6.5 LPA compared to top 50 peer average of ₹9.2 LPA.',
          'Limited documented progression to premier global master’s and doctoral programs.',
          'Backlog clearance delays in 3rd-year engineering mathematics impacting graduation on-time percentage.',
        ],
        contributingMetrics: [
          { name: 'Placement & Higher Studies (GPH)', score: currentParam.subMetrics?.GPH || 75, benchmark: 85 },
          { name: 'University Examinations (GUE)', score: currentParam.subMetrics?.GUE || 78, benchmark: 88 },
          { name: 'Median Salary (GMS)', score: currentParam.subMetrics?.GMS || 68, benchmark: 82 },
          { name: 'PhD Graduated (GPHD)', score: currentParam.subMetrics?.GPHD || 60, benchmark: 75 },
        ],
        quickFixes: [
          'Conduct specialized product-company coding bootcamps to elevate top-tier placement offers.',
          'Implement early remedial tutorials in semesters 3 and 4 to boost exam pass percentages.',
          'Partner with alumni in premier universities for structured GRE/GATE counseling cohorts.',
        ],
      },
      OI: {
        rootCauses: [
          'Other-state student enrollment is currently 18%, limiting regional diversity scoring.',
          'Female student enrollment in mechanical and civil branches is under 22%.',
          'Dedicated ramp/elevator physical accessibility across older academic blocks requires completion.',
        ],
        contributingMetrics: [
          { name: 'Regional Diversity (RD)', score: currentParam.subMetrics?.RD || 62, benchmark: 78 },
          { name: 'Women Diversity (WD)', score: currentParam.subMetrics?.WD || 66, benchmark: 78 },
          { name: 'Economically Challenged (ESCS)', score: currentParam.subMetrics?.ESCS || 72, benchmark: 75 },
          { name: 'Physically Challenged (PCS)', score: currentParam.subMetrics?.PCS || 70, benchmark: 82 },
        ],
        quickFixes: [
          'Establish national entrance exam (JEE Main) outreach counseling camps in neighboring states.',
          'Institute a "Women in STEM" tuition waiver fellowship to raise female student ratios to 40%.',
          'Complete tactile paving, ramps, and elevator retrofitting across all academic blocks.',
        ],
      },
      PR: {
        rootCauses: [
          'Employer perception survey participation among non-IT corporate recruiters is limited.',
          'Academic peer visibility outside home state is low due to infrequent national conference hosting.',
          'Alumni achievements and entrepreneurial startups under-promoted in national media.',
        ],
        contributingMetrics: [
          { name: 'Academic Peer Perception', score: 64, benchmark: 78 },
          { name: 'Employer Survey Index', score: 66, benchmark: 82 },
        ],
        quickFixes: [
          'Engage 50 key national recruiters with annual HR conclave and NIRF perception survey participation.',
          'Host 2 IEEE/Springer international conferences per academic year.',
          'Launch a quarterly digital newsletter highlighting faculty research breakthroughs to academic deans nationwide.',
        ],
      },
    }

    const template = analysisTemplates[paramKey] || analysisTemplates.RP

    return {
      success: true,
      parameter: paramKey,
      parameterName: currentParam.name || paramKey,
      currentScore: currentParam.score,
      peerAverage: peerAvg,
      scoreGap: scoreGap > 0 ? `-${scoreGap}` : `+${Math.abs(scoreGap)}`,
      summary: `In ${currentParam.name || paramKey}, the institution scored ${currentParam.score} (peer average: ${peerAvg}). ${scoreGap > 0 ? `There is an opportunity gap of ${scoreGap} points to bridge.` : 'The institution outperforms the peer cohort average.'}`,
      rootCauses: template.rootCauses,
      contributingMetrics: template.contributingMetrics,
      comparisonToPeerAverage: {
        institutionScore: currentParam.score,
        peerAverage: peerAvg,
        percentile: currentParam.score >= peerAvg ? '68th Percentile' : '42nd Percentile',
      },
      quickFixes: template.quickFixes,
    }
  }

  /**
   * Function 2: predictRank(institutionId, category, monthsAhead)
   * Forecasts the institution's NIRF rank if current trajectory continues.
   */
  static async predictRank(institutionId = 1, category = 'Engineering', monthsAhead = 12) {
    const scoreData = await NirfScoreCalculator.calculateNirfScore(institutionId, category)
    const currentRank = scoreData.predictedRank
    const totalScore = scoreData.totalScore

    let peers = await NirfRepository.getPeerInstitutions({ category, limit: 100 })
    if (!peers || peers.length === 0) peers = PEER_INSTITUTIONS

    // Trajectory prediction: assuming 3.5% score improvement per year from active IQAC interventions
    const annualGrowth = 0.035
    const monthsFraction = Math.max(monthsAhead, 3) / 12
    const projectedScore = Number((totalScore * (1 + annualGrowth * monthsFraction)).toFixed(2))

    // Count peers with higher total score than projectedScore
    const peersAheadProjected = peers.filter((p) => Number(p.totalScore || p.total_score) > projectedScore)
    const projectedRank = Math.max(peersAheadProjected.length + 1, 1)

    // Find likely peers to overtake (peers currently rank currentRank - 5 to currentRank - 1)
    const sortedPeers = [...peers].sort((a, b) => Number(a.nirf_rank || a.nirfRank) - Number(b.nirf_rank || b.nirfRank))
    const likelyPeersToOvertake = sortedPeers
      .filter((p) => {
        const r = Number(p.nirf_rank || p.nirfRank)
        return r < currentRank && r >= projectedRank
      })
      .slice(0, 3)
      .map((p) => ({
        name: p.name,
        currentRank: p.nirf_rank || p.nirfRank,
        totalScore: p.total_score || p.totalScore,
        gapPoints: Number((Number(p.total_score || p.totalScore) - totalScore).toFixed(2)),
      }))

    // Peers that might overtake if institution stagnates
    const peersLikelyToOvertake = sortedPeers
      .filter((p) => {
        const r = Number(p.nirf_rank || p.nirfRank)
        return r > currentRank && r <= currentRank + 4
      })
      .slice(0, 3)
      .map((p) => ({
        name: p.name,
        currentRank: p.nirf_rank || p.nirfRank,
        totalScore: p.total_score || p.totalScore,
        bufferPoints: Number((totalScore - Number(p.total_score || p.totalScore)).toFixed(2)),
      }))

    return {
      success: true,
      category,
      currentScore: totalScore,
      projectedScore,
      currentRank,
      predictedRank: projectedRank,
      monthsAhead,
      confidence: 0.89,
      trajectory: projectedRank < currentRank ? 'UPWARD' : 'STABLE',
      summary: `Over a ${monthsAhead}-month horizon, projected total score increases from ${totalScore} to ${projectedScore}, advancing the predicted NIRF rank from #${currentRank} to #${projectedRank}.`,
      likelyPeersToOvertake,
      peersLikelyToOvertake,
    }
  }

  /**
   * Function 3: benchmarkAgainstPeers(institutionId, category, topN)
   * Compares the institution to the top N peers.
   */
  static async benchmarkAgainstPeers(institutionId = 1, category = 'Engineering', topN = 10) {
    const scoreData = await NirfScoreCalculator.calculateNirfScore(institutionId, category)
    const currentRank = scoreData.predictedRank
    const totalScore = scoreData.totalScore

    let peers = await NirfRepository.getPeerInstitutions({ category, limit: 100 })
    if (!peers || peers.length === 0) peers = PEER_INSTITUTIONS

    const sortedPeers = [...peers].sort((a, b) => Number(a.nirf_rank || a.nirfRank) - Number(b.nirf_rank || b.nirfRank))
    const topPeers = sortedPeers.slice(0, topN).map((p) => ({
      rank: p.nirf_rank || p.nirfRank,
      name: p.name,
      totalScore: Number(p.total_score || p.totalScore),
      tlrScore: Number(p.tlr_score || p.tlrScore),
      rpScore: Number(p.rp_score || p.rpScore),
      goScore: Number(p.go_score || p.goScore),
      oiScore: Number(p.oi_score || p.oiScore),
      prScore: Number(p.pr_score || p.prScore),
      naacGrade: p.naac_grade || p.naacGrade,
      institutionType: p.institution_type || p.institutionType,
    }))

    const peersAhead = sortedPeers.filter((p) => Number(p.nirf_rank || p.nirfRank) < currentRank).length
    const peersBehind = sortedPeers.filter((p) => Number(p.nirf_rank || p.nirfRank) > currentRank).length

    // Gap analysis against top-tier benchmark average
    const topTierAvgTLR = Number((topPeers.reduce((s, p) => s + p.tlrScore, 0) / topPeers.length).toFixed(2))
    const topTierAvgRP = Number((topPeers.reduce((s, p) => s + p.rpScore, 0) / topPeers.length).toFixed(2))
    const topTierAvgGO = Number((topPeers.reduce((s, p) => s + p.goScore, 0) / topPeers.length).toFixed(2))
    const topTierAvgOI = Number((topPeers.reduce((s, p) => s + p.oiScore, 0) / topPeers.length).toFixed(2))
    const topTierAvgPR = Number((topPeers.reduce((s, p) => s + p.prScore, 0) / topPeers.length).toFixed(2))
    const topTierAvgTotal = Number((topPeers.reduce((s, p) => s + p.totalScore, 0) / topPeers.length).toFixed(2))

    const gapAnalysis = {
      TLR: Number((topTierAvgTLR - scoreData.parameterScores.TLR.score).toFixed(2)),
      RP: Number((topTierAvgRP - scoreData.parameterScores.RP.score).toFixed(2)),
      GO: Number((topTierAvgGO - scoreData.parameterScores.GO.score).toFixed(2)),
      OI: Number((topTierAvgOI - scoreData.parameterScores.OI.score).toFixed(2)),
      PR: Number((topTierAvgPR - scoreData.parameterScores.PR.score).toFixed(2)),
      totalGap: Number((topTierAvgTotal - totalScore).toFixed(2)),
    }

    const strengthAreas = [
      'Graduation Outcomes (GO) demonstrates robust placement volume with 80%+ corporate conversion.',
      'Outreach & Inclusivity (OI) exhibits strong socio-economic inclusion and reservation compliance.',
    ]

    const weaknessAreas = [
      'Research & Professional Practice (RP) presents the widest gap (-' + gapAnalysis.RP + ' pts) versus tier-1 benchmarks.',
      'Perception (PR) score is constrained by regional branding compared to multi-campus universities.',
    ]

    const recommendations = [
      'Institute mandatory Scopus publication targets for all Associate and Full Professors.',
      'Establish corporate co-sponsored incubation centers to enhance Employer Perception scores.',
      'Form consortium alliances with NITs for student joint research internships.',
    ]

    // Save benchmark report
    await NirfRepository.saveBenchmarkReport({
      institutionId,
      category,
      reportData: { institutionRank: currentRank, totalScore, parameterScores: scoreData.parameterScores },
      peerComparison: { topPeers, peersAhead, peersBehind },
      gapAnalysis,
      recommendations,
    })

    return {
      success: true,
      category,
      institutionRank: currentRank,
      institutionScore: totalScore,
      peersAhead,
      peersBehind,
      topPeers,
      gapAnalysis,
      strengthAreas,
      weaknessAreas,
      recommendations,
    }
  }

  /**
   * Function 4: improveRank(institutionId, targetRank, category)
   * Generates an improvement plan to reach a target NIRF rank.
   */
  static async improveRank(institutionId = 1, targetRank = 50, category = 'Engineering') {
    const scoreData = await NirfScoreCalculator.calculateNirfScore(institutionId, category)
    const currentRank = scoreData.predictedRank
    const currentScore = scoreData.totalScore

    let peers = await NirfRepository.getPeerInstitutions({ category, limit: 100 })
    if (!peers || peers.length === 0) peers = PEER_INSTITUTIONS

    // Find peer at or near the target rank
    const sortedPeers = [...peers].sort((a, b) => Number(a.nirf_rank || a.nirfRank) - Number(b.nirf_rank || b.nirfRank))
    const targetPeer = sortedPeers.find((p) => Number(p.nirf_rank || p.nirfRank) <= targetRank) || sortedPeers[0]
    const targetScore = Number(targetPeer?.total_score || targetPeer?.totalScore || 78.50)

    const gap = Number(Math.max(targetScore - currentScore, 1.5).toFixed(2))
    const timelineMonths = targetRank <= 25 ? 24 : targetRank <= 50 ? 18 : 12

    const priorityParameters = [
      {
        parameter: 'RP',
        name: 'Research and Professional Practice',
        currentScore: scoreData.parameterScores.RP.score,
        targetScore: Number((scoreData.parameterScores.RP.score + gap * 0.45).toFixed(2)),
        weight: 0.30,
        potentialScoreGain: Number((gap * 0.45 * 0.30).toFixed(2)),
      },
      {
        parameter: 'TLR',
        name: 'Teaching, Learning and Resources',
        currentScore: scoreData.parameterScores.TLR.score,
        targetScore: Number((scoreData.parameterScores.TLR.score + gap * 0.25).toFixed(2)),
        weight: 0.30,
        potentialScoreGain: Number((gap * 0.25 * 0.30).toFixed(2)),
      },
      {
        parameter: 'PR',
        name: 'Perception',
        currentScore: scoreData.parameterScores.PR.score,
        targetScore: Number((scoreData.parameterScores.PR.score + gap * 0.20).toFixed(2)),
        weight: 0.10,
        potentialScoreGain: Number((gap * 0.20 * 0.10).toFixed(2)),
      },
    ]

    const quickWins = [
      'Submit 15 pending patents for early publication to immediately boost the IPR sub-metric (+1.8 pts RP).',
      'Register all existing faculty in Google Scholar, ORCID, and Scopus to capture uncited historical publications (+1.2 pts PU).',
      'Update barrier-free accessibility documentation in NIRF data capture portal for PCS compliance (+2.0 pts OI).',
    ]

    const mediumTerm = [
      'Recruit 8 PhD-qualified faculty in Computer Science & AI to optimize Faculty-Student Ratio to 1:16 (+3.5 pts TLR).',
      'Launch ₹25 Lakhs Internal Research Grant fund for Q1 journal publication processing charges (+4.2 pts QP).',
      'Organize National Employer Summit to register 75 recruiters for the NIRF Perception survey (+5.0 pts PR).',
    ]

    const longTerm = [
      'Establish two Centers of Excellence (AI/Robotics & Green Energy) attracting sponsored industry funding (+6.0 pts FPPP).',
      'Elevate median placement packages from ₹6.5 LPA to ₹8.5 LPA through premium product firm recruitment (+4.5 pts GO).',
      'Institute international dual-degree exchange programs to increase regional & international diversity (+3.8 pts OI).',
    ]

    // Save improvement plan
    await NirfRepository.saveImprovementPlan({
      institutionId,
      currentScore,
      targetScore,
      targetRank,
      actionItems: { quickWins, mediumTerm, longTerm },
      timelineMonths,
      estimatedEffort: targetRank <= 25 ? 'High (24 Months)' : 'Medium (12-18 Months)',
    })

    return {
      success: true,
      category,
      currentRank,
      targetRank,
      currentScore,
      targetScore,
      gap,
      priorityParameters,
      quickWins,
      mediumTerm,
      longTerm,
      timelineMonths,
      estimatedEffort: targetRank <= 25 ? 'High' : 'Medium',
    }
  }

  /**
   * Function 5: compareNaacToNirf(institutionId)
   * Analyzes correlation between the institution's NAAC grade and NIRF rank.
   */
  static async compareNaacToNirf(institutionId = 1) {
    const scoreData = await NirfScoreCalculator.calculateNirfScore(institutionId, 'Engineering')
    const nirfRank = scoreData.predictedRank

    // Demo institution NAAC benchmark: Sri Sudha Institute of Technology holds NAAC A+ (CGPA ~3.42)
    const naacGrade = 'A+'
    const naacCgpa = 3.42

    // Benchmark expectations:
    // NAAC A++ (3.51 - 4.00) -> Expected NIRF: Rank 1 - 50
    // NAAC A+  (3.26 - 3.50) -> Expected NIRF: Rank 35 - 85
    // NAAC A   (3.01 - 3.25) -> Expected NIRF: Rank 70 - 130
    // NAAC B++ (2.76 - 3.00) -> Expected NIRF: Rank 120 - 200
    const expectedNirfForGrade = 'Rank 35 - 85'
    const isWithinExpectedRange = nirfRank >= 35 && nirfRank <= 95

    const explanation =
      'NAAC evaluates institutional quality across 7 criteria with significant emphasis on curricular aspects, governance, student support, and internal quality assurance (IQAC processes). In contrast, NIRF heavily weights research impact (RP: 30%), publications, citations, and national peer perception (PR: 10%). While Sri Sudha Institute excels in teaching operations, NAAC processes, and student success (achieving Grade A+), its NIRF rank (' +
      nirfRank +
      ') is primarily constrained by research publication density in Scopus journals and corporate perception surveys outside the immediate regional belt.'

    return {
      success: true,
      institutionId,
      naacGrade,
      naacCgpa,
      nirfRank,
      expectedNirfForGrade,
      actualVsExpected: isWithinExpectedRange ? 'ALIGNED' : nirfRank < 35 ? 'OUTPERFORMING' : 'RESEARCH_LAG',
      alignmentScore: 84,
      explanation,
      keyDifferences: [
        {
          dimension: 'Evaluation Focus',
          naac: 'Holistic institutional processes, teaching-learning, student support, and continuous IQAC improvement.',
          nirf: 'Quantitative research output, Scopus citations, patent grants, and national employer perception.',
        },
        {
          dimension: 'Research Weightage',
          naac: 'Criterion 3 accounts for ~15% to 25% of overall score.',
          nirf: 'Research & Professional Practice (RP) accounts for 30% of total score.',
        },
        {
          dimension: 'Perception Factor',
          naac: 'Peer team on-site physical visit validation.',
          nirf: 'Online national survey among academic peers and industry employers (10%).',
        },
      ],
    }
  }
}

export default NirfInsights
