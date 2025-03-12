"use client"

import type React from "react"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { EquationState, SolverMethod, Parameter, InitialCondition, Variable } from "@/types/equation"
import { v4 as uuidv4 } from "uuid"

// Define action types
type Action =
  | { type: "SET_EQUATION"; payload: string }
  | { type: "ADD_VARIABLE"; payload: Omit<Variable, "id"> }
  | { type: "REMOVE_VARIABLE"; payload: string }
  | { type: "ADD_PARAMETER"; payload: Omit<Parameter, "id"> }
  | { type: "UPDATE_PARAMETER"; payload: { id: string; value: number } }
  | { type: "REMOVE_PARAMETER"; payload: string }
  | { type: "SET_INITIAL_CONDITION"; payload: Omit<InitialCondition, "id"> }
  | { type: "UPDATE_INITIAL_CONDITION"; payload: { id: string; value: number } }
  | { type: "SET_TIME_RANGE"; payload: { start: number; end: number } }
  | { type: "SET_METHOD"; payload: SolverMethod }
  | { type: "SET_STEP_SIZE"; payload: number }
  | { type: "RESET" }

// Initial state
const initialState: EquationState = {
  equation: "dy/dx = y",
  variables: [{ id: uuidv4(), name: "y" }],
  parameters: [],
  initialConditions: [{ id: uuidv4(), variable: "y", value: 1, order: 0 }],
  timeRange: { start: 0, end: 10 },
  method: "rk4",
  stepSize: 0.1,
}

// Create reducer function
function equationReducer(state: EquationState, action: Action): EquationState {
  switch (action.type) {
    case "SET_EQUATION":
      return { ...state, equation: action.payload }

    case "ADD_VARIABLE":
      return {
        ...state,
        variables: [...state.variables, { id: uuidv4(), ...action.payload }],
      }

    case "REMOVE_VARIABLE":
      return {
        ...state,
        variables: state.variables.filter((v) => v.id !== action.payload),
      }

    case "ADD_PARAMETER":
      return {
        ...state,
        parameters: [...state.parameters, { id: uuidv4(), ...action.payload }],
      }

    case "UPDATE_PARAMETER":
      return {
        ...state,
        parameters: state.parameters.map((p) =>
          p.id === action.payload.id ? { ...p, value: action.payload.value } : p,
        ),
      }

    case "REMOVE_PARAMETER":
      return {
        ...state,
        parameters: state.parameters.filter((p) => p.id !== action.payload),
      }

    case "SET_INITIAL_CONDITION":
      return {
        ...state,
        initialConditions: [
          ...state.initialConditions.filter(
            (ic) => !(ic.variable === action.payload.variable && ic.order === action.payload.order),
          ),
          { id: uuidv4(), ...action.payload },
        ],
      }

    case "UPDATE_INITIAL_CONDITION":
      return {
        ...state,
        initialConditions: state.initialConditions.map((ic) =>
          ic.id === action.payload.id ? { ...ic, value: action.payload.value } : ic,
        ),
      }

    case "SET_TIME_RANGE":
      return {
        ...state,
        timeRange: action.payload,
      }

    case "SET_METHOD":
      return {
        ...state,
        method: action.payload,
      }

    case "SET_STEP_SIZE":
      return {
        ...state,
        stepSize: action.payload,
      }

    case "RESET":
      return initialState

    default:
      return state
  }
}

// Create context
type EquationContextType = {
  state: EquationState
  dispatch: React.Dispatch<Action>
}

const EquationContext = createContext<EquationContextType | undefined>(undefined)

// Create provider component
export function EquationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(equationReducer, initialState)

  return <EquationContext.Provider value={{ state, dispatch }}>{children}</EquationContext.Provider>
}

// Create custom hook for using the context
export function useEquation() {
  const context = useContext(EquationContext)

  if (context === undefined) {
    throw new Error("useEquation must be used within an EquationProvider")
  }

  return context
}

