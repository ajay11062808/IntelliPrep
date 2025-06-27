import { useNotes } from "./useNotes"

export function useIntelliPrepIntegration() {
  const { addInterviewNote } = useNotes()

  // This function should be called from your IntelliPrep tab
  // when an interview session is completed
  const saveInterviewToNotes = async (
    interviewId: string,
    interviewTranscript: string,
    interviewTitle?: string,
    additionalTags: string[] = [],
  ) => {
    const title = interviewTitle || `Interview Session - ${new Date().toLocaleDateString()}`

    // Format the interview content
    const formattedContent = `
# Interview Session

**Date:** ${new Date().toLocaleString()}
**Session ID:** ${interviewId}

## Interview Transcript

${interviewTranscript}

---
*This note was automatically generated from an IntelliPrep interview session.*
    `.trim()

    try {
      await addInterviewNote(interviewId, formattedContent, title)
      return true
    } catch (error) {
      console.error("Failed to save interview to notes:", error)
      return false
    }
  }

  // Function to add quick notes during interview
  const addQuickInterviewNote = async (interviewId: string, noteContent: string, noteTitle?: string) => {
    const title = noteTitle || `Quick Note - Interview ${interviewId}`

    try {
      await addInterviewNote(interviewId, noteContent, title)
      return true
    } catch (error) {
      console.error("Failed to add quick interview note:", error)
      return false
    }
  }

  return {
    saveInterviewToNotes,
    addQuickInterviewNote,
  }
}
