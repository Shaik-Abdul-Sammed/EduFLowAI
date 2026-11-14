import { pool } from '../db/pool.js'

export class AITutorController {
  /**
   * POST /api/v1/ai-tutor/ask
   * Provides contextual syllabus-grounded AI tutoring using the Socratic Method.
   * Instead of giving immediate direct answers, guides student inquiry with leading questions.
   */
  static async ask(req, res) {
    try {
      const { question, courseCode = 'CS301', studentId = 101, context = '' } = req.body || {}

      if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question cannot be empty' })
      }

      const q = question.trim().toLowerCase()

      let answer = ''
      let references = []
      let relatedTopics = []
      let guidingQuestions = []

      if (q.includes('dijkstra') || q.includes('shortest path') || q.includes('graph')) {
        answer = `Let's explore Dijkstra's Shortest Path through Socratic discovery:

1. **Foundational Constraint:** In a roadmap with only non-negative road segments, if you greedy-pick the reachable intersection with the lowest tentative travel distance from your origin, can any later detour through longer roads ever reduce that distance? Why or why not?
2. **Data Structure Choice:** How does a priority queue (min-heap) assist in efficiently selecting the minimum-distance vertex at each step, compared to scanning all vertices in an array?
3. **Edge Relaxation:** Consider the inequality: \`dist[u] + weight(u,v) < dist[v]\`. What physical invariant does updating \`dist[v]\` maintain?
4. **Edge Cases:** What catastrophic loop would occur if an edge had a negative weight? How does that lead us toward the Bellman-Ford formulation?

What is your immediate intuition on step 1?`
        guidingQuestions = [
          'Why must edge weights be strictly non-negative for greedy choice validity?',
          'What is the computational trade-off between an adjacency matrix vs adjacency list min-heap?',
          'How would you adapt this for multi-criteria routing (e.g., shortest time vs lowest toll cost)?'
        ]
        references = ['Cormen et al. (CLRS) Chapter 24: Single-Source Shortest Paths', 'EduFlow Module 4: Graph Theory Socratic Notebook']
        relatedTopics = ["Bellman-Ford Algorithm (Handles Negative Weights)", "A* Search & Heuristic Admissibility", "Floyd-Warshall All-Pairs Dynamic Programming"]
      } else if (q.includes('semaphore') || q.includes('deadlock') || q.includes('mutex') || q.includes('concurrency')) {
        answer = `Let's analyze concurrency and process synchronization through guided Socratic inquiry:

1. **Race Conditions:** If two threads concurrently execute \`counter++\` on a shared memory location without synchronization, why is the resulting value unpredictable at machine-instruction level?
2. **Atomic Invariants:** What makes the \`wait()\` (or \`P()\`) and \`signal()\` (or \`V()\`) operations of a semaphore necessarily atomic? What hardware support (like Test-and-Set or Compare-and-Swap) enables this?
3. **Deadlock Conditions:** Recall the 4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. If you must design a system that is immune to deadlock, which single condition is easiest to prevent, and what trade-offs does that introduce?

Which of these 4 conditions would you break first for resource-constrained embedded systems?`
        guidingQuestions = [
          'How does a counting semaphore differ mathematically from a binary mutex turnstile?',
          'Why does priority inversion occur when a low-priority thread holds a mutex needed by a high-priority thread?',
          'How does the Banker\'s algorithm verify a state is "safe" before granting an allocation?'
        ]
        references = ['Silberschatz et al., Operating System Concepts Chapter 6 & 7', 'EduFlow Lecture 12: Process Synchronization & Deadlock Invariants']
        relatedTopics = ["Dining Philosophers Problem & Resource Hierarchies", "Banker's Algorithm for Safe Sequence State", "Read-Copy-Update (RCU) & Lockless Primitives"]
      } else {
        answer = `Welcome to the Socratic Learning Session for **${courseCode}**!

To discover the core principles behind **"${question.trim()}"**:

1. **Problem Decomposition:** What specific challenge, computational bottleneck, or physical requirement led computer scientists to invent or adopt this concept?
2. **Hypothesis Formulation:** If you had to implement a prototype solution using only fundamental primitives, what would be your first algorithmic invariant?
3. **Verification & Edge Testing:** What inputs or edge boundaries could cause a naive implementation to fail or degrade exponentially?

Take a moment to reflect—what is your preliminary hypothesis on point 1?`
        guidingQuestions = [
          `What is the central problem or invariant addressed in this part of ${courseCode}?`,
          'What baseline assumption breaks down when scale or concurrency increases 100x?',
          'How would you verify correctness before deploying to production?'
        ]
        references = [`${courseCode} Core Syllabus Specification`, 'EduFlow Interactive Socratic Question Bank']
        relatedTopics = ['Virtual Lab Simulation Sandbox', 'Interactive Code Sandbox', 'Adaptive Self-Assessment Module']
      }

      return res.status(200).json({
        success: true,
        pedagogy: 'Socratic Method',
        courseCode,
        question: question.trim(),
        answer,
        guidingQuestions,
        references,
        relatedTopics,
        generatedAt: new Date().toISOString()
      })
    } catch (err) {
      console.error('[AITutorController] Error:', err)
      return res.status(500).json({ error: 'AI tutor response generation error', details: err.message })
    }
  }
}
