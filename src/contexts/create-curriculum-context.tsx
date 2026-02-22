import * as React from 'react'
import type {
  Curriculum,
  CurriculumParameters,
  AdvancedOptions,
} from '@/types/curriculum'

export interface CreateCurriculumState {
  prompt: string
  params: CurriculumParameters
  advancedOptions: AdvancedOptions
  contextChips: { key: string; label: string }[]
  draftSaved: boolean
  curriculum: Curriculum | null
  jobId: string | null
  jobStatus: 'idle' | 'queued' | 'running' | 'succeeded' | 'failed'
  progressMessages: string[]
  error: string | null
}

const defaultParams: CurriculumParameters = {
  session_length_minutes: 30,
  duration_weeks: 4,
  depth: 50,
  focus_tags: [],
  prior_knowledge: 'beginner',
  advanced_options: {
    citation_style: 'apa',
    image_style: ['map', 'diagram', 'photo'],
    image_license: 'open-license',
    language_register: 'plain',
    include_assessments: true,
  },
}

const defaultAdvanced: AdvancedOptions = {
  citation_style: 'apa',
  image_style: ['map', 'diagram', 'photo'],
  image_license: 'open-license',
  language_register: 'plain',
  include_assessments: true,
}

const initialState: CreateCurriculumState = {
  prompt: '',
  params: defaultParams,
  advancedOptions: defaultAdvanced,
  contextChips: [],
  draftSaved: false,
  curriculum: null,
  jobId: null,
  jobStatus: 'idle',
  progressMessages: [],
  error: null,
}

type CreateCurriculumAction =
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_PARAMS'; payload: Partial<CurriculumParameters> }
  | { type: 'SET_ADVANCED'; payload: Partial<AdvancedOptions> }
  | { type: 'ADD_CONTEXT_CHIP'; payload: { key: string; label: string } }
  | { type: 'REMOVE_CONTEXT_CHIP'; payload: string }
  | { type: 'SET_DRAFT_SAVED'; payload: boolean }
  | { type: 'START_GENERATION'; payload: { jobId: string } }
  | { type: 'GENERATION_PROGRESS'; payload: string }
  | { type: 'GENERATION_SUCCESS'; payload: Curriculum }
  | { type: 'GENERATION_FAILED'; payload: string }
  | { type: 'SET_CURRICULUM'; payload: Curriculum | null }
  | { type: 'RESET' }

function reducer(state: CreateCurriculumState, action: CreateCurriculumAction): CreateCurriculumState {
  switch (action.type) {
    case 'SET_PROMPT':
      return { ...state, prompt: action.payload }
    case 'SET_PARAMS':
      return { ...state, params: { ...state.params, ...action.payload } }
    case 'SET_ADVANCED':
      return {
        ...state,
        advancedOptions: { ...state.advancedOptions, ...action.payload },
        params: {
          ...state.params,
          advanced_options: { ...state.params.advanced_options, ...action.payload },
        },
      }
    case 'ADD_CONTEXT_CHIP':
      if (state.contextChips.some((c) => c.key === action.payload.key)) return state
      return { ...state, contextChips: [...state.contextChips, action.payload] }
    case 'REMOVE_CONTEXT_CHIP':
      return { ...state, contextChips: state.contextChips.filter((c) => c.key !== action.payload) }
    case 'SET_DRAFT_SAVED':
      return { ...state, draftSaved: action.payload }
    case 'START_GENERATION':
      return {
        ...state,
        jobId: action.payload.jobId,
        jobStatus: 'running',
        progressMessages: [],
        error: null,
      }
    case 'GENERATION_PROGRESS':
      return { ...state, progressMessages: [...state.progressMessages, action.payload] }
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        curriculum: action.payload,
        jobStatus: 'succeeded',
        error: null,
      }
    case 'GENERATION_FAILED':
      return { ...state, jobStatus: 'failed', error: action.payload }
    case 'SET_CURRICULUM':
      return { ...state, curriculum: action.payload }
    case 'RESET':
      return { ...initialState, prompt: state.prompt, params: state.params }
    default:
      return state
  }
}

interface CreateCurriculumContextValue {
  state: CreateCurriculumState
  dispatch: React.Dispatch<CreateCurriculumAction>
  setPrompt: (prompt: string) => void
  setParams: (params: Partial<CurriculumParameters>) => void
  setAdvancedOptions: (opts: Partial<AdvancedOptions>) => void
  addContextChip: (key: string, label: string) => void
  removeContextChip: (key: string) => void
  reset: () => void
}

const CreateCurriculumContext = React.createContext<CreateCurriculumContextValue | null>(null)

export function CreateCurriculumProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const setPrompt = React.useCallback((prompt: string) => {
    dispatch({ type: 'SET_PROMPT', payload: prompt })
  }, [])

  const setParams = React.useCallback((params: Partial<CurriculumParameters>) => {
    dispatch({ type: 'SET_PARAMS', payload: params })
  }, [])

  const setAdvancedOptions = React.useCallback((opts: Partial<AdvancedOptions>) => {
    dispatch({ type: 'SET_ADVANCED', payload: opts })
  }, [])

  const addContextChip = React.useCallback((key: string, label: string) => {
    dispatch({ type: 'ADD_CONTEXT_CHIP', payload: { key, label } })
  }, [])

  const removeContextChip = React.useCallback((key: string) => {
    dispatch({ type: 'REMOVE_CONTEXT_CHIP', payload: key })
  }, [])

  const reset = React.useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  const value: CreateCurriculumContextValue = React.useMemo(
    () => ({
      state,
      dispatch,
      setPrompt,
      setParams,
      setAdvancedOptions,
      addContextChip,
      removeContextChip,
      reset,
    }),
    [
      state,
      setPrompt,
      setParams,
      setAdvancedOptions,
      addContextChip,
      removeContextChip,
      reset,
    ]
  )

  return (
    <CreateCurriculumContext.Provider value={value}>
      {children}
    </CreateCurriculumContext.Provider>
  )
}

export function useCreateCurriculum() {
  const ctx = React.useContext(CreateCurriculumContext)
  if (!ctx) throw new Error('useCreateCurriculum must be used within CreateCurriculumProvider')
  return ctx
}
