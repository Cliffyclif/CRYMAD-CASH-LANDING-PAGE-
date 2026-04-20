import type { ReactNode } from "react";

/**
 * Maps a stitch iframe form-submit event to a mutation on the parent.
 * Each route can register a single handler. The handler receives the form's
 * field payload (serialized from name / id / data-field on inputs).
 *
 * Usage in StitchScreen:
 *   const handler = formHandlers[location.pathname];
 *   if (handler) await handler(payload);
 */

export type FormPayload = Record<string, string>;

export interface FormHandlerResult {
  navigateTo?: string;
  success?: boolean;
  error?: string;
}

export type FormHandler = (payload: FormPayload) => Promise<FormHandlerResult> | FormHandlerResult;

export type FormHandlers = Record<string, FormHandler>;

export interface FormHandlerHelpers {
  transfer: (payload: FormPayload) => Promise<FormHandlerResult>;
  swap: (payload: FormPayload) => Promise<FormHandlerResult>;
  cryptoSend: (payload: FormPayload) => Promise<FormHandlerResult>;
  cardOrder: (payload: FormPayload) => Promise<FormHandlerResult>;
  cardLoad: (payload: FormPayload) => Promise<FormHandlerResult>;
  cardLock: (payload: FormPayload) => Promise<FormHandlerResult>;
  addBeneficiary: (payload: FormPayload) => Promise<FormHandlerResult>;
  deleteBeneficiary: (payload: FormPayload) => Promise<FormHandlerResult>;
  completeRegistration: (payload: FormPayload) => Promise<FormHandlerResult>;
}

// Placeholder used where the stitch design has interaction but we don't
// have a dedicated backend yet. Logs and reports success without a call.
export function stubHandler(name: string): FormHandler {
  return async () => {
    console.warn(`[stitch] ${name} form stubbed`);
    return { success: true };
  };
}

export function noChildren(_c: ReactNode): void { /* type alias holder */ }
