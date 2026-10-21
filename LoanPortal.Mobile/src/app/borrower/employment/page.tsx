"use client";
import { Suspense } from "react";
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { FieldPath, FormProvider, useForm, useWatch } from "react-hook-form";
import {
  validateBorrowerPortalToken,
  BorrowerPortalTokenData,
} from "@/api/network/user";
import {
  useSaveBorrowerDraft,
  useFetchBorrowerDrafts,
  useSubmitBorrowerEmployment,
} from "@/api/reactQueriesHooks/usePreApproval";
import { EmploymentCategory, SaveDraftPayload } from "@/api/models/BorrowerPortalDraftTypes";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  DraftMeta,
  EMPTY_GUID,
  EmploymentFormValues,
  defaultValues,
  hydrationFromDrafts,
  needsPreviousEmployment,
  formToStepData,
} from "./formModel";
import { createSaveQueue } from "./saveQueue";
import { validateStep } from "./validation";
import { ProgressBar, STEP_COUNT } from "./steps/primitives";
import Step1Welcome from "./steps/Step1Welcome";
import Step2VerifyIdentity from "./steps/Step2VerifyIdentity";
import Step3EmploymentType from "./steps/Step3EmploymentType";
import Step4CurrentEmployment from "./steps/Step4CurrentEmployment";
import Step5EmployerContact from "./steps/Step5EmployerContact";
import Step6IncomeDetails from "./steps/Step6IncomeDetails";
import Step7AdditionalInfo from "./steps/Step7AdditionalInfo";
import Step8PreviousEmployment from "./steps/Step8PreviousEmployment";
import Step9Review from "./steps/Step9Review";
import Step10Success from "./steps/Step10Success";
import Step4SE from "./steps/Step4SE";
import Step5SE from "./steps/Step5SE";
import Step6SE from "./steps/Step6SE";
import Step4Military from "./steps/Step4Military";
import Step5Military from "./steps/Step5Military";

type TokenState = "loading" | "valid" | "invalid";

/* ─────────────────────────────────────────────────────────
   Main multi-step controller
   ───────────────────────────────────────────────────────── */
const SUBMIT_ERROR = "We couldn't submit your information. Please try again.";

const EmploymentForm = ({ portalData, loanOfficerId }: { portalData: BorrowerPortalTokenData | null; loanOfficerId: string }) => {
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [meta, setMeta] = useState<DraftMeta>({
    draftId: null,
    loanOfficerId,
    borrowerId: null,
    preApprovalId: null,
    createdAt: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<EmploymentFormValues>({ defaultValues });

  const { mutateAsync: saveDraftAsync } = useSaveBorrowerDraft();
  const { mutateAsync: submitEmploymentAsync } = useSubmitBorrowerEmployment();
  const { data: draftsResponse, isFetched: draftsFetched } = useFetchBorrowerDrafts(!!portalData);

  // Draft saves run one at a time so each carries the draftId returned by the previous one.
  const saveQueue = useRef(
    createSaveQueue<SaveDraftPayload>(async (payload) => {
      const res = await saveDraftAsync(payload);
      return res.data?.data?.draftId ?? null;
    })
  ).current;
  const submittingRef = useRef(false);

  /* ── Hydrate the form from the first mydrafts response (once) ── */
  const hydrated = useRef(false);
  const draftsSettled = !portalData || draftsFetched;
  useEffect(() => {
    if (hydrated.current || !draftsSettled) return;
    hydrated.current = true; // later refetches must never overwrite in-progress edits

    const hydration = hydrationFromDrafts(draftsResponse?.data?.data, loanOfficerId);
    if (!hydration) return;
    methods.reset(hydration.values);
    setMeta(hydration.meta);
    saveQueue.setDraftId(hydration.meta.draftId);
    setStep(hydration.step);
  }, [draftsSettled, draftsResponse, methods, loanOfficerId, saveQueue]);

  // Military skips step 6 (Income Details) – it only has 9 steps.
  const category = useWatch({ control: methods.control, name: "employmentCategory" });
  const isMilitary = category === EmploymentCategory.Military;
  const totalSteps = isMilitary ? 9 : STEP_COUNT;

  // Map internal step number → displayed step number (for military, steps 7-10 display as 6-9)
  const displayStep = isMilitary && step >= 7 ? step - 1 : step;

  const next = () => {
    const completedStep = step;

    // Block on missing/invalid fields; show the errors inline and focus the first one.
    const errors = Object.entries(validateStep(step, methods.getValues()));
    if (errors.length > 0) {
      errors.forEach(([path, message], i) =>
        methods.setError(path as FieldPath<EmploymentFormValues>, { type: "validate", message }, { shouldFocus: i === 0 })
      );
      return;
    }

    let nextStep = isMilitary && step === 5 ? 7 : Math.min(step + 1, STEP_COUNT);
    // Skip previous employment when the current job already covers 2 years
    if (nextStep === 8 && !needsPreviousEmployment(methods.getValues())) nextStep = 9;

    // Step 1 has no data; Step 9 submits through its own API.
    if (completedStep >= 2 && completedStep <= 8) {
      const values = structuredClone(methods.getValues()); // snapshot: the save may start later
      saveQueue.enqueue((draftId) => ({
        draftId,
        loanOfficerId: meta.loanOfficerId,
        completedStep,
        stepData: formToStepData(values, { ...meta, draftId }, completedStep, false),
      }));
    }

    setStep(nextStep);
  };

  const submit = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await saveQueue.flush(); // never let an in-flight draft save land after the submit
      const draftId = saveQueue.getDraftId();
      await submitEmploymentAsync({
        draftId: draftId ?? EMPTY_GUID,
        employmentData: formToStepData(methods.getValues(), { ...meta, draftId }, 9, true),
      });
      setStep(10);
    } catch {
      setSubmitError(SUBMIT_ERROR);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const back = () =>
    setStep((s) => {
      if (isMilitary && s === 7) return 5;          // skip back over step 6 for military
      if (s === 9 && !needsPreviousEmployment(methods.getValues())) return 7; // step 8 was skipped
      return Math.max(s - 1, 1);
    });

  const renderStep = () => {
    // Steps 1–3 and 7–10 are shared across all employment types.
    // Steps 4–6 branch by category. Military skips step 6 entirely.
    const isSelfEmployed = category === EmploymentCategory.SelfEmployed;
    switch (step) {
      case 1: return <Step1Welcome onNext={next} />;
      case 2: return <Step2VerifyIdentity onNext={next} onBack={back} />;
      case 3: return <Step3EmploymentType onNext={next} onBack={back} />;
      case 4:
        if (isSelfEmployed) return <Step4SE onNext={next} onBack={back} />;
        if (isMilitary) return <Step4Military onNext={next} onBack={back} />;
        return <Step4CurrentEmployment onNext={next} onBack={back} />;
      case 5:
        if (isSelfEmployed) return <Step5SE onNext={next} onBack={back} />;
        if (isMilitary) return <Step5Military onNext={next} onBack={back} />;
        return <Step5EmployerContact onNext={next} onBack={back} />;
      case 6:
        if (isSelfEmployed) return <Step6SE onNext={next} onBack={back} />;
        return <Step6IncomeDetails onNext={next} onBack={back} />;
      case 7: return <Step7AdditionalInfo onNext={next} onBack={back} />;
      case 8: return <Step8PreviousEmployment onNext={next} onBack={back} />;
      case 9: return <Step9Review onSubmit={submit} onBack={back} onEdit={setStep} isSubmitting={isSubmitting} error={submitError} />;
      case 10: return <Step10Success />;
      default: return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          borderRadius: "20px",
          overflow: "hidden",
          backgroundColor: "background.paper",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Progress bar */}
        <ProgressBar step={displayStep} />

        <Box sx={{ p: { xs: "24px 20px", sm: "32px 28px" } }}>
          {/* Logo + brand row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box component="img" src="/icons/icon-96x96.png" alt="Logo" sx={{ width: 36, height: 36 }} />
              <Typography sx={{ color: theme.palette.primary.main, fontSize: "1.05rem", fontWeight: 800 }}>
                Loans <span style={{ color: "#F44336" }}>N</span> Stuff
              </Typography>
            </Box>
            <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 600 }}>
              Step {displayStep} of {totalSteps}
            </Typography>
          </Box>

          {/* Loan-officer banner */}
          {portalData && (
            <Box
              sx={{
                width: "100%",
                borderRadius: "10px",
                bgcolor: "#F0F4FF",
                border: "1px solid #D0DBFF",
                px: 2,
                py: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                Prepared for&nbsp;
                <strong style={{ color: theme.palette.primary.main }}>
                  {portalData.loanOfficerName}
                </strong>
              </Typography>
            </Box>
          )}

          {/* Active step */}
          {draftsSettled ? renderStep() : (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress color="primary" size={36} />
            </Box>
          )}
        </Box>
      </Box>
    </FormProvider>
  );
};

/* ─────────────────────────────────────────────────────────
   Page wrapper with token validation
   ───────────────────────────────────────────────────────── */
const BorrowerEmploymentContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenState, setTokenState] = useState<TokenState>("loading");
  const [portalData, setPortalData] = useState<BorrowerPortalTokenData | null>(null);

  useEffect(() => {
    document.title = "Employment History - Loans N Stuff";
  }, []);

  useEffect(() => {
    if (!token) { setTokenState("invalid"); return; }
    const validate = async () => {
      try {
        const res = await validateBorrowerPortalToken(token);
        if (res.data?.success && res.data?.data) {
          setPortalData(res.data.data);
          setTokenState("valid");
        } else {
          setTokenState("invalid");
        }
      } catch {
        setTokenState("invalid");
      }
    };
    validate();
  }, [token]);

  const bgImg = (
    <Box
      component="img"
      src={isMobile ? "/Background_Svgs/authBackground-mobile.svg" : "/Background_Svgs/authBackground.svg"}
      sx={{ position: "absolute", zIndex: 0, width: "100vw", height: "100%", minHeight: "100vh", objectFit: "cover", left: ".1%" }}
    />
  );

  if (tokenState === "loading") {
    return (
      <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "background.default", overflow: "hidden" }}>
        {bgImg}
        <Box sx={{ zIndex: 1, textAlign: "center" }}>
          <CircularProgress color="primary" size={48} />
          <Typography sx={{ mt: 2, color: "text.secondary" }}>Validating your invitation link...</Typography>
        </Box>
      </Box>
    );
  }

  if (tokenState === "invalid") {
    return (
      <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: "background.default" }}>
        {bgImg}
        <Container
          sx={{
            width: { xs: "100%", sm: "420px", md: "460px" },
            minHeight: "100vh",
            position: "relative",
            zIndex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "32px",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: "100%",
              borderRadius: "24px",
              padding: "40px 32px",
              gap: "24px",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "background.paper",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              alignItems: "center",
            }}
          >
            <Box component="img" src="/icons/icon-96x96.png" alt="Logo" sx={{ width: "72px", height: "auto" }} />
            <Box sx={{ width: 72, height: 72, borderRadius: "50%", bgcolor: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ErrorOutlineIcon sx={{ fontSize: 40, color: "#F44336" }} />
            </Box>
            <Typography sx={{ fontSize: "1.4rem", fontWeight: 700, color: "text.primary", textAlign: "center" }}>
              Link Expired or Invalid
            </Typography>
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", textAlign: "center", lineHeight: 1.7 }}>
              This invitation link is no longer valid or has expired. Please ask your loan officer to send you a new link.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: "background.default" }}>
      {bgImg}
      <Container
        sx={{
          width: { xs: "100%", sm: "480px", md: "520px" },
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: { xs: "20px 16px 40px", sm: "40px 24px 60px" },
        }}
      >
        <EmploymentForm portalData={portalData} loanOfficerId={token} />
      </Container>
    </Box>
  );
};

// Only borrower sessions may view this page; anyone else goes back to the borrower sign in
const BorrowerEmploymentGuard = () => {
  const token = useSearchParams().get("token") ?? "";
  return (
    <ProtectedRoute
      allow={["borrower"]}
      redirectTo={`/borrower/signin?token=${encodeURIComponent(token)}`}
    >
      <BorrowerEmploymentContent />
    </ProtectedRoute>
  );
};

const BorrowerEmploymentPage = () => (
  <Suspense fallback={<div />}>
    <BorrowerEmploymentGuard />
  </Suspense>
);

export default BorrowerEmploymentPage;
