import axios from "axios";
import guardedInstance from "../instances/guardedInstance";
import { SaveDraftPayload, DraftStepData, SubmitEmploymentPayload } from "../models/BorrowerPortalDraftTypes";

export function getOfficeUser(token: string) {
  return guardedInstance.post(`/user/validateUserToken?token=${token}`);
}

export function getRefreshToken(refreshToken: string) {
  return guardedInstance.post(`/user/GetNewToken?refreshToken=${refreshToken}`);
}

export function getIDToken(refreshToken: string) {
  return axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}user/GetNewToken?refreshToken=${refreshToken}`);
}

// ─── Borrower-specific API functions ────────────────────────────────────────

export interface BorrowerPortalTokenData {
  loanOfficerName: string;
  loanOfficerPhone: string;
  loanOfficerProfile: string;
  loanOfficerJobTitle: string;
  loanOfficerNMLS: string;
  portalStatus: number;
}

export interface BorrowerPortalResolveResponse {
  data: BorrowerPortalTokenData;
  success: boolean;
  message: string;
  error: string | null;
  statusCode: number;
}

export interface BorrowerSignUpPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

/** Validates the borrower link token and returns loan officer info. */
export function validateBorrowerPortalToken(token: string) {
  return axios.get<BorrowerPortalResolveResponse>(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}borrowerportal/resolve/${token}`
  );
}

/** Validates the signed-in borrower's Firebase ID token with the backend. */
export function validateBorrowerToken(token: string) {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}borrower/ValidateBorrowerToken`,
    null,
    { params: { token } }
  );
}

/** Registers a new borrower account. */
export function borrowerSignUp(payload: BorrowerSignUpPayload) {
  return axios.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}borrower/SignUp`,
    payload,
    { headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Saves the borrower portal draft after each step.
 * Called on every step progression until Step9Review (final submit uses a different API).
 * Uses guardedInstance so the stored Bearer token is automatically attached.
 * The backend expects the payload wrapped in a `request` field.
 */
export function saveBorrowerDraft(payload: SaveDraftPayload) {
  return guardedInstance.post(
    `/borrowerportal/savedraft`,
    payload
  );
}

export interface BorrowerDraftSummary {
  draftId: string;
  loanOfficerId: string;
  loanOfficerName: string;
  lastCompletedStep: number;
  isSubmitted: boolean;
  updatedAt: string;
  draftData: DraftStepData;
}

export interface BorrowerDraftsResponse {
  success: boolean;
  message: string;
  data: BorrowerDraftSummary[];
  error: string | null;
  statusCode: number;
}

/**
 * Fetches the borrower's existing draft data.
 * Uses guardedInstance so the borrower auth token is automatically attached.
 */
export function fetchBorrowerDrafts() {
  return guardedInstance.get<BorrowerDraftsResponse>(
    `/borrowerportal/mydrafts`
  );
}
/**
 * Final submission of the borrower employment data (Step 9 – Review & Submit).
 * Uses guardedInstance so the borrower auth token is automatically attached.
 */
export function submitBorrowerEmployment(payload: SubmitEmploymentPayload) {
  return guardedInstance.post(
    `/borrowerportal/submit`,
    payload
  );
}
