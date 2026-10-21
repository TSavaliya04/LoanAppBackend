import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  orange: "#E64A19",
  orangeLight: "#FFF8E1",
  orangeBorder: "#FFD580",
  purple: "#4B0082",
  purpleLight: "#EDE9FF",
  purpleBorder: "#C4B5FD",
  navy: "#1a237e",
  navyLight: "#F0F4FF",
  navyBorder: "#C5CDE8",
  green: "#16A34A",
  white: "#FFFFFF",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray500: "#6B7280",
  gray700: "#374151",
  gray900: "#111827",
  blue: "#2563EB",
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    paddingTop: 16,
    paddingRight: 18,
    paddingLeft: 18,
    paddingBottom: 16,
    fontSize: 8,
    fontFamily: "Helvetica",
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6, paddingBottom: 6 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, objectFit: "cover" },
  headerAvatarFallback: { width: 42, height: 42, borderRadius: 21, backgroundColor: C.purple, justifyContent: "center", alignItems: "center" },
  headerAvatarInitials: { fontSize: 14, fontWeight: "bold", color: C.white },
  headerAgentInfo: { flexDirection: "column", justifyContent: "center", marginLeft: 8 },
  headerAgentName: { fontSize: 11, fontWeight: "bold", color: C.gray900 },
  headerAgentDetail: { fontSize: 8, color: C.gray500, marginTop: 1 },
  headerRight: { alignItems: "flex-end" },
  headerTitle: { fontSize: 16, fontWeight: "bold", color: C.purple, letterSpacing: 0.5 },
  headerTitleAccent: { fontWeight: "bold", color: C.blue },
  headerDate: { fontSize: 8, color: C.gray500, marginTop: 2 },
  headerDivider: { height: 1.5, backgroundColor: C.purple, marginBottom: 8 },

  // ── Layout helpers ─────────────────────────────────────────────────────────
  row2: { flexDirection: "row", gap: 6, marginBottom: 6 },

  // ── Shared label-value pair row ────────────────────────────────────────────
  pairRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 },
  lbl: { fontSize: 7.5, color: C.gray700, flex: 1.8 },
  val: { fontSize: 7.5, color: C.gray900, textAlign: "right", flex: 1 },
  valBold: { fontSize: 7.5, fontWeight: "bold", color: C.purple, textAlign: "right", flex: 1 },

  // ── DETAILS ────────────────────────────────────────────────────────────────
  detailsCard: { flex: 4, backgroundColor: C.orangeLight, borderWidth: 1, borderColor: C.orangeBorder, borderRadius: 4, padding: 8 },
  detailsTitle: { fontSize: 9, fontWeight: "bold", color: C.orange, marginBottom: 2 },
  detailsLine: { height: 0.8, backgroundColor: "#E64A1960", marginBottom: 5 },

  // ── LOAN OVERVIEW ──────────────────────────────────────────────────────────
  overviewCard: { flex: 5, backgroundColor: C.navyLight, borderWidth: 1, borderColor: C.navyBorder, borderRadius: 4, padding: 8 },
  overviewTitle: { fontSize: 9, fontWeight: "bold", color: C.navy, marginBottom: 2 },
  overviewLine: { height: 0.8, backgroundColor: "#1a237e50", marginBottom: 5 },
  overviewSep: { height: 0.5, backgroundColor: C.navyBorder, marginVertical: 4 },
  overviewTotalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.8, borderTopColor: "#1a237e40", paddingTop: 4, marginTop: 2 },
  overviewTotalLbl: { fontSize: 7.5, fontWeight: "bold", color: C.navy },
  overviewTotalVal: { fontSize: 7.5, fontWeight: "bold", color: C.navy },

  // ── MONTHLY PAYMENT BREAKDOWN ──────────────────────────────────────────────
  monthlyCard: { backgroundColor: C.purpleLight, borderWidth: 1, borderColor: C.purpleBorder, borderRadius: 4, padding: 8, marginBottom: 6, flexDirection: "row", alignItems: "center" },
  monthlyLeft: { alignItems: "center", justifyContent: "center", marginRight: 8, width: 72 },
  monthlyIconBox: { width: 30, height: 30, backgroundColor: "#DDD6FE", borderRadius: 6, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  monthlyIconChar: { fontSize: 14, fontWeight: "bold", color: C.purple },
  monthlyHeading: { fontSize: 7.5, fontWeight: "bold", color: C.purple, textAlign: "center", lineHeight: 1.4 },
  monthlyMiddle: { flex: 1, flexDirection: "row", alignItems: "center" },
  monthlyCol: { flex: 1, paddingHorizontal: 5 },
  monthlyItemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  monthlyItemLbl: { fontSize: 7.5, color: C.gray700 },
  monthlyItemVal: { fontSize: 7.5, color: C.gray700 },
  monthlyVSep: { width: 0.8, alignSelf: "stretch", backgroundColor: "#9C7FD4", marginHorizontal: 4 },
  monthlyRight: { paddingLeft: 10, justifyContent: "center", alignItems: "flex-end", minWidth: 85 },
  monthlyTotalLbl: { fontSize: 7, fontWeight: "bold", color: C.purple, textAlign: "right" },
  monthlyTotalAmt: { fontSize: 15, fontWeight: "bold", color: C.green, textAlign: "right", marginTop: 2 },

  // ── CLOSING COSTS ──────────────────────────────────────────────────────────
  closingCard: { flex: 1, backgroundColor: C.white, borderWidth: 1, borderColor: C.gray200, borderRadius: 4, padding: 8 },
  closingTitle: { fontSize: 9, fontWeight: "bold", color: C.navy, marginBottom: 2 },
  closingTitleLine: { height: 0.8, backgroundColor: "#1a237e50", marginBottom: 5 },
  closingSubhead: { fontSize: 7.5, fontWeight: "bold", color: C.orange, marginTop: 5, marginBottom: 2 },
  closingSubLine: { height: 0.4, backgroundColor: "#E64A1960", marginBottom: 3 },
  closingNoteText: { fontSize: 7, color: C.gray500, marginBottom: 2 },
  closingRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  closingLbl: { fontSize: 7.5, color: C.gray700, flex: 1.8 },
  closingVal: { fontSize: 7.5, color: C.gray700, textAlign: "right" },
  closingSubRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.5, borderTopColor: "#1a237e40", paddingTop: 3, marginTop: 3 },
  closingSubLbl: { fontSize: 7.5, fontWeight: "bold", color: C.navy },
  closingSubVal: { fontSize: 7.5, fontWeight: "bold", color: C.navy },
  closingGrandRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: C.purple, borderRadius: 3, padding: 5, marginTop: 5 },
  closingGrandLbl: { fontSize: 8.5, fontWeight: "bold", color: C.white },
  closingGrandVal: { fontSize: 8.5, fontWeight: "bold", color: C.white },

  // ── RIGHT COL (Credits + Note) ─────────────────────────────────────────────
  rightCol: { flex: 1, flexDirection: "column" },

  // ── CREDITS & TOTALS ───────────────────────────────────────────────────────
  creditsCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.gray200, borderRadius: 4, padding: 8 },
  creditsTitle: { fontSize: 9, fontWeight: "bold", color: C.orange, marginBottom: 2 },
  creditsTitleLine: { height: 0.8, backgroundColor: "#E64A1960", marginBottom: 5 },
  creditsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  creditsLbl: { fontSize: 7.5, color: C.gray700, flex: 1.8 },
  creditsVal: { fontSize: 7.5, color: C.gray700, textAlign: "right" },
  creditsCashRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.8, borderTopColor: "#E64A1960", paddingTop: 5, marginTop: 4 },
  cashLblPos: { fontSize: 9.5, fontWeight: "bold", color: C.green },
  cashValPos: { fontSize: 9.5, fontWeight: "bold", color: C.green },
  cashLblNeg: { fontSize: 9.5, fontWeight: "bold", color: C.orange },
  cashValNeg: { fontSize: 9.5, fontWeight: "bold", color: C.orange },

  // ── ABOUT NOTE ─────────────────────────────────────────────────────────────
  noteCard: { marginTop: 5, backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A", borderRadius: 4, padding: 7 },
  noteHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
  noteCircle: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#F59E0B", justifyContent: "center", alignItems: "center", marginRight: 4 },
  noteCircleTxt: { fontSize: 7, fontWeight: "bold", color: C.white },
  noteTitleTxt: { fontSize: 7.5, fontWeight: "bold", color: "#D97706" },
  noteBodyTxt: { fontSize: 7, color: C.gray700, lineHeight: 1.4 },

  // ── TRANSACTION SUMMARY ────────────────────────────────────────────────────
  txCard: { backgroundColor: "#F8FAFF", borderWidth: 1, borderColor: C.navyBorder, borderRadius: 4, padding: 8, marginTop: 6 },
  txTitle: { fontSize: 9, fontWeight: "bold", color: C.navy, marginBottom: 2 },
  txTitleLine: { height: 0.8, backgroundColor: "#1a237e50", marginBottom: 5 },
  txHeaderRow: { flexDirection: "row", backgroundColor: C.purpleLight, paddingVertical: 4, paddingHorizontal: 3, borderRadius: 2, marginBottom: 1 },
  txDataRow: { flexDirection: "row", paddingVertical: 3, paddingHorizontal: 3, borderBottomWidth: 0.3, borderBottomColor: C.gray200 },

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 5, borderTopWidth: 0.5, borderTopColor: C.gray300 },
  footerLeft: { flexDirection: "row", alignItems: "center" },
  footerIconBox: { width: 16, height: 16, borderRadius: 3, backgroundColor: C.purpleLight, justifyContent: "center", alignItems: "center", marginRight: 4 },
  footerIconChar: { fontSize: 9, fontWeight: "bold", color: C.purple },
  footerCompany: { fontSize: 7.5, fontWeight: "bold", color: C.purple },
  footerCenter: { fontSize: 7, color: C.gray500 },
  footerRight: { fontSize: 7, color: C.gray500 },
});

// ─── Types ────────────────────────────────────────────────────────────────────
type TransactionRow = {
  lienPosition: string;
  loanType: string;
  loanAmount: string;
  interestRate: string;
  loanTerm: string;
  monthlyPandI: string;
  status: string;
};

type RefinanceFeeWorksheetPDFProps = {
  spanish: boolean;
  borrower: string;
  loanProgram: number;
  loanType: string;
  loanPurpose: string;
  lienPosition: string;
  refiType: number;
  date: string;
  propertyAddress: string;
  // Loan Overview
  homeValue: string;
  currentLoanBalance: string;
  loanAmount: string;
  currentDrawLimit: string;
  interestRate: string;
  loanTerm: string;
  totalCombinedDebt?: string;       // "$(combined) (XX.XX%)"
  // Monthly Breakdown
  firstMortgagePandI?: string;      // existing 1st mtg P&I
  principalInterest: string;
  propertyTax: string;
  hazardInsurance: string;
  mortgageInsurance: string;
  hoaFee?: string;
  monthlyTotal: string;
  // Closing Costs
  originationFee: string;
  originationFeePercent: string;
  discountFee: string;
  discountFeePercent: string;
  appraisalFee: string;
  escrowFees: string;
  titleFees: string;
  thirdPartyLenderFee: string;
  totalClosingCosts: string;
  // Credits & Totals
  newLoanAmount: string;
  firstMortgagePayoff?: string;
  otherCostsPaidByBorrower?: string;
  cashToClose: string;
  cashToCloseIsPositive: boolean;
  totalDebtToBePaidOff: string;
  // About note
  aboutNote?: string;
  // Transaction summary rows
  transactionRows?: TransactionRow[];
  // Agent / header
  agentName: string;
  agentNmls: string;
  agentPhone: string;
  agentEmail: string;
  agentProfile: string;
  agentInitials: string;
  // Footer
  companyName?: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isPositive = (s?: string) => Number((s ?? "0").replace(/,/g, "")) > 0;

// ─── PDF Component ────────────────────────────────────────────────────────────
export const RefinanceFeeWorksheetPDF = ({
  data,
}: {
  data: RefinanceFeeWorksheetPDFProps;
}) => {
  const sp = data.spanish;
  const firstMortPay = data.currentLoanBalance ?? "0.00";
  const otherCosts = data.otherCostsPaidByBorrower ?? data.totalDebtToBePaidOff;
  const heLabel = `Home Equity Loan (${data.lienPosition})`;
  const isSecondLien = data.lienPosition.toLowerCase().includes("second");

  // Default transaction rows
  const txRows: TransactionRow[] = data.transactionRows ?? [
    ...(isSecondLien ? [{
      lienPosition: "1st Lien",
      loanType: "First Mortgage (Existing)",
      loanAmount: `$${data.currentLoanBalance}`,
      interestRate: "\u2014",
      loanTerm: "\u2014",
      monthlyPandI: data.firstMortgagePandI ? `$${data.firstMortgagePandI}` : "\u2014",
      status: "Remains in Place",
    }] : []),
    {
      lienPosition: isSecondLien ? "2nd Lien" : "1st Lien",
      loanType: data.loanType,
      loanAmount: `$${data.loanAmount}`,
      interestRate: `${data.interestRate}%`,
      loanTerm: `${data.loanTerm} Years`,
      monthlyPandI: `$${data.principalInterest}`,
      status: "New Loan",
    },
  ];

  // TX cell style helpers
  const txH = (flex: number, align: "left" | "right" = "left") =>
    ({ flex, fontSize: 7, fontWeight: "bold" as const, color: C.purple, textAlign: align });
  const txD = (flex: number, align: "left" | "right" = "left") =>
    ({ flex, fontSize: 7, color: C.gray700, textAlign: align });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>

        {/* ─────────────── HEADER ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {data.agentProfile ? (
              <Image src={data.agentProfile} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarInitials}>{data.agentInitials}</Text>
              </View>
            )}
            <View style={styles.headerAgentInfo}>
              <Text style={styles.headerAgentName}>{data.agentName}</Text>
              {data.agentNmls ? <Text style={styles.headerAgentDetail}>NMLS: {data.agentNmls}</Text> : null}
              {data.agentPhone ? <Text style={styles.headerAgentDetail}>{data.agentPhone}</Text> : null}
              {data.agentEmail ? <Text style={styles.headerAgentDetail}>{data.agentEmail}</Text> : null}
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>
              <Text style={styles.headerTitleAccent}>CLOSING COST </Text>
              SUMMARY
            </Text>
            <Text style={styles.headerDate}>Date Prepared: {data.date}</Text>
          </View>
        </View>
        <View style={styles.headerDivider} />

        {/* ─── ROW 1: DETAILS | LOAN OVERVIEW ─────────────────────────── */}
        <View style={styles.row2}>

          {/* DETAILS */}
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>{sp ? "DETALLES" : "DETAILS"}</Text>
            <View style={styles.detailsLine} />

            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Prestatario" : "Borrower"}</Text>
              <Text style={styles.val}>{data.borrower}</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Tipo de préstamo" : "Loan Type"}</Text>
              <Text style={styles.valBold}>{data.loanType}</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Propósito del préstamo" : "Loan Purpose"}</Text>
              <Text style={styles.val}>{data.loanPurpose}</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Fecha" : "Date"}</Text>
              <Text style={styles.val}>{data.date}</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Dirección de la propiedad" : "Property Address"}</Text>
              <Text style={styles.val}>{data.propertyAddress || (sp ? "Por determinar" : "TBD")}</Text>
            </View>
          </View>

          {/* LOAN OVERVIEW */}
          <View style={styles.overviewCard}>
            <Text style={styles.overviewTitle}>{sp ? "DESCRIPCIÓN DEL PRÉSTAMO" : "LOAN OVERVIEW"}</Text>
            <View style={styles.overviewLine} />

            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Valor estimado de la vivienda" : "Estimated Home Value"}</Text>
              <Text style={styles.val}>${data.homeValue}</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Saldo de la primera hipoteca existente" : "Existing First Mortgage Balance"}</Text>
              <Text style={styles.val}>${data.currentLoanBalance}</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Estado de la primera hipoteca" : "First Mortgage Status"}</Text>
              <Text style={styles.val}>{sp ? "Permanece en vigencia" : "Remains in Place"}</Text>
            </View>

            <View style={styles.overviewSep} />

            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? `Préstamo sobre el valor líquido (${data.lienPosition})` : heLabel}</Text>
              <Text style={styles.val}>${data.loanAmount}</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Tasa de interés" : "Interest Rate"}</Text>
              <Text style={styles.val}>{data.interestRate}%</Text>
            </View>
            <View style={styles.pairRow}>
              <Text style={styles.lbl}>{sp ? "Plazo del préstamo" : "Loan Term"}</Text>
              <Text style={styles.val}>{data.loanTerm} {sp ? "Años" : "Years"}</Text>
            </View>

            {data.totalCombinedDebt ? (
              <>
                <View style={styles.overviewSep} />
                <View style={styles.overviewTotalRow}>
                  <Text style={styles.overviewTotalLbl}>{sp ? "Deuda total combinada (LTV)" : "Total Combined Debt (LTV)"}</Text>
                  <Text style={styles.overviewTotalVal}>{data.totalCombinedDebt}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* ─── MONTHLY PAYMENT BREAKDOWN (full width, 4 columns) ───────── */}
        <View style={styles.monthlyCard}>

          {/* Col 1: Icon + title */}
          <View style={styles.monthlyLeft}>
            <View style={styles.monthlyIconBox}>
              <Text style={styles.monthlyIconChar}>H</Text>
            </View>
            <Text style={styles.monthlyHeading}>
              {sp ? "DESGLOSE\nPAGO\nMENSUAL" : "MONTHLY\nPAYMENT\nBREAKDOWN"}
            </Text>
          </View>

          {/* Col 2 + separator + Col 3 */}
          <View style={styles.monthlyMiddle}>

            {/* Col 2: P&I + property tax */}
            <View style={styles.monthlyCol}>
              {data.firstMortgagePandI ? (
                <View style={styles.monthlyItemRow}>
                  <Text style={styles.monthlyItemLbl}>{sp ? "P&I 1a Hipoteca" : "First Mortgage P&I"}</Text>
                  <Text style={styles.monthlyItemVal}>${data.firstMortgagePandI}</Text>
                </View>
              ) : null}
              <View style={styles.monthlyItemRow}>
                <Text style={styles.monthlyItemLbl}>{sp ? "P&I Préstamo HE" : "Home Equity Loan P&I"}</Text>
                <Text style={styles.monthlyItemVal}>${data.principalInterest}</Text>
              </View>
              {/*
              <View style={styles.monthlyItemRow}>
                <Text style={styles.monthlyItemLbl}>{sp ? "Impuesto Propiedad" : "Property Tax"}</Text>
                <Text style={styles.monthlyItemVal}>${data.propertyTax}</Text>
              </View>
              */}
            </View>

            <View style={styles.monthlyVSep} />

            {/* Col 3: Insurance / HOA */}
            <View style={styles.monthlyCol}>
              {/*
              <View style={styles.monthlyItemRow}>
                <Text style={styles.monthlyItemLbl}>{sp ? "Seguro de riesgos" : "Hazard Insurance"}</Text>
                <Text style={styles.monthlyItemVal}>${data.hazardInsurance}</Text>
              </View>
              */}
              {data.hoaFee && isPositive(data.hoaFee) ? (
                <View style={styles.monthlyItemRow}>
                  <Text style={styles.monthlyItemLbl}>{sp ? "Cuota HOA" : "HOA Fees"}</Text>
                  <Text style={styles.monthlyItemVal}>${data.hoaFee}</Text>
                </View>
              ) : null}
              {isPositive(data.mortgageInsurance) ? (
                <View style={styles.monthlyItemRow}>
                  <Text style={styles.monthlyItemLbl}>{sp ? "Seguro hipotecario" : "Mortgage Insurance"}</Text>
                  <Text style={styles.monthlyItemVal}>${data.mortgageInsurance}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Col 4: Total */}
          <View style={styles.monthlyRight}>
            <Text style={styles.monthlyTotalLbl}>{sp ? "PAGO\nMENSUAL\nTOTAL" : "TOTAL MONTHLY\nPAYMENT"}</Text>
            <Text style={styles.monthlyTotalAmt}>${data.monthlyTotal}</Text>
          </View>
        </View>

        {/* ─── ROW 3: CLOSING COSTS | CREDITS & NOTE ───────────────────── */}
        <View style={styles.row2}>

          {/* CLOSING COSTS BREAKDOWN */}
          <View style={styles.closingCard}>
            <Text style={styles.closingTitle}>{sp ? "DESGLOSE DE COSTOS DE CIERRE" : "CLOSING COSTS BREAKDOWN"}</Text>
            <View style={styles.closingTitleLine} />

            {/* First Mortgage */}
            <Text style={styles.closingSubhead}>{sp ? "PRIMERA HIPOTECA (PERMANECE)" : "FIRST MORTGAGE (REMAINS IN PLACE)"}</Text>
            <View style={styles.closingSubLine} />
            <View style={styles.closingRow}>
              <Text style={styles.closingNoteText}>{sp ? "Sin nuevos costos de cierre para la primera hipoteca" : "No new closing costs for first mortgage"}</Text>
              <Text style={[styles.closingVal, { fontWeight: "bold", color: C.purple }]}>${data.currentLoanBalance}</Text>
            </View>

            {/* HE Loan / Second Lien */}
            <Text style={styles.closingSubhead}>
              {sp
                ? `PRÉSTAMO HE (${data.lienPosition.toUpperCase()})`
                : `HOME EQUITY LOAN (${data.lienPosition.toUpperCase()})`}
            </Text>
            <View style={styles.closingSubLine} />

            <View style={styles.closingRow}>
              <Text style={styles.closingLbl}>{sp ? "Comisión de apertura" : "Origination Fee"} ({data.originationFeePercent}%)</Text>
              <Text style={styles.closingVal}>${data.originationFee}</Text>
            </View>
            {isPositive(data.discountFee) ? (
              <View style={styles.closingRow}>
                <Text style={styles.closingLbl}>{sp ? "Tarifa de descuento" : "Discount Fee"} ({data.discountFeePercent}%)</Text>
                <Text style={styles.closingVal}>${data.discountFee}</Text>
              </View>
            ) : null}
            <View style={styles.closingRow}>
              <Text style={styles.closingLbl}>{sp ? "Honorarios de tasación" : "Appraisal Fee"}</Text>
              <Text style={styles.closingVal}>${data.appraisalFee}</Text>
            </View>
            {isPositive(data.escrowFees) ? (
              <View style={styles.closingRow}>
                <Text style={styles.closingLbl}>{sp ? "Comisión de liquidación/garantía" : "Settlement / Escrow Fee"}</Text>
                <Text style={styles.closingVal}>${data.escrowFees}</Text>
              </View>
            ) : null}
            <View style={styles.closingRow}>
              <Text style={styles.closingLbl}>{sp ? "Honorarios de título" : `Title Fee (${data.lienPosition})`}</Text>
              <Text style={styles.closingVal}>${data.titleFees}</Text>
            </View>
            {isPositive(data.thirdPartyLenderFee) ? (
              <View style={styles.closingRow}>
                <Text style={styles.closingLbl}>{sp ? "Honorarios de terceros" : "Third Party Lender Fee"}</Text>
                <Text style={styles.closingVal}>${data.thirdPartyLenderFee}</Text>
              </View>
            ) : null}

            {/* Lien sub-total */}
            <View style={styles.closingSubRow}>
              <Text style={styles.closingSubLbl}>
                {sp
                  ? `SUBTOTAL COSTOS (${data.lienPosition.toUpperCase()})`
                  : `${data.lienPosition.toUpperCase()} CLOSING COSTS TOTAL`}
              </Text>
              <Text style={styles.closingSubVal}>${data.totalClosingCosts}</Text>
            </View>

            {/* Grand total banner */}
            <View style={styles.closingGrandRow}>
              <Text style={styles.closingGrandLbl}>{sp ? "TOTAL COSTOS DE CIERRE" : "TOTAL CLOSING COSTS"}</Text>
              <Text style={styles.closingGrandVal}>${data.totalClosingCosts}</Text>
            </View>
          </View>

          {/* RIGHT COLUMN: Credits + About note */}
          <View style={styles.rightCol}>

            {/* CREDITS & TOTALS */}
            <View style={styles.creditsCard}>
              <Text style={styles.creditsTitle}>{sp ? "CRÉDITOS Y TOTALES" : "CREDITS & TOTALS"}</Text>
              <View style={styles.creditsTitleLine} />

              <View style={styles.creditsRow}>
                <Text style={styles.creditsLbl}>{sp ? "Pago de primera hipoteca existente" : "Existing First Mortgage Payoff"}</Text>
                <Text style={styles.creditsVal}>${firstMortPay}</Text>
              </View>
              {data.loanProgram === 5 ? (
                <View style={styles.creditsRow}>
                  <Text style={styles.creditsLbl}>{sp ? "Límite de consumo de corriente" : `Current Draw limit`}</Text>
                  <Text style={styles.creditsVal}>${data.currentDrawLimit}</Text>
                </View>
              ) : (
                <View style={styles.creditsRow}>
                  <Text style={styles.creditsLbl}>{sp ? "Nuevo monto del préstamo HE" : `New ${data.loanType} Loan Amount`}</Text>
                  <Text style={styles.creditsVal}>${data.loanAmount}</Text>
                </View>
              )}
              <View style={styles.creditsRow}>
                <Text style={styles.creditsLbl}>{sp ? "Total costos de cierre" : "Total Closing Costs"}</Text>
                <Text style={styles.creditsVal}>-${data.totalClosingCosts}</Text>
              </View>
              <View style={styles.creditsRow}>
                <Text style={styles.creditsLbl}>{sp ? "Otros costos pagados por el prestatario" : "Other Costs Paid by Borrower"}</Text>
                <Text style={styles.creditsVal}>-${otherCosts}</Text>
              </View>

              <View style={styles.creditsCashRow}>
                <Text style={data.cashToCloseIsPositive ? styles.cashLblPos : styles.cashLblNeg}>
                  {data.cashToCloseIsPositive
                    ? (sp ? "EFECTIVO AL PRESTATARIO" : "CASH TO BORROWER")
                    : (sp ? "EFECTIVO PARA CERRAR" : "CASH TO CLOSE")}
                </Text>
                <Text style={data.cashToCloseIsPositive ? styles.cashValPos : styles.cashValNeg}>
                  ${data.cashToClose}
                </Text>
              </View>
            </View>

            {/* ABOUT THIS TRANSACTION */}
            {data.aboutNote ? (
              <View style={styles.noteCard}>
                <View style={styles.noteHeaderRow}>
                  <View style={styles.noteCircle}>
                    <Text style={styles.noteCircleTxt}>i</Text>
                  </View>
                  <Text style={styles.noteTitleTxt}>{sp ? "Acerca de esta transacción" : "About This Transaction"}</Text>
                </View>
                <Text style={styles.noteBodyTxt}>{data.aboutNote}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ─── TRANSACTION SUMMARY ─────────────────────────────────────── */}
        <View style={styles.txCard}>
          <Text style={styles.txTitle}>{sp ? "RESUMEN DE TRANSACCIÓN" : "TRANSACTION SUMMARY"}</Text>
          <View style={styles.txTitleLine} />

          {/* Header */}
          <View style={styles.txHeaderRow}>
            <Text style={txH(1.2)}>         {sp ? "Posición" : "Lien Position"}</Text>
            <Text style={txH(2.2)}>         {sp ? "Tipo de préstamo" : "Loan Type"}</Text>
            <Text style={txH(1.5, "right")}>{sp ? "Monto" : "Loan Amount"}</Text>
            <Text style={txH(1.2, "right")}>{sp ? "Tasa" : "Interest Rate"}</Text>
            <Text style={txH(1.2, "right")}>{sp ? "Plazo" : "Loan Term"}</Text>
            <Text style={txH(1.3, "right")}>{sp ? "P&I mensual" : "Monthly P&I"}</Text>
            <Text style={txH(1.4, "right")}>{sp ? "Estado" : "Status"}</Text>
          </View>

          {/* Data rows */}
          {txRows.map((row, i) => (
            <View key={i} style={styles.txDataRow}>
              <Text style={txD(1.2)}>         {row.lienPosition}</Text>
              <Text style={txD(2.2)}>         {row.loanType}</Text>
              <Text style={txD(1.5, "right")}>{row.loanAmount}</Text>
              <Text style={txD(1.2, "right")}>{row.interestRate}</Text>
              <Text style={txD(1.2, "right")}>{row.loanTerm}</Text>
              <Text style={txD(1.3, "right")}>{row.monthlyPandI}</Text>
              <Text style={txD(1.4, "right")}>{row.status}</Text>
            </View>
          ))}
        </View>

        {/* ─── FOOTER ──────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <View style={styles.footerIconBox}>
              <Text style={styles.footerIconChar}>H</Text>
            </View>
            <Text style={styles.footerCompany}>{data.companyName ?? data.agentName}</Text>
          </View>
          <Text style={styles.footerCenter}>{sp ? "¡Gracias por elegirnos!" : "Thank you for choosing us!"}</Text>
          <Text style={styles.footerRight}>Page 1 of 1</Text>
        </View>

      </Page>
    </Document>
  );
};
